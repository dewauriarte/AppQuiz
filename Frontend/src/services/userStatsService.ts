import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  user_id: number;
  period_days: number;
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
 * Obtiene las estadísticas completas del usuario
 */
export async function getUserStats(userId: number, token: string): Promise<UserStats> {
  const response = await axios.get(`${API_BASE}/users/${userId}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

/**
 * Obtiene los últimos juegos del usuario
 */
export async function getRecentGames(
  userId: number,
  token: string,
  limit: number = 10
): Promise<{ user_id: number; games: RecentGame[]; total: number }> {
  const response = await axios.get(`${API_BASE}/users/${userId}/recent-games`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { limit },
  });
  return response.data;
}

/**
 * Obtiene datos de progreso para gráficos
 */
export async function getProgressData(
  userId: number,
  token: string,
  days: number = 30
): Promise<ProgressData> {
  const response = await axios.get(`${API_BASE}/users/${userId}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { days },
  });
  return response.data;
}

/**
 * Obtiene el leaderboard global
 */
export async function getGlobalLeaderboard(
  token: string,
  limit: number = 100,
  offset: number = 0
): Promise<any> {
  const response = await axios.get(`${API_BASE}/leaderboards/global`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { limit, offset },
  });
  return response.data;
}

/**
 * Obtiene el leaderboard de amigos
 */
export async function getFriendsLeaderboard(token: string): Promise<any> {
  const response = await axios.get(`${API_BASE}/leaderboards/friends`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

