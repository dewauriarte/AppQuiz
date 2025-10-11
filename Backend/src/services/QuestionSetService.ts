import prisma from '@/config/database';
import {
  CreateQuestionSetInput,
  UpdateQuestionSetInput,
  QuestionSetFilters,
} from '@/types/questionSet.types';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/utils/ApiError';
import { DifficultyLevel } from '@prisma/client';

/**
 * Servicio para gestión de Question Sets
 * NOTA: Usa los nombres exactos del esquema de Prisma
 */
export class QuestionSetService {
  /**
   * Crear un nuevo question set con preguntas
   */
  async create(teacherId: number, data: CreateQuestionSetInput) {
    try {
      // Mapear difficulty de string a enum
      const difficultyMap: Record<string, DifficultyLevel> = {
        easy: 'easy' as DifficultyLevel,
        medium: 'medium' as DifficultyLevel,
        hard: 'hard' as DifficultyLevel,
      };

      const questionSet = await prisma.question_sets.create({
        data: {
          title: data.title,
          description: data.description,
          subject: data.subject_area,
          grade_level: data.grade_level,
          difficulty: difficultyMap[data.difficulty],
          is_public: data.is_public,
          tags: data.tags || [],
          teacher_id: teacherId,
          total_questions: data.questions.length,
          questions: {
            create: data.questions.map((q, index) => ({
              question_text: q.question_text,
              question_type: q.question_type,
              difficulty: this.mapDifficultyToNumber(q.difficulty),
              bloom_taxonomy_level: `Level ${q.bloom_level}`,
              time_limit: q.time_limit,
              points: q.points,
              explanation: q.explanation,
              order_index: index,
              question_options: {
                create: q.options.map((opt, optIndex) => ({
                  option_text: opt.option_text,
                  is_correct: opt.is_correct,
                  explanation: opt.explanation,
                  position: optIndex,
                })),
              },
            })),
          },
        },
        include: {
          questions: {
            include: {
              question_options: true,
            },
          },
          users: {
            select: {
              user_id: true,
              username: true,
              display_name: true,
            },
          },
        },
      });

      return questionSet;
    } catch (error) {
      console.error('Error creating question set:', error);
      throw new BadRequestError(`Failed to create question set: ${error}`);
    }
  }

  /**
   * Obtener un question set por ID
   */
  async getById(setId: number, userId: number, userRole: string) {
    const questionSet = await prisma.question_sets.findUnique({
      where: { set_id: setId },
      include: {
        questions: {
          include: {
            question_options: {
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { order_index: 'asc' },
        },
        users: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
          },
        },
      },
    });

    if (!questionSet) {
      throw new NotFoundError('Question set not found');
    }

    // Verificar acceso
    if (!questionSet.is_public && questionSet.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have access to this question set');
    }

    return questionSet;
  }

