import OpenAI from 'openai';
import { IAIProvider } from './IAIProvider';
import {
  GenerateConfig,
  QuestionInput,
  AIProvider,
  ProviderInfo,
  aiResponseSchema,
} from '@/types/ai.types';
import { PromptBuilder } from '@/utils/prompts';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Provider para OpenAI ChatGPT
 * Usa GPT-4 Turbo para mejor calidad
 */
export class OpenAIProvider implements IAIProvider {
  private client: OpenAI;
  name: AIProvider = 'openai';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  async generateQuestions(
    text: string,
    config: GenerateConfig
  ): Promise<QuestionInput[]> {
    // Intentar múltiples modelos en orden de preferencia
    const modelNames = [
      'gpt-4o',                  // GPT-4 Omni (más reciente, multimodal)
      'gpt-4o-mini',             // GPT-4o mini (más rápido y económico)
      'gpt-4-turbo',             // GPT-4 Turbo
      'gpt-4-turbo-preview',     // GPT-4 Turbo Preview
      'gpt-4',                   // GPT-4 (fallback)
    ];

    let lastError: any;

    for (const modelName of modelNames) {
      try {
        console.log(`Intentando con modelo: ${modelName}`);
        const prompt = PromptBuilder.buildQuestionGenerationPrompt(text, config);

        const response = await this.client.chat.completions.create({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto profesor creando preguntas de quiz educativo. Siempre respondes en formato JSON válido.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: 'json_object' }, // Fuerza respuesta JSON
        });

        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('Empty response from OpenAI');
        }

        // Parsear JSON
        const parsed = JSON.parse(content);

        // Validar estructura
        const validated = aiResponseSchema.parse(parsed);

        console.log(`✓ Éxito con modelo: ${modelName}`);
        return validated.questions;
      } catch (error: any) {
        console.error(`✗ Fallo con modelo ${modelName}:`, error.message);
        lastError = error;
        // Continuar con el siguiente modelo
        continue;
      }
    }

    // Si todos los modelos fallaron
    console.error('OpenAI generation error (todos los modelos fallaron):', lastError);
    throw new Error(`Failed to generate questions with OpenAI: ${lastError?.message || lastError}`);
  }

  async generateFromPDF(
    pdfBuffer: Buffer,
    config: GenerateConfig
  ): Promise<QuestionInput[]> {
    try {
      // Usar require() para cargar pdf-parse solo cuando se necesita
      const pdfParse = require('pdf-parse');

      // Parsear PDF
      const pdfData = await pdfParse(pdfBuffer);
      const text = pdfData.text;

      if (!text || text.trim().length < 100) {
        throw new Error('PDF content is too short or empty');
      }

      // Generar preguntas del texto extraído
      return await this.generateQuestions(text, config);
    } catch (error) {
      console.error('❌ [OpenAIProvider.generateFromPDF] Error:', error);
      throw new Error(`Failed to generate questions from PDF: ${error}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Solo verificar que el cliente esté inicializado
      // No hacemos llamadas reales a la API aquí para no consumir créditos
      return this.client !== null && this.client !== undefined;
    } catch (error) {
      console.error('OpenAI availability check failed:', error);
      return false;
    }
  }

  getInfo(): ProviderInfo {
    return {
      name: 'openai',
      displayName: 'GPT-4o/4 (OpenAI)',
      available: true,
      costPerQuestion: 0.012, // ~1.2 centavos por pregunta (más caro pero muy bueno)
      maxTokens: 4096,
      supportsPDF: true,
    };
  }

  estimateCost(numQuestions: number): number {
    // GPT-4 Turbo: $0.01 / 1K input tokens, $0.03 / 1K output tokens
    // Estimación: ~2000 tokens input + ~1500 tokens output por solicitud
    // Para 10 preguntas: ~$0.10-0.12
    return numQuestions * 0.012;
  }
}

