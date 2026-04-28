import {
  TEXTURES_BASE_PATH,
  TEXTURE_STANDARD_SIZE,
  TEXTURE_HERO_SIZE,
  type TextureCategory,
  type TextureTier,
  type TextureRole,
} from './constants';

const SNAKE = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

/** Validate `grass_field` style segments (no spaces, lowercase snake_case) */
export function isValidTextureBaseName(name: string): boolean {
  return SNAKE.test(name) && name.length >= 2 && name.length <= 64;
}

export function texturePixelSize(tier: TextureTier): number {
  return tier === 'hero' ? TEXTURE_HERO_SIZE : TEXTURE_STANDARD_SIZE;
}

const SUBDIR = /^[a-z0-9_]+(?:\/[a-z0-9_]+)*$/;

/** Optional nested folder under category, e.g. `base`, `variants`, `base/skybox`. */
export function assertValidTextureSubdir(relativeDir: string): void {
  if (!SUBDIR.test(relativeDir)) {
    throw new Error(
      `Invalid texture subfolder "${relativeDir}" (use lowercase snake segments, slashes only between segments)`
    );
  }
}

/**
 * Canonical URL for a texture in `public/assets/textures/{category}/`.
 * File on disk: `{category}/[{relativeDir}/]{asset}_{role}_{width}.png`
 */
export function pixelPlaceTexturePath(
  category: TextureCategory,
  assetSnakeName: string,
  role: TextureRole | string,
  tier: TextureTier = 'standard',
  relativeDir?: string
): string {
  if (!isValidTextureBaseName(assetSnakeName)) {
    throw new Error(`Invalid texture base name: "${assetSnakeName}" (use snake_case)`);
  }
  if (relativeDir) {
    assertValidTextureSubdir(relativeDir);
  }
  const w = texturePixelSize(tier);
  const safeRole = String(role).replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'misc';
  const prefix = relativeDir ? `${relativeDir}/` : '';
  return `${TEXTURES_BASE_PATH}/${category}/${prefix}${assetSnakeName}_${safeRole}_${w}.png`;
}

/** Parse filename like `grass_field_albedo_512.png` → parts (best-effort) */
export function parseTextureFilename(filename: string): {
  base: string;
  role: string;
  width: number;
} | null {
  const m = filename.replace(/\.png$/i, '').match(/^(.+)_([a-z0-9]+)_(\d+)$/);
  if (!m) return null;
  const width = Number(m[3]);
  if (![512, 1024].includes(width)) return null;
  return { base: m[1], role: m[2], width };
}
