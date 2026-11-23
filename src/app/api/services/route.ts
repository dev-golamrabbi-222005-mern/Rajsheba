import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const vendorId = searchParams.get('vendorId');
    const search = searchParams.get('search');

    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = parseInt(categoryId, 10);
    if (vendorId) where.vendorId = parseInt(vendorId, 10);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        vendor: { select: { id: true, name: true, email: true, phoneNumber: true } },
        nestedServices: {
          include: { subServices: true },
        },
        subServices: true,
        packages: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonResponse(services, 'Services fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch services', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      subtitle,
      description,
      overview,
      details,
      image,
      banner,
      categoryId,
      vendorId,
      agentCommissionPercentage,
      faq,
    } = body;

    if (!name) return errorResponse('Service name is required', 400);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        subtitle: subtitle || null,
        description: description || null,
        overview: overview || null,
        details: details || null,
        image: image || null,
        banner: banner || null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        vendorId: vendorId ? parseInt(vendorId, 10) : null,
        agentCommissionPercentage: agentCommissionPercentage ? parseFloat(agentCommissionPercentage) : 0,
        faq: faq || null,
      },
      include: { category: true },
    });

    return jsonResponse(service, 'Service created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create service', 500);
  }
}
