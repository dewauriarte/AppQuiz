import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import QuestionSetService from '@/services/QuestionSetService';
import {
  createQuestionSetSchema,
  updateQuestionSetSchema,
} from '@/types/questionSet.types';

/**
 * Controlador para Question Sets
 */
export class QuestionSetController {
  /**
   * POST /api/v1/question-sets
   * Crear un nuevo question set
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createQuestionSetSchema.parse(req.body);
    const teacherId = req.userId!;

    const questionSet = await QuestionSetService.create(teacherId, validatedData);

    res.status(201).json({
      success: true,
      message: 'Question set created successfully',
      data: questionSet,
    });
  });

  /**
   * GET /api/v1/question-sets/:id
   * Obtener un question set por ID
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const questionSetId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;

    const questionSet = await QuestionSetService.getById(questionSetId, userId, userRole);

    res.status(200).json({
      success: true,
      data: questionSet,
    });
  });

  /**
   * GET /api/v1/question-sets
   * Listar question sets con filtros
   */
  static list = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const userRole = req.userRole!;

    const filters: any = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
      subjectArea: req.query.subjectArea as string,
      difficulty: req.query.difficulty as string,
    };

    // Si es teacher, solo ver sus propios sets (a menos que sean públicos)
    if (userRole === 'teacher') {
      filters.teacherId = userId;
    }

    // Admins pueden ver todos
    if (req.query.teacherId && userRole === 'admin') {
      filters.teacherId = parseInt(req.query.teacherId as string);
    }

    if (req.query.isPublic !== undefined) {
      filters.isPublic = req.query.isPublic === 'true';
    }

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }

    const result = await QuestionSetService.list(filters);

    res.status(200).json({
      success: true,
      data: result.questionSets,
      pagination: result.pagination,
    });
  });

  /**
   * PUT /api/v1/question-sets/:id
   * Actualizar un question set
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const questionSetId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;
    const validatedData = updateQuestionSetSchema.parse(req.body);

    const updated = await QuestionSetService.update(
      questionSetId,
      userId,
      userRole,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: 'Question set updated successfully',
      data: updated,
    });
  });

  /**
   * DELETE /api/v1/question-sets/:id
   * Eliminar un question set (soft delete)
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const questionSetId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;

    const result = await QuestionSetService.delete(questionSetId, userId, userRole);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });


  /**
   * POST /api/v1/question-sets/:id/duplicate
   * Duplicar un question set
   */
  static duplicate = asyncHandler(async (req: Request, res: Response) => {
    const questionSetId = parseInt(req.params.id);
    const userId = req.userId!;

    const duplicate = await QuestionSetService.duplicate(questionSetId, userId);

    res.status(201).json({
      success: true,
      message: 'Question set duplicated successfully',
      data: duplicate,
    });
  });

  /**
   * POST /api/v1/question-sets/:id/questions
   * Agregar preguntas a un question set existente
   */
  static addQuestions = asyncHandler(async (req: Request, res: Response) => {
    const questionSetId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Questions array is required and must not be empty',
      });
      return;
    }

    const result = await QuestionSetService.addQuestions(
      questionSetId,
      userId,
      userRole,
      questions
    );

    res.status(201).json({
      success: true,
      message: `${questions.length} questions added successfully`,
      data: result,
    });
  });

  /**
   * GET /api/v1/question-sets/:id/stats
   * Obtener estadísticas de un question set
   */
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const questionSetId = parseInt(req.params.id);

    const stats = await QuestionSetService.getStats(questionSetId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export default QuestionSetController;

