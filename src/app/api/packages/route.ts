import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      include: { service: true },
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
    const { name, title, description, price, features, serviceId, service_id, image } = body;
    const pkgName = name || title;
    const sId = serviceId || service_id;

    if (!pkgName || !sId) return errorResponse('Name and serviceId are required', 400);

    const pkg = await prisma.package.create({
      data: {
        name: pkgName,
        description: description || null,
        price: price ? parseFloat(price) : 0,
        features: features || [],
        serviceId: parseInt(sId, 10),
        image: image || null,
      },
    });

    return jsonResponse(pkg, 'Package created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create package', 500);
  }
}
