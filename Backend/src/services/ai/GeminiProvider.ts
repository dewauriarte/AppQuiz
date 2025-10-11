import { GoogleGenerativeAI } from '@google/generative-ai';
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
 * Provider para Google Gemini
 * Usa Gemini Pro para velocidad y costo
 */
export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI;
  name: AIProvider = 'gemini';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateQuestions(
    text: string,
    config: GenerateConfig
  ): Promise<QuestionInput[]> {
    // Modelos disponibles en 2025 según Google AI
    // Referencia: https://ai.google.dev/gemini-api/docs/models/gemini
    const modelNames = [
      'gemini-2.0-flash-exp',        // Gemini 2.0 Flash experimental (más reciente)
      'gemini-2.0-flash',            // Gemini 2.0 Flash estable
      'gemini-1.5-flash',            // Gemini 1.5 Flash (fallback)
      'gemini-1.5-flash-002',        // Gemini 1.5 Flash versión 002
      'gemini-1.5-pro',              // Gemini 1.5 Pro
      'gemini-1.5-pro-002',          // Gemini 1.5 Pro versión 002
    ];

    let lastError: any;

    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Intentando con modelo: ${modelName}`);
        const model = this.client.getGenerativeModel({
          model: modelName,
        });

        const prompt = PromptBuilder.buildQuestionGenerationPrompt(text, config);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = response.text();

        // Parsear JSON
        const parsed = this.parseResponse(responseText);

        // Validar estructura
        const validated = aiResponseSchema.parse(parsed);

        console.log(`✅ Éxito con modelo: ${modelName}`);
        return validated.questions;
      } catch (error: any) {
        console.error(`❌ Fallo con modelo ${modelName}:`, error.message?.substring(0, 200));
        lastError = error;
        // Continuar con el siguiente modelo
        continue;
      }
    }

    // Si todos los modelos fallaron
    console.error('❌ Gemini generation error (todos los modelos fallaron)');
    throw new Error(`Failed to generate questions with Gemini. Tu API key podría estar restringida o el modelo no está disponible en tu cuenta/región. Verifica en Google AI Studio que tu clave tenga permisos y modelos habilitados. Error: ${lastError?.message || lastError}`);
  }

  async generateFromPDF(
    pdfBuffer: Buffer,
    config: GenerateConfig
  ): Promise<QuestionInput[]> {
    try {
      // Usar require() para cargar pdf-parse solo cuando se necesita
      // Esto evita que se ejecute el código de test al iniciar el servidor
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
      console.error('❌ [GeminiProvider.generateFromPDF] Error:', error);
      throw new Error(`Failed to generate questions from PDF: ${error}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Solo verificar que el cliente esté inicializado
      // No hacemos llamadas reales a la API aquí para no consumir créditos
      return this.client !== null && this.client !== undefined;
    } catch (error) {
      console.error('Gemini availability check failed:', error);
      return false;
    }
  }

  getInfo(): ProviderInfo {
    return {
      name: 'gemini',
      displayName: 'Gemini 2.0/1.5 (Google)',
      available: true,
      costPerQuestion: 0.008, // ~0.8 centavos por pregunta (más barato que Claude)
      maxTokens: 8192,
      supportsPDF: true,
    };
  }

  estimateCost(numQuestions: number): number {
    // Gemini 1.5 Flash: Gratis hasta 15 RPM, luego $0.00025 / 1K chars input, $0.00075 / 1K chars output
    // Estimación: ~3000 chars input + ~2000 chars output por solicitud
    // Para 10 preguntas: ~$0.04
    return numQuestions * 0.008;
  }

  /**
   * Parsea la respuesta de Gemini extrayendo el JSON
   */
  private parseResponse(text: string): any {
    try {
      // Gemini puede devolver el JSON con backticks
      let cleanText = text.trim();
      
      // Remover markdown code blocks si existen
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n/, '').replace(/\n```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n/, '').replace(/\n```$/, '');
      }

      // Buscar JSON en la respuesta
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error('Invalid JSON response from Gemini');
    }
  }
}