  /**
   * Listar question sets con filtros
   */
  async list(filters: QuestionSetFilters) {
    const {
      teacherId,
      subjectArea,
      difficulty,
      isPublic,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
    };

    if (teacherId) where.teacher_id = teacherId;
    if (subjectArea) where.subject = subjectArea;
    if (difficulty) where.difficulty = difficulty;
    if (isPublic !== undefined) where.is_public = isPublic;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [questionSets, total] = await Promise.all([
      prisma.question_sets.findMany({
        where,
        include: {
          users: {
            select: {
              user_id: true,
              username: true,
              display_name: true,
            },
          },
          _count: {
            select: {
              questions: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question_sets.count({ where }),
    ]);

    return {
      questionSets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Actualizar un question set
   */
  async update(
    setId: number,
    userId: number,
    userRole: string,
    data: UpdateQuestionSetInput
  ) {
    const questionSet = await prisma.question_sets.findUnique({
      where: { set_id: setId },
    });

    if (!questionSet) {
      throw new NotFoundError('Question set not found');
    }

    // Verificar permisos
    if (questionSet.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to update this question set');
    }

    // Mapear campos
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.subject_area) updateData.subject = data.subject_area;
    if (data.grade_level) updateData.grade_level = data.grade_level;
    if (data.difficulty) updateData.difficulty = data.difficulty;
    if (data.is_public !== undefined) updateData.is_public = data.is_public;
    if (data.tags) updateData.tags = data.tags;

    const updated = await prisma.question_sets.update({
      where: { set_id: setId },
      data: updateData,
      include: {
        questions: {
          include: {
            question_options: true,
          },
        },
        users: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Eliminar un question set (soft delete)
   */
  async delete(setId: number, userId: number, userRole: string) {
    const questionSet = await prisma.question_sets.findUnique({
      where: { set_id: setId },
    });

    if (!questionSet) {
      throw new NotFoundError('Question set not found');
    }

    // Verificar permisos
    if (questionSet.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to delete this question set');
    }

    await prisma.question_sets.update({
      where: { set_id: setId },
      data: {
        deleted_at: new Date(),
      },
    });

    return { message: 'Question set deleted successfully' };
  }

  /**
   * Duplicar un question set
   */
  async duplicate(setId: number, userId: number) {
    const original = await prisma.question_sets.findUnique({
      where: { set_id: setId },
      include: {
        questions: {
          include: {
            question_options: {
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { order_index: 'asc' },
        },
      },
    });

    if (!original) {
      throw new NotFoundError('Question set not found');
    }

    // Crear copia
    const duplicate = await prisma.question_sets.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        subject: original.subject,
        grade_level: original.grade_level,
        difficulty: original.difficulty,
        is_public: false,
        tags: original.tags,
        teacher_id: userId,
        total_questions: original.total_questions,
        questions: {
          create: original.questions.map((q: any) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            difficulty: q.difficulty,
            bloom_taxonomy_level: q.bloom_taxonomy_level,
            time_limit: q.time_limit,
            points: q.points,
            explanation: q.explanation,
            order_index: q.order_index,
            question_options: {
              create: q.question_options.map((opt: any) => ({
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                explanation: opt.explanation,
                position: opt.position,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            question_options: true,
          },
        },
      },
    });

    return duplicate;
  }

  /**
   * Agregar preguntas a un question set existente
   */
  async addQuestions(setId: number, userId: number, userRole: string, questions: any[]) {
    const questionSet = await prisma.question_sets.findUnique({
      where: { set_id: setId },
    });

    if (!questionSet) {
      throw new NotFoundError('Question set not found');
    }

    // Verificar permisos
    if (questionSet.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to add questions to this set');
    }

    // Obtener el último order_index
    const lastQuestion = await prisma.questions.findFirst({
      where: { set_id: setId },
      orderBy: { order_index: 'desc' },
    });

    const startIndex = (lastQuestion?.order_index || 0) + 1;

    // Crear las preguntas en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const createdQuestions = await Promise.all(
        questions.map((q, index) =>
          tx.questions.create({
            data: {
              set_id: setId,
              question_text: q.question_text,
              question_type: q.question_type,
              difficulty: this.mapDifficultyToNumber(q.difficulty),
              bloom_taxonomy_level: `Level ${q.bloom_level}`,
              time_limit: q.time_limit,
              points: q.points,
              explanation: q.explanation,
              order_index: startIndex + index,
              question_options: {
                create: q.options.map((opt: any, optIndex: number) => ({
                  option_text: opt.option_text,
                  is_correct: opt.is_correct,
                  explanation: opt.explanation,
                  position: optIndex,
                })),
              },
            },
            include: {
              question_options: true,
            },
          })
        )
      );

      // Actualizar el total_questions del set
      const updatedSet = await tx.question_sets.update({
        where: { set_id: setId },
        data: {
          total_questions: (questionSet.total_questions || 0) + questions.length,
          updated_at: new Date(),
        },
      });

      return { createdQuestions, updatedSet };
    });

    return result;
  }

  /**
   * Obtener estadísticas de un question set
   */
  async getStats(setId: number) {
    const questionSet = await prisma.question_sets.findUnique({
      where: { set_id: setId },
      include: {
        questions: true,
      },
    });

    if (!questionSet) {
      throw new NotFoundError('Question set not found');
    }

    const totalQuestions = questionSet.questions.length;
    const difficultyCount: Record<string, number> = {};

    questionSet.questions.forEach((q: any) => {
      const diff = this.mapNumberToDifficulty(q.difficulty);
      difficultyCount[diff] = (difficultyCount[diff] || 0) + 1;
    });

    const avgTimeLimit =
      questionSet.questions.reduce((sum: number, q: any) => sum + q.time_limit, 0) /
        totalQuestions || 0;

    const avgPoints =
      questionSet.questions.reduce((sum: number, q: any) => sum + q.points, 0) /
        totalQuestions || 0;

    return {
      totalQuestions,
      difficultyCount,
      avgTimeLimit: Math.round(avgTimeLimit),
      avgPoints: Math.round(avgPoints),
      estimatedDuration: Math.round(avgTimeLimit * totalQuestions),
    };
  }

  /**
   * Helpers para mapear difficulty
   */
  private mapDifficultyToNumber(difficulty: string): number {
    const map: Record<string, number> = {
      easy: 3,
      medium: 5,
      hard: 8,
    };
    return map[difficulty] || 5;
  }

  private mapNumberToDifficulty(num: number): string {
    if (num <= 3) return 'easy';
    if (num <= 6) return 'medium';
    return 'hard';
  }
}

export default new QuestionSetService();
