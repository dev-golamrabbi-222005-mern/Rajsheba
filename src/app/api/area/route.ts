import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      include: { district: true },
      orderBy: { name: 'asc' },
    });
    return jsonResponse(areas, 'Areas fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch areas', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, banglaName, code, longitude, latitude, district_id, districtId } = body;
    if (!name) return errorResponse('Name is required', 400);

    const distId = district_id || districtId;
    const area = await prisma.area.create({
      data: {
        name,
        banglaName: banglaName || null,
        code: code || null,
        longitude: longitude || null,
        latitude: latitude || null,
        districtId: distId ? parseInt(distId, 10) : null,
      },
    });

    return jsonResponse(area, 'Area created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create area', 500);
  }
}
