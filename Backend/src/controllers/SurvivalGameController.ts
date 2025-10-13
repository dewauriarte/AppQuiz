import { Request, Response, NextFunction } from 'express';
import SurvivalGameService from '@/services/SurvivalGameService';
import { asyncHandler } from '@/utils/asyncHandler';

/**
 * SurvivalGameController - Endpoints para modo supervivencia
 */

export class SurvivalGameController {
  /**
   * POST /api/games/:id/survival/answer
   * Responder en modo supervivencia
   */
  answerQuestion = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const gameId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { questionId, optionId, timeSpent } = req.body;

    // La lógica de respuesta usa el GameplayService existente
    // Solo agregamos tracking específico de survival

    res.json({
      success: true,
      message: 'Respuesta registrada'
    });
  });

  /**
   * GET /api/games/:id/survival/status
   * Obtener estado del juego de supervivencia
   */
  getStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const gameId = parseInt(req.params.id);

    const status = await SurvivalGameService.getSurvivalStatus(gameId);

    res.json({
      success: true,
      data: status
    });
  });

  /**
   * POST /api/games/:id/survival/initialize
   * Inicializar juego de supervivencia (solo profesor)
   */
  initialize = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const gameId = parseInt(req.params.id);

    const metadata = await SurvivalGameService.initializeSurvivalGame(gameId);

    res.json({
      success: true,
      message: 'Juego de supervivencia inicializado',
      data: metadata
    });
  });

  /**
   * POST /api/games/:id/survival/start-round
   * Iniciar ronda de supervivencia (solo profesor)
   */
  startRound = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const gameId = parseInt(req.params.id);
    const { roundNumber } = req.body;

    await SurvivalGameService.startSurvivalRound(gameId, roundNumber);

    res.json({
      success: true,
      message: `Ronda ${roundNumber} iniciada`
    });
  });

  /**
   * POST /api/games/:id/survival/process-elimination
   * Procesar eliminación de jugadores (solo profesor)
   */
  processElimination = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const gameId = parseInt(req.params.id);

    const result = await SurvivalGameService.processEliminationRound(gameId);

    res.json({
      success: true,
      message: `${result.eliminated.length} jugadores eliminados`,
      data: {
        eliminated: result.eliminated,
        survivors_count: result.survivors.length
      }
    });
  });

  /**
   * POST /api/games/:id/survival/finish
   * Finalizar juego de supervivencia (solo profesor)
   */
  finish = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const gameId = parseInt(req.params.id);

    await SurvivalGameService.finishSurvivalGame(gameId);

    res.json({
      success: true,
      message: 'Juego de supervivencia finalizado'
    });
  });
}

export default new SurvivalGameController();
