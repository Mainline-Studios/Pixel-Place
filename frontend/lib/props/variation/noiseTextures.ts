import type * as THREE from 'three';

type THREE_NS = typeof import('three');

/**
 * Greyscale multiplier map (≈1) so `map * baseColor` adds subtle albedo breakup.
 */
export function createAlbedoOverlayTexture(
  THREE: THREE_NS,
  rng: () => number,
  size: number,
  intensity: number
): THREE.DataTexture {
  const n = Math.max(4, Math.floor(size));
  const data = new Uint8Array(n * n * 4);
  const contrast = 0.14 * intensity;
  for (let i = 0; i < n * n; i++) {
    const jitter = (rng() - 0.5) * 2 * contrast;
    const v = Math.round(Math.min(255, Math.max(0, (1 + jitter) * 255)));
    const o = i * 4;
    data[o] = v;
    data[o + 1] = v;
    data[o + 2] = v;
    data[o + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, n, n);
  tex.needsUpdate = true;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2 + rng() * 2, 2 + rng() * 2);
  if ('colorSpace' in tex && THREE.SRGBColorSpace) {
    (tex as THREE.Texture & { colorSpace?: string }).colorSpace = THREE.SRGBColorSpace;
  }
  return tex;
}

/**
 * Linear noise for `roughnessMap` (multiplied with material.roughness).
 */
export function createRoughnessOverlayTexture(
  THREE: THREE_NS,
  rng: () => number,
  size: number,
  intensity: number
): THREE.DataTexture {
  const n = Math.max(4, Math.floor(size));
  const data = new Uint8Array(n * n * 4);
  const spread = 40 * intensity;
  const mid = 220;
  for (let i = 0; i < n * n; i++) {
    const jitter = (rng() - 0.5) * spread;
    const v = Math.round(Math.min(255, Math.max(0, mid + jitter)));
    const o = i * 4;
    data[o] = v;
    data[o + 1] = v;
    data[o + 2] = v;
    data[o + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, n, n);
  tex.needsUpdate = true;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3 + rng() * 3, 3 + rng() * 3);
  const Lin = (THREE as unknown as { LinearSRGBColorSpace?: string }).LinearSRGBColorSpace;
  if (Lin && 'colorSpace' in tex) {
    (tex as THREE.Texture & { colorSpace?: string }).colorSpace = Lin;
  }
  return tex;
}
