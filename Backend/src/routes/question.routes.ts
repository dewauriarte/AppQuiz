import { Router } from 'express';
import QuestionController from '@/controllers/QuestionController';
import { requireAuth, requireRole } from '@/middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * PUT /api/v1/questions/:id
 * Actualizar una pregunta individual
 * Solo el creador o admins
 */
router.put(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionController.updateQuestion
);

/**
 * DELETE /api/v1/questions/:id
 * Eliminar una pregunta (soft delete)
 * Solo el creador o admins
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionController.deleteQuestion
);

export default router;
