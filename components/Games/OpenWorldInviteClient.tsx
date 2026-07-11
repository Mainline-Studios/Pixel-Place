'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import OpenWorldPlaza from '@/components/Games/OpenWorldPlaza';
import {
  getPrivateInvite,
  isInviteCodeFormat,
  parseInviteCodeFromPath,
} from '@/lib/openWorldRtdb';

type Gate =
  | { kind: 'loading' }
  | { kind: 'expired' }
  | { kind: 'login'; code: string; roomId: string }
  | { kind: 'ready'; code: string; roomId: string };

/**
 * Client invite gate for /open-world/invite/ppowg-…
 * Invalid / expired codes show the 404-style error card.
 */
export default function OpenWorldInviteClient() {
  const { user, isRestoring } = useUser();
  const [gate, setGate] = useState<Gate>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    const code = parseInviteCodeFromPath(window.location.pathname);
    if (!code || !isInviteCodeFormat(code)) {
      setGate({ kind: 'expired' });
      return;
    }

    (async () => {
      const invite = await getPrivateInvite(code);
      if (!active) return;
      if (!invite) {
        setGate({ kind: 'expired' });
        return;
      }
      if (!user && !isRestoring) {
        setGate({ kind: 'login', code: invite.code, roomId: invite.roomId });
        return;
      }
      if (user) {
        setGate({ kind: 'ready', code: invite.code, roomId: invite.roomId });
      }
    })();

    return () => {
      active = false;
    };
  }, [user, isRestoring]);

  if (gate.kind === 'loading' || isRestoring) {
    return (
      <div style={shellStyle}>
        <div style={{ opacity: 0.8 }}>Checking invite…</div>
      </div>
    );
  }

  if (gate.kind === 'expired') {
    return (
      <div style={shellStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/error-icon.png"
          alt="404"
          width={120}
          height={120}
          style={{ marginBottom: 24, borderRadius: 16 }}
        />
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px', textAlign: 'center' }}>
          This link has expired or doesnt exsist.
        </h1>
        <p style={{ color: '#8b90a8', marginBottom: 28, textAlign: 'center', maxWidth: 420 }}>
          Create one here.
        </p>
        <Link href="/games" style={ctaStyle}>
          Create one here
        </Link>
      </div>
    );
  }

  if (gate.kind === 'login') {
    return (
      <div style={shellStyle}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Private Open World</h1>
        <p style={{ color: '#8b90a8', marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
          Sign in to join this private server invite.
        </p>
        <Link href={`/?next=${encodeURIComponent(`/open-world/invite/${gate.code}`)}`} style={ctaStyle}>
          Sign in
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={shellStyle}>
        <div style={{ opacity: 0.8 }}>Loading account…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', padding: 16, boxSizing: 'border-box' }}>
      <OpenWorldPlaza
        user={user}
        initialRoomId={gate.roomId}
        inviteCode={gate.code}
        onClose={() => {
          window.location.href = '/games';
        }}
      />
    </div>
  );
}

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  background: '#0f1117',
  color: '#f2f2f5',
};

const ctaStyle: CSSProperties = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #00aa88 0%, #008866 100%)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: 12,
  textDecoration: 'none',
  boxShadow: '0 4px 16px rgba(0, 170, 136, 0.4)',
};
