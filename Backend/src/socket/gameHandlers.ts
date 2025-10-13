import { Server } from 'socket.io';
import { CustomSocket } from '@/config/socket';
import prisma from '@/config/database';
import { GameStatus } from '@prisma/client';
import GameplayService from '@/services/GameplayService';
import RedisGameSessionService, { PlayerState } from '@/services/RedisGameSessionService';

interface JoinGamePayload {
  gameCode: string;
  nickname?: string;
}

/**
 * **ARQUITECTURA REDIS**:
 * - NO usamos Maps en memoria (se pierden al recargar servidor)
 * - TODO el estado vive en Redis
 * - Socket.IO solo maneja conexiones
 */

export function registerGameHandlers(io: Server): void {
  io.on('connection', (socket: CustomSocket) => {
    const user = socket.user;
    if (!user) return;

    /**
     * Unirse a un juego
     */
    socket.on('game:join', async (payload: JoinGamePayload, callback) => {
      try {
        const { gameCode, nickname } = payload;

        // Buscar juego
        const game = await prisma.games.findUnique({
          where: { game_code: gameCode },
          include: {
            question_sets: {
              select: {
                title: true,
                _count: { select: { questions: true } },
              },
            },
            game_players: {
              include: {
                users: {
                  select: {
                    user_id: true,
                    username: true,
                    display_name: true,
                  },
                },
              },
            },
          },
        });

        if (!game) {
          return callback({ success: false, message: 'Juego no encontrado' });
        }

        if (game.status !== GameStatus.lobby) {
          return callback({ success: false, message: 'El juego ya comenzó' });
        }

        if (game.game_players.length >= game.max_players) {
          return callback({ success: false, message: 'Juego lleno' });
        }

        // Verificar si ya está en el juego
        const existingPlayer = game.game_players.find(p => p.user_id === user.userId);

        // Preparar nickname
        const playerNickname = nickname || user.username;

        // **REDIS**: Validar nickname único usando Redis
        const nicknameInUse = await RedisGameSessionService.isNicknameInUse(
          gameCode,
          playerNickname,
          user.userId
        );

        if (nicknameInUse) {
          return callback({
            success: false,
            message: 'Este nickname ya está en uso en este juego'
          });
        }

        if (!existingPlayer) {
          // Agregar jugador a la base de datos
          await prisma.game_players.create({
            data: {
              game_id: game.game_id,
              user_id: user.userId,
              nickname: playerNickname,
            },
          });
        } else if (existingPlayer.nickname !== playerNickname) {
          // Actualizar nickname si cambió
          await prisma.game_players.updateMany({
            where: {
              game_id: game.game_id,
              user_id: user.userId,
            },
            data: {
              nickname: playerNickname,
            },
          });
        }

        // Unirse al room de Socket.IO
        socket.join(`game:${gameCode}`);

        // **REDIS**: Asegurar que la sesión existe (crear si no existe)
        let sessionExists = await RedisGameSessionService.getGameSession(gameCode);
        if (!sessionExists) {
          console.log(`🔄 Creating Redis session for new game ${gameCode}`);
          await GameplayService.recoverSession(gameCode);
        }

        // **REDIS**: Agregar jugador a Redis
        await RedisGameSessionService.addPlayerToGame(gameCode, user.userId, playerNickname);

        // **REDIS**: Crear estado inicial del jugador si no existe
        let playerState: PlayerState | null = await RedisGameSessionService.getPlayerState(gameCode, user.userId);
        if (!playerState) {
          playerState = {
            userId: user.userId,
            nickname: playerNickname,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            comboStreak: 0,
            highestCombo: 0,
            totalTimeTaken: 0,
            isConnected: true,
          };
          await RedisGameSessionService.setPlayerState(gameCode, user.userId, playerState);
        } else {
          // Solo actualizar conexión si ya existe
          await GameplayService.setPlayerConnection(gameCode, user.userId, true);
        }

        console.log(`✅ Player ${user.userId} joined and synced to Redis for ${gameCode}`);

        // Obtener lista actualizada de jugadores
        const updatedGame = await prisma.games.findUnique({
          where: { game_code: gameCode },
          include: {
            game_players: {
              include: {
                users: {
                  select: {
                    user_id: true,
                    username: true,
                    display_name: true,
                  },
                },
              },
            },
          },
        });

        const players = updatedGame!.game_players.map(p => ({
          user_id: p.user_id,
          username: p.users?.username || 'Unknown',
          display_name: p.users?.display_name || null,
          nickname: p.nickname,
          isReady: p.is_ready || false, // Leer desde BD
          score: 0,
        }));

        // Notificar a todos en el lobby
        const socketsInRoom = io.sockets.adapter.rooms.get(`game:${gameCode}`);
        console.log(`✅ Player ${user.userId} joined successfully`);
        console.log(`📢 Emitiendo 'game:player-joined' al room game:${gameCode}`);
        console.log(`🔌 Sockets en room:`, socketsInRoom ? socketsInRoom.size : 0);
        console.log(`👥 Total jugadores:`, players.length);

        io.to(`game:${gameCode}`).emit('game:player-joined', {
          player: {
            user_id: user.userId,
            username: user.username,
            nickname,
          },
          players,
          totalPlayers: players.length,
        });

        callback({ success: true, game, players });
      } catch (error) {
        console.error('Error joining game:', error);
        callback({ success: false, message: 'Error al unirse al juego' });
      }
    });

    /**
     * Unirse solo al room (sin agregar como jugador)
     * Útil para teachers y jugadores que ya están en el juego
     * CON RECUPERACIÓN DE SESIÓN DESDE REDIS
     */
    socket.on('game:join-room', async ({ gameCode }, callback) => {
      try {
        // Verificar que el juego existe
        const game = await prisma.games.findUnique({
          where: { game_code: gameCode },
          include: {
            question_sets: {
              select: {
                title: true,
                _count: { select: { questions: true } },
              },
            },
            game_players: {
              include: {
                users: {
                  select: {
                    user_id: true,
                    username: true,
                    display_name: true,
                  },
                },
              },
            },
          },
        });

        if (!game) {
          return callback({ success: false, message: 'Juego no encontrado' });
        }

        // **CRÍTICO**: Asegurar que la sesión existe en Redis para TODOS los estados
        // No solo para active/starting, también para lobby
        let sessionExists = await RedisGameSessionService.getGameSession(gameCode);

        if (!sessionExists) {
          console.log(`🔄 Session not found in Redis for ${gameCode}, creating from DB...`);
          const recovered = await GameplayService.recoverSession(gameCode);

          if (recovered) {
            console.log(`✅ Session created in Redis for ${gameCode}`);
          } else {
            console.warn(`⚠️ Could not create session for ${gameCode}`);
          }
        } else {
          console.log(`♻️ Session already exists in Redis for ${gameCode}`);
        }

        // Unirse al room de Socket.IO
        socket.join(`game:${gameCode}`);

        // **REDIS**: Asegurar que está en la lista de jugadores
        const gamePlayer = game.game_players.find(p => p.user_id === user.userId);
        if (gamePlayer) {
          // Agregar/actualizar en Redis
          await RedisGameSessionService.addPlayerToGame(gameCode, user.userId, gamePlayer.nickname);

          // **REDIS**: Crear estado inicial del jugador si no existe
          let playerState: PlayerState | null = await RedisGameSessionService.getPlayerState(gameCode, user.userId);
          if (!playerState) {
            playerState = {
              userId: user.userId,
              nickname: gamePlayer.nickname,
              score: gamePlayer.score,
              correctAnswers: gamePlayer.correct_answers,
              wrongAnswers: gamePlayer.wrong_answers,
              comboStreak: gamePlayer.combo_streak,
              highestCombo: gamePlayer.highest_combo,
              totalTimeTaken: gamePlayer.total_time_played_ms || 0,
              isConnected: true,
            };
            await RedisGameSessionService.setPlayerState(gameCode, user.userId, playerState);
          } else {
            // Solo actualizar conexión
            await GameplayService.setPlayerConnection(gameCode, user.userId, true);
          }

          console.log(`✅ Player ${user.userId} synced to Redis for game ${gameCode}`);
        }

        // Obtener lista actualizada de jugadores
        const players = game.game_players.map(p => ({
          user_id: p.user_id,
          username: p.users?.username || 'Unknown',
          display_name: p.users?.display_name || null,
          nickname: p.nickname,
          isReady: p.is_ready || false,
          score: 0,
        }));

        // Si el juego ya está activo, redirigir al jugador
        const shouldRedirect = game.status === GameStatus.active || game.status === GameStatus.starting;

        callback({
          success: true,
          game,
          players,
          shouldRedirect,
          gameStatus: game.status,
        });
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ success: false, message: 'Error al unirse al room' });
      }
    });

    /**
     * Marcar jugador como listo
     */
    socket.on('game:ready', async ({ gameCode }, callback) => {
      try {
        // Buscar el juego y el jugador
        const game = await prisma.games.findUnique({
          where: { game_code: gameCode },
          include: {
            game_players: true,
          },
        });

        if (!game) {
          return callback({ success: false, message: 'Juego no encontrado' });
        }

        // Actualizar en la base de datos
        await prisma.game_players.updateMany({
          where: {
            game_id: game.game_id,
            user_id: user.userId,
          },
          data: {
            is_ready: true,
          },
        });

        // Obtener jugadores actualizados
        const updatedGame = await prisma.games.findUnique({
          where: { game_code: gameCode },
          include: {
            game_players: {
              include: {
                users: {
                  select: {
                    user_id: true,
                    username: true,
                    display_name: true,
                  },
                },
              },
            },
          },
        });

        if (!updatedGame) {
          return callback({ success: false, message: 'Error al actualizar estado' });
        }

        const players = updatedGame.game_players.map(p => ({
          user_id: p.user_id,
          username: p.users?.username || 'Unknown',
          display_name: p.users?.display_name || null,
          nickname: p.nickname,
          isReady: p.is_ready || false,
          score: 0,
        }));

        const readyPlayers = players.filter(p => p.isReady).length;

        // Emitir evento con la lista actualizada
        io.to(`game:${gameCode}`).emit('game:player-ready', {
          userId: user.userId,
          readyPlayers,
          totalPlayers: players.length,
          players, // Enviar lista completa actualizada
        });

        callback({ success: true });
      } catch (error) {
        console.error('Error marking ready:', error);
        callback({ success: false, message: 'Error al marcar como listo' });
      }
    });

    /**
     * Iniciar juego (solo teacher)
     */
    socket.on('game:start', async ({ gameCode }, callback) => {
      try {
        const game = await prisma.games.findUnique({
          where: { game_code: gameCode },
        });

        if (!game) {
          return callback({ success: false, message: 'Juego no encontrado' });
        }

        if (game.teacher_id !== user.userId) {
          return callback({ success: false, message: 'Solo el profesor puede iniciar' });
        }

        if (game.status !== GameStatus.lobby) {
          return callback({ success: false, message: 'El juego ya comenzó' });
        }

        // **REDIS**: Obtener número de jugadores desde Redis
        const playerIds = await RedisGameSessionService.getPlayerIds(gameCode);
        if (playerIds.length < 1) {
          return callback({ success: false, message: 'Se necesita al menos 1 jugador' });
        }

        // Actualizar estado a starting
        await prisma.games.update({
          where: { game_code: gameCode },
          data: {
            status: GameStatus.starting,
            started_at: new Date(),
          },
        });

        // Emitir "Get Ready"
        console.log(`[Game ${gameCode}] 📢 Emitiendo countdown 'starting'...`);
        io.to(`game:${gameCode}`).emit('game:countdown', { count: 'starting' });

        // Después de 2 segundos, cambiar a active y enviar primera pregunta
        console.log(`[Game ${gameCode}] ⏱️ Iniciando timeout de 2s para activar juego...`);
        setTimeout(async () => {
          try {
            console.log(`[Game ${gameCode}] ========== TIMEOUT EJECUTADO ==========`);
            console.log(`[Game ${gameCode}] 🎮 Inicializando gameplay...`);
            // Inicializar gameplay
            await GameplayService.initializeGame(gameCode);
            console.log(`[Game ${gameCode}] ✅ Gameplay inicializado`);

            await prisma.games.update({
              where: { game_code: gameCode },
              data: { status: GameStatus.active },
            });
            console.log(`[Game ${gameCode}] ✅ Estado cambiado a active en BD`);

            // Notificar que el juego comenzó (para que naveguen a GamePlayPage)
            console.log(`[Game ${gameCode}] 📢 Emitiendo 'game:started'...`);
            io.to(`game:${gameCode}`).emit('game:started');

            // Dar un momento para que naveguen
            console.log(`[Game ${gameCode}] ⏱️ Esperando 500ms para que naveguen...`);
            setTimeout(async () => {
              // Enviar primera pregunta
              console.log(`[Game ${gameCode}] 📝 Llamando a sendQuestion()...`);
              await sendQuestion(io, gameCode);
            }, 500);
          } catch (error) {
            console.error(`[Game ${gameCode}] ❌ Error activating game:`, error);
            io.to(`game:${gameCode}`).emit('game:error', {
              message: 'Error al iniciar el juego',
            });
          }
        }, 2000);

        callback({ success: true });
      } catch (error) {
        console.error('Error starting game:', error);
        callback({ success: false, message: 'Error al iniciar el juego' });
      }
    });

    /**
     * Salir del juego
     * **REDIS**: Elimina jugador de Redis y BD
     */
    socket.on('game:leave', async ({ gameCode }, callback) => {
      try {
        socket.leave(`game:${gameCode}`);

        // **REDIS**: Marcar como desconectado en Redis
        await GameplayService.setPlayerConnection(gameCode, user.userId, false);

        // Eliminar de la base de datos
        const game = await prisma.games.findUnique({ where: { game_code: gameCode } });
        if (game) {
          await prisma.game_players.deleteMany({
            where: {
              game_id: game.game_id,
              user_id: user.userId,
            },
          });
        }

        // Notificar a otros jugadores
        io.to(`game:${gameCode}`).emit('game:player-left', {
          userId: user.userId,
          username: user.username,
        });

        callback?.({ success: true });
      } catch (error) {
        console.error('Error leaving game:', error);
        callback?.({ success: false, message: 'Error al salir del juego' });
      }
    });

    /**
     * Desconexión
     * **REDIS**: Marca jugador como desconectado en Redis (NO elimina)
     * Permite reconexión automática
     */
    socket.on('disconnect', async () => {
      console.log(`❌ Player ${user.username} disconnected`);

      // **REDIS**: Buscar juegos donde este usuario está conectado
      const activeGames = await RedisGameSessionService.getActiveGames();

      for (const gameCode of activeGames) {
        const playerState = await RedisGameSessionService.getPlayerState(gameCode, user.userId);

        if (playerState) {
          // **REDIS**: Marcar como desconectado (no eliminar)
          await GameplayService.setPlayerConnection(gameCode, user.userId, false);

          // Verificar si es el teacher
          try {
            const game = await prisma.games.findUnique({
              where: { game_code: gameCode },
            });

            if (game) {
              if (game.teacher_id === user.userId) {
                // Si es el teacher y el juego está en lobby, cancelar el juego
                if (game.status === GameStatus.lobby) {
                  await prisma.games.update({
                    where: { game_code: gameCode },
                    data: { status: GameStatus.cancelled },
                  });

                  io.to(`game:${gameCode}`).emit('game:cancelled', {
                    message: 'El profesor ha salido del juego',
                  });

                  // Limpiar Redis
                  await RedisGameSessionService.cleanupGameSession(gameCode);
                } else if (game.status === GameStatus.active) {
                  // Si está activo, NO pausar - permitir reconexión
                  io.to(`game:${gameCode}`).emit('game:player-disconnected', {
                    userId: user.userId,
                    username: user.username,
                    message: 'El profesor se desconectó temporalmente',
                  });
                  console.log(`⚠️ Teacher disconnected from active game: ${gameCode}, session preserved for reconnection`);
                }
              } else {
                // Es un estudiante, solo notificar (sesión se mantiene)
                io.to(`game:${gameCode}`).emit('game:player-disconnected', {
                  userId: user.userId,
                  username: user.username,
                });
                console.log(`ℹ️ Student disconnected from game: ${gameCode}, session preserved for reconnection`);
              }
            }
          } catch (error) {
            console.error('Error handling disconnect:', error);
          }
        }
      }
    });

    /**
     * Enviar respuesta a una pregunta
     */
    socket.on('answer:submit', async (payload: {
      gameCode: string;
      questionId: number;
      optionId: number;
      timeTaken: number;
    }, callback) => {
      try {
        const { gameCode, questionId, optionId, timeTaken } = payload;

        const result = await GameplayService.processAnswer(
          gameCode,
          user.userId,
          questionId,
          optionId,
          timeTaken
        );

        // Obtener estado actualizado del jugador para incluir newScore y newCombo
        const playerState = await RedisGameSessionService.getPlayerState(gameCode, user.userId);

        // **FIX**: Transformar respuesta al formato que espera el frontend
        const transformedResult = {
          isCorrect: result.isCorrect,
          correctOptionId: result.correctOptionId,
          pointsEarned: result.scoreResult.totalPoints,
          newScore: playerState?.score || 0,
          newCombo: playerState?.comboStreak || 0,
          breakdown: {
            basePoints: result.scoreResult.basePoints,
            speedBonus: result.scoreResult.speedBonus,
            comboMultiplier: result.scoreResult.comboMultiplier,
            totalPoints: result.scoreResult.totalPoints,
          },
          explanation: result.explanation,
        };

        // Enviar resultado transformado al jugador
        console.log(`✅ Respuesta procesada para ${user.username}:`, transformedResult);
        callback({ success: true, result: transformedResult });

        // Actualizar leaderboard
        const leaderboard = await GameplayService.getLeaderboard(gameCode);

        // **FIX**: Mapear de camelCase (backend) a snake_case (frontend)
        const mappedLeaderboard = leaderboard.map(player => ({
          rank: player.rank,
          user_id: player.userId,
          nickname: player.nickname,
          username: player.nickname,
          score: player.score,
          correct_answers: player.correctAnswers,
          wrong_answers: player.wrongAnswers,
          combo_streak: player.comboStreak,
          highest_combo: player.highestCombo,
        }));

        io.to(`game:${gameCode}`).emit('leaderboard:update', { leaderboard: mappedLeaderboard });

        // **NUEVO**: Emitir evento para actualizar contador del profesor
        io.to(`game:${gameCode}`).emit('answer:received', {
          userId: user.userId,
          username: user.username,
        });

      } catch (error: any) {
        console.error('Error processing answer:', error);
        callback({ success: false, message: error.message });
      }
    });

    /**
     * Obtener estado completo del juego desde Redis
     * **CRÍTICO PARA RECONEXIÓN**: Permite recuperar estado al recargar
     */
    socket.on('game:get-state', async ({ gameCode }, callback) => {
      try {
        // Recuperar sesión desde Redis (o desde BD si no existe)
        const sessionExists = await RedisGameSessionService.getGameSession(gameCode);

        if (!sessionExists) {
          // Intentar recuperar desde BD
          const recovered = await GameplayService.recoverSession(gameCode);
          if (!recovered) {
            return callback({
              success: false,
              message: 'Sesión de juego no encontrada'
            });
          }
        }

        // Obtener estado completo
        const gameSession = await RedisGameSessionService.getGameSession(gameCode);
        const playerState = await RedisGameSessionService.getPlayerState(gameCode, user.userId);
        const leaderboard = await GameplayService.getLeaderboard(gameCode);
        const allPlayers = await RedisGameSessionService.getAllPlayers(gameCode);

        // **FIX**: Mapear leaderboard de camelCase a snake_case
        const mappedLeaderboard = leaderboard.map(player => ({
          rank: player.rank,
          user_id: player.userId,
          nickname: player.nickname,
          username: player.nickname,
          score: player.score,
          correct_answers: player.correctAnswers,
          wrong_answers: player.wrongAnswers,
          combo_streak: player.comboStreak,
          highest_combo: player.highestCombo,
        }));

        // Si el juego está activo y hay una pregunta en curso, enviarla
        let currentQuestion = null;
        if (gameSession && gameSession.status === GameStatus.active) {
          currentQuestion = await GameplayService.prepareQuestion(gameCode);
        }

        callback({
          success: true,
          state: {
            gameSession,
            playerState,
            leaderboard: mappedLeaderboard,  // Usar el leaderboard mapeado
            allPlayers,
            currentQuestion,
          }
        });
      } catch (error: any) {
        console.error('Error getting game state:', error);
        callback({ success: false, message: error.message });
      }
    });
  });
}

