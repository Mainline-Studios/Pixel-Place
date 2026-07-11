'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import OpenWorldPlaza from '@/components/Games/OpenWorldPlaza';
import { markReadyAccepted } from '@/lib/appSession';
import {
  getPrivateInvite,
  inviteLoginRedirectUrl,
  invitePublicUrl,
  isInviteCodeFormat,
  isInviteLoginRedirectPath,
  parseInviteCodeFromPath,
  rememberPendingOpenWorldInvite,
} from '@/lib/openWorldRtdb';

type Gate =
  | { kind: 'loading' }
  | { kind: 'expired' }
  | { kind: 'login'; code: string; roomId: string }
  | { kind: 'ready'; code: string; roomId: string };

/**
 * Client invite gate for /open-world/invite/ppowg-…
 * Logged-out visitors auto-go to …/redirect?login=true and sign in there,
 * then return to the clean invite URL (without getting stuck on main Pixel Place).
 */
export default function OpenWorldInviteClient() {
  const { user, isRestoring, setUserAcceptedReady } = useUser();
  const [gate, setGate] = useState<Gate>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const code = parseInviteCodeFromPath(pathname);
    if (!code || !isInviteCodeFormat(code)) {
      setGate({ kind: 'expired' });
      return;
    }

    rememberPendingOpenWorldInvite(code);
    const onLoginRedirect = isInviteLoginRedirectPath(pathname, search);

    (async () => {
      const invite = await getPrivateInvite(code);
      if (!active) return;
      if (!invite) {
        setGate({ kind: 'expired' });
        return;
      }

        if (user) {
        try {
          setUserAcceptedReady(true);
          markReadyAccepted();
        } catch {
          // ignore
        }
        // After login on /redirect?login=true, drop the login suffix
        if (onLoginRedirect) {
          window.location.replace(invitePublicUrl(invite.code));
          return;
        }
        setGate({ kind: 'ready', code: invite.code, roomId: invite.roomId });
        return;
      }

      if (isRestoring) {
        setGate({ kind: 'loading' });
        return;
      }

      // Not logged in: same invite link + /redirect?login=true
      if (!onLoginRedirect) {
        window.location.replace(inviteLoginRedirectUrl(invite.code));
        return;
      }

      setGate({ kind: 'login', code: invite.code, roomId: invite.roomId });
    })();

    return () => {
      active = false;
    };
  }, [user, isRestoring, setUserAcceptedReady]);

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
      <div style={{ minHeight: '100vh', background: '#0f1117' }}>
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '20px 16px 8px',
            color: '#e8e8ef',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>Private Open World invite</div>
          <div style={{ fontSize: 12, opacity: 0.55, wordBreak: 'break-all', marginBottom: 12 }}>
            {inviteLoginRedirectUrl(gate.code)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
            Sign in to join this server. You&apos;ll return to the invite automatically.
          </div>
        </div>
        <Login />
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
