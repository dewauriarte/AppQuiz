import { z } from 'zod';
import { GameMode, GameStatus } from '@prisma/client';

export const createGameSchema = z.object({
  set_id: z.number().int().positive(),
  game_mode: z.nativeEnum(GameMode),
  max_players: z.number().int().min(1).max(1000).default(50),
  list_id: z.number().int().positive().optional(), // Lista opcional para invitar estudiantes
  config: z.object({
    show_leaderboard_live: z.boolean().default(true),
    points_for_speed: z.boolean().default(true),
    allow_powerups: z.boolean().default(false),
    allow_hints: z.boolean().default(false),
    question_time_limit: z.number().int().min(5).max(300).optional(),
  }).optional(),
});

export const updateGameStatusSchema = z.object({
  status: z.nativeEnum(GameStatus),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameStatusInput = z.infer<typeof updateGameStatusSchema>;

