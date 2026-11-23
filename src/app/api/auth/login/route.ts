import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phoneNumber, identifier, password } = body;
    const loginIdentifier = identifier || email || phoneNumber;

    if (!loginIdentifier || !password) {
      return errorResponse('Phone/Email and password are required', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          { phoneNumber: loginIdentifier },
        ],
      },
      include: { role: true },
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse('Invalid credentials', 401);
    }

    if (user.status === 'banned') {
      return errorResponse('Your account has been suspended. Please contact support.', 403);
    }

    const jwtSecret = process.env.JWT_SECRET || 'rajseba_super_secret_jwt_key_2026';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'rajseba_super_secret_refresh_jwt_key_2026';

    const payload = {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.roleName || user.role?.name || 'client',
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
      'Login successful'
    );
  } catch (error: any) {
    return errorResponse(error.message || 'Login failed', 500);
  }
}
