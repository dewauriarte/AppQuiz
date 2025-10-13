import { z } from 'zod';
import { BoardEventType } from '@prisma/client';

/**
 * Board Game Configuration Types
 * Sprint 11 - Board Mode tipo Mario Party
 */

// Board Layout Types
export type BoardLayout = 'linear' | 'circular' | 'serpentine';

// Board Game Configuration
export interface BoardGameConfig {
  board_size: number; // 30-50 casillas
  board_layout: BoardLayout;
  event_positions: number[]; // Índices de casillas con eventos
  checkpoint_positions: number[]; // Cada 10 casillas
  shop_positions: number[]; // Cada 20 casillas
  win_condition: 'reach_end' | 'max_turns' | 'highest_score';
  max_turns?: number; // Límite de turnos si win_condition es max_turns
  turn_timeout: number; // Segundos por turno (default: 15)
  dice_type: 'standard' | 'custom'; // standard: 1-6
  enable_questions: boolean; // Alternar preguntas con movimiento
  question_frequency: number; // Cada X turnos
}

// Board Event Assignment
export interface BoardEventAssignment {
  position: number;
  event_type: BoardEventType;
  event_id: number;
}

// Board State (stored in Redis)
export interface BoardGameState {
  board_size: number;
  board_layout: BoardLayout;
  current_turn: number; // Índice del jugador en turno
  turn_order: number[]; // Array de user_ids en orden
  turn_timeout_at?: number; // Timestamp cuando expira el turno actual
  events: BoardEventAssignment[]; // Eventos asignados a casillas
  checkpoint_positions: number[];
  shop_positions: number[];
  last_dice_roll?: DiceRollResult;
  question_counter: number; // Contador para alternar preguntas
}

// Player Board State (extends PlayerState)
export interface BoardPlayerState {
  userId: number;
  nickname: string;
  board_position: number; // Posición en el tablero (0 = inicio)
  coins_collected: number;
  powerups: string[]; // Powerups activos
  shields: number; // Protección contra traps
  is_turn: boolean;
}

// Dice Roll Result
export interface DiceRollResult {
  userId: number;
  diceValue: number; // 1-6
  oldPosition: number;
  newPosition: number;
  event?: BoardEventTrigger;
  timestamp: number;
}

// Event Trigger Result
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
  position_change?: number; // Movimiento adicional (teleport/go_back)
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

/**
 * Zod Schemas for Validation
 */

export const boardConfigSchema = z.object({
  board_size: z.number().int().min(30).max(50).default(40),
  board_layout: z.enum(['linear', 'circular', 'serpentine']).default('serpentine'),
  win_condition: z.enum(['reach_end', 'max_turns', 'highest_score']).default('reach_end'),
  max_turns: z.number().int().min(10).max(100).optional(),
  turn_timeout: z.number().int().min(10).max(60).default(15),
  dice_type: z.enum(['standard', 'custom']).default('standard'),
  enable_questions: z.boolean().default(true),
  question_frequency: z.number().int().min(1).max(10).default(3), // Pregunta cada 3 turnos
});

export const rollDiceSchema = z.object({
  gameCode: z.string().length(6),
  userId: z.number().int().positive(),
});

export const buyShopItemSchema = z.object({
  gameCode: z.string().length(6),
  userId: z.number().int().positive(),
  item_type: z.enum(['extra_roll', 'teleport_forward', 'steal_coins', 'shield']),
});

/**
 * Type Exports
 */
export type BoardConfigInput = z.infer<typeof boardConfigSchema>;
export type RollDiceInput = z.infer<typeof rollDiceSchema>;
export type BuyShopItemInput = z.infer<typeof buyShopItemSchema>;
