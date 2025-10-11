import { Router } from 'express';
import AIQuestionSetController from '@/controllers/AIQuestionSetController';
import { requireAuth, requireRole } from '@/middleware/auth';
import { uploadPDF } from '@/config/multer';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * POST /api/v1/ai-question-sets/generate-from-text
 * Generar y guardar question set desde texto
 * Solo teachers y admins
 */
router.post(
  '/generate-from-text',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  AIQuestionSetController.generateFromText
);

/**
 * POST /api/v1/ai-question-sets/generate-from-pdf
 * Generar y guardar question set desde PDF
 * Solo teachers y admins
 */
router.post(
  '/generate-from-pdf',
  requireAuth,
  requireRole([UserRole.teacher, UserRole.admin]),
  uploadPDF,
  AIQuestionSetController.generateFromPDF
);

export default router;

