import { GenerateConfig, QuestionInput, AIProvider, ProviderInfo } from '@/types/ai.types';

/**
 * Interface base para todos los providers de IA
 * Patrón Strategy para intercambiar providers fácilmente
 */
export interface IAIProvider {
  /** Nombre del provider */
  name: AIProvider;

  /**
   * Genera preguntas desde texto plano
   * @param text - Contenido educativo a convertir en preguntas
   * @param config - Configuración de generación
   * @returns Array de preguntas generadas
   */
  generateQuestions(text: string, config: GenerateConfig): Promise<QuestionInput[]>;

  /**
   * Genera preguntas desde un archivo PDF
   * @param pdfBuffer - Buffer del PDF
   * @param config - Configuración de generación
   * @returns Array de preguntas generadas
   */
  generateFromPDF(pdfBuffer: Buffer, config: GenerateConfig): Promise<QuestionInput[]>;

  /**
   * Verifica si el provider está disponible (API key válida, límites no excedidos)
   * @returns true si está disponible
   */
  isAvailable(): Promise<boolean>;

  /**
   * Obtiene información del provider
   * @returns Información del provider
   */
  getInfo(): ProviderInfo;

  /**
   * Estima el costo de generar N preguntas
   * @param numQuestions - Número de preguntas
   * @returns Costo estimado en USD
   */
  estimateCost(numQuestions: number): number;
}

