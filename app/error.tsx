'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#0f1117',
        color: '#f2f2f5',
      }}
    >
      <Image
        src="/error-icon.png"
        alt="Something went wrong"
        width={120}
        height={120}
        style={{ marginBottom: '24px', borderRadius: '16px' }}
      />
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#ff4d4d',
        }}
      >
        Something went wrong!
      </h1>
      <p
        style={{
          fontSize: '16px',
          marginBottom: '32px',
          color: '#8b90a8',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        {error.message || 'An unexpected error occurred'}
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(135deg, #2a2f45 0%, #3a415e 100%)',
            border: '1px solid #3a3f57',
            color: '#f2f2f5',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 10px 24px rgba(0, 0, 0, .8), 0 0 20px rgba(255, 255, 255, .07)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#3a415e';
            e.currentTarget.style.borderColor = '#9fa4b8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #2a2f45 0%, #3a415e 100%)';
            e.currentTarget.style.borderColor = '#3a3f57';
          }}
        >
          Try again
        </button>
        <Link
          href="/games"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #00aa88 0%, #008866 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0, 170, 136, 0.4)',
          }}
        >
          Back to Games
        </Link>
      </div>
    </div>
  );
}
