import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import type {
  SurvivalGameState,
  SurvivalRoundStartPayload,
  SurvivalRoundEndPayload,
  SurvivalFinalRoundPayload,
  SurvivalGameFinishedPayload,
  SurvivalAnswerReceivedPayload,
  SurvivalQuestion,
} from '@/types/survival.types';

interface UseSurvivalGameOptions {
  gameCode: string;
  userId: number;
  onGameFinished?: (payload: SurvivalGameFinishedPayload) => void;
  onEliminated?: () => void;
}

export function useSurvivalGame({ gameCode, userId, onGameFinished, onEliminated }: UseSurvivalGameOptions) {
  const socket = getSocket();
  const [gameState, setGameState] = useState<SurvivalGameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<SurvivalQuestion | null>(null);
  const [isEliminated, setIsEliminated] = useState(false);
  const [roundEndData, setRoundEndData] = useState<SurvivalRoundEndPayload | null>(null);
  const [finalResults, setFinalResults] = useState<SurvivalGameFinishedPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answersReceived, setAnswersReceived] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Refs para evitar re-renders
  const eliminatedRef = useRef(false);

  /**
   * Unirse al juego de supervivencia
   */
  const joinGame = useCallback(() => {
    if (!socket) return;

    console.log('[Survival] Uniéndose al juego:', gameCode);
    
    socket.emit('survival:join', { gameCode }, (response: any) => {
      if (response.success) {
        console.log('[Survival] Unido exitosamente');
        setLoading(false);
      } else {
        console.error('[Survival] Error al unirse:', response.message);
        setError(response.message);
        setLoading(false);
      }
    });
  }, [socket, gameCode]);

  /**
   * Responder pregunta
   */
  const answerQuestion = useCallback(
    (questionId: number, optionId: number, timeSpent: number) => {
      if (!socket || isEliminated) return;

      console.log('[Survival] Enviando respuesta:', { questionId, optionId, timeSpent });

      socket.emit(
        'survival:answer',
        { gameCode, questionId, optionId, timeSpent },
        (response: any) => {
          if (response.success) {
            console.log('[Survival] Respuesta registrada:', response.result);
          } else {
            console.error('[Survival] Error al responder:', response.message);
          }
        }
      );
    },
    [socket, gameCode, isEliminated]
  );

  /**
   * Obtener estado del juego
   */
  const getGameStatus = useCallback(() => {
    if (!socket) return;

    socket.emit('survival:get-status', { gameCode }, (response: any) => {
      if (response.success) {
        setGameState(response.data);
      }
    });
  }, [socket, gameCode]);

  /**
   * Setup socket listeners
   */
  useEffect(() => {
    if (!socket) return;

    // Iniciar ronda
    const handleRoundStart = (payload: SurvivalRoundStartPayload) => {
      console.log('[Survival] Ronda iniciada:', payload);
      
      setCurrentQuestion(payload.question);
      setRoundEndData(null);
      setAnswersReceived(0);
      setTotalPlayers(payload.players_alive);
      
      // Actualizar metadata
      setGameState((prev) => prev ? {
        ...prev,
        metadata: {
          ...prev.metadata,
          current_round: payload.round,
          safe_zone_size: payload.safe_zone_size,
          players_alive: payload.players_alive,
          is_final_round: payload.is_final_round,
        },
      } : null);
    };

    // Fin de ronda
    const handleRoundEnd = (payload: SurvivalRoundEndPayload) => {
      console.log('[Survival] Ronda finalizada:', payload);
      
      setRoundEndData(payload);
      setCurrentQuestion(null);

      // Verificar si fuiste eliminado
      const wasEliminated = payload.eliminated.some(p => p.userId === userId);
      
      if (wasEliminated && !eliminatedRef.current) {
        eliminatedRef.current = true;
        setIsEliminated(true);
        onEliminated?.();
      }
    };

    // Ronda final activada
    const handleFinalRound = (payload: SurvivalFinalRoundPayload) => {
      console.log('[Survival] ¡Ronda final activada!:', payload);
      
      setGameState((prev) => prev ? {
        ...prev,
        metadata: {
          ...prev.metadata,
          is_final_round: true,
          players_alive: payload.players_alive,
        },
      } : null);
    };

    // Juego finalizado
    const handleGameFinished = (payload: SurvivalGameFinishedPayload) => {
      console.log('[Survival] Juego finalizado:', payload);
      
      setFinalResults(payload);
      setCurrentQuestion(null);
      setGameState((prev) => prev ? { ...prev, status: 'finished' } : null);
      
      onGameFinished?.(payload);
    };

    // Respuesta recibida
    const handleAnswerReceived = (payload: SurvivalAnswerReceivedPayload) => {
      setAnswersReceived(payload.answers_received);
      setTotalPlayers(payload.total_players);
    };

    // Registrar listeners
    socket.on('survival:round-start', handleRoundStart);
    socket.on('survival:round-end', handleRoundEnd);
    socket.on('survival:final-round', handleFinalRound);
    socket.on('survival:game-finished', handleGameFinished);
    socket.on('survival:answer-received', handleAnswerReceived);

    // Cleanup
    return () => {
      socket.off('survival:round-start', handleRoundStart);
      socket.off('survival:round-end', handleRoundEnd);
      socket.off('survival:final-round', handleFinalRound);
      socket.off('survival:game-finished', handleGameFinished);
      socket.off('survival:answer-received', handleAnswerReceived);
    };
  }, [socket, userId, onGameFinished, onEliminated]);

  /**
   * Unirse al juego cuando se monta
   */
  useEffect(() => {
    joinGame();
  }, [joinGame]);

  return {
    // State
    gameState,
    currentQuestion,
    isEliminated,
    roundEndData,
    finalResults,
    loading,
    error,
    answersReceived,
    totalPlayers,
    
    // Actions
    answerQuestion,
    getGameStatus,
  };
}
