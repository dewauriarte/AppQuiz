/**
 * Sistema de puntuación para el juego
 */

export interface ScoreCalculation {
  points: number;
  basePoints: number;
  speedBonus: number;
  comboMultiplier: number;
  totalPoints: number;
}

/**
 * Calcula los puntos obtenidos por una respuesta
 */
export function calculatePoints(
  isCorrect: boolean,
  timeTaken: number,
  timeLimit: number,
  combo: number
): ScoreCalculation {
  if (!isCorrect) {
    return {
      points: 0,
      basePoints: 0,
      speedBonus: 0,
      comboMultiplier: 1,
      totalPoints: 0,
    };
  }

  const basePoints = 1000;
  
  // Speed bonus: 0-500 puntos dependiendo de qué tan rápido respondió
  // Si responde al inicio: bonus máximo
  // Si responde al final: bonus mínimo
  const speedRatio = timeTaken / timeLimit;
  const speedBonus = Math.max(0, Math.floor(500 * (1 - speedRatio)));

  // Combo multiplier: +10% por cada respuesta correcta consecutiva
  const comboMultiplier = 1 + (combo * 0.1);

  const totalPoints = Math.floor((basePoints + speedBonus) * comboMultiplier);

  return {
    points: totalPoints,
    basePoints,
    speedBonus,
    comboMultiplier,
    totalPoints,
  };
}

/**
 * Calcula recompensas basadas en el ranking final
 */
export function calculateRewards(
  ranking: number,
  totalPlayers: number
): { xp: number; coins: number; gems: number } {
  // Recompensas base
  const baseXP = 100;
  const baseCoins = 50;
  const baseGems = 0;

  // Multiplicadores según posición
  let rankMultiplier = 1;
  if (ranking === 1) {
    rankMultiplier = 3; // 1er lugar: 3x
  } else if (ranking === 2) {
    rankMultiplier = 2; // 2do lugar: 2x
  } else if (ranking === 3) {
    rankMultiplier = 1.5; // 3er lugar: 1.5x
  } else if (ranking <= totalPlayers / 2) {
    rankMultiplier = 1.2; // Top 50%: 1.2x
  }

  // Bonus por participación
  const participationBonus = totalPlayers >= 10 ? 1.2 : 1;

  const xp = Math.floor(baseXP * rankMultiplier * participationBonus);
  const coins = Math.floor(baseCoins * rankMultiplier * participationBonus);
  
  // Gemas solo para top 3
  let gems = baseGems;
  if (ranking === 1) gems = 5;
  else if (ranking === 2) gems = 3;
  else if (ranking === 3) gems = 1;

  return { xp, coins, gems };
}

/**
 * Shufflea un array (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

