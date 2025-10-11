import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import AIService from '@/services/ai/AIService';
import { BadRequestError } from '@/utils/ApiError';
import { z } from 'zod';
import { AIProvider, DifficultyLevel } from '@/types/ai.types';

/**
 * Schema para validar request de generación de preguntas
 */
const generateQuestionsSchema = z.object({
  text: z.string().min(100).optional(),
  numQuestions: z.number().int().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  topic: z.string().max(200).optional(),
  language: z.string().default('español'),
  bloomLevel: z.number().int().min(1).max(6).default(3),
  includeExplanations: z.boolean().default(true),
  timePerQuestion: z.number().int().min(10).max(300).default(30),
  provider: z.enum(['claude', 'gemini', 'openai']).optional(),
});

/**
 * Controlador para endpoints de IA
 */
export class AIController {
  /**
   * POST /api/v1/ai/generate
   * Genera preguntas desde texto plano
   */
  static generateFromText = asyncHandler(async (req: Request, res: Response) => {
    // Validar datos
    const validatedData = generateQuestionsSchema.parse(req.body);

    if (!validatedData.text) {
      throw new BadRequestError('Text is required for generation');
    }

    // Claves API personalizadas desde headers o body (override de .env si se proveen)
    const bodyKeys = (req.body?.apiKeys || {}) as { claude?: string; gemini?: string; openai?: string };
    const customKeys = {
      claude: (bodyKeys.claude ?? (req.headers['x-anthropic-key'] as string | undefined) ?? (req.headers['x-api-key'] as string | undefined))?.trim(),
      gemini: (bodyKeys.gemini ?? (req.headers['x-google-ai-key'] as string | undefined))?.trim(),
      openai: (bodyKeys.openai ?? (req.headers['x-openai-key'] as string | undefined))?.trim(),
    };

    // Generar preguntas
    const result = await AIService.generateQuestions(
      validatedData.text,
      {
        numQuestions: validatedData.numQuestions,
        difficulty: validatedData.difficulty as DifficultyLevel,
        topic: validatedData.topic,
        language: validatedData.language,
        bloomLevel: validatedData.bloomLevel,
        includeExplanations: validatedData.includeExplanations,
        timePerQuestion: validatedData.timePerQuestion,
      },
      validatedData.provider as AIProvider | undefined,
      customKeys
    );

    res.status(200).json({
      success: true,
      message: 'Questions generated successfully',
      data: result,
    });
  });

  /**
   * POST /api/v1/ai/generate-from-pdf
   * Genera preguntas desde un archivo PDF
   * Requiere multipart/form-data con campo 'pdf'
   */
  static generateFromPDF = asyncHandler(async (req: Request, res: Response) => {
    // Verificar que se subió un archivo
    if (!req.file) {
      throw new BadRequestError('PDF file is required');
    }

    // Validar datos adicionales del body
    const validatedData = generateQuestionsSchema.omit({ text: true }).parse({
      numQuestions: req.body.numQuestions ? parseInt(req.body.numQuestions) : 10,
      difficulty: req.body.difficulty || 'medium',
      topic: req.body.topic,
      language: req.body.language || 'español',
      bloomLevel: req.body.bloomLevel ? parseInt(req.body.bloomLevel) : 3,
      includeExplanations: req.body.includeExplanations !== 'false',
      timePerQuestion: req.body.timePerQuestion ? parseInt(req.body.timePerQuestion) : 30,
      provider: req.body.provider,
    });

    // Claves API personalizadas desde headers o body (override de .env si se proveen)
    const bodyKeys = (req.body?.apiKeys || {}) as { claude?: string; gemini?: string; openai?: string };
    const customKeys = {
      claude: (bodyKeys.claude ?? (req.headers['x-anthropic-key'] as string | undefined) ?? (req.headers['x-api-key'] as string | undefined))?.trim(),
      gemini: (bodyKeys.gemini ?? (req.headers['x-google-ai-key'] as string | undefined))?.trim(),
      openai: (bodyKeys.openai ?? (req.headers['x-openai-key'] as string | undefined))?.trim(),
    };

    // Generar preguntas
    const result = await AIService.generateQuestions(
      req.file.buffer,
      {
        numQuestions: validatedData.numQuestions,
        difficulty: validatedData.difficulty as DifficultyLevel,
        topic: validatedData.topic,
        language: validatedData.language,
        bloomLevel: validatedData.bloomLevel,
        includeExplanations: validatedData.includeExplanations,
        timePerQuestion: validatedData.timePerQuestion,
      },
      validatedData.provider as AIProvider | undefined,
      customKeys
    );

    res.status(200).json({
      success: true,
      message: 'Questions generated from PDF successfully',
      data: result,
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  });

  /**
   * GET /api/v1/ai/providers
   * Lista todos los providers disponibles con su info
   */
  static getProviders = asyncHandler(async (req: Request, res: Response) => {
    // Extraer claves API de los headers si existen
    const customKeys = {
      claude: req.headers['x-anthropic-key'] as string | undefined,
      gemini: req.headers['x-google-ai-key'] as string | undefined,
      openai: req.headers['x-openai-key'] as string | undefined,
    };

    const providers = await AIService.getAvailableProviders(customKeys);

    res.status(200).json({
      success: true,
      message: 'Available AI providers',
      data: providers,
    });
  });

  /**
   * POST /api/v1/ai/estimate-cost
   * Estima el costo de generar N preguntas con un provider
   */
  static estimateCost = asyncHandler(async (req: Request, res: Response) => {
    const { numQuestions, provider } = req.body;

    if (!numQuestions || numQuestions < 1) {
      throw new BadRequestError('numQuestions must be a positive integer');
    }

    const estimate = await AIService.estimateCost(
      numQuestions,
      provider as AIProvider | undefined
    );

    res.status(200).json({
      success: true,
      message: 'Cost estimated successfully',
      data: estimate,
    });
  });

  /**
   * POST /api/v1/ai/compare-providers
   * Compara resultados de múltiples providers (solo para admins/teachers)
   * ADVERTENCIA: Consume créditos de API de TODOS los providers
   */
  static compareProviders = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = generateQuestionsSchema.parse(req.body);

    if (!validatedData.text) {
      throw new BadRequestError('Text is required for comparison');
    }

    // Esta operación es costosa - solo para desarrollo/testing
    const results = await AIService.compareProviders(validatedData.text, {
      numQuestions: validatedData.numQuestions,
      difficulty: validatedData.difficulty as DifficultyLevel,
      topic: validatedData.topic,
      language: validatedData.language,
      bloomLevel: validatedData.bloomLevel,
      includeExplanations: validatedData.includeExplanations,
      timePerQuestion: validatedData.timePerQuestion,
    });

    res.status(200).json({
      success: true,
      message: 'Providers compared successfully',
      data: results,
      warning: 'This operation consumed API credits from multiple providers',
    });
  });
}

export default AIController;

