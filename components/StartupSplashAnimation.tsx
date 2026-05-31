'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  drawSplashFrame,
  loadLogoTargets,
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
  const logoTargetsRef = useRef<MorphDot[] | null>(null);
  const lastIconIndexRef = useRef(-1);
  const storedIconPointsRef = useRef<ShapePoint[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const completedRef = useRef(false);
  const audioRef = useRef<SplashAudioController | null>(null);

  const [presentsOpacity, setPresentsOpacity] = useState(0);
  const [presentsLine2, setPresentsLine2] = useState(0);
  const [revealOpacity, setRevealOpacity] = useState(0);
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
    const t3 = setTimeout(() => setPresentsOpacity(0), 2000);
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
      void loadLogoTargets(canvas.width, canvas.height, firstOpen ? 520 : 300).then((targets) => {
        if (!cancelled) logoTargetsRef.current = targets;
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
        const { reveal, iconPoints } = updateDotsForPhase(
          dotsRef.current,
          phase,
          localT,
          iconIndex,
          canvas.width,
          canvas.height,
          logoTargetsRef.current,
          now,
          lastIconIndexRef.current,
          storedIconPointsRef.current
        );

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

        if (phase === 'logo') setRevealOpacity((r) => Math.max(r, reveal));
        if (phase === 'hold') setRevealOpacity(1);

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
        setRevealOpacity(1);
        setCaption('');
        setCaptionAlpha(0);
        drawSplashFrame(ctx, canvas.width, canvas.height, dotsRef.current, 'hold', now, 1, '', 0);
      }

      if (phase === 'exit') {
        const fade = 1 - localT;
        setShellOpacity(fade);
        setRevealOpacity(fade);
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

  const markSize = firstOpen ? 128 : 96;
  const showBrand = revealOpacity > 0.02;

  return (
    <div className="splash-shell" style={{ opacity: shellOpacity }} role="dialog" aria-label="Pixel Place startup">
      <div className="splash-vignette" aria-hidden />
      <div className="splash-bar splash-bar--top" aria-hidden />
      <div className="splash-bar splash-bar--bottom" aria-hidden />

      {firstOpen && (
        <div className="splash-presents" style={{ opacity: presentsOpacity }}>
          <p className="splash-presents__studio">MAINLINE STUDIOS</p>
          <p className="splash-presents__tag" style={{ opacity: presentsLine2, transform: `translateY(${(1 - presentsLine2) * 12}px)` }}>
            PRESENTS
          </p>
        </div>
      )}

      <canvas ref={canvasRef} className="splash-canvas" />

      {caption && captionAlpha > 0.05 && (
        <p className="splash-caption" style={{ opacity: captionAlpha }}>
          {caption}
        </p>
      )}

      {showBrand && (
        <div
          className="splash-brand"
          style={{
            opacity: revealOpacity,
            transform: `scale(${0.94 + revealOpacity * 0.06})`,
            filter: `blur(${(1 - revealOpacity) * 6}px)`,
          }}
        >
          <div className="splash-brand__glow" style={{ opacity: revealOpacity * 0.85 }} aria-hidden />
          <MainlineLogoMark size={markSize} />
          <h1 className="splash-brand__title">MAINLINE STUDIOS</h1>
          {firstOpen && revealOpacity > 0.88 && (
            <p className="splash-brand__presents">presents Pixel Place</p>
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
        .splash-bar--bottom {
          bottom: 0;
          transform: rotate(180deg);
        }
        .splash-canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .splash-presents {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 3;
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
          transition: opacity 0.25s ease-out;
        }
        .splash-brand {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
          pointer-events: none;
          padding: 1.5rem;
          transition: opacity 0.5s ease-out, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .splash-brand__glow {
          position: absolute;
          width: min(320px, 70vw);
          height: min(320px, 70vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(43, 108, 176, 0.45) 0%, transparent 70%);
          filter: blur(24px);
        }
        .splash-brand__title {
          margin: 1.25rem 0 0;
          font-size: clamp(1.1rem, 3.5vw, 1.65rem);
          font-weight: 700;
          letter-spacing: 0.28em;
          text-indent: 0.28em;
          color: #fff;
          text-shadow: 0 0 40px rgba(43, 108, 176, 0.75);
        }
        .splash-brand__presents {
          margin: 0.75rem 0 0;
          font-size: 0.9rem;
          letter-spacing: 0.18em;
          color: rgba(120, 190, 255, 0.85);
          animation: splashMottoIn 0.7s ease-out;
        }
        @keyframes splashMottoIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
