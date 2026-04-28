import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import { bullmqConnection } from './redisConnection.js';

export const PIXEL_PLACE_QUEUE = 'pixel-place';

let queue: Queue | null = null;

/** Lazy BullMQ queue — null when REDIS_URL unset (single-node dev). */
export function getJobsQueue(): Queue | null {
  if (!env.REDIS_URL) return null;
  if (!queue) {
    queue = new Queue(PIXEL_PLACE_QUEUE, { connection: bullmqConnection() });
  }
  return queue;
}
