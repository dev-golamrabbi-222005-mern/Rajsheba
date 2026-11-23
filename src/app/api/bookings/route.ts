import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/server/auth';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    const where: any = {};

    if (authUser) {
      const role = (authUser.role || '').toLowerCase();
      if (role === 'client') {
        where.userId = authUser.id;
      } else if (role === 'vendor') {
        where.vendorId = authUser.id;
      } else if (role === 'agent') {
        where.agentId = authUser.id;
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true } },
        vendor: { select: { id: true, name: true, email: true, phoneNumber: true } },
        agent: { select: { id: true, name: true, email: true, phoneNumber: true } },
        service: true,
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonResponse(bookings, 'Bookings fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch bookings', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuth(req);
    const body = await req.json();
    const {
      serviceId,
      packageId,
      date,
      time,
      location,
      notes,
      quantity = 1,
      subtotal = 0,
      couponCode,
      totalPrice = 0,
      subServiceItems,
    } = body;

    if (!location || !date) {
      return errorResponse('Location and date are required', 400);
    }

    const bookingCode = 'BK-' + Date.now().toString().slice(-6);

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        userId: authUser?.id || null,
        serviceId: serviceId ? parseInt(serviceId, 10) : null,
        packageId: packageId ? parseInt(packageId, 10) : null,
        date: new Date(date),
        time: time || '10:00 AM',
        location,
        notes: notes || null,
        quantity: parseInt(quantity, 10) || 1,
        subtotal: parseFloat(subtotal) || 0,
        couponCode: couponCode || null,
        totalPrice: parseFloat(totalPrice) || 0,
        subServiceItems: subServiceItems || null,
        status: 'pending',
      },
      include: {
        service: true,
        package: true,
      },
    });

    return jsonResponse(booking, 'Booking created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create booking', 500);
  }
}
