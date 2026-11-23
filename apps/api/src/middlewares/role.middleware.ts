import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { AppError } from './error.middleware.js';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    // superadmin has access to everything
    if (userRole === 'superadmin' || normalizedAllowed.includes(userRole)) {
      return next();
    }

    return next(new AppError('Forbidden: Access denied for your role', 403));
  };
};
