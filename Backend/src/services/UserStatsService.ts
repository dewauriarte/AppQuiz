import prisma from '@config/database';

export interface UserStats {
  profile: {
    user_id: number;
    level: number;
    total_xp: bigint;
    current_xp: number;
    xp_to_next_level: number;
    current_streak: number;
    longest_streak: number;
    total_quizzes_completed: number;
    total_questions_answered: number;
    total_correct_answers: number;
    total_games_won: number;
    total_games_played: number;
    average_accuracy: number;
    average_response_time_ms: number;
  };
  currencies: {
    coins: number;
    gems: number;
    event_tokens: number;
    total_coins_earned: bigint;
    total_gems_earned: bigint;
  };
  calculated: {
    win_rate: number;
    xp_progress_percentage: number;
    global_rank?: number;
  };
}

export interface RecentGame {
  game_id: number;
  game_code: string;
  final_score: number;
  final_rank: number;
  total_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  xp_earned: number;
  coins_earned: number;
  gems_earned: number;
  highest_combo: number;
  podium_finish: boolean;
  created_at: Date;
}

export interface ProgressData {
  daily: Array<{
    date: string;
    xp_earned: number;
    coins_earned: number;
    games_played: number;
  }>;
  weekly: {
    current_week: number;
    last_week: number;
    change_percentage: number;
  };
  level_history: Array<{
    level: number;
    reached_at: Date;
  }>;
}

/**
 * Obtiene estadísticas completas del usuario
 */
export async function getUserStats(userId: number): Promise<UserStats | null> {
  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
  });

  if (!profile) {
    return null;
  }

  const currencies = await prisma.user_currencies.findUnique({
    where: { user_id: userId },
  });

  if (!currencies) {
    return null;
  }

  // Calcular win rate
  const winRate = profile.total_games_played > 0
    ? (profile.total_games_won / profile.total_games_played) * 100
    : 0;

  // Calcular progreso de XP (porcentaje hacia siguiente nivel)
  const xpProgressPercentage = profile.xp_to_next_level > 0
    ? (profile.current_xp / profile.xp_to_next_level) * 100
    : 0;

  // Obtener rank global (posición basada en total_xp)
  const higherRankedCount = await prisma.user_profiles.count({
    where: {
      total_xp: {
        gt: profile.total_xp,
      },
    },
  });
  const globalRank = higherRankedCount + 1;

  return {
    profile: {
      user_id: profile.user_id,
      level: profile.level,
      total_xp: profile.total_xp,
      current_xp: profile.current_xp,
      xp_to_next_level: profile.xp_to_next_level,
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      total_quizzes_completed: profile.total_quizzes_completed,
      total_questions_answered: profile.total_questions_answered,
      total_correct_answers: profile.total_correct_answers,
      total_games_won: profile.total_games_won,
      total_games_played: profile.total_games_played,
      average_accuracy: Number(profile.average_accuracy || 0),
      average_response_time_ms: profile.average_response_time_ms || 0,
    },
    currencies: {
      coins: currencies.coins,
      gems: currencies.gems,
      event_tokens: currencies.event_tokens,
      total_coins_earned: currencies.total_coins_earned,
      total_gems_earned: currencies.total_gems_earned,
    },
    calculated: {
      win_rate: Number(winRate.toFixed(2)),
      xp_progress_percentage: Number(xpProgressPercentage.toFixed(2)),
      global_rank: globalRank,
    },
  };
}

/**
 * Obtiene los últimos N juegos del usuario
 */
export async function getRecentGames(userId: number, limit: number = 10): Promise<RecentGame[]> {
  const results = await prisma.game_results.findMany({
    where: { user_id: userId },
    include: {
      games: {
        select: {
          game_code: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: limit,
  });

  return results.map((result) => ({
    game_id: result.game_id,
    game_code: result.games.game_code,
    final_score: result.final_score,
    final_rank: result.final_rank,
    total_questions: result.total_questions,
    correct_answers: result.correct_answers,
    accuracy_percentage: Number(result.accuracy_percentage),
    xp_earned: result.xp_earned || 0,
    coins_earned: result.coins_earned || 0,
    gems_earned: result.gems_earned || 0,
    highest_combo: result.highest_combo || 0,
    podium_finish: result.podium_finish || false,
    created_at: result.created_at,
  }));
}

/**
 * Obtiene datos de progreso para gráficos
 */
export async function getProgressData(userId: number, days: number = 30): Promise<ProgressData> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Obtener resultados de los últimos N días
  const results = await prisma.game_results.findMany({
    where: {
      user_id: userId,
      created_at: {
        gte: since,
      },
    },
    orderBy: {
      created_at: 'asc',
    },
  });

  // Agrupar por día
  const dailyData = new Map<string, { xp: number; coins: number; games: number }>();

  for (const result of results) {
    const date = result.created_at.toISOString().split('T')[0];
    const existing = dailyData.get(date) || { xp: 0, coins: 0, games: 0 };
    existing.xp += result.xp_earned || 0;
    existing.coins += result.coins_earned || 0;
    existing.games += 1;
    dailyData.set(date, existing);
  }

  const daily = Array.from(dailyData.entries()).map(([date, data]) => ({
    date,
    xp_earned: data.xp,
    coins_earned: data.coins,
    games_played: data.games,
  }));

  // Calcular weekly stats (última semana vs semana anterior)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const currentWeekResults = await prisma.game_results.aggregate({
    where: {
      user_id: userId,
      created_at: {
        gte: oneWeekAgo,
      },
    },
    _sum: {
      xp_earned: true,
    },
  });

  const lastWeekResults = await prisma.game_results.aggregate({
    where: {
      user_id: userId,
      created_at: {
        gte: twoWeeksAgo,
        lt: oneWeekAgo,
      },
    },
    _sum: {
      xp_earned: true,
    },
  });

  const currentWeekXP = currentWeekResults._sum.xp_earned || 0;
  const lastWeekXP = lastWeekResults._sum.xp_earned || 0;
  const changePercentage = lastWeekXP > 0
    ? ((currentWeekXP - lastWeekXP) / lastWeekXP) * 100
    : 0;

  return {
    daily,
    weekly: {
      current_week: currentWeekXP,
      last_week: lastWeekXP,
      change_percentage: Number(changePercentage.toFixed(2)),
    },
    level_history: [], // TODO: Implementar cuando se tenga tabla de level_history
  };
}

