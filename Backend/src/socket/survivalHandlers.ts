import { Socket } from 'socket.io';
import SurvivalGameService from '@/services/SurvivalGameService';
import GameplayService from '@/services/GameplayService';
import { getSocketIO } from './socketInstance';
import { CustomSocket } from '@/config/socket';
import prisma from '@/config/database';

/**
 * Socket Handlers para Survival Mode
 */

export function registerSurvivalHandlers(socket: Socket) {
  /**
   * survival:join - Unirse a un juego de supervivencia
   */
  socket.on('survival:join', async (data: { gameCode: string }, callback) => {
    try {
      const { gameCode } = data;
      const userId = socket.data.userId;

      if (!userId) {
        return callback({ success: false, message: 'No autenticado' });
      }

      // Verificar que el juego existe y es de tipo survival
      const game = await prisma.games.findUnique({
        where: { game_code: gameCode }
      });

      if (!game) {
        return callback({ success: false, message: 'Juego no encontrado' });
      }

      if (game.game_mode !== 'survival') {
        return callback({ success: false, message: 'Este no es un juego de supervivencia' });
      }

      // Unirse al room
      socket.join(`game:${gameCode}`);
      socket.join(`survival:${gameCode}`);

      console.log(`[Survival] Usuario ${userId} se unió al juego ${gameCode}`);

      callback({ success: true, message: 'Unido al juego de supervivencia' });
    } catch (error: any) {
      console.error('[Survival] Error al unirse:', error);
      callback({ success: false, message: error.message });
    }
  });

  /**
   * survival:initialize - Inicializar juego (solo profesor)
   */
  socket.on('survival:initialize', async (data: { gameId: number }, callback) => {
    try {
      const { gameId } = data;

      const metadata = await SurvivalGameService.initializeSurvivalGame(gameId);

      // Obtener game code
      const game = await prisma.games.findUnique({
        where: { game_id: gameId }
      });

      if (!game) {
        return callback({ success: false, message: 'Juego no encontrado' });
      }

      // Notificar a todos los jugadores
      const io = getSocketIO();
      io.to(`survival:${game.game_code}`).emit('survival:initialized', {
        metadata,
        message: 'Juego de supervivencia inicializado'
      });

      callback({ success: true, metadata });
    } catch (error: any) {
      console.error('[Survival] Error al inicializar:', error);
      callback({ success: false, message: error.message });
    }
  });

  /**
   * survival:start-round - Iniciar ronda (solo profesor)
   */
  socket.on('survival:start-round', async (data: { gameId: number; roundNumber: number }, callback) => {
    try {
      const { gameId, roundNumber } = data;

      await SurvivalGameService.startSurvivalRound(gameId, roundNumber);

      callback({ success: true, message: `Ronda ${roundNumber} iniciada` });
    } catch (error: any) {
      console.error('[Survival] Error al iniciar ronda:', error);
      callback({ success: false, message: error.message });
    }
  });

  /**
   * survival:answer - Responder pregunta en modo supervivencia
   */
  socket.on('survival:answer', async (data: {
    gameCode: string;
    questionId: number;
    optionId: number;
    timeSpent: number;
  }, callback) => {
    try {
      const { gameCode, questionId, optionId, timeSpent } = data;
      const userId = socket.data.userId;

      if (!userId) {
        return callback({ success: false, message: 'No autenticado' });
      }

      // Obtener juego
      const game = await prisma.games.findUnique({
        where: { game_code: gameCode }
      });

      if (!game) {
        return callback({ success: false, message: 'Juego no encontrado' });
      }

      // Usar GameplayService para procesar respuesta (actualiza Redis automáticamente)
      const result = await GameplayService.processAnswer(
        gameCode,
        userId,
        questionId,
        optionId,
        timeSpent
      );

      // Emitir respuesta recibida
      const io = getSocketIO();
      io.to(`survival:${gameCode}`).emit('survival:answer-received', {
        userId,
        isCorrect: result.isCorrect,
        score: result.scoreResult.totalPoints
      });

      callback({
        success: true,
        result: {
          isCorrect: result.isCorrect,
          score: result.scoreResult.totalPoints,
          points: result.scoreResult.points
        }
      });
    } catch (error: any) {
      console.error('[Survival] Error al responder:', error);
      callback({ success: false, message: error.message });
    }
  });

  /**
   * survival:process-elimination - Procesar eliminación (solo profesor)
   */
  socket.on('survival:process-elimination', async (data: { gameId: number }, callback) => {
    try {
      const { gameId } = data;

      const result = await SurvivalGameService.processEliminationRound(gameId);

      callback({
        success: true,
        eliminated_count: result.eliminated.length,
        survivors_count: result.survivors.length
      });
    } catch (error: any) {
      console.error('[Survival] Error al procesar eliminación:', error);
      callback({ success: false, message: error.message });
    }
  });

  /**
   * survival:finish - Finalizar juego (solo profesor)
   */
  socket.on('survival:finish', async (data: { gameId: number }, callback) => {
    try {
      const { gameId } = data;

      await SurvivalGameService.finishSurvivalGame(gameId);

      callback({ success: true, message: 'Juego finalizado' });
    } catch (error: any) {
      console.error('[Survival] Error al finalizar:', error);
      callback({ success: false, message: error.message });
    }
  });

  /**
   * survival:get-status - Obtener estado actual
   */
  socket.on('survival:get-status', async (data: { gameId: number }, callback) => {
    try {
      const { gameId } = data;

      const status = await SurvivalGameService.getSurvivalStatus(gameId);

      callback({ success: true, data: status });
    } catch (error: any) {
      console.error('[Survival] Error al obtener estado:', error);
      callback({ success: false, message: error.message });
    }
  });
}
