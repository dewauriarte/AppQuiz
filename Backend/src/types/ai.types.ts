import { z } from 'zod';

// Tipos de providers disponibles
export type AIProvider = 'claude' | 'gemini' | 'openai';

// Niveles de dificultad
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Configuración para generar preguntas
export interface GenerateConfig {
  numQuestions: number;
  difficulty: DifficultyLevel;
  topic?: string;
  language?: string;
  bloomLevel?: number; // Bloom's Taxonomy (1-6)
  includeExplanations?: boolean;
  timePerQuestion?: number; // segundos
}

// Schema Zod para validación de opciones
export const questionOptionSchema = z.object({
  option_text: z.string().min(1),
  is_correct: z.boolean(),
  explanation: z.string().optional(),
});

// Schema Zod para validación de preguntas
export const questionSchema = z.object({
  question_text: z.string().min(10),
  question_type: z.enum(['multiple_choice', 'true_false']).default('multiple_choice'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  bloom_level: z.number().min(1).max(6).default(3),
  time_limit: z.number().min(10).max(300).default(30),
  points: z.number().min(100).max(2000).default(1000),
  options: z.array(questionOptionSchema).min(2).max(6),
});

// Tipo inferido del schema
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionSchema>;

// Respuesta de la IA (debe tener este formato)
export interface AIResponse {
  questions: QuestionInput[];
  metadata?: {
    provider: AIProvider;
    model: string;
    tokensUsed?: number;
    processingTime?: number;
  };
}

// Schema para validar respuesta completa de IA
export const aiResponseSchema = z.object({
  questions: z.array(questionSchema),
  metadata: z.object({
    provider: z.enum(['claude', 'gemini', 'openai']).optional(),
    model: z.string().optional(),
    tokensUsed: z.number().optional(),
    processingTime: z.number().optional(),
  }).optional(),
});

// Información del provider
export interface ProviderInfo {
  name: AIProvider;
  displayName: string;
  available: boolean;
  costPerQuestion: number; // en centavos USD
  maxTokens: number;
  supportsPDF: boolean;
}

// Estadísticas de uso
export interface UsageStats {
  provider: AIProvider;
  questionsGenerated: number;
  tokensUsed: number;
  estimatedCost: number;
  timestamp: Date;
}

