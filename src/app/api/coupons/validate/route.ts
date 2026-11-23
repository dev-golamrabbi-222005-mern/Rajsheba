import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, orderAmount = 0 } = body;
    if (!code) return errorResponse('Coupon code is required', 400);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) return errorResponse('Invalid coupon code', 404);

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return errorResponse('Coupon is not yet active', 400);
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return errorResponse('Coupon has expired', 400);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse('Coupon usage limit reached', 400);
    }
    if (coupon.minOrderAmount !== null && coupon.minOrderAmount !== undefined && orderAmount < coupon.minOrderAmount) {
      return errorResponse(`Minimum order amount of ${coupon.minOrderAmount} required`, 400);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return jsonResponse({
      valid: true,
      coupon,
      discountAmount: discount,
      finalAmount: Math.max(0, orderAmount - discount),
    }, 'Coupon applied successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Validation error', 500);
  }
}
