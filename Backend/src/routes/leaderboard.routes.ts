import { Router, Request, Response } from 'express';
import { requireAuth } from '@middleware/auth';
import * as LeaderboardService from '@services/LeaderboardService';

const router = Router();

/**
 * GET /api/leaderboards/global
 * Obtiene el leaderboard global
 * Query params:
 * - limit: número de resultados (default: 100, max: 100)
 * - offset: offset para paginación (default: 0)
 * - period: 'daily' | 'weekly' | 'monthly' | 'all_time' (default: 'all_time')
 */
router.get('/global', requireAuth, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const period = (req.query.period as LeaderboardService.LeaderboardPeriod) || 'all_time';

    const leaderboard = await LeaderboardService.getGlobalLeaderboard(limit, offset, period);

    // Si el usuario está autenticado, incluir su posición
    let currentUserRank = null;
    if (req.userId) {
      currentUserRank = await LeaderboardService.getUserGlobalRank(req.userId);
    }

    return res.json({
      leaderboard,
      period,
      limit,
      offset,
      current_user_rank: currentUserRank,
    });
  } catch (error: any) {
    console.error('Error getting global leaderboard:', error);
    return res.status(500).json({ message: 'Error al obtener leaderboard global' });
  }
});

/**
 * GET /api/leaderboards/friends
 * Obtiene el leaderboard de amigos del usuario autenticado
 */
router.get('/friends', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const leaderboard = await LeaderboardService.getFriendsLeaderboard(req.userId);

    return res.json({
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error: any) {
    console.error('Error getting friends leaderboard:', error);
    return res.status(500).json({ message: 'Error al obtener leaderboard de amigos' });
  }
});

/**
 * GET /api/leaderboards/rank/:userId
 * Obtiene el rank global de un usuario específico
 */
router.get('/rank/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const rank = await LeaderboardService.getUserGlobalRank(userId);

    return res.json({
      user_id: userId,
      global_rank: rank,
    });
  } catch (error: any) {
    console.error('Error getting user rank:', error);
    return res.status(500).json({ message: 'Error al obtener ranking del usuario' });
  }
});

export default router;

