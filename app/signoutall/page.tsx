'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage, hasUsableAuthToken, removeAuthToken } from '@/lib/api';
import FocusedSignIn from '@/components/FocusedSignIn';

export default function SignOutAllPage() {
  const { user, setUser } = useUser();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSignedIn = useMemo(
    () => Boolean(user?.username && hasUsableAuthToken()),
    [user?.username],
  );

  const onSignOutAll = async () => {
    if (!isSignedIn || busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await authenticatedFetch(apiUrl('/api/auth/signout-all'), { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(authErrorMessage(res.status, data));
      setMessage('Done. All sessions were signed out. Sign in again on any device when you are ready.');
      removeAuthToken();
      setUser(null);
    } catch (e: any) {
      setError(String(e?.message || 'Failed to sign out all devices'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'rgba(18,22,36,0.9)',
          border: '1px solid rgba(132, 145, 255, 0.35)',
          borderRadius: 14,
          padding: 20,
          color: 'var(--text, #f3f4f6)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800 }}>Sign Out All Devices</h1>
        <p style={{ margin: '0 0 16px', color: 'rgba(243,244,246,0.82)' }}>
          This logs your account out everywhere by revoking all existing sessions.
        </p>

        {!isSignedIn ? (
          <FocusedSignIn
            title="Sign in first"
            subtitle="Sign in below, then you can sign out all devices on the next screen."
            submitLabel="Sign in to continue"
          />
        ) : (
          <>
            <div
              style={{
                marginBottom: 14,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.35)',
              }}
            >
              Signed in as <strong>{user?.username}</strong>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => void onSignOutAll()}
              disabled={busy}
              style={{
                width: '100%',
                padding: '11px 14px',
                fontWeight: 700,
                borderRadius: 10,
                border: '1px solid rgba(248,113,113,0.55)',
                background: busy ? 'rgba(248,113,113,0.25)' : 'rgba(248,113,113,0.15)',
                color: '#fecaca',
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Signing out all devices…' : 'Sign out on all devices'}
            </button>
          </>
        )}

        {message ? <div style={{ marginTop: 12, color: '#86efac', fontWeight: 600 }}>{message}</div> : null}
        {error ? <div style={{ marginTop: 12, color: '#fca5a5', fontWeight: 600 }}>{error}</div> : null}

        {message ? (
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 14,
              color: '#93c5fd',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign in on this device
          </a>
        ) : null}
      </div>
    </div>
  );
}
