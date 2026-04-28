import { getRedisCache } from './redisClients.js';

/** Simple JSON cache with TTL — no-op when Redis unavailable. */
export async function cachedJson<T>(key: string, ttlSec: number, fetcher: () => Promise<T>): Promise<T> {
  const r = getRedisCache();
  if (!r) return fetcher();

  try {
    const hit = await r.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    /* miss */
  }

  const val = await fetcher();
  try {
    await r.set(key, JSON.stringify(val), { EX: ttlSec });
  } catch {
    /* ignore cache write failures */
  }
  return val;
}
