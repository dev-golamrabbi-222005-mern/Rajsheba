import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware.js';
import { sendResponse } from './utils/response.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import brandingRoutes from './modules/branding/branding.routes.js';
import locationRoutes from './modules/locations/location.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import withdrawRoutes from './modules/withdraw/withdraw.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';

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

  // REST API Routes
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/categories', categoryRoutes);
  app.use('/services', serviceRoutes);
  app.use('/bookings', bookingRoutes);
  app.use('/company-branding', brandingRoutes);
  app.use('/locations', locationRoutes);
  app.use('/devisions', (req, res, next) => {
    req.url = '/devisions';
    locationRoutes(req, res, next);
  });
  app.use('/districts', (req, res, next) => {
    req.url = '/districts';
    locationRoutes(req, res, next);
  });
  app.use('/areas', (req, res, next) => {
    req.url = '/areas';
    locationRoutes(req, res, next);
  });
  app.use('/coupons', couponRoutes);
  app.use('/reviews', reviewRoutes);
  app.use('/withdraw', withdrawRoutes);
  app.use('/chat', chatRoutes);

  // Global error handler
  app.use(errorHandler);

  return app;
};
