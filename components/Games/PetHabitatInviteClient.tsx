'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import PetHabitat from '@/components/Games/PetHabitat';
import { markReadyAccepted } from '@/lib/appSession';
import {
  getPetPrivateInvite,
  isPetInviteCodeFormat,
  parsePetInviteFromPath,
  petInviteLoginRedirectUrl,
  petInvitePublicUrl,
  rememberPendingPetInvite,
} from '@/lib/petHabitatRtdb';

type Gate =
  | { kind: 'loading' }
  | { kind: 'expired' }
  | { kind: 'login'; code: string; roomId: string }
  | { kind: 'ready'; code: string; roomId: string };

function isPetLoginRedirectPath(pathname: string, search = ''): boolean {
  const normalized = String(pathname || '').replace(/\/$/, '') || '/';
  const pathOk = /\/pet-habitat\/invite\/ppph-[a-zA-Z0-9_-]+\/redirect$/i.test(normalized);
  if (!pathOk) return false;
  const q = search.startsWith('?') ? search.slice(1) : search;
  return /(?:^|[?&])=?login=true(?:&|$)/i.test(q) || new URLSearchParams(q).get('login') === 'true';
}

export default function PetHabitatInviteClient() {
  const { user, isRestoring, setUserAcceptedReady } = useUser();
  const [gate, setGate] = useState<Gate>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const code = parsePetInviteFromPath(pathname);
    if (!code || !isPetInviteCodeFormat(code)) {
      setGate({ kind: 'expired' });
      return;
    }

    rememberPendingPetInvite(code);
    const onLoginRedirect = isPetLoginRedirectPath(pathname, search);

    (async () => {
      const invite = await getPetPrivateInvite(code);
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
          /* ignore */
        }
        if (onLoginRedirect) {
          window.location.replace(petInvitePublicUrl(invite.code));
          return;
        }
        setGate({ kind: 'ready', code: invite.code, roomId: invite.roomId });
        return;
      }

      if (isRestoring) {
        setGate({ kind: 'loading' });
        return;
      }

      if (!onLoginRedirect) {
        window.location.replace(petInviteLoginRedirectUrl(invite.code));
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
        <img src="/error-icon.png" alt="" width={72} height={72} style={{ opacity: 0.9 }} />
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>Invite expired</div>
        <div style={{ opacity: 0.75, marginTop: 8, textAlign: 'center', maxWidth: 360 }}>
          This link has expired or doesn&apos;t exist. Create one in Pet Habitat.
        </div>
        <Link href="/games" style={{ marginTop: 16, color: '#7dd3fc', fontWeight: 700 }}>
          Go to Games
        </Link>
      </div>
    );
  }

  if (gate.kind === 'login') {
    return (
      <div style={{ ...shellStyle, justifyContent: 'flex-start', paddingTop: 48 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Sign in to join Pet Habitat</div>
        <Login />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0c1410', padding: 16 }}>
      <PetHabitat
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
  background: 'linear-gradient(160deg, #14201a, #0c1418)',
  color: '#e8f5e9',
  padding: 24,
};
