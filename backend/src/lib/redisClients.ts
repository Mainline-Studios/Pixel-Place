import type { RedisClientType } from 'redis';
import { createClient } from 'redis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let pubClient: RedisClientType | null = null;
let subClient: RedisClientType | null = null;
/** Dedicated client for GET/SET cache (separate from adapter pub/sub). */
let cacheClient: RedisClientType | null = null;

export function getRedisCache(): RedisClientType | null {
  return cacheClient;
}

export async function initRedisIoAdapterClients(): Promise<{
  pubClient: RedisClientType;
  subClient: RedisClientType;
} | null> {
  if (!env.REDIS_URL) return null;

  pubClient = createClient({ url: env.REDIS_URL }) as RedisClientType;
  subClient = pubClient.duplicate() as RedisClientType;

  pubClient.on('error', (e) => logger.error({ err: e }, 'redis_pub_error'));
  subClient.on('error', (e) => logger.error({ err: e }, 'redis_sub_error'));

  cacheClient = createClient({ url: env.REDIS_URL }) as RedisClientType;
  cacheClient.on('error', (e) => logger.error({ err: e }, 'redis_cache_error'));

  await Promise.all([pubClient.connect(), subClient.connect(), cacheClient.connect()]);
  logger.info('Redis connected (Socket.IO adapter + cache)');

  return { pubClient, subClient };
}

export async function shutdownRedis(): Promise<void> {
  const clients = [cacheClient, subClient, pubClient].filter(Boolean) as RedisClientType[];
  cacheClient = null;
  subClient = null;
  pubClient = null;
  await Promise.all(clients.map((c) => c.quit().catch(() => {})));
}
