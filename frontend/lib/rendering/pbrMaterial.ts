import { applyPixelPlaceTextureSettings, type LoadPixelPlaceTextureOptions } from '@/lib/textures/pixelPlaceTextureLoader';

type THREE_NS = typeof import('three');

export type GamePBRTextureMaps = {
  /** Albedo / base color (sRGB) */
  map?: import('three').Texture | null;
  normalMap?: import('three').Texture | null;
  roughnessMap?: import('three').Texture | null;
  metalnessMap?: import('three').Texture | null;
  aoMap?: import('three').Texture | null;
  emissiveMap?: import('three').Texture | null;
};

export type CreateGamePBRMaterialOptions = {
  color?: number | string;
  metalness?: number;
  roughness?: number;
  emissive?: number | string;
  emissiveIntensity?: number;
  envMapIntensity?: number;
  normalScale?: number;
  aoMapIntensity?: number;
  maps?: GamePBRTextureMaps;
  /** Flat faceted look for low-poly (optional) */
  flatShading?: boolean;
};

function tagDataMapsLinear(THREE: THREE_NS, mat: import('three').MeshStandardMaterial): void {
  const Lin = (THREE as unknown as { LinearSRGBColorSpace?: string }).LinearSRGBColorSpace;
  if (!Lin) return;
  for (const key of ['normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const) {
    const tex = mat[key] as import('three').Texture | null;
    if (tex && 'colorSpace' in tex) {
      (tex as import('three').Texture & { colorSpace?: string }).colorSpace = Lin;
    }
  }
}

/**
 * `MeshStandardMaterial` with full PBR map slots. Albedo stays sRGB; normal/roughness/metal/AO marked linear.
 */
export function createGamePBRMaterial(
  THREE: THREE_NS,
  opts: CreateGamePBRMaterialOptions = {}
): import('three').MeshStandardMaterial {
  const maps = opts.maps ?? {};
  const color =
    typeof opts.color === 'string' ? new THREE.Color(opts.color) : new THREE.Color(opts.color ?? 0xffffff);

  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness: opts.metalness ?? 1,
    roughness: opts.roughness ?? 1,
    map: maps.map ?? null,
    normalMap: maps.normalMap ?? null,
    roughnessMap: maps.roughnessMap ?? null,
    metalnessMap: maps.metalnessMap ?? null,
    aoMap: maps.aoMap ?? null,
    emissiveMap: maps.emissiveMap ?? null,
    emissive: new THREE.Color(typeof opts.emissive === 'string' ? opts.emissive : opts.emissive ?? 0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    envMapIntensity: opts.envMapIntensity ?? 1,
    aoMapIntensity: opts.aoMapIntensity ?? 1,
    flatShading: opts.flatShading ?? false,
  });

  if (opts.normalScale !== undefined && mat.normalScale) {
    mat.normalScale.set(opts.normalScale, opts.normalScale);
  }

  if ('colorSpace' in mat && THREE.SRGBColorSpace) {
    (mat as import('three').MeshStandardMaterial & { colorSpace?: string }).colorSpace = THREE.SRGBColorSpace;
  }

  tagDataMapsLinear(THREE, mat);
  return mat;
}

/** Mip / aniso / color space: albedo & emissive sRGB; data maps linear */
export function tuneGamePBRMaterialTextures(
  mat: import('three').MeshStandardMaterial,
  renderer?: import('three').WebGLRenderer
): void {
  for (const key of ['map', 'emissiveMap'] as const) {
    const t = mat[key] as import('three').Texture | null | undefined;
    if (t) applyPixelPlaceTextureSettings(t, renderer, 'srgb');
  }
  for (const key of ['normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const) {
    const t = mat[key] as import('three').Texture | null | undefined;
    if (t) applyPixelPlaceTextureSettings(t, renderer, 'linear');
  }
}

export async function loadMapsAndCreatePBRMaterial(
  THREE: THREE_NS,
  urls: {
    albedo?: string;
    normal?: string;
    roughness?: string;
    metalness?: string;
    ao?: string;
  },
  base: CreateGamePBRMaterialOptions,
  loadOpts?: LoadPixelPlaceTextureOptions
): Promise<import('three').MeshStandardMaterial> {
  const { loadPixelPlaceTexture } = await import('@/lib/textures/pixelPlaceTextureLoader');
  const maps: GamePBRTextureMaps = {};
  if (urls.albedo) maps.map = await loadPixelPlaceTexture(urls.albedo, { ...loadOpts, colorMode: 'srgb' });
  if (urls.normal) maps.normalMap = await loadPixelPlaceTexture(urls.normal, { ...loadOpts, colorMode: 'linear' });
  if (urls.roughness)
    maps.roughnessMap = await loadPixelPlaceTexture(urls.roughness, { ...loadOpts, colorMode: 'linear' });
  if (urls.metalness)
    maps.metalnessMap = await loadPixelPlaceTexture(urls.metalness, { ...loadOpts, colorMode: 'linear' });
  if (urls.ao) maps.aoMap = await loadPixelPlaceTexture(urls.ao, { ...loadOpts, colorMode: 'linear' });

  const mat = createGamePBRMaterial(THREE, { ...base, maps });
  tuneGamePBRMaterialTextures(mat, loadOpts?.renderer);
  return mat;
}
