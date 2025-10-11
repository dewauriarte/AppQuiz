import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100),
  role: z.enum(['teacher', 'student']).default('student'),
  displayName: z.string().min(2).max(100).optional(),
  birthdate: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string | null;
    role: string;
    displayName: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

