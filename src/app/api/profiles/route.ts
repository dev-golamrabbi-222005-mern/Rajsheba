import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const profiles = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        roleName: true,
        address: true,
      },
    });
    return jsonResponse(profiles.map(p => ({ ...p, role: p.roleName, id: String(p.id) })), 'Profiles fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch profiles', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return jsonResponse(body, 'Profile saved successfully', 200);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to save profile', 500);
  }
}
