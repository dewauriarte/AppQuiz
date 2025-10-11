import { Request, Response } from 'express';
import prisma from '@/config/database';
import { UnauthorizedError, BadRequestError, NotFoundError } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';

/**
 * Actualizar una pregunta individual
 */
export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;
  const {
    question_text,
    difficulty,
    bloom_taxonomy_level,
    time_limit,
    points,
    explanation,
    options,
  } = req.body;

  // Verificar que la pregunta existe
  const existingQuestion = await prisma.questions.findUnique({
    where: { question_id: parseInt(id) },
    include: {
      question_sets: {
        select: {
          teacher_id: true,
        },
      },
    },
  });

  if (!existingQuestion) {
    throw new NotFoundError('Pregunta no encontrada');
  }

  // Verificar que el usuario es el creador o admin
  if (existingQuestion.question_sets.teacher_id !== userId && req.userRole !== 'admin') {
    throw new UnauthorizedError('No tienes permiso para actualizar esta pregunta');
  }

  // Validaciones
  if (question_text && question_text.length < 10) {
    throw new BadRequestError('La pregunta debe tener al menos 10 caracteres');
  }

  if (difficulty && (difficulty < 1 || difficulty > 10)) {
    throw new BadRequestError('La dificultad debe estar entre 1 y 10');
  }

  if (time_limit && (time_limit < 10 || time_limit > 300)) {
    throw new BadRequestError('El tiempo límite debe estar entre 10 y 300 segundos');
  }

  if (points && (points < 1 || points > 10000)) {
    throw new BadRequestError('Los puntos deben estar entre 1 y 10000');
  }

  // Actualizar pregunta en una transacción
  const updatedQuestion = await prisma.$transaction(async (tx) => {
    // Actualizar pregunta
    await tx.questions.update({
      where: { question_id: parseInt(id) },
      data: {
        question_text,
        difficulty,
        bloom_taxonomy_level,
        time_limit,
        points,
        explanation,
      },
    });

    // Si se proporcionaron opciones, actualizarlas
    if (options && Array.isArray(options)) {
      // Validar que haya al menos una opción correcta
      const hasCorrectOption = options.some((opt: any) => opt.is_correct);
      if (!hasCorrectOption) {
        throw new BadRequestError('Debe haber al menos una opción correcta');
      }

      // Actualizar cada opción
      for (const option of options) {
        if (option.option_id) {
          await tx.question_options.update({
            where: { option_id: option.option_id },
            data: {
              option_text: option.option_text,
              is_correct: option.is_correct,
              explanation: option.explanation || null,
              position: option.position,
            },
          });
        }
      }
    }

    // Retornar pregunta actualizada con opciones
    return await tx.questions.findUnique({
      where: { question_id: parseInt(id) },
      include: {
        question_options: {
          orderBy: { position: 'asc' },
        },
      },
    });
  });

  res.json({
    success: true,
    message: 'Pregunta actualizada exitosamente',
    data: updatedQuestion,
  });
});

/**
 * Eliminar una pregunta individual (soft delete)
 */
export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  // Verificar que la pregunta existe
  const existingQuestion = await prisma.questions.findUnique({
    where: { question_id: parseInt(id) },
    include: {
      question_sets: {
        select: {
          teacher_id: true,
          set_id: true,
        },
      },
    },
  });

  if (!existingQuestion) {
    throw new NotFoundError('Pregunta no encontrada');
  }

  // Verificar que el usuario es el creador o admin
  if (existingQuestion.question_sets.teacher_id !== userId && req.userRole !== 'admin') {
    throw new UnauthorizedError('No tienes permiso para eliminar esta pregunta');
  }

  // Hard delete de la pregunta (las preguntas no tienen soft delete)
  await prisma.questions.delete({
    where: { question_id: parseInt(id) },
  });

  // Actualizar el conteo de preguntas del question set
  const questionCount = await prisma.questions.count({
    where: {
      set_id: existingQuestion.question_sets.set_id,
    },
  });

  await prisma.question_sets.update({
    where: { set_id: existingQuestion.question_sets.set_id },
    data: {
      total_questions: questionCount,
    },
  });

  res.json({
    success: true,
    message: 'Pregunta eliminada exitosamente',
  });
});

export default {
  updateQuestion,
  deleteQuestion,
};
