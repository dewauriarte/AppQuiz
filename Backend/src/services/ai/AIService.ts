import { AIProviderFactory } from './AIProviderFactory';
import { GenerateConfig, QuestionInput, AIProvider, AIResponse } from '@/types/ai.types';
import { BadRequestError } from '@/utils/ApiError';

/**
 * Servicio principal para generación de preguntas con IA
 * Coordina los diferentes providers y maneja la lógica de negocio
 */
export class AIService {
  /**
   * Genera preguntas desde texto usando el provider especificado
   */
  async generateQuestions(
    input: string | Buffer,
    config: GenerateConfig,
    providerName?: AIProvider,
    customKeys?: { claude?: string; gemini?: string; openai?: string }
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Validar input
      if (typeof input === 'string' && input.trim().length < 100) {
        throw new BadRequestError('Text input too short (minimum 100 characters)');
      }

      // Crear provider
      const provider = providerName
        ? AIProviderFactory.create(providerName, customKeys)
        : await AIProviderFactory.getBestAvailable(customKeys);

      console.log(`Generating questions with provider: ${provider.name}`);

      // Verificar disponibilidad
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        throw new BadRequestError(`Provider ${provider.name} is not available`);
      }

      // Generar preguntas
      let questions: QuestionInput[];

      if (Buffer.isBuffer(input)) {
        questions = await provider.generateFromPDF(input, config);
      } else {
        questions = await provider.generateQuestions(input, config);
      }

      // Validar que se generaron preguntas
      if (!questions || questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Validar y ajustar cantidad de preguntas
      // Si el AI generó más preguntas de las solicitadas, tomar solo las primeras N
      if (questions.length > config.numQuestions) {
        console.warn(
          `AI generated ${questions.length} questions but only ${config.numQuestions} were requested. Truncating to requested amount.`
        );
        questions = questions.slice(0, config.numQuestions);
      } else if (questions.length < config.numQuestions) {
        console.warn(
          `AI generated ${questions.length} questions but ${config.numQuestions} were requested.`
        );
      }

      const processingTime = Date.now() - startTime;

      // Log de uso para analytics
      await this.logUsage(provider.name, questions.length, processingTime);

      // Retornar respuesta con metadata
      return {
        questions,
        metadata: {
          provider: provider.name,
          model: this.getModelName(provider.name),
          processingTime,
        },
      };
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
  }

  /**
   * Compara resultados de múltiples providers
   * Útil para evaluar cuál da mejores resultados
   */
  async compareProviders(
    text: string,
    config: GenerateConfig
  ): Promise<{ provider: string; questions: QuestionInput[]; cost: number }[]> {
    const configuredProviders = AIProviderFactory.getConfiguredProviders();
    const results = [];

    for (const providerName of configuredProviders) {
      try {
        const provider = AIProviderFactory.create(providerName);
        
        if (await provider.isAvailable()) {
          const questions = await provider.generateQuestions(text, config);
          const cost = provider.estimateCost(questions.length);

          results.push({
            provider: providerName,
            questions,
            cost,
          });
        }
      } catch (error) {
        console.error(`Provider ${providerName} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Obtiene información de todos los providers disponibles
   */
  async getAvailableProviders(customKeys?: { claude?: string; gemini?: string; openai?: string }) {
    return await AIProviderFactory.getAllProvidersInfo(customKeys);
  }

  /**
   * Estima el costo de generar preguntas
   */
  async estimateCost(numQuestions: number, providerName?: AIProvider, customKeys?: { claude?: string; gemini?: string; openai?: string }) {
    const provider = providerName
      ? AIProviderFactory.create(providerName, customKeys)
      : AIProviderFactory.createDefault(customKeys);

    return {
      provider: provider.name,
      numQuestions,
      estimatedCost: provider.estimateCost(numQuestions),
      currency: 'USD',
    };
  }

  /**
   * Registra el uso de IA para analytics y costos
   */
  private async logUsage(
    provider: AIProvider,
    questionsGenerated: number,
    processingTime: number
  ) {
    // TODO: Guardar en base de datos o servicio de analytics
    console.log('AI Usage:', {
      provider,
      questionsGenerated,
      processingTime,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Obtiene el nombre del modelo usado por cada provider
   */
  private getModelName(provider: AIProvider): string {
    const models: Record<AIProvider, string> = {
      claude: 'claude-3.5/4.5-sonnet',
      gemini: 'gemini-1.5-flash-002',
      openai: 'gpt-4-turbo-preview',
    };
    return models[provider];
  }
}

export default new AIService();

