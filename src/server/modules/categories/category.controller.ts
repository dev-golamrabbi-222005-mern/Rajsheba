import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
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

    sendResponse(res, {
      statusCode: 200,
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('Invalid category ID', 400);

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: { where: { deletedAt: null } },
        services: { where: { deletedAt: null } },
      },
    });

    if (!category) throw new AppError('Category not found', 404);

    sendResponse(res, {
      statusCode: 200,
      message: 'Category fetched successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, icon, order, parentId } = req.body;
    if (!name) throw new AppError('Category name is required', 400);

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

    sendResponse(res, {
      statusCode: 201,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('Invalid category ID', 400);

    const { name, description, icon, order, parentId } = req.body;

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
      where: { id },
      data,
      include: { parent: true, children: true },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Category updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('Invalid category ID', 400);

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Category deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
