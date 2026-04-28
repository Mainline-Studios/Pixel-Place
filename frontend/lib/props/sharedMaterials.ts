import type { PropMaterialKey } from './types';

type THREE_NS = typeof import('three');

/**
 * Stylized PBR presets — flat, readable colors (Pixel Place / Fortnite-adjacent), not photoreal.
 * Materials are cached per-process so many props share the same GPU state.
 */
const PRESETS: Record<
  PropMaterialKey,
  { color: number; roughness: number; metalness: number; emissive?: number; emissiveIntensity?: number }
> = {
  bark: { color: 0x6b4a3a, roughness: 0.88, metalness: 0 },
  foliage: { color: 0x4a9d5f, roughness: 0.82, metalness: 0 },
  concrete: { color: 0x9ca0a8, roughness: 0.9, metalness: 0.02 },
  brick: { color: 0xa85c4a, roughness: 0.85, metalness: 0 },
  wood: { color: 0xc9a06c, roughness: 0.78, metalness: 0 },
  straw: { color: 0xc9a85c, roughness: 0.9, metalness: 0 },
  metal: { color: 0xc0c4cc, roughness: 0.35, metalness: 0.75 },
  glass: { color: 0xa8d4e6, roughness: 0.15, metalness: 0.1 },
  fabric: { color: 0x6b7cb0, roughness: 0.92, metalness: 0 },
  plastic_fun: { color: 0xff6b9d, roughness: 0.45, metalness: 0.05 },
  glow: { color: 0x88ccff, roughness: 0.4, metalness: 0.2, emissive: 0x4488ff, emissiveIntensity: 0.35 },
};

const materialCache = new Map<PropMaterialKey, import('three').MeshStandardMaterial>();

export function getSharedPropMaterial(THREE: THREE_NS, key: PropMaterialKey): import('three').MeshStandardMaterial {
  const hit = materialCache.get(key);
  if (hit) return hit;

  const p = PRESETS[key];
  const m = new THREE.MeshStandardMaterial({
    color: p.color,
    roughness: p.roughness,
    metalness: p.metalness,
    flatShading: true,
    emissive: p.emissive !== undefined ? new THREE.Color(p.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: p.emissiveIntensity ?? 0,
  });
  if ('colorSpace' in m && THREE.SRGBColorSpace) {
    (m as import('three').MeshStandardMaterial & { colorSpace?: string }).colorSpace = THREE.SRGBColorSpace;
  }
  materialCache.set(key, m);
  return m;
}

/** Attach an albedo map to every cached material with this key (shared across props). */
export function setSharedPropMaterialMap(
  THREE: THREE_NS,
  key: PropMaterialKey,
  map: import('three').Texture | null
): void {
  const m = materialCache.get(key) ?? getSharedPropMaterial(THREE, key);
  m.map = map;
  m.needsUpdate = true;
}

export function clearSharedPropMaterialCache(): void {
  for (const m of materialCache.values()) {
    m.dispose();
  }
  materialCache.clear();
}

export function listPropMaterialKeys(): PropMaterialKey[] {
  return Object.keys(PRESETS) as PropMaterialKey[];
}
