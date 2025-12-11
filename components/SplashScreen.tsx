'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'mainline' | 'pixelplace'>('mainline');
  const [opacity, setOpacity] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Phase 1: Fade in "MAINLINE STUDIOS"
    const fadeInMainline = setTimeout(() => {
      setOpacity(1);
    }, 100);

    // Phase 2: Hold "MAINLINE STUDIOS"
    const holdMainline = setTimeout(() => {
      setOpacity(1);
    }, 2000);

    // Phase 3: Fade out "MAINLINE STUDIOS"
    const fadeOutMainline = setTimeout(() => {
      setOpacity(0);
    }, 2500);

    // Phase 4: Switch to "PIXEL PLACE" with logo
    const switchToPixelPlace = setTimeout(() => {
      setPhase('pixelplace');
      setOpacity(1);
    }, 3000);

    // Phase 5: Hold "PIXEL PLACE"
    const holdPixelPlace = setTimeout(() => {
      setOpacity(1);
    }, 4500);

    // Phase 6: Fade out "PIXEL PLACE"
    const fadeOutPixelPlace = setTimeout(() => {
      setOpacity(0);
    }, 5000);

    // Phase 7: Hide and complete
    const hide = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(fadeInMainline);
      clearTimeout(holdMainline);
      clearTimeout(fadeOutMainline);
      clearTimeout(switchToPixelPlace);
      clearTimeout(holdPixelPlace);
      clearTimeout(fadeOutPixelPlace);
      clearTimeout(hide);
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
        background: 'radial-gradient(circle at 50% 50%, #0f1117 0%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity,
        transition: 'opacity 0.8s ease-in-out',
      }}
    >
      {phase === 'mainline' ? (
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            textShadow: '0 0 30px rgba(43, 108, 176, 0.8), 0 0 60px rgba(43, 108, 176, 0.5)',
            letterSpacing: '4px',
          }}
        >
          MAINLINE STUDIOS
        </h1>
      ) : (
        <>
          <div style={{ marginBottom: '30px', position: 'relative', width: '120px', height: '120px' }}>
            <Image
              src="/logo.png"
              alt="Pixel Place Logo"
              width={120}
              height={120}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h2
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
        </>
      )}
    </div>
  );
}
