import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export const getBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) throw new AppError('Unauthorized', 401);

    const role = (user.role || '').toLowerCase();
    const where: any = {};

    if (role === 'client') {
      where.userId = user.id;
    } else if (role === 'vendor') {
      where.vendorId = user.id;
    } else if (role === 'agent') {
      where.agentId = user.id;
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

    sendResponse(res, {
      statusCode: 200,
      message: 'Bookings fetched successfully',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('Invalid booking ID', 400);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        vendor: true,
        agent: true,
        service: true,
        package: true,
      },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    sendResponse(res, {
      statusCode: 200,
      message: 'Booking fetched successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
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
    } = req.body;

    if (!location || !date) {
      throw new AppError('Location and date are required', 400);
    }

    const bookingCode = 'BK-' + Date.now().toString().slice(-6);

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        userId: userId || null,
        serviceId: serviceId ? parseInt(serviceId, 10) : null,
        packageId: packageId ? parseInt(packageId, 10) : null,
        date: new Date(date),
        time: time || null,
        location,
        notes: notes || null,
        quantity: parseInt(quantity, 10) || 1,
        subtotal: parseFloat(subtotal) || 0,
        couponCode: couponCode || null,
        totalPrice: parseFloat(totalPrice) || 0,
        subServiceItems: subServiceItems || null,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
      include: {
        service: true,
        package: true,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('Invalid booking ID', 400);

    const { status, vendorId, agentId } = req.body;

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === 'assigned') data.assignedAt = new Date();
      if (status === 'on_the_way') data.onTheWayAt = new Date();
      if (status === 'completed') data.completedAt = new Date();
    }
    if (vendorId) data.vendorId = parseInt(vendorId, 10);
    if (agentId) data.agentId = parseInt(agentId, 10);

    const updated = await prisma.booking.update({
      where: { id },
      data,
      include: {
        user: true,
        vendor: true,
        service: true,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Booking status updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
