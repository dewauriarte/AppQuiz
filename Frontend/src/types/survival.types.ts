/**
 * Tipos para Survival Mode (Battle Royale Educativo)
 */

export interface SurvivalConfig {
  max_players: number;
  total_rounds: number;
  elimination_rate: number;
  final_round_players: number;
  question_time_limit: number;
  final_round_time_limit: number;
  safe_zone_enabled: boolean;
}

export interface SurvivalMetadata {
  current_round: number;
  total_rounds: number;
  safe_zone_size: number; // 100, 80, 60, 40
  players_alive: number;
  total_players: number;
  is_final_round: boolean;
  elimination_history: EliminationRecord[];
}

export interface EliminationRecord {
  round: number;
  eliminated_count: number;
  eliminated_players: {
    userId: number;
    nickname: string;
    score: number;
    rank: number;
  }[];
}

export interface SurvivalPlayer {
  userId: number;
  nickname: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  combo_streak: number;
  is_eliminated: boolean;
  eliminated_at_round?: number;
  final_rank?: number;
}

export interface SurvivalGameState {
  gameId: number;
  gameCode: string;
  status: 'waiting' | 'active' | 'finished';
  config: SurvivalConfig;
  metadata: SurvivalMetadata;
  players: SurvivalPlayer[];
  currentQuestion?: SurvivalQuestion;
}

export interface SurvivalQuestion {
  questionId: number;
  questionText: string;
  options: {
    optionId: number;
    optionText: string;
  }[];
  timeLimit: number;
  roundNumber: number;
  isFinalRound: boolean;
}

// Socket Events Payloads

export interface SurvivalRoundStartPayload {
  round: number;
  total_rounds: number;
  safe_zone_size: number;
  players_alive: number;
  is_final_round: boolean;
  time_limit: number;
  question: SurvivalQuestion;
}

export interface SurvivalRoundEndPayload {
  round: number;
  eliminated: {
    userId: number;
    nickname: string;
    score: number;
    rank: number;
  }[];
  survivors_count: number;
  players_alive: number;
  safe_zone_size: number;
  is_final_round: boolean;
  next_round_in_seconds?: number;
}

export interface SurvivalFinalRoundPayload {
  players_alive: number;
  message: string;
  survivors: {
    userId: number;
    nickname: string;
    score: number;
    rank: number;
  }[];
}

export interface SurvivalGameFinishedPayload {
  winner_id: number;
  winner_name: string;
  final_standings: {
    rank: number;
    userId: number;
    nickname: string;
    score: number;
    correct_answers: number;
    wrong_answers: number;
    rewards: {
      coins: number;
      gems: number;
      title?: string;
    };
  }[];
}

export interface SurvivalAnswerReceivedPayload {
  userId: number;
  isCorrect: boolean;
  score: number;
  answers_received: number;
  total_players: number;
}
