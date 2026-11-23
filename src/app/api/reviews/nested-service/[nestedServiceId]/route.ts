import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ nestedServiceId: string }> }
) {
  try {
    const { nestedServiceId } = await params;
    const numId = parseInt(nestedServiceId, 10);
    if (isNaN(numId)) return errorResponse('Invalid nested service ID', 400);

    const nested = await prisma.nestedService.findUnique({
      where: { id: numId },
      select: { serviceId: true },
    });

    if (!nested) return errorResponse('Nested service not found', 404);

    const reviews = await prisma.review.findMany({
      where: { serviceId: nested.serviceId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonResponse(reviews, 'Reviews fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Error', 500);
  }
}
