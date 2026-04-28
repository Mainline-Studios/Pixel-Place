import type { PropLODThresholds } from './types';
import { DEFAULT_PROP_LOD_THRESHOLDS } from './types';

type THREE_NS = typeof import('three');

/**
 * Build a Three.js `LOD` with three `Object3D` levels (high → medium → low).
 * Level 0 from 0..lod1, level 1 from lod1..lod2, level 2 beyond lod2.
 */
export function createPropLOD(
  THREE: THREE_NS,
  high: import('three').Object3D,
  medium: import('three').Object3D,
  low: import('three').Object3D,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const lod = new THREE.LOD();
  lod.addLevel(high, 0);
  lod.addLevel(medium, thresholds.lod1);
  lod.addLevel(low, thresholds.lod2);
  return lod;
}

export function disposePropObject(
  root: import('three').Object3D,
  disposeSharedMaterials: boolean
): void {
  const varied =
    disposeSharedMaterials ||
    (root as import('three').Object3D & { userData?: { pixelPlaceVariedMaterials?: boolean } }).userData
      ?.pixelPlaceVariedMaterials === true;

  root.traverse((o) => {
    const mesh = o as import('three').Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      if (varied && mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) m.dispose?.();
      }
    }
  });
}
