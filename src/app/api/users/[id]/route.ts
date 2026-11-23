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
    if (isNaN(numId)) return errorResponse('Invalid user ID', 400);

    const user = await prisma.user.findUnique({
      where: { id: numId },
      include: { role: true },
    });

    if (!user) return errorResponse('User not found', 404);

    const { password: _, ...userSafe } = user;
    return jsonResponse({ ...userSafe, role: userSafe.roleName, id: String(userSafe.id) });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch user', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid user ID', 400);

    const body = await req.json();
    const updated = await prisma.user.update({
      where: { id: numId },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roleName: true,
        avatar: true,
        address: true,
        status: true,
        balance: true,
        commissionRate: true,
      },
    });

    return jsonResponse({ ...updated, role: updated.roleName, id: String(updated.id) }, 'User updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update user', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid user ID', 400);

    await prisma.user.delete({
      where: { id: numId },
    });

    return jsonResponse({ id: numId }, 'User deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete user', 500);
  }
}
