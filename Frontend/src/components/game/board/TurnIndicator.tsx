import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Zap } from 'lucide-react';
import type { BoardPlayerState } from '@/types/board-game';

interface TurnIndicatorProps {
  currentPlayer: BoardPlayerState | null;
  isMyTurn: boolean;
  players: BoardPlayerState[];
  playSound?: boolean;
}

/**
 * TurnIndicator - Banner grande de turno con animaciones y sonido
 */
export function TurnIndicator({
  currentPlayer,
  isMyTurn,
  players,
  playSound = true,
}: TurnIndicatorProps) {
  const [show, setShow] = useState(true);

  // Reproducir sonido al cambiar turno
  useEffect(() => {
    if (!currentPlayer || !playSound) return;

    // Audio notification
    const audio = new Audio(isMyTurn ? '/sounds/your-turn.mp3' : '/sounds/turn-change.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silently fail if audio can't play
    });

    // Mostrar banner por 3 segundos
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentPlayer?.userId, isMyTurn, playSound]);

  if (!currentPlayer) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -200, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
        >
          <div className={`
            relative px-12 py-6 rounded-2xl shadow-2xl
            ${isMyTurn 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }
          `}>
            {/* Glow effect */}
            <div className={`
              absolute inset-0 rounded-2xl opacity-50 blur-xl
              ${isMyTurn ? 'bg-green-400' : 'bg-blue-400'}
            `} />

            {/* Content */}
            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                {isMyTurn ? (
                  <Zap className="w-10 h-10 text-white" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/40 animate-pulse" />
                  </div>
                )}
              </motion.div>

              {/* Text */}
              <div className="text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold mb-1"
                >
                  {isMyTurn ? '¡ES TU TURNO!' : `Turno de ${currentPlayer.nickname}`}
                </motion.div>
                <div className="text-white/80 text-sm font-medium">
                  {isMyTurn ? 'Tira el dado para continuar' : 'Esperando...'}
                </div>
              </div>

              {/* Sparkles */}
              {isMyTurn && <Sparkles />}
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 3 }}
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
              style={{ transformOrigin: 'left' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Sparkles decoration
 */
function Sparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.cos((i / 8) * Math.PI * 2) * 60,
            y: Math.sin((i / 8) * Math.PI * 2) * 60,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="absolute top-1/2 left-1/2 text-yellow-300 text-2xl"
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

/**
 * PlayerTurnArrow - Flecha apuntando al jugador activo
 */
interface PlayerTurnArrowProps {
  targetPlayerId: number;
  players: BoardPlayerState[];
}

export function PlayerTurnArrow({
  targetPlayerId,
  players,
}: PlayerTurnArrowProps) {
  const targetPlayer = players.find(p => p.userId === targetPlayerId);
  
  if (!targetPlayer) return null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="fixed pointer-events-none z-40"
      style={{
        // Position would need to be calculated based on player token position
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -100px)',
      }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="flex flex-col items-center"
      >
        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg mb-2">
          {targetPlayer.nickname}
        </div>
        <ArrowDown className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
      </motion.div>
    </motion.div>
  );
}

/**
 * TurnBadge - Badge compacto de turno (para mini views)
 */
interface TurnBadgeProps {
  isMyTurn: boolean;
  playerName?: string;
}

export function TurnBadge({ isMyTurn, playerName }: TurnBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        text-sm font-bold shadow-lg
        ${isMyTurn 
          ? 'bg-green-500 text-white animate-pulse' 
          : 'bg-gray-200 text-gray-700'
        }
      `}
    >
      <div className={`
        w-2 h-2 rounded-full
        ${isMyTurn ? 'bg-white' : 'bg-gray-400'}
      `} />
      {isMyTurn ? 'Tu turno' : playerName || 'Esperando'}
    </motion.div>
  );
}

/**
 * TurnTimeline - Timeline visual de turnos
 */
interface TurnTimelineProps {
  turnOrder: number[];
  currentTurn: number;
  players: BoardPlayerState[];
}

export function TurnTimeline({
  turnOrder,
  currentTurn,
  players,
}: TurnTimelineProps) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
      <h4 className="text-xs font-bold text-gray-600 mb-2">Orden de Turnos</h4>
      <div className="flex items-center gap-2">
        {turnOrder.map((userId, index) => {
          const player = players.find(p => p.userId === userId);
          const isCurrent = index === currentTurn;
          const isPast = index < currentTurn;

          return (
            <div key={userId} className="flex items-center">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-xs font-bold transition-all
                  ${isCurrent 
                    ? 'bg-green-500 text-white ring-4 ring-green-300' 
                    : isPast
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-blue-100 text-blue-600'
                  }
                `}
              >
                {player?.nickname.charAt(0).toUpperCase() || '?'}
              </motion.div>

              {index < turnOrder.length - 1 && (
                <div className={`
                  w-4 h-0.5
                  ${isPast ? 'bg-gray-300' : 'bg-gray-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
