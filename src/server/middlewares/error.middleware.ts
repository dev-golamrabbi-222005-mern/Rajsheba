import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Handler]:', err);

  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    statusCode,
    message,
    success: false,
    data: null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
