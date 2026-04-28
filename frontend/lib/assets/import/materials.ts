import type * as THREE from 'three';
import { applyPixelPlaceTextureSettings } from '../../textures/pixelPlaceTextureLoader';

function toMaterials(material: THREE.Material | THREE.Material[] | undefined): THREE.Material[] {
  if (!material) return [];
  return Array.isArray(material) ? material : [material];
}

function applyMapColorSpace(
  tex: THREE.Texture | null | undefined,
  renderer: THREE.WebGLRenderer | undefined,
  mode: 'srgb' | 'linear'
): void {
  if (!tex) return;
  applyPixelPlaceTextureSettings(tex, renderer, mode);
}

/**
 * Ensures PBR-friendly materials and applies Pixel Place texture sampling / color spaces.
 * Non-standard materials are upgraded to MeshStandardMaterial where possible.
 */
export function setupImportedMaterials(
  THREE: typeof import('three'),
  root: THREE.Object3D,
  renderer?: THREE.WebGLRenderer
): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    const mats = toMaterials(mesh.material);
    const next: THREE.Material[] = [];

    for (const mat of mats) {
      if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
        const std = mat as THREE.MeshStandardMaterial;
        applyMapColorSpace(std.map, renderer, 'srgb');
        applyMapColorSpace(std.emissiveMap, renderer, 'srgb');
        applyMapColorSpace(std.normalMap, renderer, 'linear');
        applyMapColorSpace(std.roughnessMap, renderer, 'linear');
        applyMapColorSpace(std.metalnessMap, renderer, 'linear');
        applyMapColorSpace(std.aoMap, renderer, 'linear');
        applyMapColorSpace(std.alphaMap, renderer, 'linear');
        applyMapColorSpace(std.bumpMap, renderer, 'linear');
        applyMapColorSpace(std.displacementMap, renderer, 'linear');
        applyMapColorSpace(std.lightMap, renderer, 'linear');
        if (std.envMap) applyMapColorSpace(std.envMap, renderer, 'linear');
        next.push(std);
        continue;
      }

      if ((mat as THREE.MeshPhongMaterial).isMeshPhongMaterial) {
        const ph = mat as THREE.MeshPhongMaterial;
        const std = new THREE.MeshStandardMaterial({
          name: ph.name,
          map: ph.map,
          color: ph.color.clone(),
          normalMap: ph.normalMap,
          emissive: ph.emissive.clone(),
          emissiveMap: ph.emissiveMap,
          transparent: ph.transparent,
          opacity: ph.opacity,
          alphaMap: ph.alphaMap,
          side: ph.side,
          roughness: 0.65,
          metalness: 0,
        });
        ph.dispose();
        applyStandardTextureModes(std, renderer);
        next.push(std);
        continue;
      }

      if ((mat as THREE.MeshLambertMaterial).isMeshLambertMaterial) {
        const lm = mat as THREE.MeshLambertMaterial;
        const std = new THREE.MeshStandardMaterial({
          name: lm.name,
          map: lm.map,
          color: lm.color.clone(),
          emissive: lm.emissive.clone(),
          emissiveMap: lm.emissiveMap,
          transparent: lm.transparent,
          opacity: lm.opacity,
          side: lm.side,
          roughness: 0.85,
          metalness: 0,
        });
        lm.dispose();
        applyStandardTextureModes(std, renderer);
        next.push(std);
        continue;
      }

      if ((mat as THREE.MeshBasicMaterial).isMeshBasicMaterial) {
        const b = mat as THREE.MeshBasicMaterial;
        const std = new THREE.MeshStandardMaterial({
          name: b.name,
          map: b.map,
          color: b.color.clone(),
          transparent: b.transparent,
          opacity: b.opacity,
          alphaMap: b.alphaMap,
          side: b.side,
          roughness: 0.9,
          metalness: 0,
        });
        b.dispose();
        applyStandardTextureModes(std, renderer);
        next.push(std);
        continue;
      }

      next.push(mat);
    }

    mesh.material = next.length === 1 ? next[0]! : next;
  });
}

function applyStandardTextureModes(
  std: THREE.MeshStandardMaterial,
  renderer: THREE.WebGLRenderer | undefined
): void {
  applyMapColorSpace(std.map, renderer, 'srgb');
  applyMapColorSpace(std.emissiveMap, renderer, 'srgb');
  applyMapColorSpace(std.normalMap, renderer, 'linear');
  applyMapColorSpace(std.roughnessMap, renderer, 'linear');
  applyMapColorSpace(std.metalnessMap, renderer, 'linear');
  applyMapColorSpace(std.aoMap, renderer, 'linear');
  applyMapColorSpace(std.alphaMap, renderer, 'linear');
}
