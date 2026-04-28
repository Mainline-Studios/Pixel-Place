import { darken, lighten, lerpRgb, parseHex, rgbToCss, type Rgb } from './colorUtils';
import { getRarityStyle } from './rarity';
import type { CosmeticGarmentCategory, CosmeticTextureOptions } from './types';

function defaultStripeAngle(category: CosmeticGarmentCategory): number {
  if (category === 'shoes') return Math.PI / 2;
  if (category === 'pants') return 0.08;
  return 0;
}

function defaultGradientStyle(
  category: CosmeticGarmentCategory,
  explicit?: 'linear' | 'radial'
): 'linear' | 'radial' {
  if (explicit) return explicit;
  if (category === 'hat') return 'radial';
  return 'linear';
}

export function drawCosmeticPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options: CosmeticTextureOptions,
  rand: () => number
): void {
  const { category, pattern, colors, rarity = 'common' } = options;
  const p = parseHex(colors.primary);
  const s = parseHex(colors.secondary);
  const accent = colors.accent ? parseHex(colors.accent) : lighten(s, 0.15);
  const style = getRarityStyle(rarity);

  if (pattern === 'solid') {
    ctx.fillStyle = rgbToCss(p);
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (pattern === 'gradient') {
    const gStyle = defaultGradientStyle(category, options.gradientStyle);
    if (gStyle === 'radial') {
      const g = ctx.createRadialGradient(w * 0.5, h * 0.35, w * 0.05, w * 0.5, h * 0.55, w * 0.65);
      g.addColorStop(0, rgbToCss(lighten(p, 0.18)));
      g.addColorStop(0.45, rgbToCss(lerpRgb(p, s, 0.5)));
      g.addColorStop(1, rgbToCss(darken(s, 0.22)));
      ctx.fillStyle = g;
    } else {
      const gx = category === 'pants' ? 0 : w * 0.15;
      const g = ctx.createLinearGradient(gx, 0, gx + w * 0.7, h);
      g.addColorStop(0, rgbToCss(lighten(p, 0.12)));
      g.addColorStop(0.55, rgbToCss(lerpRgb(p, s, 0.45)));
      g.addColorStop(1, rgbToCss(darken(s, 0.18)));
      ctx.fillStyle = g;
    }
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (pattern === 'stripes') {
    ctx.fillStyle = rgbToCss(p);
    ctx.fillRect(0, 0, w, h);

    const angle = options.stripeAngle ?? defaultStripeAngle(category);
    const bands = 6 + style.stripeExtra * 2 + (category === 'skin' ? 2 : 0);
    const thick = (w + h) / bands / (category === 'skin' ? 3.2 : 2.2);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);
    ctx.translate(-w / 2, -h / 2);

    for (let i = -4; i < bands + 4; i++) {
      const t = i / bands;
      const c = i % 2 === 0 ? p : s;
      const c2 = i % 2 === 0 ? s : p;
      const useC = category === 'skin' ? lerpRgb(c, c2, 0.35 + t * 0.15) : c;
      ctx.fillStyle = rgbToCss(useC);
      const x = -w + i * thick * 2;
      ctx.fillRect(x, -h, thick * 2, 3 * h);
    }

    if (style.stripeExtra > 0 && colors.accent) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = rgbToCss(accent);
      const thin = Math.max(2, thick * 0.12);
      for (let i = -2; i < bands + 2; i++) {
        if (i % 3 !== 0) continue;
        const x = -w + i * thick * 2 + thick * 0.65;
        ctx.fillRect(x, -h, thin, 3 * h);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
    return;
  }

  if (pattern === 'camo') {
    ctx.fillStyle = rgbToCss(lerpRgb(p, s, 0.15));
    ctx.fillRect(0, 0, w, h);

    const blobs = style.camoBlobs + (category === 'hat' ? 2 : 0);
    const palette: Rgb[] = [p, s, accent, lerpRgb(p, s, 0.35), darken(p, 0.15), lighten(s, 0.06)];

    for (let i = 0; i < blobs; i++) {
      const cx = rand() * w;
      const cy = rand() * h;
      const rx = (0.1 + rand() * 0.18) * w;
      const ry = (0.09 + rand() * 0.16) * h;
      const rot = rand() * Math.PI;
      const col = palette[i % palette.length];

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = rgbToCss(col);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
