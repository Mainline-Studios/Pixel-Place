'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type Dot = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  hue: number;
  size: number;
  delay: number;
};

type Phase = 'burst' | 'brand' | 'done';

const BURST_MS = 2800;
const BRAND_MAINLINE_MS = 2200;
const BRAND_PIXEL_MS = 2800;
const FADE_MS = 900;

function buildDots(width: number, height: number): Dot[] {
  const cols = 12;
  const rows = 9;
  const gapX = Math.min(72, (width * 0.72) / cols);
  const gapY = Math.min(58, (height * 0.55) / rows);
  const gridW = (cols - 1) * gapX;
  const gridH = (rows - 1) * gapY;
  const ox = width / 2 - gridW / 2;
  const oy = height / 2 - gridH / 2;
  const cx = width / 2;
  const cy = height / 2;
  const dots: Dot[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      dots.push({
        x: cx + (Math.random() - 0.5) * 24,
        y: cy + (Math.random() - 0.5) * 24,
        tx: ox + col * gapX,
        ty: oy + row * gapY,
        hue: 195 + (i % 7) * 18 + (row / rows) * 40,
        size: 4 + (i % 3),
        delay: (col / cols) * 0.35 + (row / rows) * 0.25,
      });
    }
  }
  return dots;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dots: Dot[],
  progress: number,
  time: number
): void {
  ctx.fillStyle = '#0a0c12';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const pulse = 0.35 + Math.sin(time * 0.004) * 0.12;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.45);
  grad.addColorStop(0, `rgba(43, 108, 176, ${0.22 * pulse})`);
  grad.addColorStop(0.5, 'rgba(43, 108, 176, 0.04)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const eased = progress * progress * (3 - 2 * progress);

  for (const dot of dots) {
    const t = Math.max(0, Math.min(1, (eased - dot.delay) / (1 - dot.delay * 0.85)));
    const ease = t * t * (3 - 2 * t);
    dot.x += (dot.tx - dot.x) * (0.06 + ease * 0.04);
    dot.y += (dot.ty - dot.y) * (0.06 + ease * 0.04);
  }

  ctx.lineWidth = 1;
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i];
      const b = dots[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d < 95 && eased > 0.2) {
        const alpha = (1 - d / 95) * 0.35 * eased;
        ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 80%, 65%, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const dot of dots) {
    const glow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.size * 4);
    glow.addColorStop(0, `hsla(${dot.hue}, 100%, 70%, 0.9)`);
    glow.addColorStop(0.4, `hsla(${dot.hue}, 90%, 55%, 0.35)`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${dot.hue}, 100%, 72%)`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (eased > 0.65) {
    const ring = (eased - 0.65) / 0.35;
    ctx.strokeStyle = `rgba(100, 181, 246, ${ring * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 40 + ring * 30, 0, Math.PI * 2);
    ctx.stroke();
  }
}

type StartupSplashAnimationProps = {
  onComplete: () => void;
  compact?: boolean;
};

export default function StartupSplashAnimation({ onComplete, compact = false }: StartupSplashAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const [phase, setPhase] = useState<Phase>('burst');
  const [canvasOpacity, setCanvasOpacity] = useState(1);
  const [brandOpacity, setBrandOpacity] = useState(0);
  const [brandStep, setBrandStep] = useState<'mainline' | 'pixelplace'>('mainline');
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('done');
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setCanvasOpacity(0);
      setBrandOpacity(1);
      setPhase('brand');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dotsRef.current = buildDots(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);
    startRef.current = performance.now();

    const burstDuration = compact ? 1400 : BURST_MS;

    const loop = (now: number) => {
      if (cancelled) return;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / burstDuration, 1);
      drawFrame(ctx, canvas.width, canvas.height, dotsRef.current, progress, now);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setCanvasOpacity(0);
        setBrandOpacity(1);
        setPhase('brand');
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [compact]);

  useEffect(() => {
    if (phase !== 'brand') return;

    const mainlineMs = compact ? 900 : BRAND_MAINLINE_MS;
    const pixelMs = compact ? 1100 : BRAND_PIXEL_MS;

    const toPixel = setTimeout(() => setBrandStep('pixelplace'), mainlineMs);
    const done = setTimeout(() => {
      setBrandOpacity(0);
      setTimeout(finish, FADE_MS);
    }, mainlineMs + pixelMs);

    return () => {
      clearTimeout(toPixel);
      clearTimeout(done);
    };
  }, [phase, compact, finish]);

  if (phase === 'done') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0c12',
        overflow: 'hidden',
      }}
      aria-hidden={phase === 'brand' ? undefined : true}
      role={phase === 'brand' ? 'dialog' : undefined}
      aria-label={phase === 'brand' ? 'Pixel Place startup' : undefined}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: canvasOpacity,
          transition: `opacity ${FADE_MS}ms ease-out`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: brandOpacity,
          transition: `opacity ${FADE_MS}ms ease-in`,
          pointerEvents: 'none',
          padding: 24,
        }}
      >
        {brandStep === 'mainline' && (
          <div style={{ textAlign: 'center', animation: 'splashBrandIn 0.8s ease-out' }}>
            <svg width={compact ? 80 : 120} height={compact ? 80 : 120} viewBox="0 0 100 100" aria-hidden>
              <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#5eb0f7" strokeWidth="3" />
              <rect x="25" y="25" width="50" height="50" rx="5" fill="#2b6cb0" />
            </svg>
            <h1
              style={{
                margin: '20px 0 0',
                fontSize: compact ? 28 : 42,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.2em',
                textShadow: '0 0 40px rgba(43, 108, 176, 0.85)',
              }}
            >
              MAINLINE STUDIOS
            </h1>
            <p style={{ marginTop: 12, fontSize: compact ? 14 : 18, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.35em' }}>
              presents
            </p>
          </div>
        )}

        {brandStep === 'pixelplace' && (
          <div style={{ textAlign: 'center', animation: 'splashBrandIn 0.8s ease-out' }}>
            <div
              style={{
                position: 'relative',
                width: compact ? 96 : 140,
                height: compact ? 96 : 140,
                margin: '0 auto',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 0 60px rgba(43, 108, 176, 0.55)',
              }}
            >
              <Image src="/logo.png" alt="" width={compact ? 96 : 140} height={compact ? 96 : 140} priority />
            </div>
            <h2
              style={{
                margin: '22px 0 0',
                fontSize: compact ? 32 : 48,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.12em',
                textShadow: '0 0 40px rgba(43, 108, 176, 0.85)',
              }}
            >
              PIXEL PLACE
            </h2>
            {!compact && (
              <>
                <p style={{ marginTop: 14, fontSize: 18, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.15em' }}>
                  Play. Create. Share.
                </p>
                <p style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                  Games · Avatars · Pixel-Coins
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes splashBrandIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
