import { Server } from 'socket.io';
import { CustomSocket } from '@/config/socket';
import prisma from '@/config/database';
import { GameStatus } from '@prisma/client';
import GameplayService from '@/services/GameplayService';

interface JoinGamePayload {
  gameCode: string;
  nickname?: string;
}

const gameRooms = new Map<string, Set<number>>(); // gameCode -> Set of userIds
const playerReadyStatus = new Map<string, Map<number, boolean>>(); // gameCode -> userId -> isReady
const playerNicknames = new Map<string, Map<number, string>>(); // gameCode -> userId -> nickname

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

        // Validar nickname único en el juego
        const nicknameExists = game.game_players.some(
          p => p.nickname?.toLowerCase() === playerNickname.toLowerCase() && p.user_id !== user.userId
        );

        if (nicknameExists) {
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

        // Actualizar tracking
        if (!gameRooms.has(gameCode)) {
          gameRooms.set(gameCode, new Set());
        }
        gameRooms.get(gameCode)!.add(user.userId);

        if (!playerReadyStatus.has(gameCode)) {
          playerReadyStatus.set(gameCode, new Map());
        }
        playerReadyStatus.get(gameCode)!.set(user.userId, false);

        if (!playerNicknames.has(gameCode)) {
          playerNicknames.set(gameCode, new Map());
        }
        playerNicknames.get(gameCode)!.set(user.userId, playerNickname);

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
          isReady: p.user_id ? (playerReadyStatus.get(gameCode)?.get(p.user_id) || false) : false,
          score: 0,
        }));

        // Notificar a todos en el lobby
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

        // Unirse al room de Socket.IO
        socket.join(`game:${gameCode}`);

        // Actualizar tracking solo si no está
        if (!gameRooms.has(gameCode)) {
          gameRooms.set(gameCode, new Set());
        }
        gameRooms.get(gameCode)!.add(user.userId);

        // Obtener lista actualizada de jugadores
        const players = game.game_players.map(p => ({
          user_id: p.user_id,
          username: p.users?.username || 'Unknown',
          display_name: p.users?.display_name || null,
          nickname: p.nickname,
          isReady: p.user_id ? (playerReadyStatus.get(gameCode)?.get(p.user_id) || false) : false,
          score: 0,
        }));

        callback({ success: true, game, players });
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
        if (!playerReadyStatus.has(gameCode)) {
          return callback({ success: false, message: 'Juego no encontrado' });
        }

        playerReadyStatus.get(gameCode)!.set(user.userId, true);

        const readyMap = playerReadyStatus.get(gameCode)!;
        const totalPlayers = readyMap.size;
        const readyPlayers = Array.from(readyMap.values()).filter(Boolean).length;

        io.to(`game:${gameCode}`).emit('game:player-ready', {
          userId: user.userId,
          readyPlayers,
          totalPlayers,
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

        const playersInLobby = gameRooms.get(gameCode)?.size || 0;
        if (playersInLobby < 1) {
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
        io.to(`game:${gameCode}`).emit('game:countdown', { count: 'starting' });

        // Después de 2 segundos, cambiar a active y enviar primera pregunta
        setTimeout(async () => {
          try {
            console.log(`[Game ${gameCode}] Inicializando gameplay...`);
            // Inicializar gameplay
            await GameplayService.initializeGame(gameCode);
            console.log(`[Game ${gameCode}] Gameplay inicializado`);

            await prisma.games.update({
              where: { game_code: gameCode },
              data: { status: GameStatus.active },
            });
            console.log(`[Game ${gameCode}] Estado cambiado a active`);

            // Notificar que el juego comenzó (para que naveguen a GamePlayPage)
            console.log(`[Game ${gameCode}] Emitiendo game:started`);
            io.to(`game:${gameCode}`).emit('game:started');

            // Dar un momento para que naveguen
            setTimeout(() => {
              // Enviar primera pregunta
              console.log(`[Game ${gameCode}] Enviando primera pregunta...`);
              sendQuestion(io, gameCode);
            }, 500);
          } catch (error) {
            console.error(`[Game ${gameCode}] Error activating game:`, error);
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
     */
    socket.on('game:leave', async ({ gameCode }, callback) => {
      try {
        socket.leave(`game:${gameCode}`);

        if (gameRooms.has(gameCode)) {
          gameRooms.get(gameCode)!.delete(user.userId);
        }

        if (playerReadyStatus.has(gameCode)) {
          playerReadyStatus.get(gameCode)!.delete(user.userId);
        }

        // Eliminar de la base de datos
        await prisma.game_players.deleteMany({
          where: {
            game_id: (await prisma.games.findUnique({ where: { game_code: gameCode } }))?.game_id,
            user_id: user.userId,
          },
        });

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
     */
    socket.on('disconnect', async () => {
      console.log(`Player ${user.username} disconnected`);
      
      // Remover de todos los juegos
      for (const [gameCode, players] of gameRooms.entries()) {
        if (players.has(user.userId)) {
          players.delete(user.userId);
          playerReadyStatus.get(gameCode)?.delete(user.userId);
          playerNicknames.get(gameCode)?.delete(user.userId);

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

                  // Limpiar tracking
                  gameRooms.delete(gameCode);
                  playerReadyStatus.delete(gameCode);
                  playerNicknames.delete(gameCode);
                } else if (game.status === GameStatus.active) {
                  // Si está activo, pausar
                  io.to(`game:${gameCode}`).emit('game:paused', {
                    message: 'El profesor se desconectó, juego pausado',
                  });
                }
              } else {
                // Es un estudiante, solo notificar
                io.to(`game:${gameCode}`).emit('game:player-disconnected', {
                  userId: user.userId,
                  username: user.username,
                });
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

        // Enviar resultado al jugador
        callback({ success: true, result });

        // Actualizar leaderboard
        const leaderboard = await GameplayService.getLeaderboard(gameCode);
        io.to(`game:${gameCode}`).emit('leaderboard:update', { leaderboard });

      } catch (error: any) {
        console.error('Error processing answer:', error);
        callback({ success: false, message: error.message });
      }
    });
  });
}

/**
 * Envía una pregunta a todos los jugadores
 */
function sendQuestion(io: any, gameCode: string) {
  try {
    console.log(`[Game ${gameCode}] Preparando pregunta...`);
    const questionData = GameplayService.prepareQuestion(gameCode);

    if (!questionData) {
      // No hay más preguntas, terminar juego
      console.log(`[Game ${gameCode}] No hay más preguntas, terminando juego...`);
      endGame(io, gameCode);
      return;
    }

    console.log(`[Game ${gameCode}] Pregunta preparada:`, questionData.question.question_text);

    // Ver quién está en el room
    const socketsInRoom = io.sockets.adapter.rooms.get(`game:${gameCode}`);
    console.log(`[Game ${gameCode}] Sockets en room:`, socketsInRoom ? socketsInRoom.size : 0);

    // Broadcast pregunta a todos
    io.to(`game:${gameCode}`).emit('question:new', questionData);
    console.log(`[Game ${gameCode}] Pregunta enviada a clientes`);

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

        // Esperar 5 segundos para mostrar resultados
        setTimeout(() => {
          // Mostrar resultados y leaderboard
          showQuestionResults(io, gameCode);
        }, 5000);
      }
    }, 1000);

    // Guardar timer para poder limpiarlo si es necesario
    GameplayService.setGameTimer(gameCode, timerInterval as any);

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
    const leaderboard = await GameplayService.getLeaderboard(gameCode);
    
    io.to(`game:${gameCode}`).emit('question:results', {
      leaderboard: leaderboard.slice(0, 5), // Top 5
    });

    // Esperar 3 segundos y avanzar a siguiente pregunta
    setTimeout(() => {
      const hasMore = GameplayService.advanceQuestion(gameCode);
      
      if (hasMore) {
        sendQuestion(io, gameCode);
      } else {
        endGame(io, gameCode);
      }
    }, 3000);

  } catch (error) {
    console.error('Error showing results:', error);
  }
}

/**
 * Finaliza el juego
 */
async function endGame(io: any, gameCode: string) {
  try {
    const results = await GameplayService.endGame(gameCode);

    io.to(`game:${gameCode}`).emit('game:finished', {
      leaderboard: results.leaderboard,
      totalPlayers: results.totalPlayers,
    });

  } catch (error) {
    console.error('Error ending game:', error);
    io.to(`game:${gameCode}`).emit('game:error', {
      message: 'Error al finalizar el juego',
    });
  }
}

