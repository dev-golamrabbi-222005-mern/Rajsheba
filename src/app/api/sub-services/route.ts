import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const subServices = await prisma.subService.findMany({
      include: { service: true, nestedService: true },
    });
    return jsonResponse(subServices, 'Sub services fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch sub services', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, serviceId, nestedServiceId, price, unit } = body;
    if (!name) return errorResponse('Name is required', 400);

    const sub = await prisma.subService.create({
      data: {
        name,
        serviceId: serviceId ? parseInt(serviceId, 10) : null,
        nestedServiceId: nestedServiceId ? parseInt(nestedServiceId, 10) : null,
        price: price ? parseFloat(price) : 0,
        unit: unit || null,
      },
    });

    return jsonResponse(sub, 'Sub service created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create sub service', 500);
  }
}
