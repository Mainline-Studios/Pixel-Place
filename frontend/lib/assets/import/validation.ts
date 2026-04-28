import type * as THREE from 'three';

export class AssetValidationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'POLYGON_LIMIT'
      | 'TEXTURE_SIZE'
      | 'TEXTURE_COUNT'
      | 'UNSUPPORTED_FORMAT'
      | 'LOAD_FAILED',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AssetValidationError';
  }
}

export type ImportValidationLimits = {
  /** Max total triangles (mesh geometry). */
  maxTriangles: number;
  /** Reject any texture whose width or height exceeds this. */
  maxTextureDimension: number;
  /** Max distinct textures referenced by materials. */
  maxTextureCount: number;
};

export const DEFAULT_IMPORT_LIMITS: ImportValidationLimits = {
  maxTriangles: 500_000,
  maxTextureDimension: 4096,
  maxTextureCount: 64,
};

const MATERIAL_TEXTURE_KEYS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'emissiveMap',
  'lightMap',
  'bumpMap',
  'displacementMap',
  'alphaMap',
  'specularMap',
  'envMap',
  'clearcoatNormalMap',
] as const;

function toMaterials(material: THREE.Material | THREE.Material[] | undefined): THREE.Material[] {
  if (!material) return [];
  return Array.isArray(material) ? material : [material];
}

export function countTriangles(root: THREE.Object3D): number {
  let total = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const geo = mesh.geometry as THREE.BufferGeometry;
    if (geo.index) {
      total += geo.index.count / 3;
    } else {
      const pos = geo.getAttribute('position');
      total += pos ? pos.count / 3 : 0;
    }
  });
  return Math.floor(total);
}

export function collectMaterialTextures(root: THREE.Object3D): THREE.Texture[] {
  const seen = new Set<THREE.Texture>();
  const list: THREE.Texture[] = [];
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const mat of toMaterials(mesh.material)) {
      const m = mat as unknown as Record<string, unknown>;
      for (const key of MATERIAL_TEXTURE_KEYS) {
        const t = m[key];
        if (t && typeof t === 'object' && 'isTexture' in t && (t as THREE.Texture).isTexture) {
          const tex = t as THREE.Texture;
          if (!seen.has(tex)) {
            seen.add(tex);
            list.push(tex);
          }
        }
      }
    }
  });
  return list;
}

function textureDimensions(tex: THREE.Texture): { w: number; h: number } | null {
  const img = tex.image as
    | { width?: number; height?: number; videoWidth?: number; videoHeight?: number }
    | undefined;
  if (!img) return null;
  const w = img.width ?? img.videoWidth ?? 0;
  const h = img.height ?? img.videoHeight ?? 0;
  if (w <= 0 || h <= 0) return null;
  return { w, h };
}

export function validateImportedModel(
  root: THREE.Object3D,
  limits: ImportValidationLimits
): { triangleCount: number; textureCount: number; maxTextureSideSeen: number } {
  const triangleCount = countTriangles(root);
  if (triangleCount > limits.maxTriangles) {
    throw new AssetValidationError(
      `Model exceeds polygon limit (${triangleCount} triangles, max ${limits.maxTriangles}).`,
      'POLYGON_LIMIT',
      { triangleCount, maxTriangles: limits.maxTriangles }
    );
  }

  const textures = collectMaterialTextures(root);
  if (textures.length > limits.maxTextureCount) {
    throw new AssetValidationError(
      `Too many textures (${textures.length}, max ${limits.maxTextureCount}).`,
      'TEXTURE_COUNT',
      { textureCount: textures.length, maxTextureCount: limits.maxTextureCount }
    );
  }

  let maxTextureSideSeen = 0;
  for (const tex of textures) {
    const dim = textureDimensions(tex);
    if (!dim) continue;
    maxTextureSideSeen = Math.max(maxTextureSideSeen, dim.w, dim.h);
    if (dim.w > limits.maxTextureDimension || dim.h > limits.maxTextureDimension) {
      throw new AssetValidationError(
        `Texture exceeds size limit (${dim.w}×${dim.h}, max side ${limits.maxTextureDimension}).`,
        'TEXTURE_SIZE',
        {
          width: dim.w,
          height: dim.h,
          maxTextureDimension: limits.maxTextureDimension,
        }
      );
    }
  }

  return { triangleCount, textureCount: textures.length, maxTextureSideSeen };
}

export function assertSupportedModelFilename(name: string): 'glb' | 'fbx' {
  const lower = name.toLowerCase();
  if (lower.endsWith('.glb') || lower.endsWith('.gltf')) return 'glb';
  if (lower.endsWith('.fbx')) return 'fbx';
  throw new AssetValidationError(
    `Unsupported format. Use .glb, .gltf, or .fbx (got "${name}").`,
    'UNSUPPORTED_FORMAT',
    { name }
  );
}
