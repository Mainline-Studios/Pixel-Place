import type * as THREE from 'three';

export type NormalizeResult = {
  /** Uniform scale applied (relative to prior scale). */
  scale: number;
  /** World-space center of the pre-normalize bounds (for debugging). */
  boundsCenter: THREE.Vector3;
};

/**
 * Centers the model at the origin and scales so the largest axis fits `targetMaxExtent`.
 */
export function normalizeImportedModelRoot(root: THREE.Object3D, targetMaxExtent: number): NormalizeResult {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) {
    return {
      scale: 1,
      boundsCenter: new THREE.Vector3(),
    };
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1e-8);
  const scale = targetMaxExtent / maxDim;

  root.position.sub(center);
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);

  return { scale, boundsCenter: center };
}
