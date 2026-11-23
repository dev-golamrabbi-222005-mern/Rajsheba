import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { deletedAt: null },
      include: { service: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    });
    return jsonResponse(packages, 'Packages fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch packages', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, price, discountedPrice, features, serviceId, vendorId } = body;
    if (!title) return errorResponse('Title is required', 400);

    const pkg = await prisma.package.create({
      data: {
        title,
        description: description || null,
        price: price ? parseFloat(price) : 0,
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        features: features || [],
        serviceId: serviceId ? parseInt(serviceId, 10) : null,
        vendorId: vendorId ? parseInt(vendorId, 10) : null,
      },
    });

    return jsonResponse(pkg, 'Package created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create package', 500);
  }
}
