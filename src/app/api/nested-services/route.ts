import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const nestedServices = await prisma.nestedService.findMany({
      where: { deletedAt: null },
      include: {
        service: true,
        subServices: true,
      },
    });
    return jsonResponse(nestedServices, 'Nested services fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch nested services', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, serviceId, basePrice, description, image } = body;
    if (!name || !serviceId) return errorResponse('Name and serviceId are required', 400);

    const nested = await prisma.nestedService.create({
      data: {
        name,
        serviceId: parseInt(serviceId, 10),
        basePrice: basePrice ? parseFloat(basePrice) : 0,
        description: description || null,
        image: image || null,
      },
      include: { service: true, subServices: true },
    });

    return jsonResponse(nested, 'Nested service created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create nested service', 500);
  }
}
