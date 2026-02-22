'use client';

import React from 'react';

interface VoidArcadeProps {
  onClose?: () => void;
}

/**
 * Void Arcade — multi-game launcher (Void Crawler, Star Fury, Crystal Keep, Neon Drift).
 * Served as static HTML from public/games/void-arcade.html.
 */
export default function VoidArcade({ onClose }: VoidArcadeProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100vh', position: 'relative' }}>
      <iframe
        src="/games/void-arcade.html"
        title="Void Arcade"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          border: 'none',
          display: 'block',
        }}
        sandbox="allow-scripts allow-same-origin"
      />
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: 9999,
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            padding: '8px 14px',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ◄ Back
        </button>
      )}
    </div>
  );
}
