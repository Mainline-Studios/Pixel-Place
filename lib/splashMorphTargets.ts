/** Sample canvas pixels into dot targets for logo morph. */

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

/** Mainline Studios mark (rounded square + inner fill) — no wordmark. */
export function drawMainlineMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  const half = size / 2;
  const x = cx - half;
  const y = cy - half;
  const rx = size * 0.12;

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(x + rx, y);
  ctx.lineTo(x + size - rx, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + rx);
  ctx.lineTo(x + size, y + size - rx);
  ctx.quadraticCurveTo(x + size, y + size, x + size - rx, y + size);
  ctx.lineTo(x + rx, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - rx);
  ctx.lineTo(x, y + rx);
  ctx.quadraticCurveTo(x, y, x + rx, y);
  ctx.closePath();
  ctx.stroke();

  const inset = size * 0.28;
  const ix = x + inset;
  const iy = y + inset;
  const is = size - inset * 2;
  const irx = is * 0.1;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(ix + irx, iy);
  ctx.lineTo(ix + is - irx, iy);
  ctx.quadraticCurveTo(ix + is, iy, ix + is, iy + irx);
  ctx.lineTo(ix + is, iy + is - irx);
  ctx.quadraticCurveTo(ix + is, iy + is, ix + is - irx, iy + is);
  ctx.lineTo(ix + irx, iy + is);
  ctx.quadraticCurveTo(ix, iy + is, ix, iy + is - irx);
  ctx.lineTo(ix, iy + irx);
  ctx.quadraticCurveTo(ix, iy, ix + irx, iy);
  ctx.closePath();
  ctx.fill();
}

function sampleCanvas(
  ctx: CanvasRenderingContext2D,
  offW: number,
  offH: number,
  viewW: number,
  viewH: number,
  maxDots: number,
  hueBase: number,
  spawnJitter = 36
): MorphDot[] {
  const data = ctx.getImageData(0, 0, offW, offH).data;
  const stride = Math.max(2, Math.floor(Math.sqrt((offW * offH) / (maxDots * 2))));
  const raw: { tx: number; ty: number; hue: number }[] = [];
  const ox = viewW / 2 - offW / 2;
  const oy = viewH / 2 - offH / 2;

  for (let y = 0; y < offH; y += stride) {
    for (let x = 0; x < offW; x += stride) {
      const i = (y * offW + x) * 4;
      if (data[i + 3] < 140) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r + g + b) / 3;
      const blueLean = b / Math.max(1, r + g + b);
      raw.push({
        tx: ox + x,
        ty: oy + y,
        hue: hueBase + blueLean * 45 + (lum / 255) * 22,
      });
    }
  }

  const picked = subsample(raw, maxDots);

  const dots: MorphDot[] = picked.map((p, idx) => ({
    x: p.tx + (Math.random() - 0.5) * spawnJitter * 0.15,
    y: p.ty + (Math.random() - 0.5) * spawnJitter * 0.15,
    tx: p.tx,
    ty: p.ty,
    hue: p.hue,
    size: 2.2 + (idx % 4) * 0.35,
    neighbors: [],
  }));

  assignNeighbors(dots, 3);
  return dots;
}

/** Mainline mark + wordmark + presents — dot cover target (blue tones). */
export function buildMainlineBrandDots(viewW: number, viewH: number, maxDots: number): MorphDot[] {
  const scale = Math.min(1, Math.min(viewW, viewH) / 900);
  const markSize = Math.round(Math.min(168, viewW * 0.26) * scale + 64);
  const titleSize = Math.round(Math.min(28, viewW * 0.038) * scale + 12);
  const offW = Math.min(720, Math.round(viewW * 0.82));
  const offH = Math.round(markSize + titleSize * 3.2 + 80);

  const off = document.createElement('canvas');
  off.width = offW;
  off.height = offH;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, offW, offH);

  const markCy = offH * 0.36;
  drawMainlineMarkColored(ctx, offW / 2, markCy, markSize);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${titleSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillStyle = '#e8f4ff';
  ctx.fillText('MAINLINE STUDIOS', offW / 2, markCy + markSize * 0.52 + titleSize * 0.9);
  ctx.font = `600 ${Math.round(titleSize * 0.72)}px system-ui, sans-serif`;
  ctx.fillStyle = '#7ec8ff';
  ctx.fillText('PRESENTS', offW / 2, markCy + markSize * 0.52 + titleSize * 2.1);

  return sampleCanvas(ctx, offW, offH, viewW, viewH, maxDots, 198, 120);
}

