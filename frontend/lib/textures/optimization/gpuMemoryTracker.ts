import { estimateThreeTextureBytes } from './memoryEstimator';
import type { TextureDeviceProfile } from './deviceProfile';

export type TextureMemoryEntry = {
  id: string;
  bytes: number;
  source?: string;
};

/**
 * Central estimate of resident texture memory (browser cannot read true VRAM).
 */
export class GpuTextureMemoryTracker {
  private entries = new Map<string, TextureMemoryEntry>();
  private listeners: Array<(total: number) => void> = [];

  get totalBytes(): number {
    let s = 0;
    for (const e of this.entries.values()) s += e.bytes;
    return s;
  }

  snapshot(): TextureMemoryEntry[] {
    return [...this.entries.values()];
  }

  register(id: string, bytes: number, source?: string): void {
    this.entries.set(id, { id, bytes, source });
    this.emit();
  }

  registerThreeTexture(id: string, tex: import('three').Texture, source?: string): void {
    this.register(id, estimateThreeTextureBytes(tex), source);
  }

  unregister(id: string): void {
    this.entries.delete(id);
    this.emit();
  }

  clear(): void {
    this.entries.clear();
    this.emit();
  }

  checkBudget(profile: TextureDeviceProfile): { overBudget: boolean; total: number; budget: number } {
    const total = this.totalBytes;
    return {
      overBudget: total > profile.softMemoryBudgetBytes,
      total,
      budget: profile.softMemoryBudgetBytes,
    };
  }

  onUpdate(fn: (total: number) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  private emit(): void {
    const t = this.totalBytes;
    for (const fn of this.listeners) fn(t);
  }
}

let globalTracker: GpuTextureMemoryTracker | null = null;

export function getGlobalGpuTextureMemoryTracker(): GpuTextureMemoryTracker {
  if (!globalTracker) globalTracker = new GpuTextureMemoryTracker();
  return globalTracker;
}
