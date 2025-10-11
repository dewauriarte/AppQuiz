import { GenerateConfig } from '@/types/ai.types';

/**
 * Genera el prompt optimizado para cada provider de IA
 */
export class PromptBuilder {
  /**
   * Construye el prompt principal para generar preguntas
   */
  static buildQuestionGenerationPrompt(text: string, config: GenerateConfig): string {
    const {
      numQuestions,
      difficulty,
      topic,
      language = 'español',
      bloomLevel = 3,
      includeExplanations = true,
      timePerQuestion = 30,
    } = config;

    return `Eres un experto profesor creando preguntas de quiz educativo. 

CONTENIDO A ANALIZAR:
${text}

INSTRUCCIONES:
- Genera exactamente ${numQuestions} preguntas de opción múltiple
- Dificultad: ${difficulty} (easy=básico, medium=intermedio, hard=avanzado)
${topic ? `- Tema específico: ${topic}` : ''}
- Nivel de pensamiento: ${this.getBloomDescription(bloomLevel)}
- Idioma: ${language}
- Tiempo sugerido por pregunta: ${timePerQuestion} segundos

FORMATO DE RESPUESTA (JSON estricto):
{
  "questions": [
    {
      "question_text": "Texto de la pregunta clara y concisa",
      "question_type": "multiple_choice",
      "difficulty": "${difficulty}",
      "bloom_level": ${bloomLevel},
      "time_limit": ${timePerQuestion},
      "points": ${this.getPointsByDifficulty(difficulty)},
      "options": [
        {
          "option_text": "Opción 1",
          "is_correct": false${includeExplanations ? ',\n          "explanation": "Explicación de por qué es incorrecta"' : ''}
        },
        {
          "option_text": "Opción 2",
          "is_correct": true${includeExplanations ? ',\n          "explanation": "Explicación de por qué es correcta"' : ''}
        },
        {
          "option_text": "Opción 3",
          "is_correct": false${includeExplanations ? ',\n          "explanation": "Explicación de por qué es incorrecta"' : ''}
        },
        {
          "option_text": "Opción 4",
          "is_correct": false${includeExplanations ? ',\n          "explanation": "Explicación de por qué es incorrecta"' : ''}
        }
      ]
    }
  ]
}

REGLAS IMPORTANTES:
1. Cada pregunta DEBE tener exactamente 4 opciones
2. Solo UNA opción debe ser correcta (is_correct: true)
3. Las preguntas deben ser claras, sin ambigüedades
4. Las opciones incorrectas deben ser plausibles pero claramente erróneas
5. Evita preguntas de "todas las anteriores" o "ninguna de las anteriores"
6. Las preguntas deben basarse SOLO en el contenido proporcionado
7. Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después

${includeExplanations ? '8. Incluye explicaciones educativas para cada opción' : ''}`;
  }

  /**
   * Descripción del nivel de Bloom's Taxonomy
   */
  private static getBloomDescription(level: number): string {
    const descriptions: Record<number, string> = {
      1: 'Recordar (memorización)',
      2: 'Comprender (explicar ideas)',
      3: 'Aplicar (usar conocimiento)',
      4: 'Analizar (establecer conexiones)',
      5: 'Evaluar (justificar decisiones)',
      6: 'Crear (producir nuevo trabajo)',
    };
    return descriptions[level] || descriptions[3];
  }

  /**
   * Puntos según dificultad
   */
  private static getPointsByDifficulty(difficulty: string): number {
    const points: Record<string, number> = {
      easy: 1000,
      medium: 1500,
      hard: 2000,
    };
    return points[difficulty] || 1000;
  }

  /**
   * Prompt para mejorar una pregunta existente
   */
  static buildImproveQuestionPrompt(
    questionText: string,
    options: string[]
  ): string {
    return `Mejora esta pregunta de quiz para que sea más clara y educativa:

PREGUNTA ORIGINAL:
${questionText}

OPCIONES:
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

INSTRUCCIONES:
- Reescribe la pregunta para que sea más clara y específica
- Mejora las opciones para que sean más educativas
- Mantén el nivel de dificultad similar
- Responde en formato JSON siguiendo la estructura estándar`;
  }

  /**
   * Prompt para validar preguntas generadas
   */
  static buildValidationPrompt(questions: any[]): string {
    return `Revisa estas preguntas de quiz y verifica:

1. Que sean educativamente válidas
2. Que tengan exactamente una respuesta correcta
3. Que las opciones incorrectas sean plausibles
4. Que no haya ambigüedades

PREGUNTAS:
${JSON.stringify(questions, null, 2)}

Responde con:
{
  "valid": true/false,
  "issues": ["lista de problemas encontrados"],
  "suggestions": ["sugerencias de mejora"]
}`;
  }
}

