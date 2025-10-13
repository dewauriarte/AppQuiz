import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import BoardGameService from '@/services/BoardGameService';
import { rollDiceSchema, buyShopItemSchema } from '@/types/boardGame.types';
import { NotFoundError, BadRequestError } from '@/utils/ApiError';
import prisma from '@/config/database';
import { GameMode } from '@prisma/client';

/**
 * Board Game Controller - Sprint 11
 * REST endpoints para el modo tablero
 */

export class BoardGameController {
  /**
   * POST /api/games/:gameCode/board/roll
   * Tirar dado (también disponible via Socket.IO)
   */
  rollDice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('Usuario no autenticado');
    }

    const { gameCode } = req.params;
    
    // Validar input
    rollDiceSchema.parse({
      gameCode,
      userId: req.userId,
    });

    // Verificar que el juego es modo tablero
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    if (game.game_mode !== GameMode.board) {
      throw new BadRequestError('Este juego no es modo tablero');
    }

    // Tirar dado
    const result = await BoardGameService.rollDice(gameCode, req.userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * GET /api/games/:gameCode/board/state
   * Obtener estado actual del tablero
   */
  getState = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { gameCode } = req.params;

    // Verificar que el juego existe
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    if (game.game_mode !== GameMode.board) {
      throw new BadRequestError('Este juego no es modo tablero');
    }

    // Obtener estado del tablero
    const boardState = await BoardGameService['getBoardState'](gameCode);
    const players = await BoardGameService.getAllBoardPlayers(gameCode);

    if (!boardState) {
      throw new NotFoundError('Estado del tablero no encontrado');
    }

    res.status(200).json({
      success: true,
      data: {
        board_state: boardState,
        players: players,
      },
    });
  });

  /**
   * POST /api/games/:gameCode/board/buy-item
   * Comprar item en checkpoint (tienda)
   */
  buyItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      throw new BadRequestError('Usuario no autenticado');
    }

    const { gameCode } = req.params;
    const { item_type } = req.body;

    // Validar input
    buyShopItemSchema.parse({
      gameCode,
      userId: req.userId,
      item_type,
    });

    // Verificar que el juego es modo tablero
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    if (game.game_mode !== GameMode.board) {
      throw new BadRequestError('Este juego no es modo tablero');
    }

    // TODO: Implementar lógica completa de compra
    // Por ahora, devolver mensaje de "en desarrollo"

    res.status(200).json({
      success: true,
      message: 'Funcionalidad de tienda en desarrollo',
      data: {
        item_type,
      },
    });
  });

  /**
   * GET /api/games/:gameCode/board/leaderboard
   * Obtener leaderboard del tablero (ranking por posición y coins)
   */
  getLeaderboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { gameCode } = req.params;

    // Verificar que el juego existe
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    if (game.game_mode !== GameMode.board) {
      throw new BadRequestError('Este juego no es modo tablero');
    }

    // Obtener todos los jugadores
    const players = await BoardGameService.getAllBoardPlayers(gameCode);

    // Ordenar por posición (mayor primero) y luego por coins
    const sortedPlayers = [...players].sort((a, b) => {
      if (b.board_position !== a.board_position) {
        return b.board_position - a.board_position;
      }
      return b.coins_collected - a.coins_collected;
    });

    // Agregar rank
    const leaderboard = sortedPlayers.map((player, index) => ({
      rank: index + 1,
      user_id: player.userId,
      nickname: player.nickname,
      board_position: player.board_position,
      coins_collected: player.coins_collected,
      is_turn: player.is_turn,
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        total_players: leaderboard.length,
      },
    });
  });
}

export default new BoardGameController();
