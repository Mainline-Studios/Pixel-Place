/** Standard texel size for most world/prop/UI tile assets */
export const TEXTURE_STANDARD_SIZE = 512;

/** Hero / focal assets (main characters, large environment masters) */
export const TEXTURE_HERO_SIZE = 1024;

/** Web path root (Next.js `public/`) */
export const TEXTURES_BASE_PATH = '/assets/textures';

/** Shared neutral fallback (minimal PNG; loader also has procedural backup) */
export const TEXTURE_FALLBACK_URL = `${TEXTURES_BASE_PATH}/shared/fallback.png`;

export type TextureCategory = 'environment' | 'characters' | 'props' | 'ui';

export type TextureTier = 'standard' | 'hero';

export type TextureRole =
  | 'albedo'
  | 'normal'
  | 'roughness'
  | 'ao'
  | 'orm'
  | 'emissive'
  | 'mask'
  | 'icon'
  | 'misc';
