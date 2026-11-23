import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const districts = await prisma.district.findMany({
      include: { areas: true, devision: true },
      orderBy: { name: 'asc' },
    });
    return jsonResponse(districts, 'Districts fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch districts', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, banglaName, code, longitude, latitude, devision_id, devisionId } = body;
    if (!name) return errorResponse('Name is required', 400);

    const devId = devision_id || devisionId;
    const district = await prisma.district.create({
      data: {
        name,
        banglaName: banglaName || null,
        code: code || null,
        longitude: longitude || null,
        latitude: latitude || null,
        devisionId: devId ? parseInt(devId, 10) : null,
      },
    });

    return jsonResponse(district, 'District created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create district', 500);
  }
}