function drawMainlineMarkColored(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  const half = size / 2;
  const x = cx - half;
  const y = cy - half;
  const rx = size * 0.12;

  ctx.strokeStyle = '#5eb0f7';
  ctx.lineWidth = Math.max(2, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(x + rx, y);
  ctx.lineTo(x + size - rx, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + rx);
  ctx.lineTo(x + size, y + size - rx);
  ctx.quadraticCurveTo(x + size, y + size, x + size - rx, y + size);
  ctx.lineTo(x + rx, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - rx);
  ctx.lineTo(x, y + rx);
  ctx.quadraticCurveTo(x, y, x + rx, y);
  ctx.closePath();
  ctx.stroke();

  const inset = size * 0.28;
  const ix = x + inset;
  const iy = y + inset;
  const is = size - inset * 2;
  const irx = is * 0.1;
  ctx.fillStyle = '#2b6cb0';
  ctx.beginPath();
  ctx.moveTo(ix + irx, iy);
  ctx.lineTo(ix + is - irx, iy);
  ctx.quadraticCurveTo(ix + is, iy, ix + is, iy + irx);
  ctx.lineTo(ix + is, iy + is - irx);
  ctx.quadraticCurveTo(ix + is, iy + is, ix + is - irx, iy + is);
  ctx.lineTo(ix + irx, iy + is);
  ctx.quadraticCurveTo(ix, iy + is, ix, iy + is - irx);
  ctx.lineTo(ix, iy + irx);
  ctx.quadraticCurveTo(ix, iy, ix + irx, iy);
  ctx.closePath();
  ctx.fill();
}

/** @deprecated Use buildMainlineBrandDots */
export const buildMainlineMarkDots = buildMainlineBrandDots;

/** Pixel Place logo + title — final morph target. */
export async function buildPixelPlaceMorphDots(
  viewW: number,
  viewH: number,
  logoSrc: string,
  maxDots: number
): Promise<MorphDot[]> {
  const img = await loadImage(logoSrc);
  const scale = Math.min(1, Math.min(viewW, viewH) / 900);
  const logoSize = Math.round(Math.min(200, viewW * 0.28) * scale + 80);
  const titleSize = Math.round(Math.min(56, viewW * 0.075) * scale + 18);
  const offW = Math.min(960, Math.round(viewW * 0.92));
  const offH = Math.round(logoSize + titleSize + 100);

  const off = document.createElement('canvas');
  off.width = offW;
  off.height = offH;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, offW, offH);

  const logoX = (offW - logoSize) / 2;
  const logoY = 40;
  ctx.drawImage(img, logoX, logoY, logoSize, logoSize);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${titleSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PIXEL PLACE', offW / 2, logoY + logoSize + 48 + titleSize * 0.5);

  return sampleCanvas(ctx, offW, offH, viewW, viewH, maxDots, 210, 36);
}

export function easeMorph(progress: number): number {
  return smoothstep(Math.min(1, Math.max(0, progress)));
}

/** Pixel Place logo fades in over assembled dots (late in assemble phase). */
export function pixelOverlayFade(localT: number): number {
  return easeMorph(Math.max(0, (localT - 0.62) / 0.38));
}

export function brandOverlayFade(localT: number): number {
  return 1 - easeMorph(Math.max(0, (localT - 0.45) / 0.55));
}

export function dotsOpacityUnderOverlay(overlayFade: number): number {
  if (overlayFade < 0.35) return 1;
  return Math.max(0, 1 - (overlayFade - 0.35) / 0.65);
}
