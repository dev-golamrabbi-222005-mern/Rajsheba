import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
    });
    return jsonResponse(roles, 'Public roles fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch public roles', 500);
  }
}
