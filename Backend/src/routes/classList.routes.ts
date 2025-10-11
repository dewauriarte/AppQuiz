import { Router } from 'express';
import ClassListController from '@/controllers/ClassListController';
import { requireAuth, requireRole } from '@/middleware/auth';
import { UserRole } from '@prisma/client';
import { uploadExcel } from '@/config/multer';

const router = Router();

/**
 * Todas las rutas requieren autenticación como teacher o admin
 */

/**
 * POST /api/v1/lists
 * Crear nueva lista de clase
 */
router.post(
  '/',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  ClassListController.create
);

/**
 * POST /api/v1/lists/import-excel
 * Importar estudiantes desde Excel
 */
router.post(
  '/import-excel',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  uploadExcel,
  ClassListController.importExcel
);

/**
 * GET /api/v1/lists
 * Listar listas de clase del teacher
 */
router.get(
  '/',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  ClassListController.list
);

/**
 * GET /api/v1/lists/:id
 * Obtener una lista específica con sus estudiantes
 */
router.get(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  ClassListController.getById
);

/**
 * PUT /api/v1/lists/:id
 * Actualizar información de una lista
 */
router.put(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  ClassListController.update
);

/**
 * DELETE /api/v1/lists/:id
 * Eliminar una lista de clase
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  ClassListController.delete
);

/**
 * POST /api/v1/lists/:id/students
 * Agregar estudiantes a una lista
 */
router.post(
  '/:id/students',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  ClassListController.addStudents
);

/**
 * GET /api/v1/lists/:id/students
 * Obtener estudiantes de una lista
 */
router.get(
  '/:id/students',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  ClassListController.getStudents
);

/**
 * DELETE /api/v1/lists/:id/students/:userId
 * Remover un estudiante de una lista
 */
router.delete(
  '/:id/students/:userId',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  ClassListController.removeStudent
);

export default router;

