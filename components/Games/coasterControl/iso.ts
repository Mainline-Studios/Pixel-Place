import { MAP_H, MAP_W } from './catalog';

/** RCT-style 2:1 isometric tile (pixel art). */
export const TW = 32;
export const TH = 16;

const ORIGIN_X = MAP_H * (TW / 2);
const ORIGIN_Y = 48;

export function tileToScreen(tx: number, ty: number, height = 0): { x: number; y: number } {
  return {
    x: ORIGIN_X + (tx - ty) * (TW / 2),
    y: ORIGIN_Y + (tx + ty) * (TH / 2) - height * 8,
  };
}

/** Inverse of tileToScreen — picks the diamond tile under a canvas pixel. */
export function screenToTile(px: number, py: number): { x: number; y: number } | null {
  const lx = px - ORIGIN_X;
  const ly = py - ORIGIN_Y;
  const fx = (lx / (TW / 2) + ly / (TH / 2)) / 2;
  const fy = (ly / (TH / 2) - lx / (TW / 2)) / 2;

  let best: { x: number; y: number } | null = null;
  let bestDist = Infinity;

  const candidates = [
    { x: Math.floor(fx), y: Math.floor(fy) },
    { x: Math.ceil(fx), y: Math.floor(fy) },
    { x: Math.floor(fx), y: Math.ceil(fy) },
    { x: Math.ceil(fx), y: Math.ceil(fy) },
    { x: Math.round(fx), y: Math.round(fy) },
  ];

  for (const c of candidates) {
    if (c.x < 0 || c.y < 0 || c.x >= MAP_W || c.y >= MAP_H) continue;
    const center = tileToScreen(c.x, c.y);
    const dx = Math.abs(px - center.x) / (TW / 2);
    const dy = Math.abs(py - center.y) / (TH / 2);
    const dist = dx + dy;
    if (dist <= 1.05 && dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }

  if (best) return best;

  const x = Math.round(fx);
  const y = Math.round(fy);
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return null;
  return { x, y };
}

export function canvasSize(): { width: number; height: number } {
  const w = Math.ceil((MAP_W + MAP_H) * (TW / 2) + TW);
  const h = Math.ceil((MAP_W + MAP_H) * (TH / 2) + TH * 6 + 80);
  return { width: w, height: h };
}

/** Center the park in the viewport (call after layout knows viewport size). */
export function defaultCamera(viewportW: number, viewportH: number): { x: number; y: number } {
  const { width, height } = canvasSize();
  const parkCenterX = ORIGIN_X;
  const parkCenterY = ORIGIN_Y + ((MAP_W + MAP_H) * TH) / 4;
  return {
    x: Math.max(0, Math.min(width - viewportW, parkCenterX - viewportW / 2)),
    y: Math.max(0, Math.min(height - viewportH, parkCenterY - viewportH / 2)),
  };
}

export function diamondPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w = TW,
  h = TH
): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
}
