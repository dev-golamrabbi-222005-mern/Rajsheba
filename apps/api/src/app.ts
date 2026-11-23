import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware.js';
import { sendResponse } from './utils/response.js';

export const createApp = () => {
  const app = express();

  // Global middlewares
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Root & Health check
  app.get('/', (req, res) => {
    sendResponse(res, {
      statusCode: 200,
      message: 'Rajseba Core Backend API (Node.js + Express + NeonDB PostgreSQL) is running',
      data: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  });

  app.get('/api/health', (req, res) => {
    sendResponse(res, {
      statusCode: 200,
      message: 'API Health Check OK',
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
