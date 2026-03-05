'use client';

import React from 'react';

interface EcoHeroProps {
  onClose?: () => void;
}

/**
 * Eco Hero — City Cleanup. HTML game with AI citizens (Anthropic).
 * Served from public/games/eco-hero.html (gitignored; contains API key).
 */
export default function EcoHero({ onClose }: EcoHeroProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100vh', position: 'relative' }}>
      <iframe
        src="/games/eco-hero.html"
        title="Eco Hero — City Cleanup"
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
