/** Sample canvas pixels into dot targets for logo morph. */

import {
  computeMainlineBrandLayout,
  computePixelBrandLayout,
  drawMainlineMarkSvgAccurate,
  PIXEL_LOGO_RADIUS,
  setCanvasBrandText,
} from '@/lib/splashBrandLayout';

export type MorphDot = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  hue: number;
  size: number;
  neighbors: number[];
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function subsample<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const out: T[] = [];
  const step = items.length / max;
  for (let i = 0; i < max; i++) {
    out.push(items[Math.floor(i * step)]);
  }
  return out;
}

function assignNeighbors(dots: MorphDot[], k: number): void {
  for (let i = 0; i < dots.length; i++) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < dots.length; j++) {
      if (i === j) continue;
      const dx = dots[i].tx - dots[j].tx;
      const dy = dots[i].ty - dots[j].ty;
      dists.push({ j, d: dx * dx + dy * dy });
    }
    dists.sort((a, b) => a.d - b.d);
    dots[i].neighbors = dists.slice(0, k).map((x) => x.j);
  }
}

function sampleViewportCanvas(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  maxDots: number,
  hueBase: number,
  spawnJitter = 24
): MorphDot[] {
  const data = ctx.getImageData(0, 0, viewW, viewH).data;
  const stride = Math.max(2, Math.floor(Math.sqrt((viewW * viewH) / (maxDots * 2))));

  const raw: { tx: number; ty: number; hue: number }[] = [];

  for (let y = 0; y < viewH; y += stride) {
    for (let x = 0; x < viewW; x += stride) {
      const i = (y * viewW + x) * 4;
      if (data[i + 3] < 140) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r + g + b) / 3;
      const blueLean = b / Math.max(1, r + g + b);
      raw.push({
        tx: x,
        ty: y,
        hue: hueBase + blueLean * 45 + (lum / 255) * 22,
      });
    }
  }

  const picked = subsample(raw, maxDots);

  const dots: MorphDot[] = picked.map((p, idx) => ({
    x: p.tx + (Math.random() - 0.5) * spawnJitter * 0.12,
    y: p.ty + (Math.random() - 0.5) * spawnJitter * 0.12,
    tx: p.tx,
    ty: p.ty,
    hue: p.hue,
    size: 1.65 + (idx % 4) * 0.28,
    neighbors: [],
  }));

  assignNeighbors(dots, 3);
  return dots;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

/** Mainline mark + wordmark + presents — same layout as HTML overlay. */
export function buildMainlineBrandDots(viewW: number, viewH: number, maxDots: number): MorphDot[] {
  if (typeof document === 'undefined' || viewW < 1 || viewH < 1) return [];

  const L = computeMainlineBrandLayout(viewW, viewH);
  const off = document.createElement('canvas');
  off.width = viewW;
  off.height = viewH;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, viewW, viewH);

  drawMainlineMarkSvgAccurate(ctx, L.cx, L.markCy, L.markSize);
  setCanvasBrandText(
    ctx,
    'MAINLINE STUDIOS',
    L.cx,
    L.titleY,
    L.titleFontPx,
    700,
    L.titleLetterSpacingEm,
    '#e8f4ff'
  );
  setCanvasBrandText(
    ctx,
    'PRESENTS',
    L.cx,
    L.presentsY,
    L.presentsFontPx,
    600,
    L.presentsLetterSpacingEm,
    '#7ec8ff'
  );

  return sampleViewportCanvas(ctx, viewW, viewH, maxDots, 198, 14);
}

/** Paint + sample using measured DOM positions (pixel-perfect vs overlay). */
export function buildMainlineBrandDotsFromDom(
  viewW: number,
  viewH: number,
  brandRoot: HTMLElement,
  maxDots: number
): MorphDot[] {
  if (viewW < 1 || viewH < 1) return [];

  const off = document.createElement('canvas');
  off.width = viewW;
  off.height = viewH;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, viewW, viewH);

  const svg = brandRoot.querySelector('svg');
  if (svg) {
    const r = svg.getBoundingClientRect();
    const size = r.width;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    drawMainlineMarkSvgAccurate(ctx, cx, cy, size);
  }

  brandRoot.querySelectorAll<HTMLElement>('[data-splash-text]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const fontPx = parseFloat(style.fontSize) || 16;
    const weight = parseInt(style.fontWeight, 10) || 700;
    const spacingEm = letterSpacingToEm(style.letterSpacing, fontPx);
    const color = style.color || '#fff';
    setCanvasBrandText(ctx, el.textContent?.trim() ?? '', r.left + r.width / 2, r.top + r.height / 2, fontPx, weight, spacingEm, color);
  });

  return sampleViewportCanvas(ctx, viewW, viewH, maxDots, 198, 12);
}

