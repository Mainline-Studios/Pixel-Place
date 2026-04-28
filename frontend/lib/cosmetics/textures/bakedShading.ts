import { rgbToCss, type Rgb } from './colorUtils';
import type { CosmeticGarmentCategory } from './types';

/**
 * Stylized “Fortnite-ish” baked lighting: soft top-left key, ambient occlusion toward bottom/edges.
 * Flat vector shapes only — no photographic grain.
 */
export function applyStylizedBakedShading(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  category: CosmeticGarmentCategory,
  primaryTint: Rgb
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';

  const grd = ctx.createLinearGradient(0, 0, w * 0.85, h * 0.95);
  const deep = rgbToCss({ r: 210, g: 210, b: 220 }, 0.35);
  const mid = rgbToCss({ r: 245, g: 245, b: 250 }, 0.12);
  grd.addColorStop(0, rgbToCss(primaryTint, 0.08));
  grd.addColorStop(0.45, mid);
  grd.addColorStop(1, deep);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'soft-light';
  const hi = ctx.createRadialGradient(w * 0.22, h * 0.18, 0, w * 0.22, h * 0.18, w * 0.55);
  hi.addColorStop(0, 'rgba(255,255,255,0.22)');
  hi.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  hi.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hi;
  ctx.fillRect(0, 0, w, h);

  if (category === 'hat') {
    ctx.globalCompositeOperation = 'multiply';
    const crown = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.5, w * 0.7);
    crown.addColorStop(0, 'rgba(255,255,255,0.15)');
    crown.addColorStop(1, 'rgba(60,60,80,0.25)');
    ctx.fillStyle = crown;
    ctx.fillRect(0, 0, w, h);
  }

  if (category === 'shoes') {
    ctx.globalCompositeOperation = 'multiply';
    const toe = ctx.createLinearGradient(0, h * 0.55, 0, h);
    toe.addColorStop(0, 'rgba(255,255,255,0)');
    toe.addColorStop(1, 'rgba(40,40,55,0.35)');
    ctx.fillStyle = toe;
    ctx.fillRect(0, 0, w, h);
  }

  if (category === 'skin') {
    ctx.globalCompositeOperation = 'soft-light';
    const cheek = ctx.createRadialGradient(w * 0.72, h * 0.42, 0, w * 0.72, h * 0.42, w * 0.22);
    cheek.addColorStop(0, 'rgba(255,160,150,0.18)');
    cheek.addColorStop(1, 'rgba(255,160,150,0)');
    ctx.fillStyle = cheek;
    ctx.fillRect(0, 0, w, h);
    const cheekL = ctx.createRadialGradient(w * 0.28, h * 0.42, 0, w * 0.28, h * 0.42, w * 0.2);
    cheekL.addColorStop(0, 'rgba(255,170,155,0.15)');
    cheekL.addColorStop(1, 'rgba(255,170,155,0)');
    ctx.fillStyle = cheekL;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}
