/**
 * Sistema de Path para Board Game tipo Ludo
 * Pre-calcula coordenadas de casillas en layout rectangular
 */

export interface TilePosition {
  x: number;
  y: number;
  position: number;
  nextPosition: number | null; // Para saber la siguiente casilla
}

/**
 * Genera path rectangular tipo Ludo
 *
 * Layout:
 * - Fila inferior: casillas 0-9 (izquierda a derecha)
 * - Columna derecha: casillas 10-14 (abajo a arriba)
 * - Fila superior: casillas 15-24 (derecha a izquierda)
 * - Columna izquierda: casillas 25-29 (arriba a abajo)
 * - Fila media: casillas 30-39 (izquierda a derecha hacia meta)
 */
export function generateLudoPath(
  boardSize: number,
  tileSize: number,
  spacing: number,
  offsetX: number = 50,
  offsetY: number = 50
): TilePosition[] {
  const positions: TilePosition[] = [];

  // Dimensiones del tablero
  const tilesPerSide = 10; // Casillas por lado
  const innerRow = Math.max(5, boardSize - 30); // Casillas en fila interna

  let currentPosition = 0;

  // ===== FILA INFERIOR (0-9): Izquierda → Derecha =====
  for (let i = 0; i < tilesPerSide && currentPosition < boardSize; i++) {
    const x = offsetX + i * (tileSize + spacing);
    const y = offsetY + 4 * (tileSize + spacing); // Fila inferior

    positions.push({
      x,
      y,
      position: currentPosition,
      nextPosition: currentPosition + 1 < boardSize ? currentPosition + 1 : null
    });
    currentPosition++;
  }

  // ===== COLUMNA DERECHA (10-14): Abajo → Arriba =====
  const rightColumn = 5;
  for (let i = 1; i <= rightColumn && currentPosition < boardSize; i++) {
    const x = offsetX + (tilesPerSide - 1) * (tileSize + spacing);
    const y = offsetY + (4 - i) * (tileSize + spacing);

    positions.push({
      x,
      y,
      position: currentPosition,
      nextPosition: currentPosition + 1 < boardSize ? currentPosition + 1 : null
    });
    currentPosition++;
  }

  // ===== FILA SUPERIOR (15-24): Derecha → Izquierda =====
  for (let i = 0; i < tilesPerSide && currentPosition < boardSize; i++) {
    const x = offsetX + (tilesPerSide - 1 - i) * (tileSize + spacing);
    const y = offsetY; // Fila superior

    positions.push({
      x,
      y,
      position: currentPosition,
      nextPosition: currentPosition + 1 < boardSize ? currentPosition + 1 : null
    });
    currentPosition++;
  }

  // ===== COLUMNA IZQUIERDA (25-29): Arriba → Abajo =====
  const leftColumn = 5;
  for (let i = 1; i <= leftColumn && currentPosition < boardSize; i++) {
    const x = offsetX;
    const y = offsetY + i * (tileSize + spacing);

    positions.push({
      x,
      y,
      position: currentPosition,
      nextPosition: currentPosition + 1 < boardSize ? currentPosition + 1 : null
    });
    currentPosition++;
  }

  // ===== FILA CENTRAL HACIA LA META (30-39): Izquierda → Derecha =====
  for (let i = 1; i < tilesPerSide && currentPosition < boardSize; i++) {
    const x = offsetX + i * (tileSize + spacing);
    const y = offsetY + 2 * (tileSize + spacing); // Fila central

    positions.push({
      x,
      y,
      position: currentPosition,
      nextPosition: currentPosition + 1 < boardSize ? currentPosition + 1 : null
    });
    currentPosition++;
  }

  return positions;
}

/**
 * Genera path intermedio entre dos casillas para animación suave
 */
export function generatePathBetweenTiles(
  from: TilePosition,
  to: TilePosition,
  steps: number = 10
): Array<{ x: number; y: number }> {
  const path: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    path.push({ x, y });
  }

  return path;
}

/**
 * Obtiene la posición de una casilla específica
 */
export function getTilePosition(
  positions: TilePosition[],
  targetPosition: number
): TilePosition | null {
  return positions.find(p => p.position === targetPosition) || null;
}

/**
 * Obtiene el camino completo desde oldPos hasta newPos
 */
export function getFullPath(
  positions: TilePosition[],
  oldPosition: number,
  newPosition: number
): TilePosition[] {
  const path: TilePosition[] = [];

  let current = oldPosition;
  const direction = newPosition > oldPosition ? 1 : -1;

  while (current !== newPosition) {
    const tile = getTilePosition(positions, current);
    if (!tile) break;

    path.push(tile);
    current += direction;
  }

  // Agregar posición final
  const finalTile = getTilePosition(positions, newPosition);
  if (finalTile) {
    path.push(finalTile);
  }

  return path;
}
