import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const devisions = await prisma.devision.findMany({
      include: {
        districts: {
          include: { areas: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return jsonResponse(devisions, 'Devisions fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch devisions', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, banglaName, code, longitude, latitude } = body;
    if (!name) return errorResponse('Name is required', 400);

    const devision = await prisma.devision.create({
      data: {
        name,
        banglaName: banglaName || null,
        code: code || null,
        longitude: longitude || null,
        latitude: latitude || null,
      },
    });

    return jsonResponse(devision, 'Devision created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create devision', 500);
  }
}
