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
  firstOpen?: boolean;
  audioEnabled?: boolean;
};

function MainlineLogoMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#5eb0f7" strokeWidth="3" />
      <rect x="25" y="25" width="50" height="50" rx="5" fill="#2b6cb0" />
    </svg>
  );
}

export default function StartupSplashAnimation({
  onComplete,
  firstOpen = false,
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

  const [presentsOpacity, setPresentsOpacity] = useState(0);
  const [presentsLine2, setPresentsLine2] = useState(0);
  const [mainlineOverlay, setMainlineOverlay] = useState(0);
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
    if (!firstOpen) return;
    const t1 = requestAnimationFrame(() => setPresentsOpacity(1));
    const t2 = setTimeout(() => setPresentsLine2(1), 420);
    const t3 = setTimeout(() => setPresentsOpacity(0), 2100);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [firstOpen]);

  useEffect(() => {
    audioRef.current = new SplashAudioController(audioEnabled);
    return () => audioRef.current?.dispose();
  }, [audioEnabled]);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      const t = setTimeout(finish, firstOpen ? 1400 : 700);
      return () => clearTimeout(t);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;

    const loadTargets = () => {
      mainlineTargetsRef.current = loadMainlineTargets(
        canvas.width,
        canvas.height,
        firstOpen ? 380 : 280
      );
      void loadPixelPlaceTargets(canvas.width, canvas.height, firstOpen ? 500 : 300).then((targets) => {
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
    const duration = totalDuration(firstOpen);

    const loop = (now: number) => {
      if (cancelled) return;
      const elapsed = now - startRef.current;
      const { phase, localT, iconIndex, iconLabel } = resolvePhase(elapsed, firstOpen);

      audioRef.current?.tick(elapsed, phase, localT, iconIndex);

      if (phase === 'presents') {
        drawSplashFrame(ctx, canvas.width, canvas.height, [], 'singleton', now, 0, '', 0);
      } else if (phase !== 'exit') {
        const { reveal, iconPoints, mainlineOverlay: mlOverlay } = updateDotsForPhase(
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

        if (phase === 'mainline') {
          setMainlineOverlay(1);
        } else {
          setMainlineOverlay(mlOverlay);
        }

        if (phase === 'icons') {
          storedIconPointsRef.current = iconPoints;
          if (iconIndex !== lastIconIndexRef.current) {
            lastIconIndexRef.current = iconIndex;
          }
          setCaption(iconLabel);
          setCaptionAlpha(reveal);
        } else {
          setCaptionAlpha(0);
        }

        if (phase === 'logo' || phase === 'hold') {
          setPixelReveal((r) => Math.max(r, reveal));
        }
        if (phase === 'hold') setPixelReveal(1);

        drawSplashFrame(
          ctx,
          canvas.width,
          canvas.height,
          dotsRef.current,
          phase,
          now,
          reveal,
          iconLabel,
          phase === 'icons' ? reveal : 0
        );
      }

      if (phase === 'hold') {
        setPixelReveal(1);
        setMainlineOverlay(0);
        setCaption('');
        drawSplashFrame(ctx, canvas.width, canvas.height, dotsRef.current, 'hold', now, 1, '', 0);
      }

      if (phase === 'exit') {
        const fade = 1 - localT;
        setShellOpacity(fade);
        setPixelReveal(fade);
        setMainlineOverlay(0);
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
  }, [firstOpen, finish]);

  if (done) return null;

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    return (
      <div className="splash-shell splash-shell--reduced">
        {firstOpen ? 'MAINLINE STUDIOS PRESENTS' : 'PIXEL PLACE'}
      </div>
    );
  }

  const markSize = firstOpen ? 132 : 96;
  const logoSize = firstOpen ? 148 : 100;

  return (
    <div className="splash-shell" style={{ opacity: shellOpacity }} role="dialog" aria-label="Pixel Place startup">
      <div className="splash-vignette" aria-hidden />
      <div className="splash-bar splash-bar--top" aria-hidden />
      <div className="splash-bar splash-bar--bottom" aria-hidden />

      {firstOpen && (
        <div className="splash-presents" style={{ opacity: presentsOpacity }}>
          <p className="splash-presents__studio">MAINLINE STUDIOS</p>
          <p
            className="splash-presents__tag"
            style={{ opacity: presentsLine2, transform: `translateY(${(1 - presentsLine2) * 12}px)` }}
          >
            PRESENTS
          </p>
        </div>
      )}

      <canvas ref={canvasRef} className="splash-canvas" />

      {mainlineOverlay > 0.02 && (
        <div
          className="splash-mainline-mark"
          style={{
            opacity: mainlineOverlay,
            transform: `scale(${0.96 + mainlineOverlay * 0.04})`,
          }}
        >
          <MainlineLogoMark size={markSize} />
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
            filter: `blur(${(1 - pixelReveal) * 5}px)`,
          }}
        >
          <div className="splash-brand__glow" style={{ opacity: pixelReveal * 0.85 }} aria-hidden />
          <div className="splash-brand__logo-wrap">
            <Image src="/logo.png" alt="Pixel Place" width={logoSize} height={logoSize} priority />
          </div>
          <h1 className="splash-brand__title">PIXEL PLACE</h1>
          {firstOpen && pixelReveal > 0.85 && (
            <p className="splash-brand__motto">Play · Create · Share</p>
          )}
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
        .splash-bar {
          position: absolute;
          left: 0;
          right: 0;
          height: 6vh;
          background: linear-gradient(to bottom, rgba(0,0,0,0.65), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .splash-bar--top { top: 0; }
        .splash-bar--bottom { bottom: 0; transform: rotate(180deg); }
        .splash-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        .splash-presents {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 4;
          pointer-events: none;
          transition: opacity 0.65s ease-in-out;
          text-align: center;
          padding: 2rem;
        }
        .splash-presents__studio {
          margin: 0;
          font-size: clamp(1.2rem, 4vw, 2rem);
          font-weight: 700;
          letter-spacing: 0.32em;
          text-indent: 0.32em;
          color: rgba(255,255,255,0.94);
          text-shadow: 0 0 40px rgba(43, 108, 176, 0.6);
        }
        .splash-presents__tag {
          margin: 1.1rem 0 0;
          font-size: clamp(0.95rem, 3vw, 1.4rem);
          font-weight: 600;
          letter-spacing: 0.5em;
          text-indent: 0.5em;
          color: rgba(120, 190, 255, 0.95);
          transition: opacity 0.55s ease-out, transform 0.55s ease-out;
        }
        .splash-mainline-mark {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          pointer-events: none;
          transition: opacity 0.35s ease-out, transform 0.5s ease-out;
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
          transition: opacity 0.45s ease-out, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
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
