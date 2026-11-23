import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return jsonResponse(coupons, 'Coupons fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch coupons', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, description, discount_type, discountType, discount_value, discountValue, max_discount, maxDiscount, min_order_amount, minOrderAmount, usage_limit, usageLimit, valid_from, validFrom, valid_until, validUntil, applicable_to, applicableTo, service_id, serviceId, package_id, packageId } = body;

    const couponCode = code ? code.trim().toUpperCase() : null;
    const finalValue = discount_value ?? discountValue;
    if (!couponCode || finalValue === undefined) {
      return errorResponse('Coupon code and discount value are required', 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        description: description || null,
        discountType: discount_type || discountType || 'percentage',
        discountValue: parseFloat(finalValue),
        maxDiscount: (max_discount ?? maxDiscount) ? parseFloat(max_discount ?? maxDiscount) : null,
        minOrderAmount: (min_order_amount ?? minOrderAmount) ? parseFloat(min_order_amount ?? minOrderAmount) : 0,
        usageLimit: (usage_limit ?? usageLimit) ? parseInt(usage_limit ?? usageLimit, 10) : null,
        validFrom: (valid_from ?? validFrom) ? new Date(valid_from ?? validFrom) : null,
        validUntil: (valid_until ?? validUntil) ? new Date(valid_until ?? validUntil) : null,
        applicableTo: applicable_to || applicableTo || 'all',
        serviceId: (service_id ?? serviceId) ? parseInt(service_id ?? serviceId, 10) : null,
        packageId: (package_id ?? packageId) ? parseInt(package_id ?? packageId, 10) : null,
      },
    });

    return jsonResponse(coupon, 'Coupon created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create coupon', 500);
  }
}
