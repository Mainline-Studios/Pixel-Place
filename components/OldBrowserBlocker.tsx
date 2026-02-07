'use client';

import { useState, useEffect } from 'react';

/** Blocks IE and very old browsers. Requires ES6+, modern features. */
export default function OldBrowserBlocker({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    try {
      // Check for ES6+ features
      if (typeof Promise === 'undefined' || typeof Symbol === 'undefined') {
        setBlocked(true);
        return;
      }
      // Block IE / very old browsers (no Proxy)
      if (typeof Proxy === 'undefined') {
        setBlocked(true);
        return;
      }
      if (/MSIE|Trident/i.test(navigator.userAgent)) {
        setBlocked(true);
      }
    } catch {
      setBlocked(true);
    }
  }, []);

  if (blocked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #00ff00 0%, #ffff00 50%, #ff00ff 100%)',
          fontFamily: 'Comic Sans MS, cursive',
          padding: 40,
          textAlign: 'center',
        }}
      >
        <marquee behavior="scroll" direction="left" style={{ fontSize: 28, color: '#000', marginBottom: 20 }}>
          *** UPGRADE YOUR BROWSER!!! ***
        </marquee>
        <h1 style={{ fontSize: 48, color: '#000', textShadow: '3px 3px 0 #fff' }}>
          PIXEL PLACE
        </h1>
        <p style={{ fontSize: 24, color: '#000', margin: 20 }}>
          Your browser is TOO OLD! No oldies allowed!!!
        </p>
        <p style={{ fontSize: 18, color: '#333', margin: 20 }}>
          Get Chrome, Firefox, or Edge (new version). Best viewed in 2020+ browsers!!!
        </p>
        <span className="blink-90s" style={{ fontSize: 20, color: '#ff0000' }}>UPGRADE NOW!!!</span>
      </div>
    );
  }
  return <>{children}</>;
}
