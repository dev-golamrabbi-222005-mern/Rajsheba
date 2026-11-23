import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;
    if (!phone) return errorResponse('Phone number is required', 400);

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otp.create({
      data: {
        phone,
        otpCode,
        expiresAt,
      },
    });

    return jsonResponse(
      { phone, otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined },
      'OTP sent successfully'
    );
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to send OTP', 500);
  }
}
