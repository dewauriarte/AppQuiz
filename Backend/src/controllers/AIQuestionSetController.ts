import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import AIQuestionSetService from '@/services/AIQuestionSetService';
import { z } from 'zod';
import { AIProvider, DifficultyLevel } from '@/types/ai.types';
import { BadRequestError } from '@/utils/ApiError';

/**
 * Schema para generar y guardar desde texto
 */
const generateAndSaveSchema = z.object({
  text: z.string().min(100),
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  subjectArea: z.string().max(100),
  gradeLevel: z.string().max(50).optional(),
  provider: z.enum(['claude', 'gemini', 'openai']).optional(),
  numQuestions: z.number().int().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  topic: z.string().max(200).optional(),
  language: z.string().default('español'),
  bloomLevel: z.number().int().min(1).max(6).default(3),
  includeExplanations: z.boolean().default(true),
  timePerQuestion: z.number().int().min(10).max(300).default(30),
});

/**
 * Controlador para generar y guardar question sets con IA
 */
export class AIQuestionSetController {
  /**
   * POST /api/v1/ai-question-sets/generate-from-text
   * Generar preguntas desde texto y guardarlas como question set
   */
  static generateFromText = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = generateAndSaveSchema.parse(req.body);
    const teacherId = req.userId!;

    // Extraer claves API de los headers o body si existen
    const bodyKeys = (req.body?.apiKeys || {}) as { claude?: string; gemini?: string; openai?: string };
    const customKeys = {
      claude: bodyKeys.claude ?? (req.headers['x-anthropic-key'] as string | undefined) ?? (req.headers['x-api-key'] as string | undefined),
      gemini: bodyKeys.gemini ?? (req.headers['x-google-ai-key'] as string | undefined),
      openai: bodyKeys.openai ?? (req.headers['x-openai-key'] as string | undefined),
    };

    const result = await AIQuestionSetService.generateAndSave(teacherId, {
      text: validatedData.text,
      title: validatedData.title,
      description: validatedData.description,
      subjectArea: validatedData.subjectArea,
      gradeLevel: validatedData.gradeLevel,
      provider: validatedData.provider as AIProvider | undefined,
      config: {
        numQuestions: validatedData.numQuestions,
        difficulty: validatedData.difficulty as DifficultyLevel,
        topic: validatedData.topic,
        language: validatedData.language,
        bloomLevel: validatedData.bloomLevel,
        includeExplanations: validatedData.includeExplanations,
        timePerQuestion: validatedData.timePerQuestion,
      },
      customKeys,
    });

    res.status(201).json({
      success: true,
      message: 'Question set generated and saved successfully',
      data: result,
    });
  });

  /**
   * POST /api/v1/ai-question-sets/generate-from-pdf
   * Generar preguntas desde PDF y guardarlas como question set
   */
  static generateFromPDF = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('PDF file is required');
    }

    if (!req.file.buffer) {
      throw new BadRequestError('PDF buffer is empty');
    }

    // Parse form data
    const title = req.body.title || 'Untitled Quiz';
    const description = req.body.description;
    const subjectArea = req.body.subjectArea || 'General';
    const gradeLevel = req.body.gradeLevel;
    const provider = req.body.provider;
    const numQuestions = parseInt(req.body.numQuestions) || 10;
    const difficulty = req.body.difficulty || 'medium';
    const topic = req.body.topic;
    const language = req.body.language || 'español';
    const bloomLevel = parseInt(req.body.bloomLevel) || 3;
    const includeExplanations = req.body.includeExplanations !== 'false';
    const timePerQuestion = parseInt(req.body.timePerQuestion) || 30;

    const teacherId = req.userId!;

    // Extraer claves API de los headers o body si existen
    const bodyKeys = (req.body?.apiKeys || {}) as { claude?: string; gemini?: string; openai?: string };
    const customKeys = {
      claude: bodyKeys.claude ?? (req.headers['x-anthropic-key'] as string | undefined) ?? (req.headers['x-api-key'] as string | undefined),
      gemini: bodyKeys.gemini ?? (req.headers['x-google-ai-key'] as string | undefined),
      openai: bodyKeys.openai ?? (req.headers['x-openai-key'] as string | undefined),
    };

    const result = await AIQuestionSetService.generateAndSaveFromPDF(teacherId, {
      pdfBuffer: req.file.buffer,
      filename: req.file.originalname,
      title,
      description,
      subjectArea,
      gradeLevel,
      provider: provider as AIProvider | undefined,
      config: {
        numQuestions,
        difficulty: difficulty as DifficultyLevel,
        topic,
        language,
        bloomLevel,
        includeExplanations,
        timePerQuestion,
      },
      customKeys,
    });

    res.status(201).json({
      success: true,
      message: 'Question set generated from PDF and saved successfully',
      data: result,
    });
  });
}

export default AIQuestionSetController;

