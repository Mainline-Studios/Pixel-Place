'use client';

import React from 'react';

type Props = {
  onClose?: () => void;
};

export default function OceanLifePro({ onClose }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#061422',
      }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 20,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Close
        </button>
      )}

      <iframe
        title="OceanLife Pro"
        src="/games/oceanlife-pro/index.html"
        style={{
          width: '100%',
          height: '100vh',
          border: 0,
          display: 'block',
          background: '#061422',
        }}
        allow="fullscreen; clipboard-read; clipboard-write"
        loading="eager"
      />
    </div>
  );
}

