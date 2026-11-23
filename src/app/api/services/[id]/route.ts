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
    const where = isNaN(numId) ? { slug: id } : { id: numId };

    const service = await prisma.service.findFirst({
      where: { ...where, deletedAt: null },
      include: {
        category: true,
        vendor: { select: { id: true, name: true, email: true, phoneNumber: true } },
        nestedServices: {
          include: { subServices: true },
        },
        subServices: true,
        packages: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!service) return errorResponse('Service not found', 404);
    return jsonResponse(service, 'Service fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch service', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid service ID', 400);

    const body = await req.json();
    const updated = await prisma.service.update({
      where: { id: numId },
      data: body,
    });

    return jsonResponse(updated, 'Service updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update service', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid service ID', 400);

    await prisma.service.update({
      where: { id: numId },
      data: { deletedAt: new Date() },
    });

    return jsonResponse({ id: numId }, 'Service deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete service', 500);
  }
}
