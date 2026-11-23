import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const branding = await prisma.companyBranding.findFirst({
      orderBy: { id: 'desc' },
    });

    const fallback = {
      name: 'Rajseba',
      logo: '/rajseba-logo.png',
      phone: '01813333373',
      email: 'support@rajseba.com',
      address: 'Rajshahi, Bangladesh',
      facebook: 'https://facebook.com/rajseba',
    };

    return jsonResponse(branding || fallback, 'Branding fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch branding', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const branding = await prisma.companyBranding.create({
      data: body,
    });
    return jsonResponse(branding, 'Branding saved successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to save branding', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await prisma.companyBranding.findFirst({ orderBy: { id: 'desc' } });
    if (existing) {
      const updated = await prisma.companyBranding.update({
        where: { id: existing.id },
        data: body,
      });
      return jsonResponse(updated, 'Branding updated successfully');
    } else {
      const created = await prisma.companyBranding.create({ data: body });
      return jsonResponse(created, 'Branding created successfully', 201);
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update branding', 500);
  }
}
