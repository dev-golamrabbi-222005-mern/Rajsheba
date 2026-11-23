import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { deletedAt: null },
      include: { service: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    });
    return jsonResponse(packages, 'Public packages fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch public packages', 500);
  }
}
