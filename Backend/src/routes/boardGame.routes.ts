import { Router } from 'express';
import BoardGameController from '@/controllers/BoardGameController';
import { requireAuth } from '@/middleware/auth';

const router = Router();

/**
 * Board Game Routes - Sprint 11
 * Endpoints REST para modo tablero
 */

// Todas las rutas requieren autenticación
router.use(requireAuth);

/**
 * @route   POST /api/games/:gameCode/board/roll
 * @desc    Tirar dado y mover jugador
 * @access  Private (jugadores del juego)
 */
router.post('/:gameCode/board/roll', BoardGameController.rollDice);

/**
 * @route   GET /api/games/:gameCode/board/state
 * @desc    Obtener estado actual del tablero
 * @access  Private (jugadores del juego)
 */
router.get('/:gameCode/board/state', BoardGameController.getState);

/**
 * @route   POST /api/games/:gameCode/board/buy-item
 * @desc    Comprar item en checkpoint (tienda)
 * @access  Private (jugadores del juego)
 */
router.post('/:gameCode/board/buy-item', BoardGameController.buyItem);

/**
 * @route   GET /api/games/:gameCode/board/leaderboard
 * @desc    Obtener leaderboard del tablero
 * @access  Private (jugadores del juego)
 */
router.get('/:gameCode/board/leaderboard', BoardGameController.getLeaderboard);

export default router;
