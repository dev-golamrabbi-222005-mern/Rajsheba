import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, password, role = 'client', address } = body;

    if (!name || !password || (!email && !phoneNumber)) {
      return errorResponse('Name, password, and either email or phone number are required', 400);
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {},
        ],
      },
    });

    if (existing) {
      return errorResponse('User with this email or phone number already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleRecord = await prisma.role.findUnique({ where: { name: role } });

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
        roleId: roleRecord?.id || null,
        roleName: role,
        address: address || null,
      },
      include: { role: true },
    });

    const jwtSecret = process.env.JWT_SECRET || 'rajseba_super_secret_jwt_key_2026';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'rajseba_super_secret_refresh_jwt_key_2026';

    const payload = {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.roleName || 'client',
      name: user.name,
    };

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, jwtRefreshSecret, { expiresIn: '7d' });

    const { password: _, ...userSafe } = user;

    return jsonResponse(
      {
        user: { ...userSafe, role: userSafe.roleName, id: String(userSafe.id) },
        accessToken,
        refreshToken,
      },
      'User registered successfully',
      201
    );
  } catch (error: any) {
    return errorResponse(error.message || 'Registration failed', 500);
  }
}
