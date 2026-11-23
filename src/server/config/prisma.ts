import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
