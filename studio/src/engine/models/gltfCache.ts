import type { AnimationClip, Group } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export type LoadedGltf = {
  scene: Group;
  animations: AnimationClip[];
};

const loader = new GLTFLoader();
const promiseCache = new Map<string, Promise<LoadedGltf>>();

/** De-duplicated async GLTF/GLB loads (URLs and data URLs). */
export function loadGltfCached(url: string): Promise<LoadedGltf> {
  let p = promiseCache.get(url);
  if (!p) {
    p = loader.loadAsync(url).then((gltf) => ({
      scene: gltf.scene as Group,
      animations: gltf.animations,
    }));
    promiseCache.set(url, p);
  }
  return p;
}

export function clearGltfCacheEntry(url: string): void {
  promiseCache.delete(url);
}
