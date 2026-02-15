'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

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
          color: '#f2f2f5',
        }}
      >
        Oops! Something went wrong
      </h1>
      <p
        style={{
          fontSize: '16px',
          marginBottom: '24px',
          color: '#8b90a8',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        We experienced an error and are currently in the process of fixing it.
      </p>
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          background: 'transparent',
          border: '1px solid #3a3f57',
          color: '#8b90a8',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '24px',
        }}
      >
        {showDetails ? 'Hide error' : 'View error'}
      </button>
      {showDetails && error && (
        <pre
          style={{
            maxWidth: '90%',
            maxHeight: '200px',
            overflow: 'auto',
            background: '#1a1d24',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#c9cdd8',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            marginBottom: '24px',
          }}
        >
          {error.message}
          {error.stack && `\n\n${error.stack}`}
        </pre>
      )}
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
          onClick={() => {
            try { sessionStorage.setItem('pixelPlaceSkipSplash', '1'); } catch {}
          }}
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
          Back to home
        </Link>
      </div>
    </div>
  );
}
