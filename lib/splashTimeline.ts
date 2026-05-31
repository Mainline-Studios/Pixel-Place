import {
  brandOverlayFade,
  buildMainlineBrandDots,
  buildPixelPlaceMorphDots,
  dotsOpacityUnderOverlay,
  pixelOverlayFade,
  type MorphDot,
} from '@/lib/splashMorphTargets';
import { FEATURE_ICONS, sampleShape, type ShapePoint } from '@/lib/splashDotShapes';

export type SplashPhase =
  | 'burst'
  | 'cover'
  | 'disperse'
  | 'split'
  | 'multiply'
  | 'icons'
  | 'assemble'
  | 'hold'
  | 'exit';

export type AnimDot = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  hue: number;
  size: number;
  delay: number;
  trail: [number, number][];
};

export type GridPoint = { tx: number; ty: number; hue: number; size: number; delay: number };

export const DURATIONS = {
  burst: 2600,
  cover: 2800,
  disperse: 1300,
  split: 1000,
  multiply: 2000,
  icons: 4600,
  assemble: 5000,
  hold: 1600,
  exit: 850,
} as const;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const iconShapeCache = new Map<string, ShapePoint[]>();

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function easeOutCubic(t: number): number {
  return 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
}

function hashOffset(i: number, scale: number): number {
  return Math.sin(i * 12.9898) * scale;
}

export function timelineOffset(): Record<SplashPhase, number> {
  const D = DURATIONS;
  let t = 0;
  const o = {} as Record<SplashPhase, number>;
  o.burst = t;
  t += D.burst;
  o.cover = t;
  t += D.cover;
  o.disperse = t;
  t += D.disperse;
  o.split = t;
  t += D.split;
  o.multiply = t;
  t += D.multiply;
  o.icons = t;
  t += D.icons;
  o.assemble = t;
  t += D.assemble;
  o.hold = t;
  t += D.hold;
  o.exit = t;
  return o;
}

export function totalDuration(): number {
  const o = timelineOffset();
  return o.exit + DURATIONS.exit;
}

