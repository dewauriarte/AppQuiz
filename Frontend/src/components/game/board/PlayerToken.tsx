import { motion, AnimatePresence } from 'framer-motion';
import { Group, Circle, Text as KonvaText } from 'react-konva';
import { useEffect, useState, useRef } from 'react';
import type { BoardPlayerState } from '@/types/board-game';
import type { TilePosition } from '@/lib/boardPathGenerator';

interface PlayerTokenProps {
  player: BoardPlayerState;
  position: TilePosition;
  isCurrentUser?: boolean;
  stackIndex?: number; // Para apilar múltiples jugadores en la misma casilla
  totalInStack?: number;
}

const PLAYER_COLORS = [
  '#3B82F6', // Azul
  '#EF4444', // Rojo
  '#10B981', // Verde
  '#F59E0B', // Naranja
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
];

/**
 * PlayerToken MEJORADO - Ficha del jugador tipo Ludo
 * - Más grande y visible
 * - Colores distintos por jugador
 * - Animación suave
 */
export function PlayerToken({
  player,
  position,
  isCurrentUser = false,
  stackIndex = 0,
  totalInStack = 1,
}: PlayerTokenProps) {
  const TOKEN_SIZE = 50; // Más grande que antes
  const TILE_SIZE = 90; // Ajustado al nuevo tamaño de casilla

  // Calcular offset para apilar jugadores (cuando hay varios en la misma casilla)
  const stackOffset = {
    x: (stackIndex % 2) * 25 - 12.5,
    y: Math.floor(stackIndex / 2) * 25 - 12.5,
  };

  // Centrar en la casilla
  const finalX = position.x + TILE_SIZE / 2 + stackOffset.x;
  const finalY = position.y + TILE_SIZE / 2 + stackOffset.y;

  // Color único por jugador
  const playerColor = PLAYER_COLORS[player.userId % PLAYER_COLORS.length];

  // Inicial del jugador
  const initial = player.nickname.charAt(0).toUpperCase();

  return (
    <Group x={finalX} y={finalY}>
      {/* Glow effect si es el turno del jugador */}
      {player.is_turn && (
        <>
          <Circle
            radius={TOKEN_SIZE / 1.5}
            fill="#FFD700"
            opacity={0.4}
            shadowColor="#FFD700"
            shadowBlur={25}
            shadowOpacity={1}
          />
          <Circle
            radius={TOKEN_SIZE / 1.8}
            stroke="#FFD700"
            strokeWidth={3}
            opacity={0.6}
          />
        </>
      )}

      {/* Sombra del token */}
      <Circle
        y={3}
        radius={TOKEN_SIZE / 2}
        fill="rgba(0,0,0,0.3)"
        blur={5}
      />

      {/* Token principal - Círculo con color del jugador */}
      <Circle
        radius={TOKEN_SIZE / 2}
        fill={playerColor}
        stroke={isCurrentUser ? '#FFFFFF' : (player.is_turn ? '#FFD700' : '#000000')}
        strokeWidth={isCurrentUser ? 4 : (player.is_turn ? 3 : 2)}
        shadowColor="rgba(0,0,0,0.5)"
        shadowBlur={8}
        shadowOpacity={0.6}
        shadowOffsetY={2}
      />

      {/* Borde interior para dar profundidad */}
      <Circle
        radius={TOKEN_SIZE / 2 - 3}
        stroke="#FFFFFF"
        strokeWidth={2}
        opacity={0.4}
      />

      {/* Inicial del jugador */}
      <KonvaText
        text={initial}
        x={-TOKEN_SIZE / 4}
        y={-TOKEN_SIZE / 4}
        width={TOKEN_SIZE / 2}
        height={TOKEN_SIZE / 2}
        align="center"
        verticalAlign="middle"
        fontSize={24}
        fontFamily="Arial, sans-serif"
        fontStyle="bold"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth={1}
      />

      {/* Shield indicator - arriba derecha */}
      {player.shields > 0 && (
        <Group x={TOKEN_SIZE / 2 - 8} y={-TOKEN_SIZE / 2 + 4}>
          <Circle
            radius={12}
            fill="#10B981"
            stroke="#FFFFFF"
            strokeWidth={2}
            shadowColor="rgba(0,0,0,0.5)"
            shadowBlur={4}
          />
          <KonvaText
            text="🛡️"
            x={-8}
            y={-8}
            fontSize={14}
          />
        </Group>
      )}

      {/* Powerup indicator - arriba izquierda */}
      {player.powerups.length > 0 && (
        <Group x={-TOKEN_SIZE / 2 + 8} y={-TOKEN_SIZE / 2 + 4}>
          <Circle
            radius={12}
            fill="#F59E0B"
            stroke="#FFFFFF"
            strokeWidth={2}
            shadowColor="rgba(0,0,0,0.5)"
            shadowBlur={4}
          />
          <KonvaText
            text="⚡"
            x={-8}
            y={-8}
            fontSize={14}
          />
        </Group>
      )}

      {/* Indicador de usuario actual - halo azul */}
      {isCurrentUser && !player.is_turn && (
        <Circle
          radius={TOKEN_SIZE / 1.6}
          stroke="#60A5FA"
          strokeWidth={3}
          dash={[8, 4]}
          opacity={0.8}
        />
      )}
    </Group>
  );
}

