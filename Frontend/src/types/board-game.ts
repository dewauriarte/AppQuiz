/**
 * Board Game Types - Frontend
 * Sprint 11 - Board Mode tipo Mario Party
 */

export type BoardLayout = 'linear' | 'circular' | 'serpentine';

export type BoardEventType =
  | 'bonus_coins'
  | 'bonus_xp'
  | 'bonus_gems'
  | 'trap_lose_coins'
  | 'trap_go_back'
  | 'teleport_forward'
  | 'quiz_challenge'
  | 'powerup'
  | 'mystery_box'
  | 'boss_encounter';

// Board Event Assignment
export interface BoardEventAssignment {
  position: number;
  event_type: BoardEventType;
  event_id: number;
}

// Board State (from server)
export interface BoardGameState {
  board_size: number;
  board_layout: BoardLayout;
  current_turn: number;
  turn_order: number[];
  turn_timeout_at?: number;
  events: BoardEventAssignment[];
  checkpoint_positions: number[];
  shop_positions: number[];
  last_dice_roll?: DiceRollResult;
  question_counter: number;
}

// Player State in Board Game
export interface BoardPlayerState {
  userId: number;
  nickname: string;
  board_position: number;
  coins_collected: number;
  powerups: string[];
  shields: number;
  is_turn: boolean;
}

// Dice Roll Result
export interface DiceRollResult {
  userId: number;
  diceValue: number;
  oldPosition: number;
  newPosition: number;
  event?: BoardEventTrigger;
  timestamp: number;
}

// Event Trigger
export interface BoardEventTrigger {
  event_type: BoardEventType;
  event_id: number;
  position: number;
  effects: EventEffects;
  message: string;
}

// Event Effects
export interface EventEffects {
  coin_change?: number;
  gem_change?: number;
  xp_change?: number;
  position_change?: number;
  powerup_granted?: string;
  shield_granted?: boolean;
}

// Turn Result
export interface TurnResult {
  current_player_id: number;
  next_player_id?: number;
  turn_number: number;
  timeout_at: number;
}

// Board Game End Result
export interface BoardGameEndResult {
  winner_id: number;
  final_positions: Array<{
    userId: number;
    nickname: string;
    board_position: number;
    score: number;
    coins_collected: number;
    rank: number;
  }>;
  reason: 'reached_end' | 'max_turns' | 'timeout';
}

// Socket Events Payloads

export interface BoardInitializedPayload {
  board_state: BoardGameState;
  players: BoardPlayerState[];
  current_player_id: number;
}

export interface BoardTurnStartPayload {
  player_id: number;
  turn_number: number;
  timeout_at: number;
}

export interface BoardPlayerMovedPayload {
  user_id: number;
  dice_value: number;
  old_position: number;
  new_position: number;
  event?: BoardEventTrigger;
}

export interface BoardEventTriggeredPayload {
  user_id: number;
  event: BoardEventTrigger;
}

export interface BoardTurnChangePayload {
  current_player_id: number;
  next_player_id?: number;
  turn_number: number;
  timeout_at: number;
}

export interface BoardGameFinishedPayload {
  winner_id: number;
  final_positions: BoardGameEndResult['final_positions'];
  reason: string;
}
