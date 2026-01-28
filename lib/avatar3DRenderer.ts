/**
 * Utility functions for rendering user avatars in 3D games
 * Reuses logic from Avatar3DViewer for consistency
 */

import { Skin, User } from '@/types';
import { getSkins, getAccessories } from '@/lib/storage';

export interface AvatarRenderOptions {
  scale?: number;
  position?: { x: number; y: number; z: number };
  animation?: 'idle' | 'walk' | 'jump' | 'wave';
}

/**
 * Get user's equipped skin and face data
 */
export async function getUserAvatarData(user: User): Promise<{
  skin: Skin | null;
  face: Skin | null;
  accessories: any[];
}> {
  try {
    const [skins, accessories] = await Promise.all([
      getSkins(),
      getAccessories()
    ]);

    const equippedSkin = skins.find(s => s.id === user.equippedSkin) || 
                         skins.find(s => s.id === 'starter_classic') || 
                         skins[0] || null;

    const equippedFace = user.equippedFace 
      ? skins.find(s => s.id === user.equippedFace && s.isFace) || null
      : null;

    // Get equipped accessories
    const equippedAccessoriesList = Object.values(user.equippedAccessories || {})
      .map(id => accessories.find(a => a.id === id))
      .filter(Boolean);

    return {
      skin: equippedSkin,
      face: equippedFace,
      accessories: equippedAccessoriesList
    };
  } catch (error) {
    console.error('Error loading avatar data:', error);
    return { skin: null, face: null, accessories: [] };
  }
}

/**
 * Create a 3D avatar mesh in a Three.js scene
 * Returns the character group and body parts for animation
 */
