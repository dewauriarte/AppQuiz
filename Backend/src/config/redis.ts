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
    // Stop retrying after 3 attempts to avoid flooding logs
    if (times > 3) {
      console.warn('⚠️ Redis connection failed after 3 attempts. Running without Redis.');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true, // Don't connect immediately on import
  enableOfflineQueue: true, // Queue commands when offline
  showFriendlyErrorStack: false, // Reduce error verbosity
};

// Cliente principal
export const redis = new Redis(redisConfig);

// Cliente para Pub/Sub (necesita conexión separada)
export const redisPub = new Redis(redisConfig);
export const redisSub = new Redis(redisConfig);

// Track Redis availability
let isRedisAvailable = false;

// Helper to check if error is connection refused
function isConnectionRefused(error: Error): boolean {
  return 'code' in error && error.code === 'ECONNREFUSED';
}

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
  isRedisAvailable = true;
});

redis.on('error', (error: Error) => {
  // Suppress connection refused errors to avoid log spam
  if (!isConnectionRefused(error)) {
    console.error('❌ Redis connection error:', error);
  }
  isRedisAvailable = false;
});

redis.on('ready', () => {
  console.log('🚀 Redis ready to accept commands');
  isRedisAvailable = true;
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
  isRedisAvailable = false;
});

redisPub.on('connect', () => {
  console.log('✅ Redis Pub connected');
});

redisPub.on('error', (error: Error) => {
  // Suppress connection refused errors
  if (!isConnectionRefused(error)) {
    console.error('❌ Redis Pub error:', error);
  }
});

redisSub.on('connect', () => {
  console.log('✅ Redis Sub connected');
});

redisSub.on('error', (error: Error) => {
  // Suppress connection refused errors
  if (!isConnectionRefused(error)) {
    console.error('❌ Redis Sub error:', error);
  }
});

/**
 * Initialize Redis connections (lazy connect)
 */
export async function initRedis(): Promise<boolean> {
  try {
    await Promise.all([
      redis.connect(),
      redisPub.connect(),
      redisSub.connect(),
    ]);
    return true;
  } catch (error) {
    console.warn('⚠️ Redis not available. Application will run without Redis caching.');
    return false;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisConnected(): boolean {
  return isRedisAvailable;
}

/**
 * Graceful shutdown
 */
export async function closeRedis(): Promise<void> {
  try {
    await Promise.all([
      redis.quit(),
      redisPub.quit(),
      redisSub.quit(),
    ]);
    console.log('👋 Redis connections closed');
  } catch (error) {
    // Ignore errors during shutdown
  }
}

export default redis;
