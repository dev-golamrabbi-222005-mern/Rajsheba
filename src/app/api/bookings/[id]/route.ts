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
    if (isNaN(numId)) return errorResponse('Invalid booking ID', 400);

    const booking = await prisma.booking.findUnique({
      where: { id: numId },
      include: {
        user: true,
        vendor: true,
        agent: true,
        service: true,
        package: true,
      },
    });

    if (!booking) return errorResponse('Booking not found', 404);
    return jsonResponse(booking, 'Booking fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch booking', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid booking ID', 400);

    const body = await req.json();
    const updated = await prisma.booking.update({
      where: { id: numId },
      data: body,
    });

    return jsonResponse(updated, 'Booking updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update booking', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid booking ID', 400);

    await prisma.booking.delete({ where: { id: numId } });
    return jsonResponse({ id: numId }, 'Booking deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete booking', 500);
  }
}
