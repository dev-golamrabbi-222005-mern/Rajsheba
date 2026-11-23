import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AppError } from './error.middleware.js';
import { prisma } from '../config/prisma.js';

export interface AuthUser {
  id: number;
  email?: string | null;
  phoneNumber?: string | null;
  role: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;

    if (!decoded || !decoded.id) {
      throw new AppError('Invalid token payload', 401);
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      phoneNumber: decoded.phoneNumber,
      role: decoded.role || decoded.roleName || 'client',
      name: decoded.name || '',
    };

    next();
  } catch (error: any) {
    next(new AppError(error.message || 'Unauthorized', 401));
  }
};
