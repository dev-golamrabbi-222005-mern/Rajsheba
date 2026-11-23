import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';

export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, vendorId, search } = req.query;

    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = parseInt(String(categoryId), 10);
    if (vendorId) where.vendorId = parseInt(String(vendorId), 10);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
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

    sendResponse(res, {
      statusCode: 200,
      message: 'Services fetched successfully',
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    const idNum = parseInt(idParam, 10);
    const where = isNaN(idNum) ? { slug: idParam } : { id: idNum };

    const service = await prisma.service.findFirst({
      where: { ...where, deletedAt: null },
      include: {
        category: true,
        vendor: { select: { id: true, name: true, email: true, phoneNumber: true } },
        nestedServices: {
          include: { subServices: true },
        },
        subServices: true,
        packages: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!service) throw new AppError('Service not found', 404);

    sendResponse(res, {
      statusCode: 200,
      message: 'Service fetched successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
    } = req.body;

    if (!name) throw new AppError('Service name is required', 400);

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

    sendResponse(res, {
      statusCode: 201,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('Invalid service ID', 400);

    const updateData: any = { ...req.body };
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId, 10);
    if (updateData.vendorId) updateData.vendorId = parseInt(updateData.vendorId, 10);
    if (updateData.agentCommissionPercentage) {
      updateData.agentCommissionPercentage = parseFloat(updateData.agentCommissionPercentage);
    }

    const updated = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Service updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('Invalid service ID', 400);

    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Service deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
