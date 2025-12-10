'use client';

import { useState, useEffect } from 'react';

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
        transition: 'opacity 1s ease-in-out',
      }}
    >
      <div style={{ marginBottom: '30px' }}>
        <svg width="120" height="120" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#2b6cb0" strokeWidth="3"/>
          <rect x="25" y="25" width="50" height="50" rx="5" fill="#2b6cb0"/>
        </svg>
      </div>
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
      <p
        style={{
          fontSize: '16px',
          color: '#8b90a8',
          marginTop: '16px',
          letterSpacing: '2px',
        }}
      >
        Presenting Pixel Place
      </p>
    </div>
  );
}

