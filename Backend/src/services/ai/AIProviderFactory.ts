import { IAIProvider } from './IAIProvider';
import { ClaudeProvider } from './ClaudeProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AIProvider } from '@/types/ai.types';
import { env } from '@/config/env';

/**
 * Factory para crear providers de IA
 * Patrón Factory + Strategy
 */
export class AIProviderFactory {
  /**
   * Crea un provider específico
   * @param provider - Nombre del provider
   * @param customKeys - Claves API opcionales desde el cliente
   */
  static create(provider: AIProvider, customKeys?: { claude?: string; gemini?: string; openai?: string }): IAIProvider {
    switch (provider) {
      case 'claude':
        const claudeKey = customKeys?.claude || env.ANTHROPIC_API_KEY;
        if (!claudeKey) {
          throw new Error('ANTHROPIC_API_KEY not configured');
        }
        return new ClaudeProvider(claudeKey);

      case 'gemini':
        const geminiKey = customKeys?.gemini || env.GOOGLE_AI_API_KEY;
        if (!geminiKey) {
          throw new Error('GOOGLE_AI_API_KEY not configured');
        }
        return new GeminiProvider(geminiKey);

      case 'openai':
        const openaiKey = customKeys?.openai || env.OPENAI_API_KEY;
        if (!openaiKey) {
          throw new Error('OPENAI_API_KEY not configured');
        }
        return new OpenAIProvider(openaiKey);

      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  /**
   * Crea el provider por defecto configurado
   */
  static createDefault(customKeys?: { claude?: string; gemini?: string; openai?: string }): IAIProvider {
    const defaultProvider = (env.DEFAULT_AI_PROVIDER || 'claude') as AIProvider;
    return this.create(defaultProvider, customKeys);
  }

  /**
   * Obtiene el primer provider disponible
   * Intenta en orden: claude, gemini, openai
   */
  static async getBestAvailable(customKeys?: { claude?: string; gemini?: string; openai?: string }): Promise<IAIProvider> {
    const providers: AIProvider[] = ['claude', 'gemini', 'openai'];

    for (const providerName of providers) {
      try {
        const provider = this.create(providerName, customKeys);
        if (await provider.isAvailable()) {
          console.log(`Using available provider: ${providerName}`);
          return provider;
        }
      } catch (error) {
        console.warn(`Provider ${providerName} not available:`, error);
        continue;
      }
    }

    throw new Error('No AI providers available. Please configure at least one API key.');
  }

  /**
   * Lista todos los providers configurados
   */
  static getConfiguredProviders(customKeys?: { claude?: string; gemini?: string; openai?: string }): AIProvider[] {
    const configured: AIProvider[] = [];

    if (customKeys?.claude || env.ANTHROPIC_API_KEY) configured.push('claude');
    if (customKeys?.gemini || env.GOOGLE_AI_API_KEY) configured.push('gemini');
    if (customKeys?.openai || env.OPENAI_API_KEY) configured.push('openai');

    return configured;
  }

  /**
   * Obtiene información de todos los providers
   */
  static async getAllProvidersInfo(customKeys?: { claude?: string; gemini?: string; openai?: string }) {
    const allProviders: AIProvider[] = ['claude', 'gemini', 'openai'];
    const info = [];

    for (const providerName of allProviders) {
      try {
        const provider = this.create(providerName, customKeys);
        const available = await provider.isAvailable();

        info.push({
          ...provider.getInfo(),
          available,
          configured: true,
        });
      } catch (error) {
        // Si el provider no está configurado, aún lo retornamos pero como no disponible
        const providerInfoDefaults = {
          claude: {
            name: 'claude' as const,
            displayName: 'Claude 3 (Anthropic)',
            costPerQuestion: 0.01,
            maxTokens: 4096,
          },
          gemini: {
            name: 'gemini' as const,
            displayName: 'Gemini Pro (Google)',
            costPerQuestion: 0.008,
            maxTokens: 8192,
          },
          openai: {
            name: 'openai' as const,
            displayName: 'GPT-4 (OpenAI)',
            costPerQuestion: 0.012,
            maxTokens: 4096,
          },
        };

        info.push({
          ...providerInfoDefaults[providerName],
          available: false,
          configured: false,
          error: 'Not configured',
        });
      }
    }

    return info;
  }
}

