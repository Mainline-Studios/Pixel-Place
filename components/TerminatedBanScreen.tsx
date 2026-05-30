'use client';

import { useEffect } from 'react';
import type { Ban } from '@/types';
import {
  TERMINATED_FIRE_MESSAGE,
  terminatedSubjectFromBan,
  setTerminatedLockFlag,
} from '@/lib/terminatedBan';

interface TerminatedBanScreenProps {
  ban: Ban;
}

export default function TerminatedBanScreen({ ban }: TerminatedBanScreenProps) {
  const subject = terminatedSubjectFromBan(ban);

  useEffect(() => {
    setTerminatedLockFlag(true);
    document.documentElement.setAttribute('data-terminated-ban', '1');
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.removeAttribute('data-terminated-ban');
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        background: '#050000',
        color: '#fff5f0',
        overflow: 'hidden',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(255, 60, 0, 0.55) 0%, transparent 55%), radial-gradient(ellipse 80% 50% at 20% 0%, rgba(255, 120, 0, 0.25) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 80% 10%, rgba(200, 0, 0, 0.3) 0%, transparent 45%)',
          animation: 'pp-terminated-pulse 4s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,80,0,0.08) 2px, rgba(255,80,0,0.08) 4px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(20px, 5vw, 48px)',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(56px, 14vw, 120px)',
            lineHeight: 1,
            marginBottom: '8px',
            filter: 'drop-shadow(0 0 24px rgba(255, 80, 0, 0.9))',
          }}
        >
          🔥
        </div>
        <h1
          style={{
            margin: '0 0 12px',
            fontSize: 'clamp(28px, 6vw, 52px)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #fff 0%, #ff6b35 45%, #c41e00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 40px rgba(255, 50, 0, 0.5)',
          }}
        >
          Terminated
        </h1>
        <p
          style={{
            margin: '0 0 28px',
            fontSize: 'clamp(16px, 3vw, 22px)',
            fontWeight: 700,
            color: '#ff9a6b',
            maxWidth: '640px',
          }}
        >
          {subject}, you have been <span style={{ color: '#ff3b00' }}>FIRED</span> from Pixel Place.
        </p>
        <pre
          style={{
            margin: 0,
            maxWidth: 'min(720px, 100%)',
            padding: '24px 28px',
            borderRadius: '12px',
            border: '2px solid rgba(255, 60, 0, 0.65)',
            background: 'rgba(20, 0, 0, 0.75)',
            boxShadow: '0 0 60px rgba(255, 40, 0, 0.35), inset 0 0 40px rgba(255, 0, 0, 0.08)',
            fontSize: 'clamp(13px, 2.2vw, 16px)',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            color: '#ffe8dc',
            fontFamily: 'inherit',
          }}
        >
          {ban.reason?.trim() || TERMINATED_FIRE_MESSAGE}
        </pre>
        <p
          style={{
            marginTop: '32px',
            fontSize: 'clamp(11px, 2vw, 13px)',
            color: 'rgba(255, 180, 140, 0.55)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Site access revoked · All linked profiles blocked · No appeals
        </p>
      </div>
      <style jsx global>{`
        @keyframes pp-terminated-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.82;
          }
        }
        html[data-terminated-ban='1'] body > *:not([data-terminated-root]) {
          visibility: hidden !important;
        }
      `}</style>
    </div>
  );
}
