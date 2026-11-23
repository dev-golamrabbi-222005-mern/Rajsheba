import { Response } from 'express';

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  success?: boolean;
}

export const sendResponse = <T>(
  res: Response,
  {
    statusCode = 200,
    message = 'Success',
    data,
    success = true,
  }: {
    statusCode?: number;
    message?: string;
    data: T;
    success?: boolean;
  }
) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    data,
    success,
  });
};
