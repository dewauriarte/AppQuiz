import { Router } from 'express';
import GameController from '@/controllers/GameController';
import { requireAuth, requireRole } from '@/middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * POST /api/v1/games
 * Crear nueva sesión de juego
 * Requiere: teacher o admin
 */
router.post(
  '/',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  GameController.create
);

/**
 * GET /api/v1/games
 * Listar juegos del teacher
 * Requiere: teacher o admin
 */
router.get(
  '/',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  GameController.list
);

/**
 * GET /api/v1/games/code/:code
 * Obtener juego por código (público - para estudiantes que se unen)
 */
router.get('/code/:code', GameController.getByCode);

/**
 * GET /api/v1/games/:id
 * Obtener juego por ID
 * Requiere: teacher owner o admin
 */
router.get(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  GameController.getById
);

/**
 * PUT /api/v1/games/:id/status
 * Actualizar estado del juego (lobby -> active -> completed)
 * Requiere: teacher owner o admin
 */
router.put(
  '/:id/status',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  GameController.updateStatus
);

/**
 * DELETE /api/v1/games/:id
 * Cancelar juego (solo si está en lobby)
 * Requiere: teacher owner o admin
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  GameController.delete
);

export default router;

