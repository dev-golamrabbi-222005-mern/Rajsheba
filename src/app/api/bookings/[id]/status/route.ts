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
    if (isNaN(numId)) return errorResponse('Invalid booking ID', 400);

    const body = await req.json();
    const { status, vendorId, employeeId } = body;

    const data: any = {};
    if (status) data.status = status;
    if (vendorId !== undefined) data.vendorId = vendorId ? parseInt(vendorId, 10) : null;
    if (employeeId !== undefined) data.employeeId = employeeId ? parseInt(employeeId, 10) : null;

    const updated = await prisma.booking.update({
      where: { id: numId },
      data,
    });

    return jsonResponse(updated, 'Booking status updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update booking status', 500);
  }
}
