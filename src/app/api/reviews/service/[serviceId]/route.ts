import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;
    const numId = parseInt(serviceId, 10);
    if (isNaN(numId)) return errorResponse('Invalid service ID', 400);

    const reviews = await prisma.review.findMany({
      where: { serviceId: numId },
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
