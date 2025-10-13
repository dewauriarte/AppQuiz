import { useEffect, useState, useCallback } from 'react';
import { BoardGameCanvas } from './BoardGameCanvas';
import type {
  BoardGameState,
  BoardPlayerState,
} from '@/types/board-game';

interface BoardGameScreenProps {
  boardState: BoardGameState;
  players: BoardPlayerState[];
  currentUserId: number;
  onRollDice?: () => void;
  isMyTurn?: boolean;
}

interface TilePosition {
  x: number;
  y: number;
  position: number;
}

/**
 * BoardGameScreen - Pantalla principal del modo tablero
 * Combina BoardGameCanvas + PlayerTokens
 */
export function BoardGameScreen({
  boardState,
  players,
  currentUserId,
  onRollDice,
  isMyTurn = false,
}: BoardGameScreenProps) {
  const [tilePositions, setTilePositions] = useState<TilePosition[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);

  const TILE_SIZE = 50;
  const TILE_SPACING = 10;
  const TILES_PER_ROW = 8;

  // Calcular posiciones de casillas (serpentine layout)
  useEffect(() => {
    const positions: TilePosition[] = [];
    const { board_size } = boardState;

    for (let i = 0; i < board_size; i++) {
      const row = Math.floor(i / TILES_PER_ROW);
      const col = i % TILES_PER_ROW;
      
      // Serpentine: alternar dirección cada fila
      const actualCol = row % 2 === 0 ? col : TILES_PER_ROW - 1 - col;
      
      const x = 50 + actualCol * (TILE_SIZE + TILE_SPACING);
      const y = 50 + row * (TILE_SIZE + TILE_SPACING);

      positions.push({ x, y, position: i });
    }

    setTilePositions(positions);
  }, [boardState.board_size]);

  const handleTileClick = useCallback((position: number) => {
    setSelectedTile(position);
    // Aquí podrías mostrar información de la casilla
  }, []);

  // Obtener jugador actual
  const currentPlayer = players.find(p => p.userId === currentUserId);

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-900"
    >
      {/* Canvas principal - Ocupar todo el espacio */}
      <div className="w-full h-full p-4">
        <BoardGameCanvas
          boardState={boardState}
          players={players}
          currentUserId={currentUserId}
          onTileClick={handleTileClick}
        />
      </div>
    </div>
  );
}
