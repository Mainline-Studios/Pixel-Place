'use client';

import { useEffect } from 'react';

const MAINLINE_URL = 'https://mainline-gaming-hub.base44.app';

export default function MainlineLoginRedirect() {
  useEffect(() => {
    // Client-side redirect so this works with `output: "export"`.
    window.location.replace(MAINLINE_URL);
  }, []);

  return (
    <div style={{ padding: 24, color: 'var(--text)' }}>
      Redirecting to Mainline Studios…
    </div>
  );
}

