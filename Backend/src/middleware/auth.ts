import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@utils/ApiError';
import { verifyAccessToken } from '@utils/jwt';
import { UserRole } from '@prisma/client';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.userId = payload.userId;
    req.userRole = payload.role as UserRole;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (!roles.includes(req.userRole)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

