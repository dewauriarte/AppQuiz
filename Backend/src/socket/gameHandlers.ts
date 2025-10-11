import { Server } from 'socket.io';
import { CustomSocket } from '@/config/socket';
import prisma from '@/config/database';
import { GameStatus } from '@prisma/client';

interface JoinGamePayload {
  gameCode: string;
  nickname?: string;
}


const gameRooms = new Map<string, Set<number>>(); // gameCode -> Set of userIds
const playerReadyStatus = new Map<string, Map<number, boolean>>(); // gameCode -> userId -> isReady

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

        if (!existingPlayer) {
          // Agregar jugador a la base de datos
          await prisma.game_players.create({
            data: {
              game_id: game.game_id,
              user_id: user.userId,
              nickname: nickname || user.username,
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

        // Actualizar estado
        await prisma.games.update({
          where: { game_code: gameCode },
          data: {
            status: GameStatus.starting,
            started_at: new Date(),
          },
        });

        // Notificar a todos
        io.to(`game:${gameCode}`).emit('game:starting', {
          message: '¡El juego va a comenzar!',
          countdown: 3,
        });

        // Después de 3 segundos, cambiar a active
        setTimeout(async () => {
          await prisma.games.update({
            where: { game_code: gameCode },
            data: { status: GameStatus.active },
          });

          io.to(`game:${gameCode}`).emit('game:started', {
            message: '¡Juego iniciado!',
          });
        }, 3000);

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
      // Remover de todos los juegos
      for (const [gameCode, players] of gameRooms.entries()) {
        if (players.has(user.userId)) {
          players.delete(user.userId);
          playerReadyStatus.get(gameCode)?.delete(user.userId);

          io.to(`game:${gameCode}`).emit('game:player-disconnected', {
            userId: user.userId,
            username: user.username,
          });
        }
      }
    });
  });
}

