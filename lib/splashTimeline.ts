import {
  buildMainlineMorphDots,
  logoDotFade,
  logoSharpenProgress,
  type MorphDot,
} from '@/lib/splashMorphTargets';
import { FEATURE_ICONS, sampleShape, type ShapePoint } from '@/lib/splashDotShapes';

export type SplashPhase =
  | 'presents'
  | 'singleton'
  | 'split'
  | 'multiply'
  | 'icons'
  | 'logo'
  | 'hold'
  | 'exit';

export type AnimDot = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  hue: number;
  size: number;
  trail: [number, number][];
};

export const DURATIONS_FULL = {
  presents: 2400,
  singleton: 900,
  split: 1100,
  multiply: 2000,
  icons: 5000,
  logo: 4800,
  hold: 1800,
  exit: 900,
} as const;

export const DURATIONS_QUICK = {
  presents: 0,
  singleton: 450,
  split: 550,
  multiply: 800,
  icons: 1600,
  logo: 1800,
  hold: 700,
  exit: 550,
} as const;

function getDurations(firstOpen: boolean) {
  return firstOpen ? DURATIONS_FULL : DURATIONS_QUICK;
}

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

export function timelineOffset(firstOpen: boolean): Record<SplashPhase, number> {
  const D = getDurations(firstOpen);
  let t = 0;
  const o = {} as Record<SplashPhase, number>;
  if (firstOpen) {
    o.presents = t;
    t += D.presents;
  } else {
    o.presents = -1;
  }
  o.singleton = t;
  t += D.singleton;
  o.split = t;
  t += D.split;
  o.multiply = t;
  t += D.multiply;
  o.icons = t;
  t += D.icons;
  o.logo = t;
  t += D.logo;
  o.hold = t;
  t += D.hold;
  o.exit = t;
  return o;
}

export function totalDuration(firstOpen: boolean): number {
  const D = getDurations(firstOpen);
  const o = timelineOffset(firstOpen);
  return o.exit + D.exit;
}

