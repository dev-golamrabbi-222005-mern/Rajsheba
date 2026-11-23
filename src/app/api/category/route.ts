import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return jsonResponse(categories, 'Categories fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch categories', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, icon, order, parentId } = body;
    if (!name) return errorResponse('Category name is required', 400);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        order: order ? parseInt(order, 10) : 0,
        parentId: parentId ? parseInt(parentId, 10) : null,
      },
      include: { parent: true, children: true },
    });

    return jsonResponse(category, 'Category created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create category', 500);
  }
}
