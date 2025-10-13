import { useState, useEffect } from 'react';
import { useSurvivalGame } from '@/hooks/useSurvivalGame';
import { SurvivalLobby } from './SurvivalLobby';
import { SurvivalGameHUD } from './SurvivalGameHUD';
import { SurvivalQuestionScreen } from './SurvivalQuestionScreen';
import { SurvivalEliminationScreen } from './SurvivalEliminationScreen';
import { SurvivalFinalResults } from './SurvivalFinalResults';
import { Loader2 } from 'lucide-react';

interface SurvivalGameScreenProps {
  gameCode: string;
  userId: number;
}

type GamePhase = 'lobby' | 'question' | 'elimination' | 'finished';

/**
 * SurvivalGameScreen - Componente principal para modo supervivencia
 * Orquesta todas las pantallas del juego
 */
export function SurvivalGameScreen({ gameCode, userId }: SurvivalGameScreenProps) {
  const currentUserId = userId;
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [playersConnected, setPlayersConnected] = useState(0);

  const {
    gameState,
    currentQuestion,
    isEliminated,
    roundEndData,
    finalResults,
    loading,
    error,
    answersReceived,
    totalPlayers,
    answerQuestion,
  } = useSurvivalGame({
    gameCode,
    userId: currentUserId,
    onGameFinished: () => {
      setPhase('finished');
    },
    onEliminated: () => {
      console.log('[SurvivalGame] Jugador eliminado');
    },
  });

  // Detectar cambios de fase
  useEffect(() => {
    if (finalResults) {
      setPhase('finished');
    } else if (roundEndData) {
      setPhase('elimination');
    } else if (currentQuestion) {
      setPhase('question');
    } else if (gameState?.status === 'waiting') {
      setPhase('lobby');
    }
  }, [currentQuestion, roundEndData, finalResults, gameState]);

  // Actualizar contador de jugadores conectados
  useEffect(() => {
    if (gameState) {
      setPlayersConnected(gameState.players.length);
    }
  }, [gameState]);

  // Loading state
  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Cargando juego...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md">
          <h2 className="text-white text-2xl font-bold mb-4">Error</h2>
          <p className="text-white/80">{error}</p>
        </div>
      </div>
    );
  }

  // Render based on phase
  return (
    <div className="relative">
      {/* HUD (visible during question phase) */}
      {phase === 'question' && !isEliminated && gameState.metadata && (
        <SurvivalGameHUD
          metadata={gameState.metadata}
          currentScore={
            gameState.players.find((p) => p.userId === currentUserId)?.score || 0
          }
          currentRank={
            gameState.players
              .filter((p) => !p.is_eliminated)
              .sort((a, b) => b.score - a.score)
              .findIndex((p) => p.userId === currentUserId) + 1
          }
          answersReceived={answersReceived}
          totalPlayers={totalPlayers}
        />
      )}

      {/* Main Content */}
      {phase === 'lobby' && (
        <SurvivalLobby gameState={gameState} playersConnected={playersConnected} />
      )}

      {phase === 'question' && currentQuestion && (
        <SurvivalQuestionScreen
          question={currentQuestion}
          onAnswer={answerQuestion}
          disabled={isEliminated}
        />
      )}

      {phase === 'elimination' && roundEndData && (
        <SurvivalEliminationScreen
          roundEndData={roundEndData}
          onContinue={() => setPhase('lobby')} // Wait for next round
          wasEliminated={isEliminated}
        />
      )}

      {phase === 'finished' && finalResults && (
        <SurvivalFinalResults results={finalResults} currentUserId={currentUserId} />
      )}

      {/* Eliminated Overlay (if eliminated but game continues) */}
      {isEliminated && phase === 'question' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-2xl p-6">
            <p className="text-white text-2xl font-bold text-center">
              ☠️ Eliminado - Modo Espectador
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
