'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'mainline' | 'pixelplace'>('mainline');
  const [mainlineOpacity, setMainlineOpacity] = useState(0);
  const [pixelPlaceOpacity, setPixelPlaceOpacity] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Phase 1: Mainline Studios — fade in
    const fadeInMainline = setTimeout(() => setMainlineOpacity(1), 100);
    // Hold
    const holdMainline = setTimeout(() => {}, 2200);
    // Fade out
    const fadeOutMainline = setTimeout(() => setMainlineOpacity(0), 2500);

    // Switch to Pixel Place (show immediately so animations are visible)
    const switchPhase = setTimeout(() => {
      setPhase('pixelplace');
      setPixelPlaceOpacity(1);
    }, 3200);
    // Hold
    const holdPixelPlace = setTimeout(() => {}, 5200);
    // Fade out
    const fadeOutPixelPlace = setTimeout(() => setPixelPlaceOpacity(0), 5700);
    // Hide and complete
    const hide = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 6400);

    return () => {
      clearTimeout(fadeInMainline);
      clearTimeout(holdMainline);
      clearTimeout(fadeOutMainline);
      clearTimeout(switchPhase);
      clearTimeout(holdPixelPlace);
      clearTimeout(fadeOutPixelPlace);      clearTimeout(hide);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .splash-logo-mainline {
          animation: splashScaleIn 1s ease-out forwards;
        }
        .splash-logo-pixelplace {
          animation: splashScaleIn 1s ease-out forwards;
        }
        .splash-text {
          animation: splashScaleIn 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .splash-presents {
          animation: splashScaleIn 0.6s ease-out 0.5s forwards;
          opacity: 0;
        }
        .splash-motto {
          animation: splashScaleIn 0.6s ease-out 0.5s forwards;
          opacity: 0;
        }
        .splash-features {
          animation: splashScaleIn 0.5s ease-out 0.8s forwards;
          opacity: 0;
        }
      `}</style>

      {/* Mainline Studios phase - uses Mainline brand, not Pixel Place logo */}
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
          <div className="splash-logo-mainline" style={{ marginBottom: '24px', width: 120, height: 120, borderRadius: '20px', background: 'linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(43, 108, 176, 0.6)' }}>
            <span style={{ fontSize: '56px', fontWeight: 800, color: '#fff', letterSpacing: '-2px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>M</span>
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
          <div
            className="splash-presents"
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.85)',
              marginTop: '12px',
              letterSpacing: '3px',
            }}
          >
            presents
          </div>
        </div>
      )}

      {/* Pixel Place phase */}
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
            <Image
              src="/logo.png"
              alt="Pixel Place Logo"
              width={140}
              height={140}
              style={{ objectFit: 'contain', borderRadius: '20px' }}
              priority
            />
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
          <div
            className="splash-motto"
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.9)',
              marginTop: '14px',
              letterSpacing: '2px',
            }}
          >
            Play. Create. Share.
          </div>
          <div
            className="splash-features"
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              marginTop: '8px',
              letterSpacing: '1px',
            }}
          >
            Games • Avatars • 10 Pixel-Coins to start
          </div>
        </div>
      )}    </div>
  );
}
