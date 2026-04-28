'use client';

import { useEffect, useMemo, useState } from 'react';

function studioSrc(): string {
  if (typeof window === 'undefined') return '/pixel-studio/index.html';
  const isLocal =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const env = process.env.NEXT_PUBLIC_PIXEL_STUDIO_URL;
  if (env) return env;
  if (isLocal) return 'http://127.0.0.1:5173/';
  return `${window.location.origin}/pixel-studio/index.html`;
}

/**
 * Embeds the Vite-based Pixel Studio editor (Roblox-style tooling) inside the Games tab.
 * - Local dev: run `npm run dev:studio` so the iframe can load http://127.0.0.1:5173
 * - Production: run `npm run build:studio:embed` before `next build` to copy `studio/dist` into `public/pixel-studio`
 */
export default function PixelStudioGame() {
  const src = useMemo(() => studioSrc(), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [src]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(90vh, 920px)',
        background: '#0c0f16',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <iframe
        title="Pixel Studio"
        src={src}
        onLoad={() => setReady(true)}
        style={{
          width: '100%',
          height: 'min(90vh, 920px)',
          border: 'none',
          display: 'block',
        }}
        allow="clipboard-read; clipboard-write"
      />
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              maxWidth: 520,
              background: 'rgba(12,15,22,0.92)',
              color: '#dbe1f5',
              padding: '12px 14px',
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.5,
              border: '1px solid #242c44',
            }}
          >
            <strong>Pixel Studio</strong> loads from{' '}
            <code style={{ color: '#7aa8ff' }}>{src}</code>. If this stays blank, run{' '}
            <code style={{ color: '#7aa8ff' }}>npm run dev:studio</code> in another terminal, or build with{' '}
            <code style={{ color: '#7aa8ff' }}>npm run build:studio:embed</code> for static hosting.
          </div>
        </div>
      )}
    </div>
  );
}
