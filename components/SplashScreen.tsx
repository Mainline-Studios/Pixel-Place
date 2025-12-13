'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showMainline, setShowMainline] = useState(true);
  const [showPixelPlace, setShowPixelPlace] = useState(false);
  const [mainlineOpacity, setMainlineOpacity] = useState(0);
  const [pixelPlaceOpacity, setPixelPlaceOpacity] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Mainline Studios sequence
    // Fade in Mainline
    const fadeInMainline = setTimeout(() => {
      setMainlineOpacity(1);
    }, 100);

    // Hold Mainline
    const holdMainline = setTimeout(() => {
      setMainlineOpacity(1);
    }, 2000);

    // Fade out Mainline
    const fadeOutMainline = setTimeout(() => {
      setMainlineOpacity(0);
    }, 2500);

    // Hide Mainline and show Pixel Place
    const switchToPixelPlace = setTimeout(() => {
      setShowMainline(false);
      setShowPixelPlace(true);
    }, 3000);

    // Fade in Pixel Place
    const fadeInPixelPlace = setTimeout(() => {
      setPixelPlaceOpacity(1);
    }, 3100);

    // Hold Pixel Place
    const holdPixelPlace = setTimeout(() => {
      setPixelPlaceOpacity(1);
    }, 5000);

    // Fade out Pixel Place
    const fadeOutPixelPlace = setTimeout(() => {
      setPixelPlaceOpacity(0);
    }, 5500);

    // Hide and complete
    const hide = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 6500);

    return () => {
      clearTimeout(fadeInMainline);
      clearTimeout(holdMainline);
      clearTimeout(fadeOutMainline);
      clearTimeout(switchToPixelPlace);
      clearTimeout(fadeInPixelPlace);
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
        transition: 'opacity 0.8s ease-in-out',
      }}
    >
      {/* Mainline Studios */}
      {showMainline && (
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
          <div style={{ marginBottom: '30px' }}>
            <svg width="120" height="120" viewBox="0 0 100 100">
              <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#2b6cb0" strokeWidth="3"/>
              <rect x="25" y="25" width="50" height="50" rx="5" fill="#2b6cb0"/>
            </svg>
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
            MAINLINE STUDIOS
          </h2>
        </div>
      )}

      {/* Pixel Place */}
      {showPixelPlace && (
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
      )}
    </div>
  );
}