/**
 * AnimatedPlayerToken - Versión con animación paso a paso tipo Ludo
 * La ficha se mueve casilla por casilla con delay
 */
interface AnimatedPlayerTokenProps {
  player: BoardPlayerState;
  oldPosition: number;
  newPosition: number;
  allPositions: TilePosition[];
  onAnimationComplete?: () => void;
  stackIndex?: number;
  totalInStack?: number;
  isCurrentUser?: boolean;
}

export function AnimatedPlayerToken({
  player,
  oldPosition,
  newPosition,
  allPositions,
  onAnimationComplete,
  stackIndex = 0,
  totalInStack = 1,
  isCurrentUser = false,
}: AnimatedPlayerTokenProps) {
  const [currentPos, setCurrentPos] = useState(oldPosition);
  const animationRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (oldPosition === newPosition) return;

    // Animar paso a paso desde oldPosition a newPosition (como Ludo)
    let step = oldPosition;
    const direction = newPosition > oldPosition ? 1 : -1;
    const totalSteps = Math.abs(newPosition - oldPosition);
    let currentStep = 0;

    const animate = () => {
      if (currentStep < totalSteps) {
        step += direction;
        setCurrentPos(step);
        currentStep++;
        animationRef.current = setTimeout(animate, 300); // 300ms por casilla (como Ludo)
      } else {
        onAnimationComplete?.();
      }
    };

    // Iniciar animación después de 100ms
    animationRef.current = setTimeout(animate, 100);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [oldPosition, newPosition, onAnimationComplete]);

  // Buscar posición actual en el array de casillas
  const currentTilePosition = allPositions.find(p => p.position === currentPos);

  if (!currentTilePosition) {
    // Fallback: usar la posición inicial
    const fallbackPosition = allPositions.find(p => p.position === oldPosition) || allPositions[0];
    return (
      <PlayerToken
        player={player}
        position={fallbackPosition}
        isCurrentUser={isCurrentUser}
        stackIndex={stackIndex}
        totalInStack={totalInStack}
      />
    );
  }

  return (
    <PlayerToken
      player={player}
      position={currentTilePosition}
      isCurrentUser={isCurrentUser}
      stackIndex={stackIndex}
      totalInStack={totalInStack}
    />
  );
}

/**
 * PlayerTokenHTML - Versión HTML/CSS (para HUD y otros componentes)
 */
interface PlayerTokenHTMLProps {
  player: BoardPlayerState;
  size?: 'sm' | 'md' | 'lg';
  showNickname?: boolean;
  showStats?: boolean;
  className?: string;
}

export function PlayerTokenHTML({
  player,
  size = 'md',
  showNickname = false,
  showStats = false,
  className = '',
}: PlayerTokenHTMLProps) {
  const sizes = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-lg',
  };

  const playerColor = PLAYER_COLORS[player.userId % PLAYER_COLORS.length];
  const initial = player.nickname.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`flex flex-col items-center gap-2 ${className}`}
    >
      <div className="relative">
        {/* Avatar */}
        <div
          className={`
            ${sizes[size]}
            rounded-full
            flex items-center justify-center
            font-bold text-white
            shadow-lg border-4 border-white
            ${player.is_turn ? 'ring-4 ring-yellow-400 ring-offset-2 animate-pulse' : ''}
          `}
          style={{
            backgroundColor: playerColor,
          }}
        >
          {initial}
        </div>

        {/* Shields badge */}
        {player.shields > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-xs font-bold shadow-md">
            🛡️
          </div>
        )}

        {/* Powerups badge */}
        {player.powerups.length > 0 && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-xs font-bold shadow-md">
            ⚡
          </div>
        )}
      </div>

      {/* Nickname */}
      {showNickname && (
        <span className="text-sm font-bold text-white drop-shadow-lg truncate max-w-[100px]">
          {player.nickname}
        </span>
      )}

      {/* Stats */}
      {showStats && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
            <span>💰</span>
            <span className="font-bold text-white text-xs">{player.coins_collected}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
            <span>📍</span>
            <span className="font-bold text-white text-xs">{player.board_position}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
