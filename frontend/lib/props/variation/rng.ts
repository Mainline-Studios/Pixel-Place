export function hashStringToUint32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic 0…1 PRNG (32-bit, suitable for cosmetic variation).
 */
export function createSeededRng(seed: number | string): () => number {
  let state = (typeof seed === 'string' ? hashStringToUint32(seed) : seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable seed for one of `slotCount` variants (e.g. 20 trees from one preset). */
export function variationSlotSeed(presetId: string, slotIndex: number, slotCount = 20): string {
  const n = Math.floor(slotCount);
  const mod = n > 0 ? n : 20;
  let i = Math.floor(slotIndex) % mod;
  if (i < 0) i += mod;
  return `${presetId}:v${i}`;
}
