'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  drawSplashFrame,
  loadMainlineTargets,
  loadPixelPlaceTargets,
  resolvePhase,
  totalDuration,
  updateDotsForPhase,
  type AnimDot,
  type MorphDot,
} from '@/lib/splashTimeline';
import type { ShapePoint } from '@/lib/splashDotShapes';
import { SplashAudioController } from '@/lib/splashAudio';

type StartupSplashAnimationProps = {
  onComplete: () => void;
  audioEnabled?: boolean;
};

function MainlineBrandMark({ markSize }: { markSize: number }) {
  return (
    <div className="splash-mainline-brand">
      <svg width={markSize} height={markSize} viewBox="0 0 100 100" aria-hidden>
        <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#5eb0f7" strokeWidth="3" />
        <rect x="25" y="25" width="50" height="50" rx="5" fill="#2b6cb0" />
      </svg>
      <p className="splash-mainline-brand__title">MAINLINE STUDIOS</p>
      <p className="splash-mainline-brand__presents">PRESENTS</p>
    </div>
  );
}

export default function StartupSplashAnimation({
  onComplete,
  audioEnabled = true,
}: StartupSplashAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<AnimDot[]>([]);
  const mainlineTargetsRef = useRef<MorphDot[] | null>(null);
  const pixelTargetsRef = useRef<MorphDot[] | null>(null);
  const lastIconIndexRef = useRef(-1);
  const storedIconPointsRef = useRef<ShapePoint[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const completedRef = useRef(false);
  const audioRef = useRef<SplashAudioController | null>(null);

  const [brandOverlay, setBrandOverlay] = useState(1);
  const [pixelReveal, setPixelReveal] = useState(0);
  const [shellOpacity, setShellOpacity] = useState(1);
  const [captionAlpha, setCaptionAlpha] = useState(0);
  const [caption, setCaption] = useState('');
  const [done, setDone] = useState(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    audioRef.current?.dispose();
    setDone(true);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    audioRef.current = new SplashAudioController(audioEnabled);
    const unlock = () => audioRef.current?.unlock();
    unlock();
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      audioRef.current?.dispose();
    };
  }, [audioEnabled]);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      const t = setTimeout(finish, 1400);
      return () => clearTimeout(t);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;

    const loadTargets = () => {
      mainlineTargetsRef.current = loadMainlineTargets(canvas.width, canvas.height, 420);
      void loadPixelPlaceTargets(canvas.width, canvas.height, 500).then((targets) => {
        if (!cancelled) pixelTargetsRef.current = targets;
      });
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      loadTargets();
    };
    resize();
    window.addEventListener('resize', resize);
    loadTargets();

    startRef.current = performance.now();
    const duration = totalDuration();

    const loop = (now: number) => {
      if (cancelled) return;
      const elapsed = now - startRef.current;
      const { phase, localT, iconIndex, iconLabel } = resolvePhase(elapsed);

      audioRef.current?.tick(elapsed, phase, localT, iconIndex);

      if (phase !== 'exit') {
        const { pixelReveal: pr, brandOverlay: bo, iconPoints, dotAlpha } = updateDotsForPhase(
          dotsRef.current,
          phase,
          localT,
          iconIndex,
          canvas.width,
          canvas.height,
          mainlineTargetsRef.current,
          pixelTargetsRef.current,
          now,
          lastIconIndexRef.current,
          storedIconPointsRef.current
        );

        setBrandOverlay(bo);
        setPixelReveal((r) => (phase === 'assemble' || phase === 'hold' ? Math.max(r, pr) : r));

        const capA = phase === 'icons' ? captionAlphaFromLocal(localT) : 0;
        if (phase === 'icons') {
          storedIconPointsRef.current = iconPoints;
          if (iconIndex !== lastIconIndexRef.current) {
            lastIconIndexRef.current = iconIndex;
          }
          setCaption(iconLabel);
          setCaptionAlpha(capA);
        } else {
          setCaptionAlpha(0);
        }

        drawSplashFrame(
          ctx,
          canvas.width,
          canvas.height,
          dotsRef.current,
          phase,
          now,
          pr,
          iconLabel,
          capA,
          dotAlpha
        );
      }

      if (phase === 'hold') {
        setPixelReveal(1);
        setBrandOverlay(0);
        setCaption('');
        drawSplashFrame(ctx, canvas.width, canvas.height, dotsRef.current, 'assemble', now, 1, '', 0, 0);
      }

      if (phase === 'exit') {
        setShellOpacity(1 - localT);
        setPixelReveal(1 - localT);
      }

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        finish();
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [finish]);

  if (done) return null;

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    return (
      <div className="splash-shell splash-shell--reduced">MAINLINE STUDIOS PRESENTS</div>
    );
  }

  const markSize = 132;
  const logoSize = 148;

  return (
    <div
      className="splash-shell"
      style={{ opacity: shellOpacity }}
      role="dialog"
      aria-label="Pixel Place startup"
      onPointerDown={() => audioRef.current?.unlock()}
    >
      <div className="splash-vignette" aria-hidden />
      <canvas ref={canvasRef} className="splash-canvas" />

      {brandOverlay > 0.03 && (
        <div
          className="splash-mainline-layer"
          style={{
            opacity: brandOverlay,
            transition: 'opacity 0.5s ease-out',
          }}
        >
          <MainlineBrandMark markSize={markSize} />
        </div>
      )}

      {caption && captionAlpha > 0.05 && (
        <p className="splash-caption" style={{ opacity: captionAlpha }}>
          {caption}
        </p>
      )}

      {pixelReveal > 0.02 && (
        <div
          className="splash-brand"
          style={{
            opacity: pixelReveal,
            transform: `scale(${0.94 + pixelReveal * 0.06})`,
            filter: `blur(${(1 - pixelReveal) * 4}px)`,
          }}
        >
          <div className="splash-brand__glow" style={{ opacity: pixelReveal * 0.85 }} aria-hidden />
          <div className="splash-brand__logo-wrap">
            <Image src="/logo.png" alt="Pixel Place" width={logoSize} height={logoSize} priority />
          </div>
          <h1 className="splash-brand__title">PIXEL PLACE</h1>
          {pixelReveal > 0.88 && <p className="splash-brand__motto">Play · Create · Share</p>}
        </div>
      )}

      <style>{`
        .splash-shell {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #050608;
          overflow: hidden;
        }
        .splash-shell--reduced {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1.25rem;
          letter-spacing: 0.2em;
        }
        .splash-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, rgba(0,0,0,0.5) 100%);
          z-index: 1;
        }
        .splash-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        .splash-mainline-layer {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          pointer-events: none;
        }
        .splash-mainline-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .splash-mainline-brand__title {
          margin: 1.1rem 0 0;
          font-size: clamp(1rem, 3.2vw, 1.55rem);
          font-weight: 700;
          letter-spacing: 0.28em;
          text-indent: 0.28em;
          color: rgba(255,255,255,0.95);
          text-shadow: 0 0 36px rgba(43, 108, 176, 0.65);
        }
        .splash-mainline-brand__presents {
          margin: 0.65rem 0 0;
          font-size: clamp(0.85rem, 2.5vw, 1.15rem);
          font-weight: 600;
          letter-spacing: 0.42em;
          text-indent: 0.42em;
          color: rgba(126, 200, 255, 0.95);
        }
        .splash-caption {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 14%;
          margin: 0;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.7);
          z-index: 2;
          pointer-events: none;
        }
        .splash-brand {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 3;
          pointer-events: none;
          padding: 1.5rem;
        }
        .splash-brand__glow {
          position: absolute;
          width: min(320px, 70vw);
          height: min(320px, 70vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(43, 108, 176, 0.45) 0%, transparent 70%);
          filter: blur(24px);
        }
        .splash-brand__logo-wrap {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08),
            0 0 60px rgba(43, 108, 176, 0.55),
            0 20px 50px rgba(0,0,0,0.45);
        }
        .splash-brand__title {
          margin: 1.25rem 0 0;
          font-size: clamp(1.85rem, 6vw, 3rem);
          font-weight: 700;
          letter-spacing: 0.14em;
          text-indent: 0.14em;
          color: #fff;
          text-shadow: 0 0 50px rgba(43, 108, 176, 0.8);
        }
        .splash-brand__motto {
          margin: 0.85rem 0 0;
          font-size: 0.95rem;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.65);
          animation: splashMottoIn 0.8s ease-out;
        }
        @keyframes splashMottoIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function easeCaption(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function captionAlphaFromLocal(t: number): number {
  const enter = easeCaption(Math.min(1, t * 3));
  const exit = easeCaption(Math.min(1, (1 - t) * 3));
  return Math.min(enter, exit);
}
