/**
 * Utility to create a user's avatar from their skin and accessories
 * This is extracted from Avatar3DViewer to be reusable in games
 */

import { createModularCharacter, modularOptionsFromSkin, type ModularCharacterRig } from '@/lib/characters/modular';
import { Skin } from '@/types';
import { createSkinMaterial, createFabricMaterial } from '../graphics/PBRShader';

export interface AvatarCreationOptions {
  skin: Skin;
  scene: any; // Three.js Scene
  THREE: any; // Three.js library
  position?: { x: number; y: number; z: number };
  scale?: number;
  /** Default: modular low-poly rig (bone-driven). `legacy` = old high-poly box stack. */
  characterMode?: 'modular' | 'legacy';
}

/**
 * Create an avatar in a Three.js scene from a skin.
 * Returns the root `Group`; modular rigs attach `userData.modularRig` for emotes / bones.
 */
export function createAvatarInScene(options: AvatarCreationOptions): any {
  const {
    skin,
    scene,
    THREE,
    position = { x: 0, y: 0, z: 0 },
    scale = 1,
    characterMode = 'modular',
  } = options;

  if (!skin || !skin.colors) {
    console.warn('Invalid skin provided to createAvatarInScene');
    return null;
  }

  if (characterMode === 'modular') {
    const rig: ModularCharacterRig = createModularCharacter(THREE, modularOptionsFromSkin(skin));
    rig.root.scale.setScalar(scale);
    rig.root.position.set(position.x, position.y, position.z);
    rig.root.userData.modularRig = rig;
    rig.root.userData.hipBaseY = rig.hipBaseY;
    scene.add(rig.root);
    return rig.root;
  }

  // Convert hex color to RGB
  const hexToColor = (hex: string) => {
    if (!hex || typeof hex !== 'string') {
      return { r: 0.5, g: 0.5, b: 0.5 };
    }
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      if (isNaN(num)) {
        return { r: 0.5, g: 0.5, b: 0.5 };
      }
      return {
        r: ((num >> 16) & 255) / 255,
        g: ((num >> 8) & 255) / 255,
        b: (num & 255) / 255
      };
    } catch (e) {
      return { r: 0.5, g: 0.5, b: 0.5 };
    }
  };

  // Create pixelated texture
  const createPixelatedTexture = (color: { r: number; g: number; b: number }, pixelSize: number = 8) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const pixelsPerRow = Math.floor(size / pixelSize);

    for (let y = 0; y < pixelsPerRow; y++) {
      for (let x = 0; x < pixelsPerRow; x++) {
        const variation = (Math.random() - 0.5) * 0.15;
        const pixelColor = {
          r: Math.max(0, Math.min(255, Math.floor((color.r + variation) * 255))),
          g: Math.max(0, Math.min(255, Math.floor((color.g + variation) * 255))),
          b: Math.max(0, Math.min(255, Math.floor((color.b + variation) * 255)))
        };

        ctx.fillStyle = `rgb(${pixelColor.r}, ${pixelColor.g}, ${pixelColor.b})`;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  // Helper to create rounded box
  const createRoundedBox = (width: number, height: number, depth: number, radius: number = 0.1) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    geometry.computeVertexNormals();
    return geometry;
  };

  // Get colors from skin
  const headColor = hexToColor(skin.colors?.head || '#f4c2a1');
  const torsoColor = hexToColor(skin.colors?.torso || '#4d536f');
  const armColor = hexToColor(skin.colors?.arm || '#3a3f56');
  const legColor = hexToColor(skin.colors?.legs || '#3a3f56');

  // Create materials with PBR (Physically Based Rendering) for realistic lighting
  // Head uses skin material with subsurface scattering
  const headMaterial = createSkinMaterial(THREE, headColor);
  headMaterial.map = createPixelatedTexture(headColor, 8);
  
  // Torso, arms, and legs use fabric material
  const torsoMaterial = createFabricMaterial(THREE, torsoColor);
  torsoMaterial.map = createPixelatedTexture(torsoColor, 8);
  
  const armMaterial = createFabricMaterial(THREE, armColor);
  armMaterial.map = createPixelatedTexture(armColor, 8);
  
  const legMaterial = createFabricMaterial(THREE, legColor);
  legMaterial.map = createPixelatedTexture(legColor, 8);

  // Create character group
  const characterGroup = new THREE.Group();
  characterGroup.scale.set(scale, scale, scale);
  characterGroup.position.set(position.x, position.y, position.z);

  // Body scale
  const bodyScale = (skin as any).bodyScale || { x: 1, y: 1, z: 1 };
  const headScale = (skin as any).headScale || { x: 1, y: 1, z: 1 };
  const isSpecial = (skin as any).special || false;

  // Head
  const headSize = 1.2;
  const headGeometry = createRoundedBox(headSize * headScale.x, headSize * headScale.y, headSize * headScale.z, 0.08);
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 2.1, 0);
  head.castShadow = true;
  characterGroup.add(head);

  // Torso
  const torsoSize = { w: 1.6, h: 1.8, d: 0.8 };
  const torsoGeometry = createRoundedBox(
    torsoSize.w * bodyScale.x,
    torsoSize.h * bodyScale.y,
    torsoSize.d * bodyScale.z,
    0.1
  );
  const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
  torso.position.set(0, 0.9, 0);
  torso.castShadow = true;
  characterGroup.add(torso);

  // Left Arm
  const armSize = { w: 0.5, h: 1.8, d: 0.5 };
  const leftArmGeometry = createRoundedBox(
    armSize.w * bodyScale.x,
    armSize.h * bodyScale.y,
    armSize.d * bodyScale.z,
    0.06
  );
  const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
  leftArm.position.set(-1.15 * bodyScale.x, 0.9, 0);
  leftArm.castShadow = true;
  characterGroup.add(leftArm);

  // Right Arm
  const rightArmGeometry = createRoundedBox(
    armSize.w * bodyScale.x,
    armSize.h * bodyScale.y,
    armSize.d * bodyScale.z,
    0.06
  );
  const rightArm = new THREE.Mesh(rightArmGeometry, armMaterial);
  rightArm.position.set(1.15 * bodyScale.x, 0.9, 0);
  rightArm.castShadow = true;
  characterGroup.add(rightArm);

  // Left Leg
  const legSize = { w: 0.6, h: 1.6, d: 0.6 };
  const leftLegGeometry = createRoundedBox(
    legSize.w * bodyScale.x,
    legSize.h * bodyScale.y,
    legSize.d * bodyScale.z,
    0.06
  );
  const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
  leftLeg.position.set(-0.4 * bodyScale.x, -1.0, 0);
  leftLeg.castShadow = true;
  characterGroup.add(leftLeg);

  // Right Leg
  const rightLegGeometry = createRoundedBox(
    legSize.w * bodyScale.x,
    legSize.h * bodyScale.y,
    legSize.d * bodyScale.z,
    0.06
  );
  const rightLeg = new THREE.Mesh(rightLegGeometry, legMaterial);
  rightLeg.position.set(0.4 * bodyScale.x, -1.0, 0);
  rightLeg.castShadow = true;
  characterGroup.add(rightLeg);

  // Store body parts references for animation
  (characterGroup as any).bodyParts = {
    head,
    torso,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg
  };

  // Add to scene
  scene.add(characterGroup);

  return characterGroup;
}
