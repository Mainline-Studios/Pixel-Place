'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  buildBurstGrid,
  drawSplashFrame,
  loadMainlineTargets,
  loadPixelPlaceTargets,
  resolvePhase,
  totalDuration,
  updateDotsForPhase,
  type AnimDot,
  type GridPoint,
  type MorphDot,
  type SplashPhase,
} from '@/lib/splashTimeline';
import type { ShapePoint } from '@/lib/splashDotShapes';
import { SplashAudioController } from '@/lib/splashAudio';
import {
  computeMainlineBrandLayout,
  computePixelBrandLayout,
  PIXEL_LOGO_RADIUS,
  type MainlineBrandLayout,
  type PixelBrandLayout,
} from '@/lib/splashBrandLayout';
import {
  buildMainlineBrandDotsFromDom,
  buildPixelPlaceMorphDotsFromDom,
} from '@/lib/splashMorphTargets';

type StartupSplashAnimationProps = {
  onComplete: () => void;
  audioEnabled?: boolean;
};

function MainlineBrandMark({
  layout,
  rootRef,
}: {
  layout: MainlineBrandLayout;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={rootRef}
      className="splash-mainline-brand"
      style={{ height: layout.stackHeight, justifyContent: 'flex-start' }}
    >
      <svg width={layout.markSize} height={layout.markSize} viewBox="0 0 100 100" aria-hidden>
        <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#5eb0f7" strokeWidth="3" />
        <rect x="25" y="25" width="50" height="50" rx="5" fill="#2b6cb0" />
      </svg>
      <p
        data-splash-text
        className="splash-mainline-brand__title"
        style={{
          margin: `${layout.titleMarginTop}px 0 0`,
          fontSize: layout.titleFontPx,
          letterSpacing: `${layout.titleLetterSpacingEm}em`,
          textIndent: `${layout.titleLetterSpacingEm}em`,
        }}
      >
        MAINLINE STUDIOS
      </p>
      <p
        data-splash-text
        className="splash-mainline-brand__presents"
        style={{
          margin: `${layout.presentsMarginTop}px 0 0`,
          fontSize: layout.presentsFontPx,
          letterSpacing: `${layout.presentsLetterSpacingEm}em`,
          textIndent: `${layout.presentsLetterSpacingEm}em`,
        }}
      >
        PRESENTS
      </p>
    </div>
  );
}

