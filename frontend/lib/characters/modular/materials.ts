import type { Skin, SkinMaterial } from '@/types';
import type { AvatarTextureSlots } from './types';

type THREE_NS = typeof import('three');

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!hex || typeof hex !== 'string') return { r: 0.75, g: 0.75, b: 0.75 };
  const num = parseInt(hex.replace('#', ''), 16);
  if (Number.isNaN(num)) return { r: 0.75, g: 0.75, b: 0.75 };
  return { r: ((num >> 16) & 255) / 255, g: ((num >> 8) & 255) / 255, b: (num & 255) / 255 };
}

function applySkinMaterialProps(
  THREE: THREE_NS,
  mat: InstanceType<THREE_NS['MeshStandardMaterial']>,
  sm?: SkinMaterial
): void {
  if (!sm) return;
  if (sm.roughness !== undefined) mat.roughness = sm.roughness;
  if (sm.metalness !== undefined) mat.metalness = sm.metalness;
  if (sm.emissive) {
    mat.emissive = new THREE.Color(sm.emissive);
    mat.emissiveIntensity = sm.emissiveIntensity ?? 0.6;
  }
}

function createStylizedCanvasTexture(
  THREE: THREE_NS,
  color: { r: number; g: number; b: number },
  pixelSize = 6
): import('three').CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const cells = Math.floor(size / pixelSize);
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const variation = (Math.random() - 0.5) * 0.12;
      const r = Math.max(0, Math.min(255, Math.floor((color.r + variation) * 255)));
      const g = Math.max(0, Math.min(255, Math.floor((color.g + variation) * 255)));
      const b = Math.max(0, Math.min(255, Math.floor((color.b + variation) * 255)));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if ('colorSpace' in tex && THREE.SRGBColorSpace) {
    (tex as import('three').CanvasTexture & { colorSpace?: string }).colorSpace = THREE.SRGBColorSpace;
  }
  return tex;
}

export type ResolvedPartMaterials = {
  head: import('three').MeshStandardMaterial;
  torso: import('three').MeshStandardMaterial;
  arm: import('three').MeshStandardMaterial;
  leg: import('three').MeshStandardMaterial;
};

/**
 * Builds MeshStandardMaterials with optional URL maps from `textureSlots` / `skin.textures`.
 * Falls back to stylized procedural canvas atlases when URLs are absent.
 */
export function createModularPartMaterials(
  THREE: THREE_NS,
  skin: Skin,
  equippedFace: Skin | null | undefined,
  textureSlots: AvatarTextureSlots | undefined
): ResolvedPartMaterials {
  const headHex = equippedFace?.colors?.head ?? skin.colors?.head ?? '#e8b89a';
  const torsoHex = skin.colors?.torso ?? '#4d536f';
  const armHex = skin.colors?.arm ?? '#3a3f56';
  const legHex = skin.colors?.legs ?? '#3a3f56';

  const headRgb = hexToRgb(headHex);
  const torsoRgb = hexToRgb(torsoHex);
  const armRgb = hexToRgb(armHex);
  const legRgb = hexToRgb(legHex);

  const loader = new THREE.TextureLoader();

  const make = (
    rgb: { r: number; g: number; b: number },
    matHint: SkinMaterial | undefined,
    url?: string
  ): import('three').MeshStandardMaterial => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(rgb.r, rgb.g, rgb.b),
      roughness: 0.72,
      metalness: 0.06,
      map: createStylizedCanvasTexture(THREE, rgb),
    });
    applySkinMaterialProps(THREE, mat, matHint);
    if (url) {
      loader.load(
        url,
        (t) => {
          if ('colorSpace' in t && THREE.SRGBColorSpace) {
            (t as import('three').Texture & { colorSpace?: string }).colorSpace = THREE.SRGBColorSpace;
          }
          mat.map = t;
          mat.needsUpdate = true;
        },
        undefined,
        () => {
          /* keep procedural */
        }
      );
    }
    return mat;
  };

  const headUrl = textureSlots?.skin ?? skin.textures?.head?.base;
  const torsoUrl = textureSlots?.clothingTorso ?? skin.textures?.torso?.base;
  const armUrl = textureSlots?.clothingArms ?? skin.textures?.arm?.base;
  const legUrl = textureSlots?.clothingLegs ?? skin.textures?.legs?.base;

  return {
    head: make(headRgb, skin.materials?.head ?? equippedFace?.materials?.head, headUrl),
    torso: make(torsoRgb, skin.materials?.torso, torsoUrl),
    arm: make(armRgb, skin.materials?.arm, armUrl),
    leg: make(legRgb, skin.materials?.legs, legUrl),
  };
}
