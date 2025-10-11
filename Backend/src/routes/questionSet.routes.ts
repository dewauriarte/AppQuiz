import { Router } from 'express';
import QuestionSetController from '@/controllers/QuestionSetController';
import { requireAuth, requireRole } from '@/middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */

/**
 * POST /api/v1/question-sets
 * Crear un nuevo question set
 * Solo teachers y admins
 */
router.post(
  '/',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionSetController.create
);

/**
 * GET /api/v1/question-sets
 * Listar question sets
 * Teachers ven solo los suyos, admins ven todos
 */
router.get(
  '/',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionSetController.list
);

/**
 * GET /api/v1/question-sets/:id
 * Obtener un question set específico
 */
router.get(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin, UserRole.student]),
  QuestionSetController.getById
);

/**
 * PUT /api/v1/question-sets/:id
 * Actualizar un question set
 * Solo el creador o admins
 */
router.put(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionSetController.update
);

/**
 * DELETE /api/v1/question-sets/:id
 * Eliminar un question set (soft delete)
 * Solo el creador o admins
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionSetController.delete
);


/**
 * POST /api/v1/question-sets/:id/questions
 * Agregar preguntas a un question set existente
 * Solo el creador o admins
 */
router.post(
  '/:id/questions',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionSetController.addQuestions
);

/**
 * POST /api/v1/question-sets/:id/duplicate
 * Duplicar un question set
 * Todos los teachers
 */
router.post(
  '/:id/duplicate',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionSetController.duplicate
);

/**
 * GET /api/v1/question-sets/:id/stats
 * Obtener estadísticas de un question set
 */
router.get(
  '/:id/stats',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  QuestionSetController.getStats
);

export default router;

