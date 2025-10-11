import { Router } from 'express';
import AIController from '@/controllers/AIController';
import { requireAuth, requireRole } from '@/middleware/auth';
import { uploadPDF } from '@/config/multer';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Todas las rutas de IA requieren autenticación
 * Solo teachers y admins pueden generar preguntas con IA
 */

/**
 * POST /api/v1/ai/generate
 * Genera preguntas desde texto plano
 * Body: { text, numQuestions, difficulty, topic, etc. }
 */
router.post(
  '/generate',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  AIController.generateFromText
);

/**
 * POST /api/v1/ai/generate-from-pdf
 * Genera preguntas desde un archivo PDF
 * Form-data: pdf (file), numQuestions, difficulty, etc.
 */
router.post(
  '/generate-from-pdf',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  uploadPDF, // Middleware de multer
  AIController.generateFromPDF
);

/**
 * GET /api/v1/ai/providers
 * Lista todos los providers de IA disponibles
 */
router.get(
  '/providers',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  AIController.getProviders
);

/**
 * POST /api/v1/ai/estimate-cost
 * Estima el costo de generar N preguntas
 * Body: { numQuestions, provider? }
 */
router.post(
  '/estimate-cost',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  AIController.estimateCost
);

/**
 * POST /api/v1/ai/compare-providers
 * Compara resultados de múltiples providers
 * ADVERTENCIA: Consume créditos de API de TODOS los providers
 * Body: { text, numQuestions, difficulty, etc. }
 */
router.post(
  '/compare-providers',
  requireAuth,
  requireRole([UserRole.admin]), // Solo admins
  AIController.compareProviders
);

export default router;

