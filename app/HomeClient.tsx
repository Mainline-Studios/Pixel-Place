'use client';

import React, { useState, useEffect } from 'react';
import InstallPrompt from '@/components/InstallPrompt';
import { useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import BreakReminder from '@/components/BreakReminder';
import BanScreen from '@/components/BanScreen';
import LoginNotice from '@/components/LoginNotice';
import { getPlaytimeTracker } from '@/lib/playtimeTracker';
import { User } from '@/types';
import ErrorBoundary from '@/components/ErrorBoundary';
import KonamiCodeEasterEgg from '@/components/KonamiCodeEasterEgg';
import UrgentGameBanner from '@/components/UrgentGameBanner';
import PixelPlacePay, { PayPortalInvalid, PayPortalLanding } from '@/components/PixelPlacePay';
import LocalizeText from '@/components/LocalizeText';
import { getPayPortalClientState, getPayPortalOrigin, isPayPortalHostname, type PayPortalClientState } from '@/lib/payPortal';

type PublicUserProfile = {
  userId: number;
  username: string;
  gender?: string;
  role?: string;
  equippedSkin?: string;
  coins?: number;
  founderOrdinal?: number;
  isDonor?: boolean;
  createdAt?: number;
};

function PublicUserProfilePage({ userId }: { userId: number }) {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setProfile(null);
    fetch(`/api/user?userId=${encodeURIComponent(String(userId))}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Profile not found.');
        if (!active) return;
        setProfile(data as PublicUserProfile);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Could not load user profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div className="ai-box" style={{ width: 'min(560px, 100%)', margin: 0 }}>
        <div className="ai-label">User Profile</div>
        <div className="ai-output" style={{ lineHeight: 1.7 }}>
          {loading ? (
            <p style={{ margin: 0 }}>Loading profile…</p>
          ) : error ? (
            <p style={{ margin: 0, color: '#fecaca' }}>{error}</p>
          ) : profile ? (
            <>
              <p style={{ margin: '0 0 8px' }}><strong>{profile.username}</strong></p>
              <p style={{ margin: '0 0 6px' }}>Player ID: {profile.userId}</p>
              {profile.gender ? <p style={{ margin: '0 0 6px' }}>Gender: {profile.gender}</p> : null}
              {profile.role ? <p style={{ margin: '0 0 6px' }}>Role: {profile.role}</p> : null}
              {profile.equippedSkin ? <p style={{ margin: '0 0 6px' }}>Equipped Skin: {profile.equippedSkin}</p> : null}
              {typeof profile.coins === 'number' ? <p style={{ margin: '0 0 6px' }}>Coins: {profile.coins}</p> : null}
              {typeof profile.founderOrdinal === 'number' ? (
                <p style={{ margin: '0 0 6px' }}>Founder Rank: #{profile.founderOrdinal}</p>
              ) : null}
              {profile.createdAt ? (
                <p style={{ margin: '0 0 6px' }}>Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>
              ) : null}
            </>
          ) : null}
          <div style={{ marginTop: 12 }}>
            <a className="btn" href="/">Back to Pixel Place</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, bannedSession, clearBannedSession, deviceBannedSession, clearDeviceBannedSession, isRestoring } = useUser();
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      if (sessionStorage.getItem('pixelPlaceSkipSplash')) {
        sessionStorage.removeItem('pixelPlaceSkipSplash');
        return false;
      }
    } catch {}
    return true;
  });
  const prevUserRef = React.useRef<User | null>(null);
  const [payPortal, setPayPortal] = useState<PayPortalClientState>(() => getPayPortalClientState());
  const [publicUserId, setPublicUserId] = useState<number | null>(null);

  useEffect(() => {
    setPayPortal(getPayPortalClientState());
    if (typeof window !== 'undefined') {
      const m = window.location.pathname.match(/^\/user\/(\d+)\/?$/);
      setPublicUserId(m ? Number(m[1]) : null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = (window.location.pathname || '').replace(/\/$/, '') || '/';
    if (path === '/pay' && !isPayPortalHostname(window.location.hostname)) {
      window.location.replace(`${getPayPortalOrigin()}/`);
    }
  }, []);

  useEffect(() => {
    if (user && !prevUserRef.current) {
      if (typeof window !== 'undefined') {
        const tracker = getPlaytimeTracker();
        tracker.startTracking(user.username);
      }
    } else if (!user && prevUserRef.current) {
      const tracker = getPlaytimeTracker();
      tracker.stopTracking();
    }
    prevUserRef.current = user;

    return () => {
      if (typeof window !== 'undefined') {
        const tracker = getPlaytimeTracker();
        tracker.stopTracking();
      }
    };
  }, [user]);

  if (payPortal.kind === 'checkout') {
    return <PixelPlacePay coins={payPortal.coins} />;
  }
  if (payPortal.kind === 'landing') {
    return <PayPortalLanding />;
  }
  if (payPortal.kind === 'invalid') {
    return <PayPortalInvalid path={payPortal.path} />;
  }
  if (publicUserId && Number.isFinite(publicUserId) && publicUserId > 0) {
    return <PublicUserProfilePage userId={publicUserId} />;
  }

  return (
    <>
      <UrgentGameBanner />
      {!showSplash && <LoginNotice />}
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : bannedSession ? (
        <BanScreen
          ban={bannedSession.ban}
          username={bannedSession.username}
          onAppealSubmitted={clearBannedSession}
        />
      ) : deviceBannedSession ? (
        <BanScreen
          ban={deviceBannedSession.ban}
          username={deviceBannedSession.username}
          onAppealSubmitted={clearDeviceBannedSession}
        />
      ) : !user && isRestoring ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text)', fontSize: '18px' }}>
          <LocalizeText text="Loading…" />
        </div>
      ) : !user ? (
        <>
          <Login />
          <InstallPrompt />
        </>
      ) : (
        <>
          <Dashboard user={user} />
          <InstallPrompt />
          <BreakReminder />
        </>
      )}

      <style jsx global>{`
        html, body {
          background: #1a1d29 !important;
          background-image: radial-gradient(circle at 20% 20%, #2a2e3d 0%, #1a1d29 60%) !important;
          color: #f2f2f5 !important;
          min-height: 100vh;
        }
      `}</style>
    </>
  );
}

export default function HomeClient() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <ErrorBoundary>
      <AppContent />
      <KonamiCodeEasterEgg />
    </ErrorBoundary>
  );
}
