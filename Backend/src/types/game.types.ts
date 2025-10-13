import { z } from 'zod';
import { GameMode, GameStatus } from '@prisma/client';

// Configuración base para todos los modos
const baseConfigSchema = z.object({
  show_leaderboard_live: z.boolean().default(true),
  points_for_speed: z.boolean().default(true),
  allow_powerups: z.boolean().default(false),
  allow_hints: z.boolean().default(false),
  question_time_limit: z.number().int().min(5).max(300).optional(),
});

// Configuración específica para modo tablero
const boardConfigSchema = z.object({
  board_size: z.number().int().min(30).max(50).default(40),
  board_layout: z.enum(['linear', 'circular', 'serpentine']).default('serpentine'),
  win_condition: z.enum(['reach_end', 'max_turns', 'highest_score']).default('reach_end'),
  max_turns: z.number().int().min(10).max(100).optional(),
  turn_timeout: z.number().int().min(10).max(60).default(15),
  enable_questions: z.boolean().default(true),
  question_frequency: z.number().int().min(1).max(10).default(3),
});

// Configuración específica para modo supervivencia
const survivalConfigSchema = z.object({
  total_rounds: z.number().int().min(5).max(20).default(12),
  elimination_rate: z.number().min(0.1).max(0.5).default(0.20), // 20%
  final_round_players: z.number().int().min(3).max(20).default(10),
  question_time_limit: z.number().int().min(10).max(60).default(30),
  final_round_time_limit: z.number().int().min(10).max(30).default(20),
  safe_zone_enabled: z.boolean().default(true),
});

// Configuración completa (base + específica según modo)
const configSchema = z.union([
  baseConfigSchema,
  baseConfigSchema.merge(boardConfigSchema),
  baseConfigSchema.merge(survivalConfigSchema),
]);

export const createGameSchema = z.object({
  set_id: z.number().int().positive(),
  game_mode: z.nativeEnum(GameMode),
  max_players: z.number().int().min(1).max(1000).default(50),
  list_id: z.number().int().positive().optional(), // Lista opcional para invitar estudiantes
  config: configSchema.optional(),
});

export const updateGameStatusSchema = z.object({
  status: z.nativeEnum(GameStatus),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameStatusInput = z.infer<typeof updateGameStatusSchema>;

