import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid ID', 400);

    const pkg = await prisma.package.findUnique({
      where: { id: numId },
      include: { service: true },
    });

    if (!pkg) return errorResponse('Not found', 404);
    return jsonResponse(pkg);
  } catch (error: any) {
    return errorResponse(error.message || 'Error', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid ID', 400);

    const body = await req.json();
    const updated = await prisma.package.update({
      where: { id: numId },
      data: body,
    });

    return jsonResponse(updated, 'Updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Error', 500);
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

    await prisma.package.delete({
      where: { id: numId },
    });

    return jsonResponse({ id: numId }, 'Deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Error', 500);
  }
}
