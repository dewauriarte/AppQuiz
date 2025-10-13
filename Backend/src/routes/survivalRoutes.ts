import express from 'express';
import SurvivalGameController from '@/controllers/SurvivalGameController';
import { requireAuth, requireRole } from '@/middleware/auth';

const router = express.Router();

/**
 * Rutas para Survival Mode
 * Todas requieren autenticación
 */

// Obtener estado del juego
router.get(
  '/:id/survival/status',
  requireAuth,
  SurvivalGameController.getStatus
);

// Responder pregunta (estudiantes)
router.post(
  '/:id/survival/answer',
  requireAuth,
  SurvivalGameController.answerQuestion
);

// --- Rutas solo para profesores ---

// Inicializar juego de supervivencia
router.post(
  '/:id/survival/initialize',
  requireAuth,
  requireRole(['teacher']),
  SurvivalGameController.initialize
);

// Iniciar ronda
router.post(
  '/:id/survival/start-round',
  requireAuth,
  requireRole(['teacher']),
  SurvivalGameController.startRound
);

// Procesar eliminación
router.post(
  '/:id/survival/process-elimination',
  requireAuth,
  requireRole(['teacher']),
  SurvivalGameController.processElimination
);

// Finalizar juego
router.post(
  '/:id/survival/finish',
  requireAuth,
  requireRole(['teacher']),
  SurvivalGameController.finish
);

export default router;
