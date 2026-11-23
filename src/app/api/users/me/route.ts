import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/server/auth';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { role: true },
    });

    if (!user) return errorResponse('User not found', 404);

    const { password: _, ...userSafe } = user;
    return jsonResponse({
      ...userSafe,
      role: userSafe.roleName,
      id: String(userSafe.id),
    }, 'User profile fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch profile', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { name, avatar, address, password, phoneNumber } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (address) updateData.address = address;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roleName: true,
        avatar: true,
        address: true,
        status: true,
      },
    });

    return jsonResponse({ ...updated, role: updated.roleName, id: String(updated.id) }, 'Profile updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update profile', 500);
  }
}
