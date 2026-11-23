import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid ID', 400);

    const body = await req.json();
    const { name, banglaName, code, longitude, latitude, district_id, districtId } = body;
    const data: any = {};
    if (name) data.name = name;
    if (banglaName !== undefined) data.banglaName = banglaName;
    if (code !== undefined) data.code = code;
    if (longitude !== undefined) data.longitude = longitude;
    if (latitude !== undefined) data.latitude = latitude;
    const distId = district_id || districtId;
    if (distId !== undefined) data.districtId = parseInt(distId, 10);

    const updated = await prisma.area.update({
      where: { id: numId },
      data,
    });

    return jsonResponse(updated, 'Area updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update area', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid ID', 400);

    await prisma.area.delete({ where: { id: numId } });
    return jsonResponse({ id: numId }, 'Area deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete area', 500);
  }
}
