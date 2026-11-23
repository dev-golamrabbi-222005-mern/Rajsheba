import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/server/auth';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        service: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return jsonResponse(reviews, 'Reviews fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch reviews', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    const body = await req.json();
    const { service_id, serviceId, rating, comment } = body;
    const targetServiceId = service_id || serviceId;

    if (!targetServiceId || rating === undefined) {
      return errorResponse('Service ID and rating are required', 400);
    }

    let userId = authUser?.id;
    if (!userId) {
      const fallbackUser = await prisma.user.findFirst();
      userId = fallbackUser?.id || 1;
    }

    const review = await prisma.review.create({
      data: {
        userId,
        serviceId: parseInt(targetServiceId, 10),
        rating: parseFloat(rating),
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return jsonResponse(review, 'Review submitted successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to submit review', 500);
  }
}
