import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';

export const getBranding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let branding = await prisma.companyBranding.findFirst();
    if (!branding) {
      branding = await prisma.companyBranding.create({
        data: {
          id: 1,
          companyName: 'Rajseba',
          logoUrl: '/rajshiblogo.png',
          footerLogoUrl: '/logo.png',
          email: 'contact@rajseba.com',
          phone: '01813-333373',
          address: 'Rajshahi Corporate Office, Ghoramara, Rajshahi',
          cityLocation: 'Rajshahi',
        },
      });
    }

    sendResponse(res, {
      statusCode: 200,
      message: 'Company branding fetched successfully',
      data: branding,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.companyBranding.upsert({
      where: { id: 1 },
      update: req.body,
      create: { id: 1, ...req.body },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Company branding updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
