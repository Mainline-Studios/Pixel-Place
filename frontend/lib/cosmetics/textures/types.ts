/** Garment / surface target — assign to matching `MeshStandardMaterial.map` on modular parts */
export type CosmeticGarmentCategory = 'shirt' | 'pants' | 'hat' | 'shoes' | 'skin';

export type CosmeticPatternKind = 'solid' | 'stripes' | 'camo' | 'gradient';

export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type CosmeticColorSet = {
  /** Primary fill */
  primary: string;
  /** Secondary (stripes, camo blobs, gradient end) */
  secondary: string;
  /** Optional accent (rare+ trims, epic highlights) */
  accent?: string;
};

export type CosmeticTextureOptions = {
  category: CosmeticGarmentCategory;
  pattern: CosmeticPatternKind;
  colors: CosmeticColorSet;
  rarity?: CosmeticRarity;
  /** Square output size; default matches `TEXTURE_STANDARD_SIZE` (512) */
  size?: number;
  /** Deterministic camo / accent placement */
  seed?: string;
  /** Stripe angle in radians (0 = vertical bands on canvas) */
  stripeAngle?: number;
  /** Gradient: 'linear' | 'radial' (hat favors radial when pattern is gradient) */
  gradientStyle?: 'linear' | 'radial';
};

export type CosmeticTextureResult = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  category: CosmeticGarmentCategory;
  rarity: CosmeticRarity;
};

/** Modular character: default `BoxGeometry` — each face uses full 0–1 UVs; textures are authored as tile-friendly albedos. */
export const COSMETIC_UV_MODULAR_BOX =
  'Modular avatar parts use Three.js BoxGeometry: each face maps the full texture 0–1. Use repeating patterns (stripes/camo/gradient) or atlas layouts if you later assign custom UVs.';

/**
 * Suggested `ModularCharacterRig.meshes` keys to receive each garment texture (`THREE.Texture` on `material.map`).
 * Hat is empty — bind to an accessory mesh or head overlay in your pipeline.
 */
export const MODULAR_MESH_SLOTS: Record<CosmeticGarmentCategory, string[]> = {
  shirt: ['torso', 'leftUpperArm', 'leftLowerArm', 'rightUpperArm', 'rightLowerArm'],
  pants: ['leftUpperLeg', 'leftLowerLeg', 'rightUpperLeg', 'rightLowerLeg'],
  hat: [],
  shoes: ['leftLowerLeg', 'rightLowerLeg'],
  skin: ['head'],
};
