import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '@middleware/auth';
import prisma from '@config/database';

const router = Router();

// Helper para convertir BigInt a Number
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  return obj;
}

/**
 * GET /api/teachers/:id/stats
 * Obtiene estadísticas del maestro
 */
router.get('/:id/stats', requireAuth, requireRole(['teacher', 'admin']), async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.id);

    // Verificar permisos
    if (req.userId !== teacherId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para ver estas estadísticas' });
    }

    // Total de quizzes creados
    const totalQuizzes = await prisma.question_sets.count({
      where: { teacher_id: teacherId },
    });

    // Juegos activos
    const activeGames = await prisma.games.count({
      where: {
        teacher_id: teacherId,
        status: { in: ['lobby', 'starting', 'active'] },
      },
    });

    // Total de estudiantes en listas
    const studentCount = await prisma.class_list_students.count({
      where: {
        list: {
          teacher_id: teacherId,
        },
      },
    });

    // Quizzes recientes
    const recentQuizzes = await prisma.question_sets.findMany({
      where: { teacher_id: teacherId },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        set_id: true,
        title: true,
        total_questions: true,
        times_played: true,
        created_at: true,
      },
    });

    // Juegos recientes
    const recentGames = await prisma.games.findMany({
      where: { teacher_id: teacherId },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        game_id: true,
        game_code: true,
        status: true,
        created_at: true,
        _count: {
          select: {
            game_players: true,
          },
        },
      },
    });

    // Calcular precisión promedio (promedio de accuracy de todos los game_results de sus juegos)
    const accuracyData = await prisma.game_results.aggregate({
      where: {
        games: {
          teacher_id: teacherId,
        },
      },
      _avg: {
        accuracy_percentage: true,
      },
    });

    const stats = {
      totalQuizzes,
      activeGames,
      totalStudents: studentCount,
      averageAccuracy: accuracyData._avg.accuracy_percentage ? Number(accuracyData._avg.accuracy_percentage) : 0,
      recentQuizzes: recentQuizzes.map(q => ({
        set_id: q.set_id,
        title: q.title,
        question_count: q.total_questions,
        times_played: q.times_played,
        created_at: q.created_at.toISOString(),
      })),
      recentGames: recentGames.map(g => ({
        game_id: g.game_id,
        game_code: g.game_code,
        status: g.status,
        player_count: g._count.game_players,
        created_at: g.created_at.toISOString(),
      })),
    };

    return res.json(convertBigIntToNumber(stats));
  } catch (error: any) {
    console.error('Error getting teacher stats:', error);
    return res.status(500).json({ message: 'Error al obtener estadísticas del maestro' });
  }
});

export default router;

