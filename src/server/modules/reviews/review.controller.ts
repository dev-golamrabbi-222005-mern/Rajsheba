import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export const createReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { service_id, rating, comment } = req.body;
    if (!service_id || rating === undefined) {
      throw new AppError('Service ID and rating are required', 400);
    }

    const review = await prisma.review.create({
      data: {
        userId,
        serviceId: parseInt(service_id, 10),
        rating: parseFloat(rating),
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    sendResponse(res, {
      statusCode: 201,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
