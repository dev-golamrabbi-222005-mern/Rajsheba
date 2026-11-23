import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        vendor: { select: { id: true, name: true, email: true, phoneNumber: true } },
        nestedServices: {
          include: { subServices: true },
        },
        packages: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonResponse(services, 'Public services fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch public services', 500);
  }
}
