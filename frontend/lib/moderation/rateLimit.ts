/**
 * Process-local sliding window rate limiter. For horizontal scale, swap for Redis (same interface).
 */

export class MemoryRateLimiter {
  private buckets = new Map<string, number[]>();

  constructor(
    private windowMs: number,
    private maxHits: number
  ) {}

  /** Returns true if request is allowed (and records the hit). */
  allow(key: string): boolean {
    const now = Date.now();
    const arr = this.buckets.get(key) || [];
    const pruned = arr.filter((t) => now - t < this.windowMs);
    if (pruned.length >= this.maxHits) {
      this.buckets.set(key, pruned);
      return false;
    }
    pruned.push(now);
    this.buckets.set(key, pruned);
    return true;
  }
}

const pixelLimiter = new MemoryRateLimiter(
  Number(process.env.PIXEL_RATE_WINDOW_MS) || 60_000,
  Number(process.env.PIXEL_RATE_MAX) || 40
);

const chatLimiter = new MemoryRateLimiter(
  Number(process.env.CHAT_RATE_WINDOW_MS) || 10_000,
  Number(process.env.CHAT_RATE_MAX) || 25
);

const reportLimiter = new MemoryRateLimiter(
  Number(process.env.REPORT_RATE_WINDOW_MS) || 3600_000,
  Number(process.env.REPORT_RATE_MAX) || 15
);

export function allowPixelPlacement(userKey: string, ipKey: string): boolean {
  return pixelLimiter.allow(`p:${userKey}`) && pixelLimiter.allow(`pip:${ipKey}`);
}

export function allowChatMessage(userKey: string, ipKey: string): boolean {
  return chatLimiter.allow(`c:${userKey}`) && chatLimiter.allow(`cip:${ipKey}`);
}

export function allowReport(ipKey: string): boolean {
  return reportLimiter.allow(`r:${ipKey}`);
}
