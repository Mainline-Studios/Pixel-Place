'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, getAuthToken, removeAuthToken } from '@/lib/api';

export default function SignOutAllPage() {
  const { user, setUser } = useUser();
  const token = getAuthToken();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSignedIn = useMemo(() => Boolean(user?.username && token), [token, user?.username]);

  const onSignOutAll = async () => {
    if (!isSignedIn || busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await authenticatedFetch(apiUrl('/auth/signout-all'), { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to sign out all devices');
      removeAuthToken();
      setUser(null);
      setMessage('Done. All other sessions were signed out. Please sign in again on this device.');
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

        {isSignedIn ? (
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
              onClick={onSignOutAll}
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
              {busy ? 'Signing out all devices...' : 'Sign Out on All Devices'}
            </button>
          </>
        ) : (
          <div
            style={{
              marginBottom: 14,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.35)',
            }}
          >
            You must sign in first.
          </div>
        )}

        {message ? <div style={{ marginTop: 12, color: '#86efac', fontWeight: 600 }}>{message}</div> : null}
        {error ? <div style={{ marginTop: 12, color: '#fca5a5', fontWeight: 600 }}>{error}</div> : null}

        {!isSignedIn ? (
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
            Go to Sign In
          </a>
        ) : null}
      </div>
    </div>
  );
}
