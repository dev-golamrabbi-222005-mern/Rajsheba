import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Coupons fetched successfully',
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, description, discount_type, discount_value, max_discount, min_order_amount, usage_limit, valid_from, valid_until, applicable_to, service_id, package_id } = req.body;

    if (!code || discount_value === undefined) {
      throw new AppError('Coupon code and discount value are required', 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description: description || null,
        discountType: discount_type || 'percentage',
        discountValue: parseFloat(discount_value),
        maxDiscount: max_discount ? parseFloat(max_discount) : null,
        minOrderAmount: minOrderAmount(min_order_amount),
        usageLimit: usage_limit ? parseInt(usage_limit, 10) : null,
        validFrom: valid_from ? new Date(valid_from) : null,
        validUntil: valid_until ? new Date(valid_until) : null,
        applicableTo: applicable_to || 'all',
        serviceId: service_id ? parseInt(service_id, 10) : null,
        packageId: package_id ? parseInt(package_id, 10) : null,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

const minOrderAmount = (val: any) => val ? parseFloat(val) : 0;