/**
 * Envía una pregunta a todos los jugadores
 */
async function sendQuestion(io: any, gameCode: string) {
  try {
    console.log(`[Game ${gameCode}] ========== ENVIANDO PREGUNTA ==========`);
    const questionData = await GameplayService.prepareQuestion(gameCode);

    if (!questionData) {
      // No hay más preguntas, terminar juego
      console.log(`[Game ${gameCode}] ❌ No hay más preguntas, terminando juego...`);
      await endGame(io, gameCode);
      return;
    }

    console.log(`[Game ${gameCode}] ✅ Pregunta preparada #${questionData.questionNumber}/${questionData.totalQuestions}:`, questionData.questionText);

    // Ver quién está en el room
    const socketsInRoom = io.sockets.adapter.rooms.get(`game:${gameCode}`);
    console.log(`[Game ${gameCode}] 🔌 Sockets conectados en room:`, socketsInRoom ? socketsInRoom.size : 0);

    if (socketsInRoom && socketsInRoom.size > 0) {
      console.log(`[Game ${gameCode}] 📡 Emitiendo 'question:new' al room game:${gameCode}`);
    } else {
      console.warn(`[Game ${gameCode}] ⚠️ NO HAY SOCKETS EN EL ROOM!`);
    }

    // Broadcast pregunta a todos
    io.to(`game:${gameCode}`).emit('question:new', questionData);
    console.log(`[Game ${gameCode}] ✅ Evento 'question:new' emitido`);

    // Iniciar timer
    const timeLimit = questionData.timeLimit;
    let timeRemaining = timeLimit;

    const timerInterval = setInterval(() => {
      timeRemaining--;
      io.to(`game:${gameCode}`).emit('timer:tick', { timeRemaining });

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        
        // Timeout de la pregunta
        io.to(`game:${gameCode}`).emit('question:timeout', {
          message: 'Se acabó el tiempo!',
        });

        // Esperar 2 segundos para mostrar resultados (reducido para evitar congelación)
        setTimeout(() => {
          // Mostrar resultados y leaderboard
          showQuestionResults(io, gameCode);
        }, 2000);
      }
    }, 1000);

  } catch (error) {
    console.error('Error sending question:', error);
    io.to(`game:${gameCode}`).emit('game:error', {
      message: 'Error al enviar pregunta',
    });
  }
}

