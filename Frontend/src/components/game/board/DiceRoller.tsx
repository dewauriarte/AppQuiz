import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Dices, Lock } from 'lucide-react';

interface DiceRollerProps {
  onRoll: () => void;
  isMyTurn: boolean;
  isRolling: boolean;
  lastDiceValue?: number;
  disabled?: boolean;
  autoRollTimeoutAt?: number;
}

/**
 * DiceRoller - Dado 3D animado para el modo tablero
 * Usa Framer Motion para animaciones
 */
export function DiceRoller({
  onRoll,
  isMyTurn,
  isRolling,
  lastDiceValue,
  disabled = false,
  autoRollTimeoutAt,
}: DiceRollerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const controls = useAnimation();

  // Countdown para auto-roll
  useEffect(() => {
    if (!autoRollTimeoutAt || !isMyTurn) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, autoRollTimeoutAt - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [autoRollTimeoutAt, isMyTurn]);

  // Animación de rotación del dado
  useEffect(() => {
    if (isRolling) {
      controls.start({
        rotateX: [0, 360, 720, 1080],
        rotateY: [0, 180, 360, 540],
        rotateZ: [0, 90, 180, 270],
        scale: [1, 1.2, 1.1, 1],
        transition: {
          duration: 1.5,
          ease: 'easeOut',
          times: [0, 0.3, 0.7, 1],
        },
      });
    } else {
      controls.start({
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
      });
    }
  }, [isRolling, controls]);

  const handleClick = () => {
    if (!disabled && isMyTurn && !isRolling) {
      onRoll();
    }
  };

  const isDisabled = disabled || !isMyTurn || isRolling;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dado */}
      <motion.button
        onClick={handleClick}
        disabled={isDisabled}
        animate={controls}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        className={`
          relative w-24 h-24 rounded-xl 
          flex items-center justify-center
          font-bold text-4xl
          shadow-2xl
          transition-all duration-300
          ${isDisabled
            ? 'bg-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 cursor-pointer'
          }
          ${isMyTurn && !isRolling ? 'ring-4 ring-yellow-400 ring-offset-4 animate-pulse' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        {/* Cara del dado */}
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {isRolling ? (
            <Dices className="w-12 h-12 animate-spin" />
          ) : lastDiceValue ? (
            <DiceFace value={lastDiceValue} />
          ) : (
            <Dices className="w-12 h-12" />
          )}
        </div>

        {/* Reflejo/Brillo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl pointer-events-none" />

        {/* Lock icon si no es tu turno */}
        {!isMyTurn && !isRolling && (
          <div className="absolute -top-2 -right-2 bg-gray-700 rounded-full p-2">
            <Lock className="w-4 h-4 text-white" />
          </div>
        )}
      </motion.button>

      {/* Texto de estado */}
      <AnimatePresence mode="wait">
        {isRolling && (
          <motion.div
            key="rolling"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-bold text-purple-600 animate-pulse"
          >
            🎲 Tirando...
          </motion.div>
        )}

        {!isRolling && isMyTurn && (
          <motion.div
            key="your-turn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-bold text-green-600"
          >
            ¡Tu turno! Click para tirar
          </motion.div>
        )}

        {!isRolling && !isMyTurn && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-gray-500"
          >
            Esperando turno...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown */}
      {timeLeft !== null && isMyTurn && !isRolling && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            px-4 py-2 rounded-full font-bold text-white
            ${timeLeft <= 3 ? 'bg-red-500 animate-bounce' : 'bg-orange-500'}
          `}
        >
          ⏱️ {timeLeft}s
        </motion.div>
      )}

      {/* Resultado del último dado */}
      {lastDiceValue && !isRolling && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-sm text-gray-600"
        >
          Último resultado: <span className="font-bold text-2xl">{lastDiceValue}</span>
        </motion.div>
      )}
    </div>
  );
}

/**
 * DiceFace - Cara del dado con puntos
 */
function DiceFace({ value }: { value: number }) {
  const dots: Record<number, number[][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
  };

  const positions = dots[value] || [];

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2">
      {Array.from({ length: 9 }).map((_, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const hasDot = positions.some(([r, c]) => r === row && c === col);

        return (
          <div
            key={index}
            className={`
              w-3 h-3 rounded-full
              ${hasDot ? 'bg-white shadow-lg' : 'bg-transparent'}
            `}
          />
        );
      })}
    </div>
  );
}

/**
 * CompactDiceRoller - Versión compacta para HUD
 */
interface CompactDiceRollerProps {
  onRoll: () => void;
  isMyTurn: boolean;
  isRolling: boolean;
  disabled?: boolean;
}

export function CompactDiceRoller({
  onRoll,
  isMyTurn,
  isRolling,
  disabled = false,
}: CompactDiceRollerProps) {
  const isDisabled = disabled || !isMyTurn || isRolling;

  return (
    <motion.button
      onClick={onRoll}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      animate={isRolling ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
      className={`
        px-6 py-3 rounded-lg font-bold
        flex items-center gap-2
        transition-all duration-300
        ${isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
        }
        ${isMyTurn && !isRolling ? 'ring-2 ring-yellow-400 ring-offset-2 animate-pulse' : ''}
      `}
    >
      <Dices className="w-5 h-5" />
      {isRolling ? 'Tirando...' : 'Tirar Dado'}
    </motion.button>
  );
}

/**
 * DiceHistory - Historial de tiradas
 */
interface DiceHistoryProps {
  history: number[];
  maxItems?: number;
}

export function DiceHistory({ history, maxItems = 5 }: DiceHistoryProps) {
  const recentHistory = history.slice(-maxItems).reverse();

  return (
    <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
      <h4 className="text-sm font-bold mb-2 text-gray-700">Historial</h4>
      <div className="flex flex-col gap-2">
        {recentHistory.map((value, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 text-sm"
          >
            <div className="w-8 h-8 rounded bg-red-500 flex items-center justify-center text-white font-bold shadow">
              {value}
            </div>
            <span className="text-gray-500 text-xs">
              {index === 0 ? 'Último' : `Hace ${index}`}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
