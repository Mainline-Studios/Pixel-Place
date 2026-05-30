'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export type SplashVariant = 'full' | 'quick';

interface SplashScreenProps {
  onComplete: () => void;
  variant?: SplashVariant;
}

function QuickSplash({ onComplete }: { onComplete: () => void }) {
  const [opacity, setOpacity] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const fadeIn = setTimeout(() => setOpacity(1), 30);
    const done = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 720);
    return () => {
      clearTimeout(fadeIn);
      clearTimeout(done);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, #1a1d29 0%, #0f1117 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', justifyContent: 'center', padding: 24 }}>
        <svg width="72" height="72" viewBox="0 0 100 100" aria-hidden>
          <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#2b6cb0" strokeWidth="3" />
          <rect x="25" y="25" width="50" height="50" rx="5" fill="#2b6cb0" />
        </svg>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>presents</span>
        <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 16, overflow: 'hidden' }}>
          <Image src="/logo.png" alt="Pixel Place" width={88} height={88} style={{ objectFit: 'contain' }} priority />
        </div>
      </div>
      <p style={{ marginTop: 12, fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: 3, textShadow: '0 0 24px rgba(43, 108, 176, 0.6)' }}>
        PIXEL PLACE
      </p>
    </div>
  );
}

function FullSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'mainline' | 'pixelplace'>('mainline');
  const [mainlineOpacity, setMainlineOpacity] = useState(0);
  const [pixelPlaceOpacity, setPixelPlaceOpacity] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const fadeInMainline = setTimeout(() => setMainlineOpacity(1), 100);
    const fadeOutMainline = setTimeout(() => setMainlineOpacity(0), 2500);
    const switchPhase = setTimeout(() => {
      setPhase('pixelplace');
      setPixelPlaceOpacity(1);
    }, 3200);
    const fadeOutPixelPlace = setTimeout(() => setPixelPlaceOpacity(0), 5700);
    const hide = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 6400);

    return () => {
      clearTimeout(fadeInMainline);
      clearTimeout(fadeOutMainline);
      clearTimeout(switchPhase);
      clearTimeout(fadeOutPixelPlace);
      clearTimeout(hide);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, #1a1d29 0%, #0f1117 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes splashScaleIn {
          0% { opacity: 0; transform: scale(0.3); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        .splash-logo-mainline { animation: splashScaleIn 1s ease-out forwards; }
        .splash-logo-pixelplace { animation: splashScaleIn 1s ease-out forwards; }
        .splash-text { animation: splashScaleIn 0.8s ease-out 0.2s forwards; opacity: 0; }
        .splash-presents { animation: splashScaleIn 0.6s ease-out 0.5s forwards; opacity: 0; }
        .splash-motto { animation: splashScaleIn 0.6s ease-out 0.5s forwards; opacity: 0; }
        .splash-features { animation: splashScaleIn 0.5s ease-out 0.8s forwards; opacity: 0; }
      `}</style>

      {phase === 'mainline' && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: mainlineOpacity,
            transition: 'opacity 0.8s ease-in-out',
          }}
        >
          <div className="splash-logo-mainline" style={{ marginBottom: '30px' }}>
            <svg width="120" height="120" viewBox="0 0 100 100">
              <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#2b6cb0" strokeWidth="3" />
              <rect x="25" y="25" width="50" height="50" rx="5" fill="#2b6cb0" />
            </svg>
          </div>
          <h1
            className="splash-text"
            style={{
              fontSize: '42px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              textShadow: '0 0 30px rgba(43, 108, 176, 0.8), 0 0 60px rgba(43, 108, 176, 0.5)',
              letterSpacing: '4px',
            }}
          >
            MAINLINE STUDIOS
          </h1>
          <div className="splash-presents" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginTop: '12px', letterSpacing: '3px' }}>
            presents
          </div>
        </div>
      )}

      {phase === 'pixelplace' && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pixelPlaceOpacity,
            transition: 'opacity 0.8s ease-in-out',
          }}
        >
          <div className="splash-logo-pixelplace" style={{ marginBottom: '24px', position: 'relative', width: 140, height: 140, borderRadius: '20px', overflow: 'hidden' }}>
            <Image src="/logo.png" alt="Pixel Place Logo" width={140} height={140} style={{ objectFit: 'contain', borderRadius: '20px' }} priority />
          </div>
          <h2
            className="splash-text"
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              textShadow: '0 0 30px rgba(43, 108, 176, 0.8), 0 0 60px rgba(43, 108, 176, 0.5)',
              letterSpacing: '4px',
            }}
          >
            PIXEL PLACE
          </h2>
          <div className="splash-motto" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginTop: '14px', letterSpacing: '2px' }}>
            Play. Create. Share.
          </div>
          <div className="splash-features" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '8px', letterSpacing: '1px' }}>
            Games • Avatars • 10 Pixel-Coins to start
          </div>
        </div>
      )}
    </div>
  );
}

export default function SplashScreen({ onComplete, variant = 'full' }: SplashScreenProps) {
  if (variant === 'quick') return <QuickSplash onComplete={onComplete} />;
  return <FullSplash onComplete={onComplete} />;
}
