import AIService from '@/services/ai/AIService';
import QuestionSetService from '@/services/QuestionSetService';
import { GenerateConfig, AIProvider } from '@/types/ai.types';
import { CreateQuestionSetInput } from '@/types/questionSet.types';

/**
 * Servicio que integra IA con QuestionSets
 * Genera preguntas y las guarda directamente
 */
export class AIQuestionSetService {
  /**
   * Generar y guardar un question set desde texto
   */
  async generateAndSave(
    teacherId: number,
    input: {
      text: string;
      title: string;
      description?: string;
      subjectArea: string;
      gradeLevel?: string;
      provider?: AIProvider;
      config: GenerateConfig;
      customKeys?: { claude?: string; gemini?: string; openai?: string };
    }
  ) {
    // Generar preguntas con IA
    const aiResponse = await AIService.generateQuestions(
      input.text,
      input.config,
      input.provider,
      input.customKeys
    );

    // Crear el question set input
    const questionSetInput: CreateQuestionSetInput = {
      title: input.title,
      description: input.description || `Generated with ${aiResponse.metadata?.provider}`,
      subject_area: input.subjectArea,
      grade_level: input.gradeLevel,
      difficulty: input.config.difficulty,
      is_public: false,
      tags: [
        `ai-generated`,
        `${aiResponse.metadata?.provider}`,
        input.subjectArea,
      ],
      questions: aiResponse.questions,
    };

    // Guardar en la base de datos
    const questionSet = await QuestionSetService.create(teacherId, questionSetInput);

    return {
      questionSet,
      aiMetadata: aiResponse.metadata,
    };
  }

  /**
   * Generar y guardar desde PDF
   */
  async generateAndSaveFromPDF(
    teacherId: number,
    input: {
      pdfBuffer: Buffer;
      filename: string;
      title: string;
      description?: string;
      subjectArea: string;
      gradeLevel?: string;
      provider?: AIProvider;
      config: GenerateConfig;
      customKeys?: { claude?: string; gemini?: string; openai?: string };
    }
  ) {
    // Generar preguntas desde PDF
    const aiResponse = await AIService.generateQuestions(
      input.pdfBuffer,
      input.config,
      input.provider,
      input.customKeys
    );

    // Crear el question set input
    const questionSetInput: CreateQuestionSetInput = {
      title: input.title,
      description: input.description || `Generated from PDF: ${input.filename}`,
      subject_area: input.subjectArea,
      grade_level: input.gradeLevel,
      difficulty: input.config.difficulty,
      is_public: false,
      tags: [
        `ai-generated`,
        `${aiResponse.metadata?.provider}`,
        `pdf-source`,
        input.subjectArea,
      ],
      questions: aiResponse.questions,
    };

    // Guardar en la base de datos
    const questionSet = await QuestionSetService.create(teacherId, questionSetInput);

    return {
      questionSet,
      aiMetadata: aiResponse.metadata,
      sourceFile: input.filename,
    };
  }
}

export default new AIQuestionSetService();

