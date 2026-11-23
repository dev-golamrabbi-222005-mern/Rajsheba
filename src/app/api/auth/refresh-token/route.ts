import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse('Refresh token required', 400);
    }

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'rajseba_super_secret_refresh_jwt_key_2026';
    const jwtSecret = process.env.JWT_SECRET || 'rajseba_super_secret_jwt_key_2026';

    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;
    if (!decoded || !decoded.id) {
      return errorResponse('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const payload = {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.roleName || user.role?.name || 'client',
      name: user.name,
    };

    const newAccessToken = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
    const newRefreshToken = jwt.sign(payload, jwtRefreshSecret, { expiresIn: '7d' });

    return jsonResponse(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      'Token refreshed successfully'
    );
  } catch (error: any) {
    return errorResponse(error.message || 'Invalid refresh token', 401);
  }
}
