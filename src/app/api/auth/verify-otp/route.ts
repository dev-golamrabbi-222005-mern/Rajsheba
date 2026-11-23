import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otpCode } = body;
    if (!phone || !otpCode) return errorResponse('Phone and OTP code are required', 400);

    const record = await prisma.otp.findFirst({
      where: {
        phone,
        otpCode,
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return errorResponse('Invalid or expired OTP', 400);
    }

    await prisma.otp.update({
      where: { id: record.id },
      data: { isVerified: true },
    });

    return jsonResponse({ verified: true }, 'OTP verified successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'OTP verification failed', 500);
  }
}
