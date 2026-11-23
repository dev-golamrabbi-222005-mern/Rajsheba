import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const [totalUsers, totalServices, totalBookings, totalVendors] = await Promise.all([
      prisma.user.count(),
      prisma.service.count({ where: { deletedAt: null } }),
      prisma.booking.count(),
      prisma.user.count({ where: { roleName: 'vendor' } }),
    ]);

    return jsonResponse({
      totalUsers,
      totalServices,
      totalBookings,
      totalVendors,
      rating: 4.9,
      satisfactionRate: 98,
    }, 'Stats fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch stats', 500);
  }
}
