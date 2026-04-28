/**
 * High-quality AI prompt builder for Pixel Place textures.
 * Aligns with art direction: semi-realistic stylized (Fortnite/Roblox hybrid), clean, game-ready, seamless.
 */

import { TEXTURE_STANDARD_SIZE, TEXTURE_HERO_SIZE, type TextureTier } from './constants';

export type LightingStyle = 'soft diffused' | 'gentle outdoor' | 'neutral studio' | 'warm skylight' | 'cool ambient';

export type ArtStyleHint =
  | 'Fortnite-style'
  | 'stylized Roblox-adjacent'
  | 'semi-realistic game texture'
  | 'hand-painted PBR-friendly';

export interface TexturePromptRecord {
  id: string;
  prompt: string;
  assetType: string;
  material: string;
  style?: string;
  lighting: LightingStyle;
  resolution: 512 | 1024;
  seamless: boolean;
  preset?: TexturePresetId;
  variant?: string;
}

export type TexturePresetId = 'grass' | 'stone' | 'wood' | 'metal' | 'fabric';

const ART_DIRECTION =
  'semi-realistic stylized game texture, clean readable forms, not photorealistic, bright but not oversaturated';

const TILING = 'seamless tileable texture, no visible seams, edge-wrapped for UV tiling';

export const PRESET_TEMPLATES: Record<
  TexturePresetId,
  {
    objectType: string;
    defaultMaterial: string;
    defaultStyle: ArtStyleHint;
    /** Short phrases mixed into prompts for variety */
    variants: string[];
  }
> = {
  grass: {
    objectType: 'grass field ground cover',
    defaultMaterial: 'organic turf and blade clusters',
    defaultStyle: 'Fortnite-style',
    variants: [
      'lush vibrant green with subtle hue variation',
      'short manicured lawn with soft highlights',
      'wild meadow mix with small flowers desaturated',
      'dry summer grass with warm yellow tips',
      'damp mossy patch with deeper emerald tones',
      'sports turf with uniform micro-pattern',
      'highland pasture with wind-swept directional bias',
      'jungle floor grass with darker undertones',
    ],
  },
  stone: {
    objectType: 'stone rock surface',
    defaultMaterial: 'mineral aggregate with fine grain',
    defaultStyle: 'semi-realistic game texture',
    variants: [
      'rough granite with cool gray variation',
      'weathered limestone with warm cream chips',
      'dark volcanic rock with subtle sparkle',
      'cobblestone patch with rounded edges',
      'crumbling castle masonry with soft erosion',
      'polished marble veining stylized not noisy',
      'sandstone cliff with horizontal strata',
      'wet river rock with gentle specular hints',
    ],
  },
  wood: {
    objectType: 'wood timber surface',
    defaultMaterial: 'lignin grain and plank structure',
    defaultStyle: 'stylized Roblox-adjacent',
    variants: [
      'light oak plank with clear ring lines',
      'weathered barn wood with soft gray wash',
      'dark walnut with rich brown depth',
      'bamboo strip pattern clean and graphic',
      'painted wood with slight chip wear',
      'rough cut timber with bold grain',
      'parquet floor geometric repeat-friendly',
      'driftwood bleached with subtle salt streaks',
    ],
  },
  metal: {
    objectType: 'metal surface',
    defaultMaterial: 'worked metal with controlled reflectivity',
    defaultStyle: 'hand-painted PBR-friendly',
    variants: [
      'brushed aluminum with linear scratch direction',
      'rusted iron with stylized orange-brown patina',
      'painted steel with micro-chip edge wear',
      'chrome trim with soft cartoon specular',
      'copper with teal oxidation accents',
      'galvanized zinc with mottled matte',
      'sci-fi panel metal with inset lines',
      'hammered bronze with low-frequency bumps',
    ],
  },
  fabric: {
    objectType: 'woven fabric textile',
    defaultMaterial: 'fiber weave with thread detail',
    defaultStyle: 'Fortnite-style',
    variants: [
      'tight cotton twill with soft shadowing',
      'denim with diagonal weave readability',
      'velvet with gentle sheen variation',
      'heavy canvas with coarse stitch',
      'wool knit with chunky loops stylized',
      'linen with irregular slub pattern',
      'satin with simplified highlight bands',
      'felt with uniform matte micro-fuzz',
    ],
  },
};

const LIGHTING_ROTATION: LightingStyle[] = [
  'soft diffused',
  'gentle outdoor',
  'neutral studio',
  'warm skylight',
  'cool ambient',
];

