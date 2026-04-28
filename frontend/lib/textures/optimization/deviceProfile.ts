import { TEXTURE_HERO_SIZE, TEXTURE_STANDARD_SIZE } from '../constants';

export type DevicePerformanceTier = 'low' | 'medium' | 'high';

export type TextureDeviceProfile = {
  tier: DevicePerformanceTier;
  /** Cap for longest texture edge when loading (before atlas pack) */
  maxTextureDimension: number;
  /** Atlas width/height cap */
  maxAtlasDimension: number;
  /** JPEG/WebP quality 0–1 when re-encoding */
  lossyQuality: number;
  /** Prefer WebP blob transcode when supported */
  preferWebpTranscode: boolean;
  /** Simultaneous decode jobs */
  maxConcurrentLoads: number;
  /** Heuristic: est. GPU budget for textures (bytes) before soft warnings */
  softMemoryBudgetBytes: number;
};

function supportsWebp(): boolean {
  if (typeof document === 'undefined') return false;
  const c = document.createElement('canvas');
  return c.toDataURL('image/webp').startsWith('data:image/webp');
}

/**
 * Heuristic tier from coarse device signals (no reliable total VRAM in WebGL).
 */
export function getTextureDeviceProfile(): TextureDeviceProfile {
  if (typeof navigator === 'undefined') {
    return {
      tier: 'medium',
      maxTextureDimension: TEXTURE_STANDARD_SIZE,
      maxAtlasDimension: 2048,
      lossyQuality: 0.82,
      preferWebpTranscode: false,
      maxConcurrentLoads: 4,
      softMemoryBudgetBytes: 192 * 1024 * 1024,
    };
  }

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio ?? 1, 3) : 1;
  const coarse =
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:coarse)').matches;

  let score = 0;
  if (mem !== undefined) {
    if (mem >= 8) score += 3;
    else if (mem >= 4) score += 2;
    else score += 1;
  } else {
    score += 2;
  }
  if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;
  if (dpr <= 1.25) score += 1;
  if (coarse) score -= 1;

  let tier: DevicePerformanceTier = 'medium';
  if (score <= 2) tier = 'low';
  else if (score >= 5) tier = 'high';

  const maxTextureDimension =
    tier === 'high'
      ? TEXTURE_HERO_SIZE
      : tier === 'medium'
        ? TEXTURE_STANDARD_SIZE
        : Math.min(384, TEXTURE_STANDARD_SIZE);

  const maxAtlasDimension = tier === 'low' ? 1024 : tier === 'medium' ? 2048 : 4096;

  return {
    tier,
    maxTextureDimension,
    maxAtlasDimension,
    lossyQuality: tier === 'low' ? 0.72 : tier === 'medium' ? 0.82 : 0.88,
    preferWebpTranscode: supportsWebp() && tier !== 'high',
    maxConcurrentLoads: tier === 'low' ? 2 : tier === 'medium' ? 4 : 6,
    softMemoryBudgetBytes:
      tier === 'low' ? 96 * 1024 * 1024 : tier === 'medium' ? 192 * 1024 * 1024 : 384 * 1024 * 1024,
  };
}
