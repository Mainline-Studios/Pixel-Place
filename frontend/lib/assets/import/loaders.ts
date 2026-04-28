import type * as THREE from 'three';
import { AssetValidationError } from './validation';

export async function loadGLTFSceneFromArrayBuffer(buffer: ArrayBuffer): Promise<THREE.Object3D> {
  try {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, '');
    return gltf.scene;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new AssetValidationError(`Failed to load GLB/GLTF: ${msg}`, 'LOAD_FAILED', { cause: msg });
  }
}

export async function loadFBXSceneFromArrayBuffer(buffer: ArrayBuffer): Promise<THREE.Object3D> {
  try {
    const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
    const loader = new FBXLoader();
    const blob = new Blob([buffer]);
    const url = URL.createObjectURL(blob);
    try {
      const group = await loader.loadAsync(url);
      return group;
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new AssetValidationError(`Failed to load FBX: ${msg}`, 'LOAD_FAILED', { cause: msg });
  }
}

export async function loadModelRootFromArrayBuffer(
  buffer: ArrayBuffer,
  format: 'glb' | 'fbx'
): Promise<THREE.Object3D> {
  if (format === 'glb') return loadGLTFSceneFromArrayBuffer(buffer);
  return loadFBXSceneFromArrayBuffer(buffer);
}
