import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: number;
  email?: string | null;
  phoneNumber?: string | null;
  role: string;
  name: string;
}

export function verifyAuth(req: Request | NextRequest): TokenPayload | null {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'rajseba_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || !decoded.id) return null;
    return {
      id: Number(decoded.id),
      email: decoded.email,
      phoneNumber: decoded.phoneNumber,
      role: decoded.role || decoded.roleName || 'client',
      name: decoded.name || '',
    };
  } catch {
    return null;
  }
}
