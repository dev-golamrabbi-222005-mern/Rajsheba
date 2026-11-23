import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.query;

    const where: any = {};
    if (role) {
      where.roleName = String(role).toLowerCase();
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

    sendResponse(res, {
      statusCode: 200,
      message: 'Users fetched successfully',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { name, avatar, address, password, phoneNumber } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (address) updateData.address = address;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roleName: true,
        avatar: true,
        address: true,
        status: true,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: { ...updated, role: updated.roleName, id: String(updated.id) },
    });
  } catch (error) {
    next(error);
  }
};
