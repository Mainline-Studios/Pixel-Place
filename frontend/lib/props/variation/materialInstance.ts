import { getSharedPropMaterial } from '../sharedMaterials';
import type { PropMaterialKey } from '../types';
import { createAlbedoOverlayTexture, createRoughnessOverlayTexture } from './noiseTextures';
import type { PropVariationContext } from './types';

type THREE_NS = typeof import('three');

const HUE_RANGE = 0.07;
const SAT_RANGE = 0.12;
const LIGHT_RANGE = 0.08;

export type VariedMaterialOptions = {
  /** Scales hue/sat/light/emissive hue jitter (use a value below 1 for glass / subtle surfaces). Default 1. */
  colorNoiseMul?: number;
  /** Scales procedural map contrast. Default 1. */
  mapNoiseMul?: number;
};

/**
 * Clones the shared preset for `key` and applies hue/sat/light jitter plus light procedural maps.
 * Caller must dispose materials (and their maps) when dropping the prop — use `disposeGameProp` on varied props.
 */
export function createVariedPropMaterial(
  THREE: THREE_NS,
  key: PropMaterialKey,
  ctx: PropVariationContext,
  opts: VariedMaterialOptions = {}
): import('three').MeshStandardMaterial {
  const base = getSharedPropMaterial(THREE, key);
  const mat = base.clone();
  mat.userData.pixelPlaceVariation = true;

  const { rng, intensity } = ctx;
  const cMul = opts.colorNoiseMul ?? 1;
  const mMul = opts.mapNoiseMul ?? 1;
  const mapIntensity = intensity * mMul;

  const hsl = { h: 0, s: 0, l: 0 };
  mat.color.getHSL(hsl);
  hsl.h += (rng() - 0.5) * 2 * HUE_RANGE * intensity * cMul;
  hsl.h = ((hsl.h % 1) + 1) % 1;
  hsl.s = Math.min(1, Math.max(0, hsl.s + (rng() - 0.5) * 2 * SAT_RANGE * intensity * cMul));
  hsl.l = Math.min(1, Math.max(0, hsl.l + (rng() - 0.5) * 2 * LIGHT_RANGE * intensity * cMul));
  mat.color.setHSL(hsl.h, hsl.s, hsl.l);

  if (mat.emissiveIntensity > 0) {
    const eh = { h: 0, s: 0, l: 0 };
    mat.emissive.getHSL(eh);
    eh.h += (rng() - 0.5) * 2 * HUE_RANGE * intensity * cMul;
    eh.h = ((eh.h % 1) + 1) % 1;
    mat.emissive.setHSL(eh.h, eh.s, eh.l);
  }

  mat.roughness = Math.min(1, Math.max(0.02, mat.roughness + (rng() - 0.5) * 0.12 * intensity * cMul));
  mat.metalness = Math.min(1, Math.max(0, mat.metalness + (rng() - 0.5) * 0.06 * intensity * cMul));

  const albedoMap = createAlbedoOverlayTexture(THREE, rng, 32, mapIntensity);
  const roughMap = createRoughnessOverlayTexture(THREE, rng, 16, mapIntensity);
  mat.map = albedoMap;
  mat.roughnessMap = roughMap;

  mat.needsUpdate = true;
  return mat;
}