function slugId(parts: string[]): string {
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Build a single high-quality texture prompt for image/texture AI models.
 *
 * @param assetType - Object or surface category (e.g. "grass field", "metal panel")
 * @param material - Material description (e.g. "organic turf", "brushed steel")
 * @param style - Optional art-direction override; defaults to semi-realistic stylized game language
 */
export function generateTexturePrompt(
  assetType: string,
  material: string,
  style?: string
): string {
  const stylePhrase = style?.trim() || ART_DIRECTION;
  const lighting: LightingStyle = 'soft diffused';
  const res = TEXTURE_STANDARD_SIZE;

  return [
    `A seamless stylized ${assetType.trim()} texture`,
    `material: ${material.trim()}`,
    lighting + ' lighting',
    stylePhrase,
    'game-ready albedo-style color map',
    TILING,
    `${res}x${res} resolution`,
  ]
    .filter(Boolean)
    .join(', ');
}

/**
 * Merge preset defaults with optional overrides and return a full sentence prompt.
 */
export function generateTexturePromptFromPreset(
  preset: TexturePresetId,
  variantIndex: number,
  options?: {
    lighting?: LightingStyle;
    tier?: TextureTier;
    extraStyle?: string;
  }
): string {
  const p = PRESET_TEMPLATES[preset];
  const variant = p.variants[variantIndex % p.variants.length]!;
  const lighting = options?.lighting ?? LIGHTING_ROTATION[variantIndex % LIGHTING_ROTATION.length]!;
  const res = options?.tier === 'hero' ? TEXTURE_HERO_SIZE : TEXTURE_STANDARD_SIZE;
  const styleBits = [ART_DIRECTION, p.defaultStyle, options?.extraStyle].filter(Boolean).join(', ');

  return [
    `A seamless stylized ${p.objectType}`,
    variant,
    `material feel: ${p.defaultMaterial}`,
    `${lighting} lighting`,
    styleBits,
    'clean readable detail, not photorealistic',
    'game-ready, tileable albedo',
    TILING,
    `${res}x${res} resolution`,
  ].join(', ');
}

export function listPresetIds(): TexturePresetId[] {
  return Object.keys(PRESET_TEMPLATES) as TexturePresetId[];
}

/**
 * Enumerate preset × variant × lighting × resolution tier — produces 100+ rows by default.
 */
export function batchGenerateTexturePrompts(options?: {
  /** Include hero (1024) variants; doubles count roughly */
  includeHeroResolution?: boolean;
  /** Cap variants per preset (default: all) */
  maxVariantsPerPreset?: number;
}): TexturePromptRecord[] {
  const includeHero = options?.includeHeroResolution ?? true;
  const maxV = options?.maxVariantsPerPreset ?? Infinity;
  const records: TexturePromptRecord[] = [];
  let seq = 0;

  for (const preset of listPresetIds()) {
    const p = PRESET_TEMPLATES[preset];
    const variants = p.variants.slice(0, maxV);

    variants.forEach((variantPhrase, vi) => {
      LIGHTING_ROTATION.forEach((lighting) => {
        const tiers: TextureTier[] = includeHero ? ['standard', 'hero'] : ['standard'];
        tiers.forEach((tier) => {
          seq += 1;
          const resolution = tier === 'hero' ? TEXTURE_HERO_SIZE : TEXTURE_STANDARD_SIZE;
          const prompt = generateTexturePromptFromPreset(preset, vi, { lighting, tier });
          records.push({
            id: slugId(['pptx', preset, String(vi), lighting.replace(/\s+/g, '-'), String(resolution)]),
            prompt,
            assetType: p.objectType,
            material: `${p.defaultMaterial}; ${variantPhrase}`,
            style: p.defaultStyle,
            lighting,
            resolution,
            seamless: true,
            preset,
            variant: variantPhrase,
          });
        });
      });
    });
  }

  return records;
}

/** Serialize records for pipelines (pretty-print optional). */
export function exportTexturePromptsJSON(records: TexturePromptRecord[], pretty = false): string {
  const payload = {
    generatedAt: new Date().toISOString(),
    count: records.length,
    artDirectionNotes: ART_DIRECTION,
    tilingRequirement: TILING,
    prompts: records,
  };
  return pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
}

/** JSON Lines — one object per line for streaming ingestion */
export function exportTexturePromptsJSONL(records: TexturePromptRecord[]): string {
  return records.map((r) => JSON.stringify(r)).join('\n');
}

/** Convenience: default batch (5 presets × 8 variants × 5 lighting × 2 tiers = 400 prompts) */
export function generateDefaultTexturePromptDataset(): TexturePromptRecord[] {
  return batchGenerateTexturePrompts({ includeHeroResolution: true });
}
