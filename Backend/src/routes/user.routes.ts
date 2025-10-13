import { Router, Request, Response } from 'express';
import { requireAuth } from '@middleware/auth';
import * as UserStatsService from '@services/UserStatsService';

const router = Router();

// Helper para convertir BigInt a Number en objetos
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
 * GET /api/users/:id/stats
 * Obtiene estadísticas completas del usuario
 */
router.get('/:id/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // Verificar que el usuario solo puede ver sus propias stats (o es admin)
    if (req.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para ver estas estadísticas' });
    }

    const stats = await UserStatsService.getUserStats(userId);

    if (!stats) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Convertir BigInt a Number antes de serializar
    return res.json(convertBigIntToNumber(stats));
  } catch (error: any) {
    console.error('Error getting user stats:', error);
    return res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

/**
 * GET /api/users/:id/recent-games
 * Obtiene los últimos juegos del usuario
 */
router.get('/:id/recent-games', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 10;

    // Verificar permisos
    if (req.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para ver estos juegos' });
    }

    const games = await UserStatsService.getRecentGames(userId, limit);

    return res.json(convertBigIntToNumber({
      user_id: userId,
      games,
      total: games.length,
    }));
  } catch (error: any) {
    console.error('Error getting recent games:', error);
    return res.status(500).json({ message: 'Error al obtener juegos recientes' });
  }
});

/**
 * GET /api/users/:id/progress
 * Obtiene datos de progreso para gráficos
 */
router.get('/:id/progress', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const days = parseInt(req.query.days as string) || 30;

    // Verificar permisos
    if (req.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para ver este progreso' });
    }

    const progress = await UserStatsService.getProgressData(userId, days);

    return res.json(convertBigIntToNumber({
      user_id: userId,
      period_days: days,
      ...progress,
    }));
  } catch (error: any) {
    console.error('Error getting progress data:', error);
    return res.status(500).json({ message: 'Error al obtener datos de progreso' });
  }
});

export default router;

