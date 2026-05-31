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

/** Draw Mainline Studios mark (rounded square + inner fill) for dot sampling. */
function drawMainlineMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
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
  hueBase: number
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
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      raw.push({
        tx: ox + x,
        ty: oy + y,
        hue: hueBase + (lum / 255) * 28 + (x / offW) * 18,
      });
    }
  }

  const picked = subsample(raw, maxDots);
  const cx = viewW / 2;
  const cy = viewH / 2;

  const dots: MorphDot[] = picked.map((p, idx) => ({
    x: cx + (Math.random() - 0.5) * 36,
    y: cy + (Math.random() - 0.5) * 36,
    tx: p.tx,
    ty: p.ty,
    hue: p.hue,
    size: 2.2 + (idx % 4) * 0.35,
    neighbors: [],
  }));

  assignNeighbors(dots, 3);
  return dots;
}

/** Dots settle into the Mainline Studios logo + wordmark. */
export function buildMainlineMorphDots(viewW: number, viewH: number, maxDots: number): MorphDot[] {
  const scale = Math.min(1, Math.min(viewW, viewH) / 900);
  const markSize = Math.round(Math.min(200, viewW * 0.32) * scale + 72);
  const titleSize = Math.round(Math.min(36, viewW * 0.048) * scale + 14);
  const offW = Math.min(920, Math.round(viewW * 0.9));
  const offH = Math.round(markSize + titleSize + 100);

  const off = document.createElement('canvas');
  off.width = offW;
  off.height = offH;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, offW, offH);

  const markY = offH * 0.38;
  drawMainlineMark(ctx, offW / 2, markY, markSize);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${titleSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MAINLINE', offW / 2, markY + markSize * 0.52 + titleSize * 0.55);
  ctx.fillText('STUDIOS', offW / 2, markY + markSize * 0.52 + titleSize * 1.55);

  return sampleCanvas(ctx, offW, offH, viewW, viewH, maxDots, 205);
}

export function easeMorph(progress: number): number {
  return smoothstep(Math.min(1, Math.max(0, progress)));
}

/** Overlay sharpens only after dots have settled (late in logo phase). */
export function logoSharpenProgress(localT: number): number {
  return easeMorph(Math.max(0, (localT - 0.78) / 0.22));
}

/** Dots stay visible until the mark is formed, then gently dissolve into the SVG. */
export function logoDotFade(sharpen: number): number {
  if (sharpen < 0.35) return 1;
  return Math.max(0, 1 - (sharpen - 0.35) / 0.65);
}
