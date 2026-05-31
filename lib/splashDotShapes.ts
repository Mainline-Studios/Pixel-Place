/** Sample dot targets from simple feature-icon shapes drawn on canvas. */

export type ShapePoint = { tx: number; ty: number; hue: number };

export type FeatureIconDef = {
  id: string;
  label: string;
  hue: number;
  draw: (ctx: CanvasRenderingContext2D, s: number) => void;
};

function subsample<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const out: T[] = [];
  const step = items.length / max;
  for (let i = 0; i < max; i++) out.push(items[Math.floor(i * step)]);
  return out;
}

export function sampleShape(
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  centerX: number,
  centerY: number,
  size: number,
  hue: number,
  maxPoints: number
): ShapePoint[] {
  const off = document.createElement('canvas');
  const s = 128;
  off.width = s;
  off.height = s;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#fff';
  draw(ctx, s);

  const data = ctx.getImageData(0, 0, s, s).data;
  const raw: ShapePoint[] = [];
  const stride = 2;
  const half = size / 2;
  const ox = centerX - half;
  const oy = centerY - half;

  for (let y = 0; y < s; y += stride) {
    for (let x = 0; x < s; x += stride) {
      const i = (y * s + x) * 4;
      if (data[i + 3] < 150) continue;
      raw.push({
        tx: ox + (x / s) * size,
        ty: oy + (y / s) * size,
        hue: hue + ((data[i] + data[i + 1]) / 510) * 20,
      });
    }
  }
  return subsample(raw, maxPoints);
}

function drawGamepad(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s / 2;
  const cy = s / 2;
  ctx.fillStyle = '#fff';
  const rx = 14;
  const x = cx - 44;
  const y = cy - 22;
  const w = 88;
  const h = 44;
  ctx.beginPath();
  ctx.moveTo(x + rx, y);
  ctx.lineTo(x + w - rx, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rx);
  ctx.lineTo(x + w, y + h - rx);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
  ctx.lineTo(x + rx, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rx);
  ctx.lineTo(x, y + rx);
  ctx.quadraticCurveTo(x, y, x + rx, y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 26, cy, 10, 0, Math.PI * 2);
  ctx.arc(cx + 26, cy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 6, cy - 14, 12, 28);
  ctx.fillRect(cx - 14, cy - 6, 28, 12);
}

function drawCoin(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s / 2;
  const cy = s / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 8, cy - 10, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawFriends(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s / 2;
  ctx.beginPath();
  ctx.arc(cx - 18, 46, 14, 0, Math.PI * 2);
  ctx.arc(cx + 18, 46, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 18, 88, 22, Math.PI, 0);
  ctx.arc(cx + 18, 88, 22, Math.PI, 0);
  ctx.fill();
}

function drawCreate(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s / 2;
  const cy = s / 2;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? 42 : 18;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawShop(ctx: CanvasRenderingContext2D, s: number): void {
  const cx = s / 2;
  ctx.fillRect(cx - 36, 52, 72, 48);
  ctx.beginPath();
  ctx.moveTo(cx - 40, 52);
  ctx.lineTo(cx, 28);
  ctx.lineTo(cx + 40, 52);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - 12, 68, 24, 32);
}

export const FEATURE_ICONS: FeatureIconDef[] = [
  { id: 'games', label: 'Games', hue: 205, draw: drawGamepad },
  { id: 'coins', label: 'Pixel-Coins', hue: 48, draw: drawCoin },
  { id: 'friends', label: 'Friends', hue: 285, draw: drawFriends },
  { id: 'create', label: 'Create', hue: 135, draw: drawCreate },
  { id: 'shop', label: 'Shop', hue: 12, draw: drawShop },
];
