'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [opacity, setOpacity] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Fade in
    const fadeIn = setTimeout(() => {
      setOpacity(1);
    }, 100);

    // Hold
    const hold = setTimeout(() => {
      setOpacity(1);
    }, 2500);

    // Fade out
    const fadeOut = setTimeout(() => {
      setOpacity(0);
    }, 3000);

    // Hide and complete
    const hide = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(fadeIn);
      clearTimeout(hold);
      clearTimeout(fadeOut);
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
    </div>
  );
}
