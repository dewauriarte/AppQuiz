import Redis from 'ioredis';

/**
 * Redis Client Configuration
 * Usado para:
 * - Game session state (temporal, TTL)
 * - Leaderboards en tiempo real
 * - Connection state recovery
 */

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

// Cliente principal
export const redis = new Redis(redisConfig);

// Cliente para Pub/Sub (necesita conexión separada)
export const redisPub = new Redis(redisConfig);
export const redisSub = new Redis(redisConfig);

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
  console.log('🚀 Redis ready to accept commands');
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
});

redisPub.on('connect', () => {
  console.log('✅ Redis Pub connected');
});

redisSub.on('connect', () => {
  console.log('✅ Redis Sub connected');
});

/**
 * Graceful shutdown
 */
export async function closeRedis(): Promise<void> {
  await Promise.all([
    redis.quit(),
    redisPub.quit(),
    redisSub.quit(),
  ]);
  console.log('👋 Redis connections closed');
}

export default redis;
