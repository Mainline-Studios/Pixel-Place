/**
 * Optional variation applied when spawning props so the same preset reads as many distinct instances.
 */

export type PropVariationSpec = {
  /**
   * Deterministic seed — string or 32-bit uint. Use `variationSlotSeed(presetId, slotIndex)` for 0…N-1 slots.
   */
  seed?: number | string;
  /** 0…1 scales hue/noise/geometry jitter. Default 1. */
  intensity?: number;
};

export type PropVariationContext = {
  rng: () => number;
  intensity: number;
};