export function resolvePhase(
  elapsed: number
): { phase: SplashPhase; localT: number; iconIndex: number; iconLabel: string } {
  const o = timelineOffset();
  const D = DURATIONS;
  const iconDur = D.icons / FEATURE_ICONS.length;

  if (elapsed < o.cover) {
    return { phase: 'burst', localT: elapsed / D.burst, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.disperse) {
    return { phase: 'cover', localT: (elapsed - o.cover) / D.cover, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.split) {
    return { phase: 'disperse', localT: (elapsed - o.disperse) / D.disperse, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.multiply) {
    return { phase: 'split', localT: (elapsed - o.split) / D.split, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.icons) {
    return { phase: 'multiply', localT: (elapsed - o.multiply) / D.multiply, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.assemble) {
    const iconElapsed = elapsed - o.icons;
    const iconIndex = Math.min(FEATURE_ICONS.length - 1, Math.floor(iconElapsed / iconDur));
    const localT = (iconElapsed - iconIndex * iconDur) / iconDur;
    return {
      phase: 'icons',
      localT,
      iconIndex,
      iconLabel: FEATURE_ICONS[iconIndex]?.label ?? '',
    };
  }
  if (elapsed < o.hold) {
    return { phase: 'assemble', localT: (elapsed - o.assemble) / D.assemble, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.exit) {
    return { phase: 'hold', localT: (elapsed - o.hold) / D.hold, iconIndex: 0, iconLabel: '' };
  }
  return { phase: 'exit', localT: (elapsed - o.exit) / D.exit, iconIndex: 0, iconLabel: '' };
}

function pushTrail(dot: AnimDot): void {
  dot.trail.push([dot.x, dot.y]);
  if (dot.trail.length > 4) dot.trail.shift();
}

function lerpDots(dots: AnimDot[], factor: number): void {
  for (const d of dots) {
    d.x += (d.tx - d.x) * factor;
    d.y += (d.ty - d.y) * factor;
    pushTrail(d);
  }
}

function getIconPoints(
  iconIndex: number,
  cx: number,
  cy: number,
  iconSize: number,
  count: number
): ShapePoint[] {
  const icon = FEATURE_ICONS[iconIndex];
  if (!icon) return [];
  const key = `${icon.id}-${Math.round(iconSize)}-${count}`;
  let pts = iconShapeCache.get(key);
  if (!pts) {
    pts = sampleShape(icon.draw, cx, cy - 8, iconSize, icon.hue, count);
    iconShapeCache.set(key, pts);
  }
  return pts;
}

function blendTargets(
  dots: AnimDot[],
  from: ShapePoint[],
  to: ShapePoint[],
  blend: number,
  cx: number,
  cy: number
): void {
  const n = dots.length;
  const fm = from.length || 1;
  const tm = to.length || 1;
  for (let i = 0; i < n; i++) {
    const f = from[i % fm];
    const t = to[i % tm];
    if (f && t) {
      dots[i].tx = f.tx + (t.tx - f.tx) * blend;
      dots[i].ty = f.ty + (t.ty - f.ty) * blend;
      dots[i].hue += (t.hue - dots[i].hue) * 0.2;
    } else {
      dots[i].tx = cx;
      dots[i].ty = cy;
    }
  }
}

export function resizeDotPool(dots: AnimDot[], count: number, cx: number, cy: number, baseHue: number): AnimDot[] {
  while (dots.length < count) {
    dots.push({
      x: cx + hashOffset(dots.length, 8),
      y: cy + hashOffset(dots.length + 1, 8),
      tx: cx,
      ty: cy,
      hue: baseHue + (dots.length % 12) * 8,
      size: 2.4 + (dots.length % 3) * 0.35,
      delay: 0,
      trail: [],
    });
  }
  if (dots.length > count) dots.length = count;
  return dots;
}

/** HTML-style opening: all dots spawn at center, expand into a staggered grid. */
export function buildBurstGrid(width: number, height: number, centerY?: number): GridPoint[] {
  const cols = 12;
  const rows = 9;
  const gapX = Math.min(72, (width * 0.72) / cols);
  const gapY = Math.min(58, (height * 0.55) / rows);
  const gridW = (cols - 1) * gapX;
  const gridH = (rows - 1) * gapY;
  const ox = width / 2 - gridW / 2;
  const cy = centerY ?? height / 2;
  const oy = cy - gridH / 2;
  const points: GridPoint[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      points.push({
        tx: ox + col * gapX,
        ty: oy + row * gapY,
        hue: 195 + (i % 7) * 18 + (row / rows) * 40,
        size: 3 + (i % 3) * 0.45,
        delay: (col / cols) * 0.35 + (row / rows) * 0.25,
      });
    }
  }
  return points;
}

function initBurstDots(dots: AnimDot[], grid: GridPoint[], cx: number, cy: number): void {
  resizeDotPool(dots, grid.length, cx, cy, 200);
  for (let i = 0; i < grid.length; i++) {
    const g = grid[i];
    dots[i].x = cx + (Math.random() - 0.5) * 18;
    dots[i].y = cy + (Math.random() - 0.5) * 18;
    dots[i].tx = g.tx;
    dots[i].ty = g.ty;
    dots[i].hue = g.hue;
    dots[i].size = g.size;
    dots[i].delay = g.delay;
    dots[i].trail = [];
  }
}

export function updateDotsForPhase(
  dots: AnimDot[],
  phase: SplashPhase,
  localT: number,
  iconIndex: number,
  width: number,
  height: number,
  mainlineTargets: MorphDot[] | null,
  pixelTargets: MorphDot[] | null,
  time: number,
  prevIconIndex: number,
  prevIconPoints: ShapePoint[],
  burstGrid: GridPoint[] | null
): {
  pixelReveal: number;
  brandOverlay: number;
  iconPoints: ShapePoint[];
  dotAlpha: number;
} {
  const cx = width / 2;
  const cy = height / 2;
  const iconSize = Math.min(130, width * 0.24);
  let pixelReveal = 0;
  let brandOverlay = 0;
  let dotAlpha = 1;
  let iconPoints: ShapePoint[] = prevIconPoints;

  if (phase === 'burst' && burstGrid?.length) {
    const globalEase = smoothstep(localT);
    if (dots.length !== burstGrid.length) {
      initBurstDots(dots, burstGrid, cx, cy);
    }

    for (let i = 0; i < dots.length; i++) {
      const g = burstGrid[i];
      const delay = g.delay;
      const t = Math.max(0, Math.min(1, (globalEase - delay) / Math.max(0.08, 1 - delay * 0.85)));
      const ease = smoothstep(t);
      dots[i].tx = g.tx;
      dots[i].ty = g.ty;
      dots[i].hue = g.hue;
      dots[i].size = g.size;
      dots[i].x += (dots[i].tx - dots[i].x) * (0.06 + ease * 0.05);
      dots[i].y += (dots[i].ty - dots[i].y) * (0.06 + ease * 0.05);
      pushTrail(dots[i]);
    }

    brandOverlay = smoothstep(Math.max(0, (localT - 0.78) / 0.22));
    dotAlpha = 1;
    return { pixelReveal: 0, brandOverlay, iconPoints, dotAlpha };
  }

  if (phase === 'cover' && mainlineTargets?.length) {
    const t = easeOutCubic(localT);
    const count = mainlineTargets.length;
    const grid = burstGrid ?? [];
    resizeDotPool(dots, count, cx, cy, 210);
    brandOverlay = brandOverlayFade(localT);
    dotAlpha = 0.65 + t * 0.35;

    for (let i = 0; i < count; i++) {
      const m = mainlineTargets[i];
      const g = grid[i % Math.max(1, grid.length)];
      if (g && t < 0.35) {
        dots[i].tx = g.tx + (m.tx - g.tx) * smoothstep(t / 0.35);
        dots[i].ty = g.ty + (m.ty - g.ty) * smoothstep(t / 0.35);
        dots[i].hue = g.hue + (m.hue - g.hue) * t;
      } else {
        dots[i].tx = m.tx;
        dots[i].ty = m.ty;
        dots[i].hue = m.hue;
      }
      dots[i].size = m.size * (0.72 + t * 0.28);
      if (t < 0.12) {
        const angle = i * GOLDEN;
        const spawn = 40 + hashOffset(i, 24);
        dots[i].x += (m.tx + Math.cos(angle) * spawn - dots[i].x) * 0.15;
        dots[i].y += (m.ty + Math.sin(angle) * spawn - dots[i].y) * 0.15;
      }
    }
    lerpDots(dots, 0.1 + t * 0.16);
    return { pixelReveal: 0, brandOverlay, iconPoints, dotAlpha };
  }

  if (phase === 'disperse' && mainlineTargets?.length) {
    const t = easeOutCubic(localT);
    const count = mainlineTargets.length;
    resizeDotPool(dots, count, cx, cy, 210);
    const maxR = Math.min(width, height) * 0.42;
    brandOverlay = 0;
    for (let i = 0; i < count; i++) {
      const home = mainlineTargets[i];
      const angle = i * GOLDEN + time * 0.0025;
      const r = t * maxR * (0.45 + (i % 9) / 14);
      dots[i].tx = home.tx + Math.cos(angle) * r;
      dots[i].ty = home.ty + Math.sin(angle) * r * 0.86;
      dots[i].hue = home.hue + t * 35;
      dots[i].size = home.size * (1 + t * 0.45);
      if (t < 0.06) {
        dots[i].x = home.tx;
        dots[i].y = home.ty;
      }
    }
    lerpDots(dots, 0.07 + t * 0.12);
    return { pixelReveal: 0, brandOverlay: 0, iconPoints, dotAlpha: 1 };
  }

  if (phase === 'split') {
    const t = easeOutCubic(localT);
    const count = Math.max(8, Math.round(8 + t * 24));
    resizeDotPool(dots, count, cx, cy, 220);
    const r = 32 + t * 40;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      dots[i].tx = cx + Math.cos(a) * r;
      dots[i].ty = cy + Math.sin(a) * r;
      dots[i].hue = 205 + i * 14;
      dots[i].size = 3 + (i % 2) * 0.7;
    }
    lerpDots(dots, 0.11 + t * 0.04);
    return { pixelReveal: 0, brandOverlay: 0, iconPoints, dotAlpha: 1 };
  }

  if (phase === 'multiply') {
    const t = easeOutCubic(localT);
    const count = Math.round(12 + t * 118);
    resizeDotPool(dots, count, cx, cy, 198);
    const maxR = Math.min(width, height) * 0.36;
    for (let i = 0; i < count; i++) {
      const swirl = time * 0.0018 + i * GOLDEN;
      const r = 14 + t * maxR * (0.4 + (i % 9) / 14);
      dots[i].tx = cx + Math.cos(swirl) * r;
      dots[i].ty = cy + Math.sin(swirl) * r * 0.88;
      dots[i].hue = 192 + (i % 14) * 12 + t * 45;
      dots[i].size = 2 + (i % 5) * 0.35;
    }
    lerpDots(dots, 0.06 + t * 0.06);
    return { pixelReveal: 0, brandOverlay: 0, iconPoints, dotAlpha: 1 };
  }

  if (phase === 'icons') {
    const enter = easeOutCubic(Math.min(1, localT * 3));
    const exit = easeOutCubic(Math.min(1, (1 - localT) * 3));
    const hold = Math.min(enter, exit);
    const count = 160;
    resizeDotPool(dots, count, cx, cy, FEATURE_ICONS[iconIndex]?.hue ?? 200);
    iconPoints = getIconPoints(iconIndex, cx, cy - height * 0.03, iconSize, count);

    if (prevIconIndex >= 0 && prevIconPoints.length > 0 && localT < 0.28) {
      blendTargets(dots, prevIconPoints, iconPoints, smoothstep(localT / 0.28), cx, cy);
    } else {
      for (let i = 0; i < count; i++) {
        const p = iconPoints[i % iconPoints.length];
        if (!p) continue;
        const scatter = (1 - hold) * 22;
        dots[i].tx = p.tx + hashOffset(i, scatter);
        dots[i].ty = p.ty + hashOffset(i + 7, scatter);
        dots[i].hue += (p.hue - dots[i].hue) * 0.25;
      }
    }
    lerpDots(dots, 0.09 + hold * 0.05);
    return { pixelReveal: 0, brandOverlay: 0, iconPoints, dotAlpha: 1 };
  }

  if (phase === 'assemble') {
    const t = easeOutCubic(localT);
    pixelReveal = pixelOverlayFade(localT);
    dotAlpha = dotsOpacityUnderOverlay(pixelReveal);

    if (pixelTargets && pixelTargets.length > 0) {
      const count = pixelTargets.length;
      resizeDotPool(dots, count, cx, cy, 215);
      for (let i = 0; i < count; i++) {
        const pt = pixelTargets[i];
        if (t < 0.08) {
          const angle = i * GOLDEN + time * 0.002;
          const r = 80 + hashOffset(i, 30);
          dots[i].x = cx + Math.cos(angle) * r;
          dots[i].y = cy + Math.sin(angle) * r * 0.85;
        }
        dots[i].tx = pt.tx;
        dots[i].ty = pt.ty;
        dots[i].hue = pt.hue;
        dots[i].size = pt.size * (0.9 + t * 0.15);
      }
      lerpDots(dots, 0.05 + t * 0.11);
    }
    return { pixelReveal, brandOverlay: 0, iconPoints, dotAlpha };
  }

  return { pixelReveal: 0, brandOverlay: 0, iconPoints, dotAlpha: 1 };
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
  const cx = width / 2;
  const cy = height / 2;

  const bg = ctx.createRadialGradient(cx, cy * 0.9, 0, cx, cy, Math.max(width, height) * 0.75);
  bg.addColorStop(0, '#12182a');
  bg.addColorStop(0.45, '#0a0d14');
  bg.addColorStop(1, '#040508');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const pulse = 0.32 + Math.sin(time * 0.0025) * 0.12;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.48);
  grad.addColorStop(0, `rgba(55, 130, 220, ${0.24 * pulse})`);
  grad.addColorStop(0.4, 'rgba(43, 108, 176, 0.06)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let i = 0; i < 48; i++) {
    const sx = (Math.sin(i * 4.1 + time * 0.0004) * 0.5 + 0.5) * width;
    const sy = (Math.cos(i * 3.7 + time * 0.0003) * 0.5 + 0.5) * height;
    const r = 0.6 + (i % 3) * 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const vig = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.2, cx, cy, Math.max(width, height) * 0.65);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}

export function drawSplashFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dots: AnimDot[],
  phase: SplashPhase,
  time: number,
  pixelReveal: number,
  iconLabel: string,
  captionAlpha: number,
  dotAlpha: number
): void {
  drawBackground(ctx, width, height, time);

  const cx = width / 2;
  const cy = height / 2;
  const showTrails =
    phase === 'burst' || phase === 'multiply' || phase === 'split' || phase === 'disperse' || phase === 'cover';
  const lineCap =
    phase === 'burst' || phase === 'cover' ? dots.length : dots.length > 100 ? 80 : dots.length;

  if (showTrails) {
    for (let i = 0; i < Math.min(lineCap, dots.length); i++) {
      const dot = dots[i];
      if (dot.trail.length < 2) continue;
      ctx.strokeStyle = `hsla(${dot.hue}, 90%, 60%, ${0.12 * dotAlpha})`;
      ctx.lineWidth = dot.size * 0.8;
      ctx.beginPath();
      ctx.moveTo(dot.trail[0][0], dot.trail[0][1]);
      for (let k = 1; k < dot.trail.length; k++) {
        ctx.lineTo(dot.trail[k][0], dot.trail[k][1]);
      }
      ctx.stroke();
    }
  }

  const lineAlpha =
    phase === 'assemble'
      ? dotAlpha * 0.38
      : phase === 'burst'
        ? 0.38 * dotAlpha
      : phase === 'icons'
        ? 0.32
        : phase === 'multiply'
          ? 0.22
          : phase === 'cover'
            ? 0.45
            : 0.14;

  const lineDist = phase === 'burst' ? 95 : 50;

  if (lineAlpha > 0.02 && dots.length > 1 && (phase === 'burst' || phase === 'cover' || dots.length <= 220)) {
    ctx.lineWidth = phase === 'burst' ? 1.2 : 1;
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      for (let j = i + 1; j < Math.min(i + 4, dots.length); j++) {
        const b = dots[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > lineDist) continue;
        const alpha = (1 - d / lineDist) * lineAlpha;
        ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 88%, 64%, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  if (dotAlpha > 0.02) {
    ctx.globalCompositeOperation = 'lighter';
    for (const dot of dots) {
      const glowR = dot.size * (phase === 'burst' || phase === 'cover' || phase === 'assemble' ? 4.5 : 4);
      const glow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, glowR);
      glow.addColorStop(0, `hsla(${dot.hue}, 100%, 78%, ${0.9 * dotAlpha})`);
      glow.addColorStop(0.35, `hsla(${dot.hue}, 95%, 55%, ${0.35 * dotAlpha})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${dot.hue}, 100%, 88%, ${dotAlpha})`;
      ctx.fill();
      if (phase === 'burst' || phase === 'cover') {
        ctx.strokeStyle = `rgba(255,255,255,${0.75 * dotAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  if (phase === 'burst' && dotAlpha > 0.4) {
    const pulse = 0.35 + Math.sin(time * 0.004) * 0.15;
    ctx.strokeStyle = `rgba(100, 181, 246, ${pulse * dotAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 36 + pulse * 28, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (iconLabel && captionAlpha > 0.05) {
    ctx.font = `600 ${Math.round(15)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255,255,255,${0.85 * captionAlpha})`;
    ctx.fillText(iconLabel.toUpperCase(), cx, cy + height * 0.2);
  }
}

export function loadMainlineTargets(width: number, height: number, maxDots: number): MorphDot[] {
  return buildMainlineBrandDots(width, height, maxDots);
}

export async function loadPixelPlaceTargets(
  width: number,
  height: number,
  maxDots: number
): Promise<MorphDot[]> {
  return buildPixelPlaceMorphDots(width, height, '/logo.png', maxDots);
}
