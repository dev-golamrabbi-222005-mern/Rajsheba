const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("Prisma client initialization warning:", error.message);
}

module.exports = prisma;
