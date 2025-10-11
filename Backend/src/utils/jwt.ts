import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { JWTPayload } from '@/types/auth.types';

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as any);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as any);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
};

