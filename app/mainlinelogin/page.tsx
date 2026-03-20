'use client';

import { useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getAuthToken } from '@/lib/api';

const MAINLINE_URL = 'https://mainline-gaming-hub.base44.app';

export default function MainlineLoginRedirect() {
  const { user } = useUser();
  const pixelPlaceToken = getAuthToken();

  const recentPreview = useMemo(() => {
    const list = user?.recentlyPlayed || [];
    // Show only a few in the UI; keep the full list for the handoff below.
    return list.slice(-5).reverse();
  }, [user?.recentlyPlayed]);

  const handoffUrl = useMemo(() => {
    try {
      const url = new URL(MAINLINE_URL);
      url.searchParams.set('pixelPlaceAction', 'login');

      if (user?.username) url.searchParams.set('pixelPlaceUsername', user.username);
      if (pixelPlaceToken) url.searchParams.set('pixelPlaceToken', pixelPlaceToken);

      const recent = user?.recentlyPlayed || [];
      if (recent.length) url.searchParams.set('pixelPlaceRecent', recent.join(','));
      return url.toString();
    } catch {
      return MAINLINE_URL;
    }
  }, [pixelPlaceToken, user?.recentlyPlayed, user?.username]);

  useEffect(() => {
    // Small wait so the UI can render + so user context has a chance to hydrate.
    const startedAt = Date.now();
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      const hasUsername = !!user?.username;
      const hasRecent = (user?.recentlyPlayed?.length || 0) > 0;
      // Wait for recent games to hydrate so the Mainline site can preload them.
      // If it takes too long, fall back to redirect anyway.
      const shouldRedirect = (hasUsername && hasRecent) || elapsed > 2500;

      if (shouldRedirect) {
        window.location.replace(handoffUrl);
      } else {
        window.setTimeout(tick, 200);
      }
    };

    const t = window.setTimeout(tick, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [handoffUrl, user?.username]);

  return (
    <div style={{ padding: 24, color: 'var(--text)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>Link with Mainline Studios</div>
      <div style={{ color: 'rgba(242,242,245,0.8)', fontSize: 14, textAlign: 'center', maxWidth: 420 }}>
        We’ll sign you in on the Mainline site and send your recent games. If it doesn’t work, use the link below:
      </div>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {user?.username ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Signed in as {user.username}</div>
            {recentPreview.length > 0 ? (
              <div style={{ fontSize: 13, color: 'rgba(242,242,245,0.85)' }}>
                Recent games: <span style={{ color: 'var(--accent)' }}>{recentPreview.join(', ')}</span>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'rgba(242,242,245,0.85)' }}>No recent games found yet.</div>
            )}
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', color: 'rgba(242,242,245,0.85)' }}>
            If you’re not signed into Pixel Place yet, sign in and try again.
          </div>
        )}
      </div>
      <a
        href={handoffUrl}
        style={{
          color: '#1a1d29',
          background: 'linear-gradient(180deg, #a7f3d0 0%, #34d399 100%)',
          textDecoration: 'none',
          padding: '10px 18px',
          borderRadius: 12,
          fontWeight: 700,
        }}
      >
        Continue to Mainline Studios
      </a>
    </div>
  );
}

