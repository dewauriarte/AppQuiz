import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['teacher', 'student']).default('student'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: number;
  username: string;
  email: string | null;
  role: UserRole;
  displayName: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

