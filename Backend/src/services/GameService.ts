import prisma from '@/config/database';
import { CreateGameInput, UpdateGameStatusInput } from '@/types/game.types';
import { generateGameCode } from '@/utils/generateGameCode';
import { NotFoundError, UnauthorizedError, BadRequestError } from '@/utils/ApiError';
import { GameStatus } from '@prisma/client';

export class GameService {
  async create(teacherId: number, data: CreateGameInput) {
    // Verificar que el question set existe y pertenece al teacher
    const questionSet = await prisma.question_sets.findUnique({
      where: { set_id: data.set_id },
      include: { _count: { select: { questions: true } } },
    });

    if (!questionSet) {
      throw new NotFoundError('Question set no encontrado');
    }

    if (questionSet.teacher_id !== teacherId) {
      throw new UnauthorizedError('No tienes permiso para usar este quiz');
    }

    if (questionSet._count.questions === 0) {
      throw new BadRequestError('El quiz no tiene preguntas');
    }

    // Generar código único
    const gameCode = await generateGameCode();

    // Crear sesión de juego
    const game = await prisma.games.create({
      data: {
        teacher_id: teacherId,
        set_id: data.set_id,
        game_code: gameCode,
        game_mode: data.game_mode,
        max_players: data.max_players,
        status: GameStatus.lobby,
        config: data.config || {},
      },
      include: {
        question_sets: {
          select: {
            set_id: true,
            title: true,
            description: true,
            difficulty: true,
            _count: { select: { questions: true } },
          },
        },
        users: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
          },
        },
      },
    });

    return game;
  }

  async getByCode(code: string) {
    const game = await prisma.games.findUnique({
      where: { game_code: code },
      include: {
        question_sets: {
          select: {
            set_id: true,
            title: true,
            description: true,
            difficulty: true,
            subject: true,
            grade_level: true,
            _count: { select: { questions: true } },
          },
        },
        users: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
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
        _count: {
          select: { game_players: true },
        },
      },
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    // Si el juego está en estado 'starting' pero no hay actividad reciente, resetear a lobby
    if (game.status === GameStatus.starting && game.started_at) {
      const timeSinceStart = Date.now() - new Date(game.started_at).getTime();
      // Si pasaron más de 30 segundos desde que empezó el countdown, resetear
      if (timeSinceStart > 30000) {
        await prisma.games.update({
          where: { game_code: code },
          data: {
            status: GameStatus.lobby,
            started_at: null,
          },
        });
        game.status = GameStatus.lobby;
        game.started_at = null;
      }
    }

    return game;
  }

  async getById(sessionId: number, userId: number, userRole: string) {
    const game = await prisma.games.findUnique({
      where: { game_id: sessionId },
      include: {
        question_sets: true,
        users: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
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
      throw new NotFoundError('Juego no encontrado');
    }

    // Solo el teacher o admin pueden ver todos los detalles
    if (game.teacher_id !== userId && userRole !== 'admin') {
      throw new UnauthorizedError('No tienes permiso para ver este juego');
    }

    return game;
  }

  async updateStatus(sessionId: number, teacherId: number, data: UpdateGameStatusInput) {
    const game = await prisma.games.findUnique({
      where: { game_id: sessionId },
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    if (game.teacher_id !== teacherId) {
      throw new UnauthorizedError('No tienes permiso para modificar este juego');
    }

    // Validar transiciones de estado
    if (game.status === GameStatus.finished) {
      throw new BadRequestError('No se puede modificar un juego finalizado');
    }

    const updatedGame = await prisma.games.update({
      where: { game_id: sessionId },
      data: {
        status: data.status,
        started_at: data.status === GameStatus.active ? new Date() : game.started_at,
        ended_at: data.status === GameStatus.finished ? new Date() : null,
      },
      include: {
        question_sets: {
          select: {
            title: true,
            _count: { select: { questions: true } },
          },
        },
        _count: {
          select: { game_players: true },
        },
      },
    });

    return updatedGame;
  }

  async delete(sessionId: number, teacherId: number) {
    const game = await prisma.games.findUnique({
      where: { game_id: sessionId },
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    if (game.teacher_id !== teacherId) {
      throw new UnauthorizedError('No tienes permiso para eliminar este juego');
    }

    // Se puede eliminar si está en lobby o starting (antes de que empiece realmente)
    if (game.status !== GameStatus.lobby && game.status !== GameStatus.starting) {
      throw new BadRequestError('Solo se pueden eliminar juegos que no han iniciado');
    }

    await prisma.games.delete({
      where: { game_id: sessionId },
    });

    return { message: 'Juego eliminado exitosamente' };
  }

  async listByTeacher(teacherId: number, filters: {
    page?: number;
    limit?: number;
    status?: GameStatus;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { teacher_id: teacherId };
    if (filters.status) {
      where.status = filters.status;
    }

    const [games, total] = await Promise.all([
      prisma.games.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          question_sets: {
            select: {
              title: true,
              difficulty: true,
              _count: { select: { questions: true } },
            },
          },
          _count: {
            select: { game_players: true },
          },
        },
      }),
      prisma.games.count({ where }),
    ]);

    return {
      data: games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new GameService();

