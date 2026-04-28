import { TEXTURE_STANDARD_SIZE } from '@/lib/textures/constants';
import { applyStylizedBakedShading } from './bakedShading';
import { parseHex, seededRandom } from './colorUtils';
import { drawCosmeticPattern } from './patterns';
import { drawLegendaryFacets, drawRarityTrim, getRarityStyle } from './rarity';
import type { CosmeticGarmentCategory, CosmeticTextureOptions, CosmeticTextureResult } from './types';

function requireBrowserCanvas(): void {
  if (typeof document === 'undefined') {
    throw new Error(
      'createCosmeticTextureCanvas requires a browser (HTMLCanvasElement). Call from a client component or use a headless canvas in Node.'
    );
  }
}

/**
 * Paints game-ready albedo data: stylized pattern, optional legendary facets, baked shading, rarity trim.
 * Safe for `BoxGeometry` UVs (full 0–1 per face); patterns tile without photorealistic noise.
 */
export function renderCosmeticTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: CosmeticTextureOptions
): void {
  const rarity = options.rarity ?? 'common';
  const seed = options.seed ?? `${options.category}-${options.pattern}-${rarity}-${options.colors.primary}`;
  const rand = seededRandom(seed);

  drawCosmeticPattern(ctx, width, height, options, rand);

  const style = getRarityStyle(rarity);
  if (style.angularHighlights && options.colors.accent) {
    drawLegendaryFacets(ctx, width, height, options.colors.accent);
  }

  applyStylizedBakedShading(ctx, width, height, options.category, parseHex(options.colors.primary));

  const trimColor = options.colors.accent ?? options.colors.secondary;
  drawRarityTrim(ctx, width, height, rarity, trimColor);
}

export function createCosmeticTextureCanvas(options: CosmeticTextureOptions): CosmeticTextureResult {
  requireBrowserCanvas();
  const size = options.size ?? TEXTURE_STANDARD_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  renderCosmeticTexture(ctx, size, size, options);
  return {
    canvas,
    width: size,
    height: size,
    category: options.category,
    rarity: options.rarity ?? 'common',
  };
}

const DEFAULT_GARMENTS: CosmeticGarmentCategory[] = ['shirt', 'pants', 'hat', 'shoes', 'skin'];

/**
 * Batch-generate matching garment textures (same pattern/rarity/colors, per-category layout tweaks).
 */
export function createCosmeticTextureSet(
  base: Omit<CosmeticTextureOptions, 'category'>,
  categories: CosmeticGarmentCategory[] = DEFAULT_GARMENTS
): CosmeticTextureResult[] {
  return categories.map((category) =>
    createCosmeticTextureCanvas({ ...base, category } as CosmeticTextureOptions)
  );
}
