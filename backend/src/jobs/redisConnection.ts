import { env } from '../config/env.js';

/** BullMQ / shared Redis connection options derived from REDIS_URL. */
export function bullmqConnection(): {
  host: string;
  port: number;
  username?: string;
  password?: string;
} {
  if (!env.REDIS_URL) throw new Error('REDIS_URL is not set');
  const u = new URL(env.REDIS_URL);
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    username: u.username ? decodeURIComponent(u.username) : undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
  };
}
