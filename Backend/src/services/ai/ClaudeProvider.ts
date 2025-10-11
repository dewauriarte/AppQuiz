import Anthropic from '@anthropic-ai/sdk';
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
 * Provider para Anthropic Claude
 * Usa Claude 3 Sonnet para balance costo/calidad
 */
export class ClaudeProvider implements IAIProvider {
  private client: Anthropic;
  name: AIProvider = 'claude';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Claude API key is required');
    }
    this.client = new Anthropic({ apiKey });
  }

  async generateQuestions(
    text: string,
    config: GenerateConfig
  ): Promise<QuestionInput[]> {
    // Intentar múltiples modelos en orden de preferencia
    const modelNames = [
      'claude-sonnet-4-20250514',  // Claude 4.5 Sonnet (más reciente)
      'claude-3-7-sonnet-20250219', // Claude 3.7 Sonnet
      'claude-3-5-sonnet-20241022', // Claude 3.5 Sonnet v2
      'claude-3-5-sonnet-20240620', // Claude 3.5 Sonnet v1
      'claude-3-sonnet-20240229',   // Claude 3 Sonnet (fallback)
    ];

    let lastError: any;

    for (const modelName of modelNames) {
      try {
        console.log(`Intentando con modelo: ${modelName}`);
        const prompt = PromptBuilder.buildQuestionGenerationPrompt(text, config);

        const response = await this.client.messages.create({
          model: modelName,
          max_tokens: 4096,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        // Extraer contenido de la respuesta
        const content = response.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Claude');
        }

        // Parsear JSON
        const parsed = this.parseResponse(content.text);

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
    console.error('Claude generation error (todos los modelos fallaron):', lastError);
    throw new Error(`Failed to generate questions with Claude: ${lastError?.message || lastError}`);
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
      console.error('❌ [ClaudeProvider.generateFromPDF] Error:', error);
      throw new Error(`Failed to generate questions from PDF: ${error}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Solo verificar que el cliente esté inicializado
      // No hacemos llamadas reales a la API aquí para no consumir créditos
      return this.client !== null && this.client !== undefined;
    } catch (error) {
      console.error('Claude availability check failed:', error);
      return false;
    }
  }

  getInfo(): ProviderInfo {
    return {
      name: 'claude',
      displayName: 'Claude 3.5-4.5 (Anthropic)',
      available: true,
      costPerQuestion: 0.01, // ~1 centavo por pregunta (estimado)
      maxTokens: 4096,
      supportsPDF: true,
    };
  }

  estimateCost(numQuestions: number): number {
    // Claude 3 Sonnet: ~$3 / 1M input tokens, ~$15 / 1M output tokens
    // Estimación: ~2000 tokens input + ~1000 tokens output por solicitud
    // Para 10 preguntas: ~$0.05-0.10
    return numQuestions * 0.01;
  }

  /**
   * Parsea la respuesta de Claude extrayendo el JSON
   */
  private parseResponse(text: string): any {
    try {
      // Buscar JSON en la respuesta (Claude a veces incluye texto adicional)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse Claude response:', text);
      throw new Error('Invalid JSON response from Claude');
    }
  }
}

