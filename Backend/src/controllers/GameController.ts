import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import GameService from '@/services/GameService';
import { createGameSchema, updateGameStatusSchema } from '@/types/game.types';
import { GameStatus } from '@prisma/client';

export class GameController {
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const validatedData = createGameSchema.parse(req.body);
    const game = await GameService.create(req.userId, validatedData);

    res.status(201).json({
      success: true,
      data: game,
      message: 'Juego creado exitosamente',
    });
  });

  getByCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params;
    const game = await GameService.getByCode(code);

    res.status(200).json({
      success: true,
      data: game,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!req.userId || !req.userRole) {
      throw new Error('User not authenticated');
    }

    const game = await GameService.getById(parseInt(id), req.userId, req.userRole);

    res.status(200).json({
      success: true,
      data: game,
    });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const validatedData = updateGameStatusSchema.parse(req.body);
    const game = await GameService.updateStatus(parseInt(id), req.userId, validatedData);

    res.status(200).json({
      success: true,
      data: game,
      message: 'Estado del juego actualizado',
    });
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const result = await GameService.delete(parseInt(id), req.userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const { page, limit, status } = req.query;

    const result = await GameService.listByTeacher(req.userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as GameStatus | undefined,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });
}

export default new GameController();

