import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid ID', 400);

    const coupon = await prisma.coupon.findUnique({ where: { id: numId } });
    if (!coupon) return errorResponse('Coupon not found', 404);
    return jsonResponse(coupon);
  } catch (error: any) {
    return errorResponse(error.message || 'Error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid ID', 400);

    const body = await req.json();
    const updated = await prisma.coupon.update({
      where: { id: numId },
      data: body,
    });
    return jsonResponse(updated, 'Coupon updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Error', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid ID', 400);

    await prisma.coupon.delete({ where: { id: numId } });
    return jsonResponse({ id: numId }, 'Coupon deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Error', 500);
  }
}
