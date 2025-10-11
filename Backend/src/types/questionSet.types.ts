import { z } from 'zod';

/**
 * Schema para crear un nuevo question set
 */
export const createQuestionSetSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  subject_area: z.string().max(100),
  grade_level: z.string().max(50).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  questions: z.array(
    z.object({
      question_text: z.string().min(10),
      question_type: z.enum(['multiple_choice', 'true_false']).default('multiple_choice'),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      bloom_level: z.number().int().min(1).max(6).default(3),
      time_limit: z.number().int().min(10).max(300).default(30),
      points: z.number().int().min(100).max(2000).default(1000),
      explanation: z.string().optional(),
      options: z.array(
        z.object({
          option_text: z.string().min(1),
          is_correct: z.boolean(),
          explanation: z.string().optional(),
        })
      ).min(2).max(6),
    })
  ).min(1).max(100),
});

/**
 * Schema para actualizar un question set
 */
export const updateQuestionSetSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  subject_area: z.string().max(100).optional(),
  grade_level: z.string().max(50).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  is_public: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

/**
 * Schema para agregar preguntas a un set existente
 */
export const addQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question_text: z.string().min(10),
      question_type: z.enum(['multiple_choice', 'true_false']).default('multiple_choice'),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      bloom_level: z.number().int().min(1).max(6).default(3),
      time_limit: z.number().int().min(10).max(300).default(30),
      points: z.number().int().min(100).max(2000).default(1000),
      explanation: z.string().optional(),
      options: z.array(
        z.object({
          option_text: z.string().min(1),
          is_correct: z.boolean(),
          explanation: z.string().optional(),
        })
      ).min(2).max(6),
    })
  ).min(1).max(50),
});

/**
 * Tipos inferidos
 */
export type CreateQuestionSetInput = z.infer<typeof createQuestionSetSchema>;
export type UpdateQuestionSetInput = z.infer<typeof updateQuestionSetSchema>;
export type AddQuestionsInput = z.infer<typeof addQuestionsSchema>;

/**
 * Filtros para listar question sets
 */
export interface QuestionSetFilters {
  teacherId?: number;
  subjectArea?: string;
  difficulty?: string;
  isPublic?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

