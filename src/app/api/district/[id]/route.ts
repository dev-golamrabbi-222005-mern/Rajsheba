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
    const { name, banglaName, code, longitude, latitude, devision_id, devisionId } = body;
    const data: any = {};
    if (name) data.name = name;
    if (banglaName !== undefined) data.banglaName = banglaName;
    if (code !== undefined) data.code = code;
    if (longitude !== undefined) data.longitude = longitude;
    if (latitude !== undefined) data.latitude = latitude;
    const devId = devision_id || devisionId;
    if (devId !== undefined) data.devisionId = parseInt(devId, 10);

    const updated = await prisma.district.update({
      where: { id: numId },
      data,
    });

    return jsonResponse(updated, 'District updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update district', 500);
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

    await prisma.district.delete({ where: { id: numId } });
    return jsonResponse({ id: numId }, 'District deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete district', 500);
  }
}
