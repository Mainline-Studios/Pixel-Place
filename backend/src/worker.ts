/**
 * Separate process for BullMQ workers — run one (or more) beside horizontally scaled API instances.
 * Example: REDIS_URL=redis://localhost:6379 npm run worker
 */
import { Worker } from 'bullmq';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { PIXEL_PLACE_QUEUE } from './jobs/queue.js';
import { bullmqConnection } from './jobs/redisConnection.js';

if (!env.REDIS_URL) {
  logger.error('REDIS_URL required for worker');
  process.exit(1);
}

new Worker(
  PIXEL_PLACE_QUEUE,
  async (job) => {
    logger.debug({ jobId: job.id, name: job.name }, 'job_processed');
    if (job.name === 'ping') return { ok: true };
    /* Future: aggregates, notifications, abuse review, analytics exports */
    return { ok: true, noop: job.name };
  },
  { connection: bullmqConnection() }
).on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'job_failed');
});

logger.info({ queue: PIXEL_PLACE_QUEUE }, 'BullMQ worker started');
