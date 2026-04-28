import type { CosmeticRarity } from './types';
import { parseHex, rgbToCss } from './colorUtils';

export type RarityStyle = {
  stripeExtra: number;
  camoBlobs: number;
  trimStroke: number;
  glowStroke: boolean;
  angularHighlights: boolean;
};

export function getRarityStyle(r: CosmeticRarity): RarityStyle {
  switch (r) {
    case 'common':
      return { stripeExtra: 0, camoBlobs: 8, trimStroke: 0, glowStroke: false, angularHighlights: false };
    case 'rare':
      return { stripeExtra: 1, camoBlobs: 11, trimStroke: 2, glowStroke: false, angularHighlights: false };
    case 'epic':
      return { stripeExtra: 2, camoBlobs: 14, trimStroke: 3, glowStroke: true, angularHighlights: false };
    case 'legendary':
      return { stripeExtra: 2, camoBlobs: 16, trimStroke: 4, glowStroke: true, angularHighlights: true };
    default:
      return { stripeExtra: 0, camoBlobs: 8, trimStroke: 0, glowStroke: false, angularHighlights: false };
  }
}

/** Rarity frame / trim drawn in screen space after base pattern */
export function drawRarityTrim(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rarity: CosmeticRarity,
  accentHex: string
): void {
  const style = getRarityStyle(rarity);
  if (style.trimStroke <= 0) return;

  ctx.save();
  const c = parseHex(accentHex);
  ctx.strokeStyle = rgbToCss(c, rarity === 'legendary' ? 0.95 : 0.75);
  ctx.lineWidth = style.trimStroke;
  if (rarity === 'epic' || rarity === 'legendary') {
    ctx.shadowColor = rgbToCss(c, 0.6);
    ctx.shadowBlur = rarity === 'legendary' ? 14 : 8;
  }
  ctx.strokeRect(style.trimStroke, style.trimStroke, w - style.trimStroke * 2, h - style.trimStroke * 2);
  ctx.restore();
}

export function drawLegendaryFacets(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accentHex: string
): void {
  const c = parseHex(accentHex);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = rgbToCss(c, 0.2);
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.2);
  ctx.lineTo(w * 0.45, h * 0.08);
  ctx.lineTo(w * 0.35, h * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.75, h * 0.65);
  ctx.lineTo(w * 0.92, h * 0.45);
  ctx.lineTo(w * 0.88, h * 0.82);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
