import type * as THREE from 'three';
import {
  assertSupportedModelFilename,
  DEFAULT_IMPORT_LIMITS,
  type ImportValidationLimits,
  validateImportedModel,
} from './validation';
import { normalizeImportedModelRoot } from './normalize';
import { setupImportedMaterials } from './materials';
import { loadModelRootFromArrayBuffer } from './loaders';

export type GameAssetImportPipelineOptions = {
  limits?: Partial<ImportValidationLimits>;
  /** Largest axis after normalization (world units). Default 2. */
  targetNormalizedExtent?: number;
  renderer?: THREE.WebGLRenderer;
};

export type GameAssetImportReport = {
  triangleCount: number;
  textureCount: number;
  maxTextureSideSeen: number;
  normalizeScale: number;
  format: 'glb' | 'fbx';
  fileName: string;
};

export type GameAssetImportResult = {
  root: THREE.Object3D;
  report: GameAssetImportReport;
  /** Original file bytes (for persistence). */
  buffer: ArrayBuffer;
};

function mergeLimits(partial?: Partial<ImportValidationLimits>): ImportValidationLimits {
  return { ...DEFAULT_IMPORT_LIMITS, ...partial };
}

/**
 * Load → validate (poly + textures) → normalize scale & center → PBR material setup.
 */
export async function runGameAssetImportPipeline(
  THREE: typeof import('three'),
  file: File,
  options: GameAssetImportPipelineOptions = {}
): Promise<GameAssetImportResult> {
  const format = assertSupportedModelFilename(file.name);
  const limits = mergeLimits(options.limits);
  const targetExtent = options.targetNormalizedExtent ?? 2;

  const buffer = await file.arrayBuffer();
  const root = await loadModelRootFromArrayBuffer(buffer, format);

  const validation = validateImportedModel(root, limits);
  const { scale } = normalizeImportedModelRoot(root, targetExtent);
  setupImportedMaterials(THREE, root, options.renderer);

  return {
    root,
    buffer,
    report: {
      triangleCount: validation.triangleCount,
      textureCount: validation.textureCount,
      maxTextureSideSeen: validation.maxTextureSideSeen,
      normalizeScale: scale,
      format,
      fileName: file.name,
    },
  };
}

/**
 * Re-run post-load steps on an existing graph (e.g. after hydrating from IndexedDB).
 */
export function reprocessImportedRoot(
  THREE: typeof import('three'),
  root: THREE.Object3D,
  fileName: string,
  buffer: ArrayBuffer,
  options: GameAssetImportPipelineOptions = {}
): GameAssetImportResult {
  const format = assertSupportedModelFilename(fileName);
  const limits = mergeLimits(options.limits);
  const targetExtent = options.targetNormalizedExtent ?? 2;

  const validation = validateImportedModel(root, limits);
  const { scale } = normalizeImportedModelRoot(root, targetExtent);
  setupImportedMaterials(THREE, root, options.renderer);

  return {
    root,
    buffer,
    report: {
      triangleCount: validation.triangleCount,
      textureCount: validation.textureCount,
      maxTextureSideSeen: validation.maxTextureSideSeen,
      normalizeScale: scale,
      format,
      fileName,
    },
  };
}
