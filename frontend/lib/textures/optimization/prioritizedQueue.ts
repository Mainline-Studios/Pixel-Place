import { getTextureDeviceProfile } from './deviceProfile';

type Job<T> = {
  priority: number;
  fn: () => Promise<T>;
  resolve: (v: T) => void;
  reject: (e: unknown) => void;
};

/**
 * Bounded concurrency with priority: higher `priority` runs first.
 */
export class PrioritizedTextureQueue {
  private waiting: Job<unknown>[] = [];
  private active = 0;

  constructor(private readonly maxConcurrent: number) {}

  submit<T>(priority: number, fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.waiting.push({
        priority,
        fn: fn as () => Promise<unknown>,
        resolve: resolve as (v: unknown) => void,
        reject,
      });
      this.pump();
    });
  }

  private pump(): void {
    while (this.active < this.maxConcurrent && this.waiting.length > 0) {
      this.waiting.sort((a, b) => b.priority - a.priority);
      const job = this.waiting.shift()!;
      this.active++;
      job
        .fn()
        .then(job.resolve, job.reject)
        .finally(() => {
          this.active--;
          this.pump();
        });
    }
  }

  get queueLength(): number {
    return this.waiting.length;
  }

  get inflight(): number {
    return this.active;
  }
}

let globalQueue: PrioritizedTextureQueue | null = null;

export function getGlobalPrioritizedTextureQueue(maxConcurrent?: number): PrioritizedTextureQueue {
  if (!globalQueue) {
    const n = maxConcurrent ?? getTextureDeviceProfile().maxConcurrentLoads;
    globalQueue = new PrioritizedTextureQueue(n);
  }
  return globalQueue;
}