export function createAvatarMesh(
  THREE: any,
  scene: any,
  skin: Skin,
  equippedFace: Skin | null,
  accessories: any[],
  options: AvatarRenderOptions = {}
): {
  characterGroup: any;
  bodyParts: {
    head: any;
    torso: any;
    leftArm: any;
    rightArm: any;
    leftLeg: any;
    rightLeg: any;
  };
} {
  const scale = options.scale || 1.0;
  const position = options.position || { x: 0, y: 0, z: 0 };

  // Convert hex color to Three.js color
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
  const createPixelatedTexture = (color: { r: number, g: number, b: number }, pixelSize: number = 8) => {
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

  // Create glow material
  const createGlowMaterial = (baseColor: { r: number, g: number, b: number }, hasGlow: boolean, glowColor?: string, glowIntensity: number = 0.5) => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor.r, baseColor.g, baseColor.b),
      roughness: hasGlow ? 0.3 : 0.7,
      metalness: hasGlow ? 0.5 : 0.1,
      emissive: hasGlow && glowColor ? new THREE.Color(glowColor) : new THREE.Color(0, 0, 0),
      emissiveIntensity: hasGlow ? glowIntensity : 0
    });
  };

  // Create high-poly geometry
  const createHighPolyGeometry = (type: 'head' | 'torso' | 'arm' | 'leg', width: number, height: number, depth: number) => {
    if (type === 'head') {
      const radius = Math.max(width, height, depth) / 2;
      return new THREE.IcosahedronGeometry(radius, 4); // ~5120 faces
    }
    const segments = 20;
    const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
    geometry.computeVertexNormals();
    return geometry;
  };

  // Ensure skin has colors
  const defaultColors = {
    head: '#f4c2a1',
    torso: '#4d536f',
    arm: '#3a3f56',
    legs: '#3a3f56'
  };

  const safeColors = {
    head: skin.colors?.head || defaultColors.head,
    torso: skin.colors?.torso || defaultColors.torso,
    arm: skin.colors?.arm || defaultColors.arm,
    legs: skin.colors?.legs || defaultColors.legs
  };

  // Apply equipped face to head if available
  const headColor = hexToColor(equippedFace?.colors?.head || safeColors.head);
  const torsoColor = hexToColor(safeColors.torso);
  const armColor = hexToColor(safeColors.arm);
  const legColor = hexToColor(safeColors.legs);

  // Check for glow
  const faceHasGlow = equippedFace?.isSpecial || equippedFace?.materials?.head?.emissive !== undefined;
  const faceGlowColor = equippedFace?.materials?.head?.emissive || equippedFace?.materials?.torso?.emissive;
  const faceGlowIntensity = equippedFace?.materials?.head?.emissiveIntensity || equippedFace?.materials?.torso?.emissiveIntensity || 0.6;
  const hasGlow = skin.isSpecial || (skin.materials?.torso?.emissive !== undefined) || faceHasGlow;
  const glowColor = faceGlowColor || skin.materials?.torso?.emissive || skin.materials?.head?.emissive || '#4a90e2';
  const glowIntensity = faceGlowIntensity || skin.materials?.torso?.emissiveIntensity || skin.materials?.head?.emissiveIntensity || 0.6;

  // Create materials
  const headMaterial = (hasGlow && (faceHasGlow || skin.isSpecial))
    ? createGlowMaterial(headColor, true, glowColor, glowIntensity)
    : new THREE.MeshStandardMaterial({
        map: createPixelatedTexture(headColor, 8),
        color: new THREE.Color(headColor.r, headColor.g, headColor.b),
        roughness: 0.8,
        metalness: 0.0
      });

  const torsoMaterial = hasGlow
    ? createGlowMaterial(torsoColor, true, glowColor, glowIntensity)
    : new THREE.MeshStandardMaterial({
        map: createPixelatedTexture(torsoColor, 8),
        color: new THREE.Color(torsoColor.r, torsoColor.g, torsoColor.b),
        roughness: 0.7,
        metalness: 0.1
      });

  const armMaterial = hasGlow
    ? createGlowMaterial(armColor, true, glowColor, glowIntensity)
    : new THREE.MeshStandardMaterial({
        map: createPixelatedTexture(armColor, 8),
        color: new THREE.Color(armColor.r, armColor.g, armColor.b),
        roughness: 0.7,
        metalness: 0.1
      });

  const legMaterial = hasGlow
    ? createGlowMaterial(legColor, true, glowColor, glowIntensity)
    : new THREE.MeshStandardMaterial({
        map: createPixelatedTexture(legColor, 8),
        color: new THREE.Color(legColor.r, legColor.g, legColor.b),
        roughness: 0.7,
        metalness: 0.1
      });

  // Create character group
  const characterGroup = new THREE.Group();
  characterGroup.scale.set(scale, scale, scale);
  characterGroup.position.set(position.x, position.y, position.z);

  // Body parts
  const bodyScale = (skin as any).bodyScale || { x: 1, y: 1, z: 1 };
  const headScale = (skin as any).headScale || { x: 1, y: 1, z: 1 };
  const isSpecial = skin.isSpecial || false;

  // Head
  const headSize = 1.2;
  const headGeometry = createHighPolyGeometry('head', headSize * headScale.x, headSize * headScale.y, headSize * headScale.z);
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 2.1, 0);
  head.castShadow = true;
  characterGroup.add(head);

  // Torso
  const torsoSize = { w: 1.6, h: 1.8, d: 0.8 };
  const torsoGeometry = createHighPolyGeometry('torso', torsoSize.w * bodyScale.x, torsoSize.h * bodyScale.y, torsoSize.d * bodyScale.z);
  const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
  torso.position.set(0, 0.9, 0);
  torso.castShadow = true;
  characterGroup.add(torso);

  // Arms
  const armSize = { w: 0.5, h: 1.8, d: 0.5 };
  const leftArmGeometry = createHighPolyGeometry('arm', armSize.w * bodyScale.x, armSize.h * bodyScale.y, armSize.d * bodyScale.z);
  const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
  leftArm.position.set(-1.15 * bodyScale.x, 0.9, 0);
  leftArm.castShadow = true;
  characterGroup.add(leftArm);

  const rightArmGeometry = createHighPolyGeometry('arm', armSize.w * bodyScale.x, armSize.h * bodyScale.y, armSize.d * bodyScale.z);
  const rightArm = new THREE.Mesh(rightArmGeometry, armMaterial);
  rightArm.position.set(1.15 * bodyScale.x, 0.9, 0);
  rightArm.castShadow = true;
  characterGroup.add(rightArm);

  // Legs
  const legSize = { w: 0.6, h: 1.6, d: 0.6 };
  const leftLegGeometry = createHighPolyGeometry('leg', legSize.w * bodyScale.x, legSize.h * bodyScale.y, legSize.d * bodyScale.z);
  const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
  leftLeg.position.set(-0.4 * bodyScale.x, -1.0, 0);
  leftLeg.castShadow = true;
  characterGroup.add(leftLeg);

  const rightLegGeometry = createHighPolyGeometry('leg', legSize.w * bodyScale.x, legSize.h * bodyScale.y, legSize.d * bodyScale.z);
  const rightLeg = new THREE.Mesh(rightLegGeometry, legMaterial);
  rightLeg.position.set(0.4 * bodyScale.x, -1.0, 0);
  rightLeg.castShadow = true;
  characterGroup.add(rightLeg);

  // Add accessories (simplified - just basic rendering)
  accessories.forEach(accessory => {
    if (!accessory) return;
    const accColor = hexToColor(accessory.color || '#ffffff');
    const accMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accColor.r, accColor.g, accColor.b),
      roughness: 0.5,
      metalness: 0.3
    });

    if (accessory.type === 'hat') {
      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 0.12, 16),
        accMat
      );
      hat.position.set(0, 2.75, 0);
      characterGroup.add(hat);
    }
  });

  scene.add(characterGroup);

  return {
    characterGroup,
    bodyParts: { head, torso, leftArm, rightArm, leftLeg, rightLeg }
  };
}
