import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/server/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid category ID', 400);

    const category = await prisma.category.findUnique({
      where: { id: numId },
      include: {
        parent: true,
        children: { where: { deletedAt: null } },
        services: { where: { deletedAt: null } },
      },
    });

    if (!category) return errorResponse('Category not found', 404);
    return jsonResponse(category, 'Category fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch category', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid category ID', 400);

    const body = await req.json();
    const { name, description, icon, order, parentId } = body;

    const data: any = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) data.description = description;
    if (icon !== undefined) data.icon = icon;
    if (order !== undefined) data.order = parseInt(order, 10);
    if (parentId !== undefined) data.parentId = parentId ? parseInt(parentId, 10) : null;

    const updated = await prisma.category.update({
      where: { id: numId },
      data,
    });

    return jsonResponse(updated, 'Category updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update category', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return errorResponse('Invalid category ID', 400);

    await prisma.category.update({
      where: { id: numId },
      data: { deletedAt: new Date() },
    });

    return jsonResponse({ id: numId }, 'Category deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete category', 500);
  }
}
