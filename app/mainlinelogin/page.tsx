'use client';

import { useEffect } from 'react';

const MAINLINE_URL = 'https://mainline-gaming-hub.base44.app';

export default function MainlineLoginRedirect() {
  useEffect(() => {
    // Small delay so users can see the message before redirecting.
    const t = window.setTimeout(() => {
      window.location.replace(MAINLINE_URL);
    }, 800);

    return () => window.clearTimeout(t);
  }, []);

  return (
    <div style={{ padding: 24, color: 'var(--text)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>Link with Mainline Studios</div>
      <div style={{ color: 'rgba(242,242,245,0.8)', fontSize: 14, textAlign: 'center', maxWidth: 420 }}>
        Redirecting you now. If it doesn’t work, use the link below:
      </div>
      <a
        href={MAINLINE_URL}
        style={{
          color: '#1a1d29',
          background: 'linear-gradient(180deg, #a7f3d0 0%, #34d399 100%)',
          textDecoration: 'none',
          padding: '10px 18px',
          borderRadius: 12,
          fontWeight: 700,
        }}
      >
        Continue to Mainline Studios
      </a>
    </div>
  );
}

