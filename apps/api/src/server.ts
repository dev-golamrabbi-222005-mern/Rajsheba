import http from 'http';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/prisma.js';
import { setupSocketIO } from './socket.js';

const app = createApp();
const server = http.createServer(app);

// Setup Socket.IO Gateway
setupSocketIO(server);

const startServer = async () => {
  try {
    // Test DB connection if DATABASE_URL configured
    if (ENV.DATABASE_URL && !ENV.DATABASE_URL.includes('npg_password')) {
      await prisma.$connect();
      console.log('✅ Connected to NeonDB PostgreSQL database');
    } else {
      console.log('⚡ NeonDB PostgreSQL: DATABASE_URL not yet configured with live credentials.');
      console.log('📁 Set your live NeonDB connection string in apps/api/.env');
    }

    server.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`🚀 Rajseba Backend API running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server };