/**
 * Muestra resultados de la pregunta actual
 */
async function showQuestionResults(io: any, gameCode: string) {
  try {
    console.log(`[Game ${gameCode}] ========== MOSTRANDO RESULTADOS ==========`);
    const leaderboard = await GameplayService.getLeaderboard(gameCode);
    console.log(`[Game ${gameCode}] 📊 Leaderboard obtenido:`, leaderboard.length, 'jugadores');

    // **FIX**: Mapear de camelCase (backend) a snake_case (frontend)
    const mappedLeaderboard = leaderboard.map(player => ({
      rank: player.rank,
      user_id: player.userId,  // camelCase → snake_case
      nickname: player.nickname,
      username: player.nickname, // Usar nickname como username por ahora
      score: player.score,
      correct_answers: player.correctAnswers,  // camelCase → snake_case
      wrong_answers: player.wrongAnswers,  // camelCase → snake_case
      combo_streak: player.comboStreak,  // camelCase → snake_case
      highest_combo: player.highestCombo,  // camelCase → snake_case
    }));

    console.log(`[Game ${gameCode}] 📢 Emitiendo 'question:results' con TODOS los jugadores`);
    io.to(`game:${gameCode}`).emit('question:results', {
      leaderboard: mappedLeaderboard, // Todos los jugadores (formato snake_case)
    });

    // Esperar 8 segundos para que vean ambas pantallas (3s explicación + 5s ranking)
    console.log(`[Game ${gameCode}] ⏱️ Esperando 8s para que vean resultados...`);
    setTimeout(async () => {
      console.log(`[Game ${gameCode}] ⏩ Avanzando a siguiente pregunta...`);
      const hasMore = await GameplayService.advanceQuestion(gameCode);
      console.log(`[Game ${gameCode}] ❓ ¿Hay más preguntas?`, hasMore);

      if (hasMore) {
        console.log(`[Game ${gameCode}] ✅ Sí, enviando siguiente pregunta...`);
        await sendQuestion(io, gameCode);
      } else {
        console.log(`[Game ${gameCode}] 🏁 No, finalizando juego...`);
        await endGame(io, gameCode);
      }
    }, 8000); // 8 segundos para sincronizar con frontend

  } catch (error) {
    console.error(`[Game ${gameCode}] ❌ Error showing results:`, error);
  }
}

/**
 * Finaliza el juego
 */
async function endGame(io: any, gameCode: string) {
  try {
    const results = await GameplayService.endGame(gameCode);

    // **FIX**: Mapear de camelCase (backend) a snake_case (frontend)
    const mappedLeaderboard = results.leaderboard.map((player: any) => ({
      rank: player.rank,
      user_id: player.userId,
      nickname: player.nickname,
      username: player.nickname,
      score: player.score,
      correct_answers: player.correctAnswers,
      wrong_answers: player.wrongAnswers,
      combo_streak: player.comboStreak,
      highest_combo: player.highestCombo,
    }));

    io.to(`game:${gameCode}`).emit('game:finished', {
      leaderboard: mappedLeaderboard,
      totalPlayers: results.totalPlayers,
    });

  } catch (error) {
    console.error('Error ending game:', error);
    io.to(`game:${gameCode}`).emit('game:error', {
      message: 'Error al finalizar el juego',
    });
  }
}

