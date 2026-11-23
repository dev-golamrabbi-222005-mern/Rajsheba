import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const service = await prisma.service.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        vendor: { select: { id: true, name: true, email: true, phoneNumber: true } },
        nestedServices: {
          include: { subServices: true },
        },
        subServices: true,
        packages: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!service) return errorResponse('Service not found', 404);
    return jsonResponse(service, 'Service fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch service', 500);
  }
}