export default function StartupSplashAnimation({
  onComplete,
  audioEnabled = true,
}: StartupSplashAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<AnimDot[]>([]);
  const burstGridRef = useRef<GridPoint[] | null>(null);
  const mainlineTargetsRef = useRef<MorphDot[] | null>(null);
  const pixelTargetsRef = useRef<MorphDot[] | null>(null);
  const lastIconIndexRef = useRef(-1);
  const storedIconPointsRef = useRef<ShapePoint[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const completedRef = useRef(false);
  const audioRef = useRef<SplashAudioController | null>(null);
  const mainlineBrandRef = useRef<HTMLDivElement | null>(null);
  const pixelBrandRef = useRef<HTMLDivElement | null>(null);
  const pixelMeasureRef = useRef<HTMLDivElement | null>(null);
  const domTargetsSyncedRef = useRef(false);

  const [brandOverlay, setBrandOverlay] = useState(1);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [pixelReveal, setPixelReveal] = useState(0);
  const [splashPhase, setSplashPhase] = useState<SplashPhase>('burst');
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

    const syncTargetsFromDom = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w < 1 || h < 1) return;

      const mainlineEl = mainlineBrandRef.current;
      if (mainlineEl) {
        const measured = buildMainlineBrandDotsFromDom(w, h, mainlineEl, 340);
        if (measured.length > 0) mainlineTargetsRef.current = measured;
      }

      const pixelEl = pixelMeasureRef.current ?? pixelBrandRef.current;
      if (pixelEl) {
        const measured = buildPixelPlaceMorphDotsFromDom(w, h, pixelEl, 400);
        if (measured.length > 0) pixelTargetsRef.current = measured;
      }
    };

    const loadTargets = () => {
      const w = canvas.width;
      const h = canvas.height;
      setViewport({ w, h });
      domTargetsSyncedRef.current = false;

      const mainlineLayout = computeMainlineBrandLayout(w, h);
      burstGridRef.current = buildBurstGrid(w, h, mainlineLayout.cy);
      mainlineTargetsRef.current = loadMainlineTargets(w, h, 340);
      void loadPixelPlaceTargets(w, h, 400).then((targets) => {
        if (!cancelled) pixelTargetsRef.current = targets;
      });
      requestAnimationFrame(() => {
        if (!cancelled) syncTargetsFromDom();
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
      setSplashPhase(phase);

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
          storedIconPointsRef.current,
          burstGridRef.current
        );

        setBrandOverlay(bo);
        if (
          !domTargetsSyncedRef.current &&
          (phase === 'burst' || phase === 'cover') &&
          bo > 0.12
        ) {
          domTargetsSyncedRef.current = true;
          syncTargetsFromDom();
        }
        if (phase === 'assemble' && localT < 0.08 && pixelMeasureRef.current) {
          syncTargetsFromDom();
        }
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
        drawSplashFrame(ctx, canvas.width, canvas.height, dotsRef.current, 'assemble', now, 1, '', 0, 0.35);
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

  const vw = viewport.w || (typeof window !== 'undefined' ? window.innerWidth : 0);
  const vh = viewport.h || (typeof window !== 'undefined' ? window.innerHeight : 0);
  const mainlineLayout = vw > 0 ? computeMainlineBrandLayout(vw, vh) : null;
  const pixelLayout = vw > 0 ? computePixelBrandLayout(vw, vh) : null;

  const dotsOverMainline = splashPhase === 'burst' || splashPhase === 'cover';
  const dotsUnderPixel =
    splashPhase === 'assemble' || splashPhase === 'hold' || splashPhase === 'exit';

  return (
    <div
      className="splash-shell"
      style={{ opacity: shellOpacity }}
      role="dialog"
      aria-label="Pixel Place startup"
      onPointerDown={() => audioRef.current?.unlock()}
    >
      <div className="splash-vignette" aria-hidden />

      {pixelLayout && (
        <div className="splash-brand-measure" aria-hidden>
          <div ref={pixelMeasureRef} className="splash-brand splash-brand--measure">
            <div
              className="splash-brand__logo-wrap"
              style={{ borderRadius: PIXEL_LOGO_RADIUS, width: pixelLayout.logoSize, height: pixelLayout.logoSize }}
            >
              <Image
                src="/logo.png"
                alt=""
                width={pixelLayout.logoSize}
                height={pixelLayout.logoSize}
                priority
              />
            </div>
            <h1
              data-splash-text
              className="splash-brand__title"
              style={{
                margin: `${pixelLayout.titleMarginTop}px 0 0`,
                fontSize: pixelLayout.titleFontPx,
                letterSpacing: `${pixelLayout.titleLetterSpacingEm}em`,
                textIndent: `${pixelLayout.titleLetterSpacingEm}em`,
              }}
            >
              PIXEL PLACE
            </h1>
          </div>
        </div>
      )}

      {brandOverlay > 0.03 && mainlineLayout && (
        <div
          className="splash-mainline-layer"
          style={{ opacity: brandOverlay }}
        >
          <MainlineBrandMark layout={mainlineLayout} rootRef={mainlineBrandRef} />
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`splash-canvas${dotsOverMainline ? ' splash-canvas--over-brand' : ''}${dotsUnderPixel ? ' splash-canvas--under-logo' : ''}`}
      />

      {caption && captionAlpha > 0.05 && (
        <p className="splash-caption" style={{ opacity: captionAlpha }}>
          {caption}
        </p>
      )}

      {pixelReveal > 0.02 && pixelLayout && (
        <div
          ref={pixelBrandRef}
          className="splash-brand"
          style={{
            opacity: pixelReveal,
            transform: `scale(${0.94 + pixelReveal * 0.06})`,
            filter: `blur(${(1 - pixelReveal) * 4}px)`,
          }}
        >
          <div className="splash-brand__glow" style={{ opacity: pixelReveal * 0.85 }} aria-hidden />
          <div
            className="splash-brand__logo-wrap"
            style={{ borderRadius: PIXEL_LOGO_RADIUS, width: pixelLayout.logoSize, height: pixelLayout.logoSize }}
          >
            <Image
              src="/logo.png"
              alt="Pixel Place"
              width={pixelLayout.logoSize}
              height={pixelLayout.logoSize}
              priority
            />
          </div>
          <h1
            data-splash-text
            className="splash-brand__title"
            style={{
              margin: `${pixelLayout.titleMarginTop}px 0 0`,
              fontSize: pixelLayout.titleFontPx,
              letterSpacing: `${pixelLayout.titleLetterSpacingEm}em`,
              textIndent: `${pixelLayout.titleLetterSpacingEm}em`,
            }}
          >
            PIXEL PLACE
          </h1>
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
          z-index: 3;
        }
        .splash-canvas--over-brand {
          z-index: 4;
        }
        .splash-canvas--under-logo {
          z-index: 2;
        }
        .splash-brand-measure {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .splash-brand--measure {
          opacity: 1;
          transform: none;
          filter: none;
        }
        .splash-mainline-layer {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          pointer-events: none;
        }
        .splash-mainline-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .splash-mainline-brand__title {
          margin: 0;
          font-weight: 700;
          color: rgba(255,255,255,0.95);
          text-shadow: 0 0 36px rgba(43, 108, 176, 0.65);
        }
        .splash-mainline-brand__presents {
          margin: 0;
          font-weight: 600;
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
          z-index: 5;
          pointer-events: none;
          padding: 1.5rem;
        }
        .splash-brand__glow {
          position: absolute;
          width: min(220px, 52vw);
          height: min(220px, 52vw);
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
          margin: 0;
          font-weight: 700;
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