function letterSpacingToEm(letterSpacing: string, fontPx: number): number {
  if (!letterSpacing || letterSpacing === 'normal') return 0;
  if (letterSpacing.endsWith('em')) return parseFloat(letterSpacing);
  if (letterSpacing.endsWith('px')) return parseFloat(letterSpacing) / fontPx;
  return 0;
}

/** @deprecated Use buildMainlineBrandDots */
export const buildMainlineMarkDots = buildMainlineBrandDots;

/** Pixel Place logo + title — same layout as HTML overlay. */
export async function buildPixelPlaceMorphDots(
  viewW: number,
  viewH: number,
  logoSrc: string,
  maxDots: number
): Promise<MorphDot[]> {
  if (typeof document === 'undefined' || viewW < 1 || viewH < 1) return [];

  const img = await loadImage(logoSrc);
  const L = computePixelBrandLayout(viewW, viewH);

  const off = document.createElement('canvas');
  off.width = viewW;
  off.height = viewH;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, viewW, viewH);

  const logoX = L.cx - L.logoSize / 2;
  const logoY = L.logoTop;
  ctx.save();
  roundRectPath(ctx, logoX, logoY, L.logoSize, L.logoSize, L.logoRadius);
  ctx.clip();
  ctx.drawImage(img, logoX, logoY, L.logoSize, L.logoSize);
  ctx.restore();

  setCanvasBrandText(
    ctx,
    'PIXEL PLACE',
    L.cx,
    L.titleY,
    L.titleFontPx,
    700,
    L.titleLetterSpacingEm,
    '#ffffff'
  );

  return sampleViewportCanvas(ctx, viewW, viewH, maxDots, 210, 14);
}

export function buildPixelPlaceMorphDotsFromDom(
  viewW: number,
  viewH: number,
  brandRoot: HTMLElement,
  maxDots: number
): MorphDot[] {
  if (viewW < 1 || viewH < 1) return [];

  const off = document.createElement('canvas');
  off.width = viewW;
  off.height = viewH;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, viewW, viewH);

  const img = brandRoot.querySelector('img');
  if (img) {
    const r = img.getBoundingClientRect();
    const x = r.left;
    const y = r.top;
    const w = r.width;
    const h = r.height;
    const radius = parseFloat(getComputedStyle(img.parentElement ?? img).borderRadius) || PIXEL_LOGO_RADIUS;
    ctx.save();
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  brandRoot.querySelectorAll<HTMLElement>('[data-splash-text]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const fontPx = parseFloat(style.fontSize) || 16;
    const weight = parseInt(style.fontWeight, 10) || 700;
    const spacingEm = letterSpacingToEm(style.letterSpacing, fontPx);
    setCanvasBrandText(ctx, el.textContent?.trim() ?? '', r.left + r.width / 2, r.top + r.height / 2, fontPx, weight, spacingEm, style.color || '#fff');
  });

  return sampleViewportCanvas(ctx, viewW, viewH, maxDots, 210, 12);
}

export function easeMorph(progress: number): number {
  return smoothstep(Math.min(1, Math.max(0, progress)));
}

/** Pixel Place logo fades in over assembled dots (late in assemble phase). */
export function pixelOverlayFade(localT: number): number {
  return easeMorph(Math.max(0, (localT - 0.62) / 0.38));
}

export function brandOverlayFade(localT: number): number {
  return 1 - easeMorph(Math.max(0, (localT - 0.52) / 0.48));
}

export function dotsOpacityUnderOverlay(overlayFade: number): number {
  if (overlayFade < 0.35) return 1;
  return Math.max(0, 1 - (overlayFade - 0.35) / 0.65);
}
