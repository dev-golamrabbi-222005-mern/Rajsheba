import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;
    const numServiceId = parseInt(serviceId, 10);
    if (isNaN(numServiceId)) return errorResponse('Invalid service ID', 400);

    const nestedServices = await prisma.nestedService.findMany({
      where: { serviceId: numServiceId },
      include: { subServices: true },
    });

    return jsonResponse(nestedServices, 'Nested services fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch nested services', 500);
  }
}
