import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { motion } from 'framer-motion';
import type { BoardGameState, BoardPlayerState, BoardEventAssignment } from '@/types/board-game';
import { generateLudoPath, getTilePosition, type TilePosition } from '@/lib/boardPathGenerator';
import { PlayerToken } from './PlayerToken';

interface BoardGameCanvasProps {
  boardState: BoardGameState;
  players: BoardPlayerState[];
  currentUserId?: number;
  onTileClick?: (position: number) => void;
}

/**
 * BoardGameCanvas HÍBRIDO - Casillas HTML + Fichas Canvas
 * - Casillas en HTML/CSS (nítidas como botones)
 * - Fichas en Canvas (animación suave)
 */
export function BoardGameCanvas({
  boardState,
  players,
  currentUserId,
  onTileClick
}: BoardGameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [tilePositions, setTilePositions] = useState<TilePosition[]>([]);

  // Configuración del tablero
  const TILE_SIZE = 90; // Más grande
  const TILE_SPACING = 15;
  const OFFSET_X = 100;
  const OFFSET_Y = 100;

  // Calcular posiciones usando el sistema Ludo
  useEffect(() => {
    const positions = generateLudoPath(
      boardState.board_size,
      TILE_SIZE,
      TILE_SPACING,
      OFFSET_X,
      OFFSET_Y
    );

    console.log('[BoardGameCanvas] 🎲 Generadas', positions.length, 'casillas');
    console.log('[BoardGameCanvas] Primera casilla:', positions[0]);
    console.log('[BoardGameCanvas] Última casilla:', positions[positions.length - 1]);

    setTilePositions(positions);
  }, [boardState.board_size]);

  // Responsive canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.max(1200, containerRef.current.offsetWidth);
        const height = Math.max(800, window.innerHeight - 200);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Obtener color de casilla según tipo
  const getTileColor = (position: number): string => {
    if (position === boardState.board_size - 1) return 'from-yellow-400 to-yellow-600';
    if (boardState.checkpoint_positions.includes(position)) return 'from-orange-400 to-orange-600';
    if (boardState.shop_positions.includes(position)) return 'from-blue-400 to-blue-600';

    const event = boardState.events.find(e => e.position === position);
    if (event) return getEventColor(event);

    return 'from-green-400 to-green-600';
  };

  // Color según tipo de evento
  const getEventColor = (event: BoardEventAssignment): string => {
    const colors: Record<string, string> = {
      bonus_coins: 'from-yellow-300 to-yellow-500',
      bonus_xp: 'from-purple-400 to-purple-600',
      bonus_gems: 'from-pink-400 to-pink-600',
      trap_lose_coins: 'from-red-400 to-red-600',
      trap_go_back: 'from-orange-500 to-red-500',
      teleport_forward: 'from-cyan-400 to-cyan-600',
      powerup: 'from-emerald-400 to-emerald-600',
      mystery_box: 'from-violet-400 to-violet-600',
      quiz_challenge: 'from-indigo-400 to-indigo-600',
      boss_encounter: 'from-red-600 to-red-800',
    };
    return colors[event.event_type] || 'from-green-400 to-green-600';
  };

  // Icono de evento
  const getEventIcon = (event: BoardEventAssignment): string => {
    const icons: Record<string, string> = {
      bonus_coins: '💰',
      bonus_xp: '📚',
      bonus_gems: '💎',
      trap_lose_coins: '⚠️',
      trap_go_back: '⬅️',
      teleport_forward: '🌀',
      powerup: '⚡',
      mystery_box: '❓',
      quiz_challenge: '❔',
      boss_encounter: '👹',
    };
    return icons[event.event_type] || '';
  };

  // Agrupar jugadores por posición
  const playersByPosition = players.reduce((acc, player) => {
    const pos = player.board_position;
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(player);
    return acc;
  }, {} as Record<number, BoardPlayerState[]>);

  return (
    <div
      ref={containerRef}
      className="w-full relative rounded-2xl overflow-auto"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        minHeight: '800px',
        height: 'calc(100vh - 100px)',
      }}
    >
      {/* CASILLAS HTML (NÍTIDAS) */}
      <div
        className="relative pointer-events-none"
        style={{
          width: '100%',
          height: `${dimensions.height}px`,
          minHeight: '800px'
        }}
      >
        {tilePositions.map((tile) => {
          const color = getTileColor(tile.position);
          const event = boardState.events.find(e => e.position === tile.position);
          const isCheckpoint = boardState.checkpoint_positions.includes(tile.position);
          const isShop = boardState.shop_positions.includes(tile.position);
          const isFinal = tile.position === boardState.board_size - 1;

          return (
            <motion.div
              key={`tile-${tile.position}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: tile.position * 0.02 }}
              className={`
                absolute pointer-events-auto cursor-pointer
                bg-gradient-to-br ${color}
                rounded-2xl shadow-lg
                border-4 border-white
                hover:scale-105 hover:shadow-2xl
                transition-all duration-200
                ${isFinal ? 'ring-4 ring-yellow-300 ring-offset-2' : ''}
              `}
              style={{
                left: `${tile.x}px`,
                top: `${tile.y}px`,
                width: `${TILE_SIZE}px`,
                height: `${TILE_SIZE}px`,
              }}
              onClick={() => onTileClick?.(tile.position)}
            >
              {/* Número de casilla - GRANDE Y NÍTIDO */}
              <div className="absolute top-1 left-2 bg-black/30 backdrop-blur-sm text-white font-bold text-sm px-2 py-0.5 rounded-lg">
                {tile.position}
              </div>

              {/* Icono central - GRANDE */}
              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                {isFinal && '🏆'}
                {isCheckpoint && !isFinal && '⭐'}
                {isShop && '🏪'}
                {event && !isCheckpoint && !isShop && !isFinal && getEventIcon(event)}
              </div>

              {/* Efecto de brillo para casilla final */}
              {isFinal && (
                <div className="absolute inset-0 rounded-2xl bg-yellow-300/30 animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* FICHAS DE JUGADORES EN CANVAS (SOBRE LAS CASILLAS) */}
      <Stage width={dimensions.width} height={dimensions.height} className="absolute inset-0 pointer-events-none">
        <Layer>
          {Object.entries(playersByPosition).map(([position, playersInTile]) => {
            const tile = getTilePosition(tilePositions, parseInt(position));
            if (!tile) return null;

            return playersInTile.map((player, index) => (
              <PlayerToken
                key={player.userId}
                player={player}
                position={tile}
                isCurrentUser={player.userId === currentUserId}
                stackIndex={index}
                totalInStack={playersInTile.length}
              />
            ));
          })}
        </Layer>
      </Stage>

      {/* Leyenda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-3 text-sm font-bold bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-lg border-2 border-white shadow-md"></div>
          <span className="text-gray-800">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg border-2 border-white shadow-md"></div>
          <span className="text-gray-800">Meta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg border-2 border-white shadow-md"></div>
          <span className="text-gray-800">Estrella</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg border-2 border-white shadow-md"></div>
          <span className="text-gray-800">Tienda</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg border-2 border-white shadow-md"></div>
          <span className="text-gray-800">Evento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-lg border-2 border-white shadow-md"></div>
          <span className="text-gray-800">Trampa</span>
        </div>
      </motion.div>
    </div>
  );
}