export function resolvePhase(
  elapsed: number,
  firstOpen: boolean
): { phase: SplashPhase; localT: number; iconIndex: number; iconLabel: string } {
  const o = timelineOffset(firstOpen);
  const D = getDurations(firstOpen);
  const iconDur = D.icons / FEATURE_ICONS.length;

  if (firstOpen && elapsed < o.singleton) {
    return { phase: 'presents', localT: elapsed / D.presents, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.split) {
    return { phase: 'singleton', localT: (elapsed - o.singleton) / D.singleton, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.multiply) {
    return { phase: 'split', localT: (elapsed - o.split) / D.split, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.icons) {
    return { phase: 'multiply', localT: (elapsed - o.multiply) / D.multiply, iconIndex: 0, iconLabel: '' };
  }
  if (elapsed < o.logo) {
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
    return { phase: 'logo', localT: (elapsed - o.logo) / D.logo, iconIndex: 0, iconLabel: '' };
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
      trail: [],
    });
  }
  if (dots.length > count) dots.length = count;
  return dots;
}

export function updateDotsForPhase(
  dots: AnimDot[],
  phase: SplashPhase,
  localT: number,
  iconIndex: number,
  width: number,
  height: number,
  logoTargets: MorphDot[] | null,
  time: number,
  prevIconIndex: number,
  prevIconPoints: ShapePoint[]
): { reveal: number; iconPoints: ShapePoint[] } {
  const cx = width / 2;
  const cy = height / 2;
  const iconSize = Math.min(130, width * 0.24);
  let reveal = 0;
  let iconPoints: ShapePoint[] = prevIconPoints;

  if (phase === 'singleton') {
    const t = easeOutCubic(localT);
    resizeDotPool(dots, 1, cx, cy, 215);
    const pulse = 1 + Math.sin(time * 0.008) * 0.08;
    dots[0].tx = cx;
    dots[0].ty = cy;
    dots[0].hue = 210 + t * 50;
    dots[0].size = (6 + t * 5) * pulse;
    lerpDots(dots, 0.12);
    return { reveal: 0, iconPoints };
  }

  if (phase === 'split') {
    const t = easeOutCubic(localT);
    const count = Math.max(1, Math.round(1 + t * 7));
    resizeDotPool(dots, count, cx, cy, 220);
    const r = 28 + t * 32;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      dots[i].tx = cx + Math.cos(a) * r;
      dots[i].ty = cy + Math.sin(a) * r;
      dots[i].hue = 205 + i * 16;
      dots[i].size = 3.2 + (i % 2) * 0.8;
    }
    lerpDots(dots, 0.11 + t * 0.04);
    return { reveal: 0, iconPoints };
  }

  if (phase === 'multiply') {
    const t = easeOutCubic(localT);
    const count = Math.round(6 + t * 118);
    resizeDotPool(dots, count, cx, cy, 198);
    const maxR = Math.min(width, height) * 0.36;
    for (let i = 0; i < count; i++) {
      const swirl = time * 0.0018 + i * GOLDEN;
      const r = 12 + t * maxR * (0.4 + (i % 9) / 14);
      dots[i].tx = cx + Math.cos(swirl) * r;
      dots[i].ty = cy + Math.sin(swirl) * r * 0.88;
      dots[i].hue = 192 + (i % 14) * 12 + t * 45;
      dots[i].size = 2 + (i % 5) * 0.35;
    }
    lerpDots(dots, 0.06 + t * 0.06);
    return { reveal: 0, iconPoints };
  }

  if (phase === 'icons') {
    const enter = easeOutCubic(Math.min(1, localT * 3));
    const exit = easeOutCubic(Math.min(1, (1 - localT) * 3));
    const hold = Math.min(enter, exit);
    const count = 160;
    resizeDotPool(dots, count, cx, cy, FEATURE_ICONS[iconIndex]?.hue ?? 200);
    iconPoints = getIconPoints(iconIndex, cx, cy - height * 0.03, iconSize, count);

    if (prevIconIndex >= 0 && prevIconPoints.length > 0 && localT < 0.28) {
      const blend = smoothstep(localT / 0.28);
      blendTargets(dots, prevIconPoints, iconPoints, blend, cx, cy);
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
    return { reveal: hold, iconPoints };
  }

  if (phase === 'logo') {
    const t = easeOutCubic(localT);
    reveal = logoSharpenProgress(localT);
    if (logoTargets && logoTargets.length > 0) {
      const count = logoTargets.length;
      resizeDotPool(dots, count, cx, cy, 210);
      for (let i = 0; i < count; i++) {
        const lt = logoTargets[i];
        dots[i].tx = lt.tx;
        dots[i].ty = lt.ty;
        dots[i].hue = lt.hue;
        dots[i].size = lt.size * (0.92 + t * 0.08);
      }
      const snap = localT > 0.65 ? 0.14 + t * 0.06 : 0.06 + t * 0.08;
      lerpDots(dots, snap);
    }
    return { reveal, iconPoints };
  }

  return { reveal: 0, iconPoints };
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
  reveal: number,
  iconLabel: string,
  captionAlpha: number
): void {
  drawBackground(ctx, width, height, time);

  const cx = width / 2;
  const cy = height / 2;
  const showTrails = phase === 'multiply' || phase === 'split';
  const lineCap = dots.length > 100 ? 48 : dots.length;

  if (showTrails) {
    for (let i = 0; i < Math.min(lineCap, dots.length); i++) {
      const dot = dots[i];
      if (dot.trail.length < 2) continue;
      ctx.strokeStyle = `hsla(${dot.hue}, 90%, 60%, 0.12)`;
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
    phase === 'logo'
      ? logoDotFade(reveal) * 0.4
      : phase === 'icons'
        ? 0.32
        : phase === 'multiply'
          ? 0.22
          : 0.14;

  if (lineAlpha > 0.02 && dots.length > 1 && dots.length <= 180) {
    ctx.lineWidth = 1;
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      for (let j = i + 1; j < Math.min(i + 3, dots.length); j++) {
        const b = dots[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 50) continue;
        const alpha = (1 - d / 50) * lineAlpha;
        ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 88%, 64%, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  const dotAlpha = phase === 'logo' ? logoDotFade(reveal) : 1;
  ctx.globalCompositeOperation = 'lighter';
  for (const dot of dots) {
    const glowR = dot.size * (phase === 'singleton' ? 8 : 5.5);
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
  }
  ctx.globalCompositeOperation = 'source-over';

  if (phase === 'singleton') {
    const ring = 0.4 + Math.sin(time * 0.006) * 0.2;
    ctx.strokeStyle = `rgba(120, 200, 255, ${ring})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 28 + Math.sin(time * 0.004) * 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (iconLabel && captionAlpha > 0.05) {
    ctx.font = `600 ${Math.round(15)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255,255,255,${0.85 * captionAlpha})`;
    ctx.fillText(iconLabel.toUpperCase(), cx, cy + height * 0.2);
    ctx.fillStyle = `rgba(94, 176, 247, ${0.35 * captionAlpha})`;
    ctx.fillRect(cx - 40, cy + height * 0.2 + 10, 80 * captionAlpha, 2);
  }
}

export async function loadLogoTargets(
  width: number,
  height: number,
  maxDots: number
): Promise<MorphDot[]> {
  return buildMainlineMorphDots(width, height, maxDots);
}
