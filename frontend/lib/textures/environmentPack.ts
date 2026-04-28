/**
 * Drop-in environment texture pack: paths, manifest URL, Three.js helpers.
 * Terrain maps use RepeatWrapping and linear color space for data textures (normal/roughness/AO).
 */
import * as THREE from 'three';
import { TEXTURES_BASE_PATH } from './constants';
import {
  ENV_PACK_GRASS_VARIANTS,
  ENV_PACK_LIGHT_DIRECTION,
  ENV_PACK_SKY_FACES,
  ENV_PACK_SKY_SUBDIR,
  ENV_PACK_TERRAIN_BASE,
  envPackSkyBaseName,
  type EnvPackSkyFace,
  type EnvPackTerrainMaterial,
} from './environmentPackCatalog';
import { pixelPlaceTexturePath } from './naming';
import {
  applyPixelPlaceTextureSettings,
  loadPixelPlaceTexture,
  type LoadPixelPlaceTextureOptions,
} from './pixelPlaceTextureLoader';

export * from './environmentPackCatalog';

export const ENV_PACK_MANIFEST_URL = `${TEXTURES_BASE_PATH}/environment/environment_pack_v1.json`;

const ALL_TERRAIN: EnvPackTerrainMaterial[] = [...ENV_PACK_TERRAIN_BASE, ...ENV_PACK_GRASS_VARIANTS];

export function listEnvPackTerrainMaterials(): EnvPackTerrainMaterial[] {
  return ALL_TERRAIN.slice();
}

export function getEnvPackTerrainById(id: string): EnvPackTerrainMaterial | undefined {
  return ALL_TERRAIN.find((m) => m.id === id);
}

/** Matches baked micro-tilt in procedural generator; use for directional light in scenes. */
export function getEnvPackLightDirectionThree(): THREE.Vector3 {
  return new THREE.Vector3(
    ENV_PACK_LIGHT_DIRECTION.x,
    ENV_PACK_LIGHT_DIRECTION.y,
    ENV_PACK_LIGHT_DIRECTION.z
  ).normalize();
}

function applyLinearDataTexture(tex: THREE.Texture): void {
  const Lin = (THREE as unknown as { LinearSRGBColorSpace?: string }).LinearSRGBColorSpace;
  if (Lin && 'colorSpace' in tex) {
    (tex as THREE.Texture & { colorSpace?: string }).colorSpace = Lin;
  }
}

/** Seamless terrain: repeat UVs; keep mip + filtering from Pixel Place defaults. */
export function applyEnvPackTerrainWrapping(texture: THREE.Texture): void {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
}

/**
 * Load PBR terrain/water tile (albedo + normal + roughness + AO).
 * Albedo stays sRGB; other maps are marked linear for correct shading.
 */
export async function loadEnvPackTerrainMaterial(
  mat: EnvPackTerrainMaterial,
  options?: LoadPixelPlaceTextureOptions
): Promise<THREE.MeshStandardMaterial> {
  const sub = mat.subfolder;
  const albedoUrl = pixelPlaceTexturePath('environment', mat.baseName, 'albedo', 'standard', sub);
  const normalUrl = pixelPlaceTexturePath('environment', mat.baseName, 'normal', 'standard', sub);
  const roughUrl = pixelPlaceTexturePath('environment', mat.baseName, 'roughness', 'standard', sub);
  const aoUrl = pixelPlaceTexturePath('environment', mat.baseName, 'ao', 'standard', sub);

  const [map, normalMap, roughnessMap, aoMap] = await Promise.all([
    loadPixelPlaceTexture(albedoUrl, options),
    loadPixelPlaceTexture(normalUrl, options),
    loadPixelPlaceTexture(roughUrl, options),
    loadPixelPlaceTexture(aoUrl, options),
  ]);

  applyLinearDataTexture(normalMap);
  applyLinearDataTexture(roughnessMap);
  applyLinearDataTexture(aoMap);

  for (const t of [map, normalMap, roughnessMap, aoMap]) {
    applyEnvPackTerrainWrapping(t);
  }

  const material = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughnessMap,
    roughness: 1,
    aoMap,
    aoMapIntensity: 1,
    metalness: 0,
    envMapIntensity: mat.kind === 'water' ? 1.15 : 1,
  });

  if (mat.kind === 'water') {
    material.transparent = true;
    material.opacity = 0.92;
    material.depthWrite = false;
    material.roughness = 0.85;
  }

  return material;
}

const CUBE_ORDER: EnvPackSkyFace[] = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

/**
 * Stylized sky cubemap (albedo only). Assign to `scene.background` or `Scene.environment` via PMREM if desired.
 */
export function loadEnvPackSkyCubeAlbedo(
  onLoad?: (tex: THREE.CubeTexture) => void,
  onError?: (err: unknown) => void
): THREE.CubeTexture {
  const loader = new THREE.CubeTextureLoader();
  const urls = CUBE_ORDER.map((face) =>
    pixelPlaceTexturePath('environment', envPackSkyBaseName(face), 'albedo', 'standard', ENV_PACK_SKY_SUBDIR)
  );
  const cube = loader.load(
    urls,
    (tex) => {
      if (THREE.SRGBColorSpace && 'colorSpace' in tex) {
        (tex as THREE.CubeTexture & { colorSpace?: string }).colorSpace = THREE.SRGBColorSpace;
      }
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      onLoad?.(tex);
    },
    undefined,
    onError
  );
  return cube;
}

/** Optional: full PBR sky faces as separate materials per face (advanced). */
export async function loadEnvPackSkyFaceMaterial(
  face: EnvPackSkyFace,
  options?: LoadPixelPlaceTextureOptions
): Promise<THREE.MeshStandardMaterial> {
  const base = envPackSkyBaseName(face);
  const sub = ENV_PACK_SKY_SUBDIR;
  const [map, normalMap, roughnessMap, aoMap] = await Promise.all([
    loadPixelPlaceTexture(pixelPlaceTexturePath('environment', base, 'albedo', 'standard', sub), options),
    loadPixelPlaceTexture(pixelPlaceTexturePath('environment', base, 'normal', 'standard', sub), options),
    loadPixelPlaceTexture(pixelPlaceTexturePath('environment', base, 'roughness', 'standard', sub), options),
    loadPixelPlaceTexture(pixelPlaceTexturePath('environment', base, 'ao', 'standard', sub), options),
  ]);
  applyLinearDataTexture(normalMap);
  applyLinearDataTexture(roughnessMap);
  applyLinearDataTexture(aoMap);
  for (const t of [map, normalMap, roughnessMap, aoMap]) {
    applyPixelPlaceTextureSettings(t, options?.renderer);
  }
  return new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughnessMap,
    roughness: 1,
    aoMap,
    metalness: 0,
    side: THREE.BackSide,
  });
}
