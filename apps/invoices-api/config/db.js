const prisma = require('./prisma');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('npg_password')) {
    console.log('\n================================================================');
    console.log('⚡ NeonDB PostgreSQL: DATABASE_URL not yet configured with live credentials.');
    console.log('📁 Using local fallback storage mode for zero-interruption development.');
    console.log('🔗 Set your live NeonDB connection string in apps/invoices-api/.env');
    console.log('================================================================\n');
    process.env.USE_JSON_DB = 'true';
    return;
  }

  try {
    await prisma.$connect();
    console.log('✅ Connected to NeonDB PostgreSQL database successfully.');
    process.env.USE_JSON_DB = 'false';
  } catch (error) {
    console.log('\n================================================================');
    console.log('⚠️ Could not connect to NeonDB PostgreSQL instance: ' + error.message);
    console.log('📁 Falling back to local storage mode.');
    console.log('================================================================\n');
    process.env.USE_JSON_DB = 'true';
  }
};

module.exports = connectDB;
