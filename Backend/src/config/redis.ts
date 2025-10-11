import { createClient } from 'redis';

let redisClient: any = null;
let redisAvailable = false;

try {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err: any) => {
    console.warn('⚠️ Redis not available:', err.message);
    redisAvailable = false;
  });

  redisClient.on('connect', () => {
    console.info('✅ Redis connected successfully');
    redisAvailable = true;
  });

} catch (error) {
  console.warn('⚠️ Redis client initialization failed');
  redisAvailable = false;
}

export const connectRedis = async () => {
  if (redisClient && !redisClient.isOpen && redisAvailable) {
    try {
      await redisClient.connect();
    } catch (error) {
      console.warn('⚠️ Redis connection failed');
      redisAvailable = false;
    }
  }
};

export const getRedisClient = () => {
  return redisAvailable ? redisClient : null;
};

export const isRedisAvailable = () => redisAvailable;

export default redisClient;

