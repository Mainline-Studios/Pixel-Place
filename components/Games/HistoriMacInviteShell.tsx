'use client';

import React, { useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import HistoriMac from '@/components/Games/HistoriMac';

type Props = {
  versionId: string;
  label: string;
};

/**
 * Discord-style invite gate → HistoriMac in standalone mode (no Back to games / no Close).
 */
export default function HistoriMacInviteShell({ versionId, label }: Props) {
  const { user, isRestoring } = useUser();
  const [started, setStarted] = useState(false);

  const onBootConsumed = useCallback(() => {}, []);

  if (started) {
    return (
      <HistoriMac
        standaloneInvite
        bootVersionId={versionId}
        onBootVersionConsumed={onBootConsumed}
      />
    );
  }

  /** Only block on session restore — not `gettingReady` (Firestore sync can take 6s+ and isn’t needed for guest play). */
  const sessionLoading = isRestoring;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 16,
          padding: '28px 24px 24px',
          background: 'linear-gradient(180deg, rgba(42, 46, 62, 0.95) 0%, rgba(28, 31, 44, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 42, lineHeight: 1, marginBottom: 12 }} aria-hidden>
            🖥️
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#fff',
            }}
          >
            Welcome to Pixel Place!
          </h1>
        </div>

        <p
          style={{
            margin: '16px 0 20px',
            fontSize: '0.95rem',
            lineHeight: 1.55,
            color: 'rgba(232, 232, 239, 0.92)',
            textAlign: 'center',
          }}
        >
          The game you&apos;re about to play is{' '}
          <strong style={{ color: '#fff' }}>HistoriMac</strong>, emulating{' '}
          <strong style={{ color: '#7dd3fc' }}>{label}</strong>.
        </p>

        {sessionLoading ? (
          <p style={{ textAlign: 'center', color: 'rgba(232,232,239,0.7)', fontSize: 14 }}>Loading…</p>
        ) : user ? (
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '0.88rem',
              textAlign: 'center',
              color: 'rgba(180, 200, 255, 0.95)',
            }}
          >
            Signed in as <strong style={{ color: '#fff' }}>{user.username}</strong>.
          </p>
        ) : (
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '0.88rem',
              textAlign: 'center',
              color: 'rgba(232, 232, 239, 0.75)',
            }}
          >
            <a
              href="/"
              style={{
                color: '#7dd3fc',
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Log in here
            </a>{' '}
            at Pixel Place, or play below without an account.
          </p>
        )}

        <button
          type="button"
          onClick={() => setStarted(true)}
          disabled={sessionLoading}
          style={{
            display: 'block',
            width: '100%',
            padding: '14px 20px',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f1419',
            background: 'linear-gradient(180deg, #86efac 0%, #4ade80 45%, #22c55e 100%)',
            border: 'none',
            borderRadius: 12,
            cursor: sessionLoading ? 'wait' : 'pointer',
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.35)',
            opacity: sessionLoading ? 0.7 : 1,
          }}
        >
          {user ? 'Play HistoriMac' : 'Play as guest'}
        </button>

        <p
          style={{
            margin: '16px 0 0',
            fontSize: '0.75rem',
            textAlign: 'center',
            color: 'rgba(232, 232, 239, 0.45)',
            lineHeight: 1.45,
          }}
        >
          Powered by Infinite Mac in your browser. This page is only HistoriMac — not the full games grid.
        </p>
      </div>
    </div>
  );
}
