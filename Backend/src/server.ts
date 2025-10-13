import { createServer } from 'http';
import app from './app';
import { env } from '@config/env';
import prisma from '@config/database';
import redis, { closeRedis } from '@config/redis';
import { initializeSocket } from '@config/socket';
import { registerGameHandlers } from '@/socket/gameHandlers';
import { setSocketIO } from '@/socket/socketInstance';

const PORT = parseInt(env.PORT, 10) || 4000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.info('✅ Database connected successfully');

    // Test Redis connection
    try {
      await redis.ping();
      console.info('✅ Redis connected successfully');
    } catch (redisError) {
      console.warn('⚠️ Redis connection failed, continuing without Redis cache');
      console.warn('   Game sessions will not persist across server restarts');
    }

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const io = initializeSocket(httpServer);
    setSocketIO(io); // Set global instance
    registerGameHandlers(io);
    console.info('✅ Socket.IO initialized');

    // Start server
    httpServer.listen(PORT, () => {
      console.info(`Server is running on port ${PORT}`);
      console.info(`Environment: ${env.NODE_ENV}`);
      console.info(`API URL: http://localhost:${PORT}/api/v1`);
      console.info(`Socket.IO URL: ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.info('\n⏹️  Shutting down gracefully...');
  await prisma.$disconnect();
  await closeRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.info('\n⏹️  Shutting down gracefully...');
  await prisma.$disconnect();
  await closeRedis();
  process.exit(0);
});

startServer();

