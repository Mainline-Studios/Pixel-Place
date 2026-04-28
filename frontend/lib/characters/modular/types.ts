import type { Skin, SkinTexture } from '@/types';

/** Logical body groups exposed for customization / games */
export type ModularCharacterComponent = 'head' | 'torso' | 'arms' | 'legs';

/** Emotes supported by the procedural rig (extend with GLTF clips later) */
export type ModularEmoteId =
  | 'idle'
  | 'walk'
  | 'wave'
  | 'jump'
  | 'dance'
  | 'custom';

/** Optional texture URLs per slot (skin tone, clothing layers, accessory overlay) */
export type AvatarTextureSlots = {
  /** Face / head skin albedo */
  skin?: string;
  /** Torso clothing */
  clothingTorso?: string;
  /** Arm clothing (sleeves) */
  clothingArms?: string;
  /** Pants / leg wear */
  clothingLegs?: string;
  /** Hats, glasses, detail mask — multiplied or overlay in shader later; for now single albedo tint layer */
  accessories?: string;
};

export type ModularCharacterBuildOptions = {
  skin: Skin;
  /** Optional equipped face colors / materials */
  equippedFace?: Skin | null;
  /** Explicit URLs overriding `skin.textures` when set */
  textureSlots?: AvatarTextureSlots;
  /** Stylized scale tweaks */
  bodyScale?: { x: number; y: number; z: number };
  headScale?: { x: number; y: number; z: number };
};

export function textureSlotFromSkin(part: 'head' | 'torso' | 'arm' | 'legs', skin: Skin): SkinTexture | undefined {
  return skin.textures?.[part];
}
