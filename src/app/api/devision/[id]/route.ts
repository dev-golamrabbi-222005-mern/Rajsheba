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
    const updated = await prisma.devision.update({
      where: { id: numId },
      data: body,
    });

    return jsonResponse(updated, 'Devision updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update devision', 500);
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

    await prisma.devision.delete({ where: { id: numId } });
    return jsonResponse({ id: numId }, 'Devision deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete devision', 500);
  }
}
