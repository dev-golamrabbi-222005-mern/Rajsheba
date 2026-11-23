import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { sendResponse } from '../../utils/response.js';

export const getDevisions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const devisions = await prisma.devision.findMany({
      include: {
        districts: {
          include: { areas: true },
        },
      },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Devisions fetched successfully',
      data: devisions,
    });
  } catch (error) {
    next(error);
  }
};

export const getDistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const districts = await prisma.district.findMany({
      include: { areas: true },
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Districts fetched successfully',
      data: districts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAreas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const areas = await prisma.area.findMany();

    sendResponse(res, {
      statusCode: 200,
      message: 'Areas fetched successfully',
      data: areas,
    });
  } catch (error) {
    next(error);
  }
};
