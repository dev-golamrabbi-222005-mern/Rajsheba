import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const where: any = {};
    if (role) {
      where.roleName = role.toLowerCase();
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roleName: true,
        avatar: true,
        status: true,
        balance: true,
        address: true,
        commissionRate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map(u => ({ ...u, role: u.roleName, id: String(u.id) }));
    return jsonResponse(formatted, 'Users fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch users', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, password = 'DefaultPassword123!', role = 'client', address } = body;

    if (!name) return errorResponse('Name is required', 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleRecord = await prisma.role.findUnique({ where: { name: role.toLowerCase() } });

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
        roleId: roleRecord?.id || null,
        roleName: role.toLowerCase(),
        address: address || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roleName: true,
        avatar: true,
        address: true,
        status: true,
        createdAt: true,
      },
    });

    return jsonResponse({ ...user, role: user.roleName, id: String(user.id) }, 'User created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create user', 500);
  }
}
