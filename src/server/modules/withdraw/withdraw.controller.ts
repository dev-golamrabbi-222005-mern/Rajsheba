import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export const getWithdrawals = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) throw new AppError('Unauthorized', 401);

    const where: any = { deletedAt: null };
    if (user.role === 'vendor') {
      where.vendorId = user.id;
    }

    const withdraws = await prisma.withdraw.findMany({
      where,
      include: {
        vendor: { select: { id: true, name: true, email: true, roleName: true } },
        booking: {
          select: {
            id: true,
            totalPrice: true,
            date: true,
            service: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Withdrawals fetched successfully',
      data: withdraws,
    });
  } catch (error) {
    next(error);
  }
};

export const createWithdrawal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { amount, booking_id, getway_type, getway_info } = req.body;
    if (!amount) throw new AppError('Withdrawal amount is required', 400);

    const withdrawal = await prisma.withdraw.create({
      data: {
        vendorId: userId,
        amount: parseFloat(amount),
        bookingId: booking_id ? parseInt(booking_id, 10) : null,
        gatewayType: getway_type || 'bKash',
        gatewayInfo: getway_info || null,
        status: 'pending',
      },
    });

    sendResponse(res, {
      statusCode: 201,
      message: 'Withdrawal requested successfully',
      data: withdrawal,
    });
  } catch (error) {
    next(error);
  }
};
