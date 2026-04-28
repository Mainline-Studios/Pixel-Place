import type { Mesh, Object3D } from "three";

export function tagMeshesWithPickId(root: Object3D, gameObjectId: string): void {
  root.userData.gameObjectId = gameObjectId;
  root.traverse((child) => {
    const m = child as Mesh;
    if (m.isMesh) {
      m.userData.gameObjectId = gameObjectId;
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
}

export function disposeObjectSubtree(root: Object3D): void {
  root.traverse((child) => {
    const m = child as Mesh;
    if (m.isMesh) {
      m.geometry?.dispose();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((sub) => sub.dispose());
      else mat?.dispose?.();
    }
  });
}
