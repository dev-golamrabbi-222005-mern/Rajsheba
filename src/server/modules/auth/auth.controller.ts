import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

// Generate access & refresh tokens
const generateTokens = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.roleName || user.role?.name || 'client',
    name: user.name,
  };

  const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phoneNumber, password, role = 'client', address } = req.body;

    if (!name || !password || (!email && !phoneNumber)) {
      throw new AppError('Name, password, and either email or phone number are required', 400);
    }

    // Check duplicate
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {},
        ],
      },
    });

    if (existing) {
      throw new AppError('User with this email or phone number already exists', 400);
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

    const tokens = generateTokens(user);

    const { password: _, ...userSafe } = user;

    sendResponse(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: {
        user: { ...userSafe, role: userSafe.roleName, id: String(userSafe.id) },
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phoneNumber, identifier, password } = req.body;
    const loginIdentifier = identifier || email || phoneNumber;

    if (!loginIdentifier || !password) {
      throw new AppError('Phone/Email and password are required', 400);
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
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status === 'banned') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    const tokens = generateTokens(user);
    const { password: _, ...userSafe } = user;

    sendResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: { ...userSafe, role: userSafe.roleName, id: String(userSafe.id) },
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as any;
    if (!decoded || !decoded.id) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tokens = generateTokens(user);

    sendResponse(res, {
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error: any) {
    next(new AppError(error.message || 'Invalid refresh token', 401));
  }
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new AppError('Phone number is required', 400);

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otp.create({
      data: {
        phone,
        otpCode,
        expiresAt,
      },
    });

    console.log(`[OTP Simulated SMS] Phone: ${phone}, OTP: ${otpCode}`);

    sendResponse(res, {
      statusCode: 200,
      message: 'OTP sent successfully',
      data: { phone, otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otpCode } = req.body;
    if (!phone || !otpCode) throw new AppError('Phone and OTP code are required', 400);

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
      throw new AppError('Invalid or expired OTP', 400);
    }

    await prisma.otp.update({
      where: { id: record.id },
      data: { isVerified: true },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'OTP verified successfully',
      data: { verified: true },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) throw new AppError('User not found', 404);

    const { password: _, ...userSafe } = user;

    sendResponse(res, {
      statusCode: 200,
      message: 'User profile fetched successfully',
      data: {
        ...userSafe,
        role: userSafe.roleName,
        id: String(userSafe.id),
      },
    });
  } catch (error) {
    next(error);
  }
};
