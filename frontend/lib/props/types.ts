import type { Object3D } from 'three';

/**
 * UVs come from Three.js primitives (box/cylinder/cone/ico/octa/tetra) — consistent 0–1 per face,
 * suitable for shared stylized atlases or per-category `MeshStandardMaterial.map`.
 */

/** LOD slot indices — distances are world units from camera (Three.js `LOD` convention). */
export type PropLODLevel = 0 | 1 | 2;

export type PropLODThresholds = {
  /** Show LOD1 from this distance (typical: 25–45) */
  lod1: number;
  /** Show LOD2 from this distance (typical: 55–100) */
  lod2: number;
};

export const DEFAULT_PROP_LOD_THRESHOLDS: PropLODThresholds = {
  lod1: 32,
  lod2: 72,
};

export type PropMaterialKey =
  | 'bark'
  | 'foliage'
  | 'concrete'
  | 'brick'
  | 'wood'
  | 'straw'
  | 'metal'
  | 'glass'
  | 'fabric'
  | 'plastic_fun'
  | 'glow';

export type PropCategory = 'tree' | 'building' | 'furniture' | 'interactive' | 'starter';

export type PropFactoryResult = {
  lod: import('three').LOD;
  category: PropCategory;
  /** Stable id for pooling / serialization */
  presetId: string;
};

/** After `disposeProp`, do not use shared materials until recreated */
export type PropDisposeOptions = {
  /** If true, also disposes cached `MeshStandardMaterial` instances (usually leave false). */
  disposeSharedMaterials?: boolean;
};

export function isLODObject(o: Object3D): o is import('three').LOD {
  return (o as import('three').LOD).isLOD === true;
}
