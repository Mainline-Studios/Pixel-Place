'use client';

import React, { Suspense, useState, useEffect, useLayoutEffect } from 'react';
import InstallPrompt from '@/components/InstallPrompt';
import { useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import VerifyEmailFlow from '@/components/VerifyEmailFlow';
import SignOutAllFlow from '@/components/SignOutAllFlow';
import { isFocusedAuthPathname, isSignOutAllPathname, isVerifyPathname } from '@/lib/focusedAuthRoutes';
import Dashboard from '@/components/Dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import { isSplashDone, markSplashDone, shouldShowSplash } from '@/lib/appSession';
import BreakReminder from '@/components/BreakReminder';
import BanScreen from '@/components/BanScreen';
import LoginNotice from '@/components/LoginNotice';
import { getPlaytimeTracker } from '@/lib/playtimeTracker';
import { Skin, User } from '@/types';
import ErrorBoundary from '@/components/ErrorBoundary';
import KonamiCodeEasterEgg from '@/components/KonamiCodeEasterEgg';
import UrgentGameBanner from '@/components/UrgentGameBanner';
import PixelPlacePay, { PayPortalInvalid, PayPortalLanding } from '@/components/PixelPlacePay';
import LocalizeText from '@/components/LocalizeText';
import { getPayPortalClientState, getPayPortalOrigin, isPayPortalHostname, type PayPortalClientState } from '@/lib/payPortal';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import { getSkins } from '@/lib/storage';

type PublicUserProfile = {
  userId: number;
  username: string;
  gender?: string;
  role?: string;
  equippedSkin?: string;
  equippedFace?: string;
  coins?: number;
  favoriteGameIds?: string[];
  madeGames?: Array<{ id: string; gameId?: number; title: string; ts?: number }>;
  founderOrdinal?: number;
  isDonor?: boolean;
  createdAt?: number;
};

type PublicGameProfile = {
  gameId: number;
  id: string;
  title: string;
  desc?: string;
  owner?: string;
  ts?: number;
  createdAt?: number;
};

const GAME_LABELS: Record<string, string> = {
  'city-life': 'City Life',
  'hide-and-seek': 'Hide and Seek',
  'musical-mayhem': 'Musical Mayhem',
  'gym-pump': 'Gym Pump',
  'star-catcher': 'Star Catcher',
  'speed-runner': 'Speed Runner',
  'treasure-hunt': 'Treasure Hunt',
};

function PublicUserProfilePage({ userId }: { userId: number }) {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getSkins()
      .then((skinsData) => {
        if (!active) return;
        setSkins(Array.isArray(skinsData) ? skinsData : []);
      })
      .catch(() => {
        if (!active) return;
        setSkins([]);
      });
    return () => {
      active = false;
    };
  }, []);

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

  const equippedSkinModel =
    (profile?.equippedSkin ? skins.find((s) => s.id === profile.equippedSkin) : null)
    || skins.find((s) => s.id === 'pixel_placer')
    || (skins.length > 0 ? skins[0] : null);
  const equippedFaceModel = profile?.equippedFace
    ? skins.find((s) => s.id === profile.equippedFace && s.isFace) || null
    : null;

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
              {equippedSkinModel ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 10px' }}>
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Avatar3DViewer
                      skin={equippedSkinModel}
                      width={96}
                      height={96}
                      interactive={false}
                      animation={equippedSkinModel.defaultAnimation || 'idle'}
                      equippedFace={equippedFaceModel || undefined}
                    />
                  </div>
                </div>
              ) : null}
              <p style={{ margin: '0 0 8px' }}><strong>{profile.username}</strong></p>
              <p style={{ margin: '0 0 6px' }}>Player ID: {profile.userId}</p>
              {profile.gender ? <p style={{ margin: '0 0 6px' }}>Gender: {profile.gender}</p> : null}
              {profile.role ? <p style={{ margin: '0 0 6px' }}>Role: {profile.role}</p> : null}
              {profile.equippedSkin ? <p style={{ margin: '0 0 6px' }}>Equipped Skin: {profile.equippedSkin}</p> : null}
              {profile.equippedFace ? <p style={{ margin: '0 0 6px' }}>Face: {profile.equippedFace}</p> : null}
              {typeof profile.coins === 'number' ? <p style={{ margin: '0 0 6px' }}>Coins: {profile.coins}</p> : null}
              {typeof profile.founderOrdinal === 'number' ? (
                <p style={{ margin: '0 0 6px' }}>Founder Rank: #{profile.founderOrdinal}</p>
              ) : null}
              {profile.createdAt ? (
                <p style={{ margin: '0 0 6px' }}>Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>
              ) : null}
              <div style={{ marginTop: 14 }}>
                <p style={{ margin: '0 0 6px' }}><strong>Favorite Games</strong></p>
                {Array.isArray(profile.favoriteGameIds) && profile.favoriteGameIds.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {profile.favoriteGameIds.map((gameId) => (
                      <li key={gameId}>{GAME_LABELS[gameId] || gameId}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, opacity: 0.8 }}>No favorites yet.</p>
                )}
              </div>
              <div style={{ marginTop: 14 }}>
                <p style={{ margin: '0 0 6px' }}><strong>Made Games</strong></p>
                {Array.isArray(profile.madeGames) && profile.madeGames.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {profile.madeGames.map((game) => (
                      <li key={game.id}>
                        <a
                          href={
                            Number.isInteger(game.gameId) && Number(game.gameId) > 0
                              ? `/game/${game.gameId}`
                              : `/games?playUserGame=${encodeURIComponent(game.id)}`
                          }
                          style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                          title="Open this game page"
                        >
                          {game.title || game.id}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, opacity: 0.8 }}>No made games yet.</p>
                )}
              </div>
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

function PublicGameProfilePage({ gameId }: { gameId: number }) {
  const [game, setGame] = useState<PublicGameProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setGame(null);
    fetch(`/api/game?gameId=${encodeURIComponent(String(gameId))}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Game not found.');
        if (!active) return;
        setGame(data as PublicGameProfile);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Could not load game.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [gameId]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div className="ai-box" style={{ width: 'min(560px, 100%)', margin: 0 }}>
        <div className="ai-label">Game Page</div>
        <div className="ai-output" style={{ lineHeight: 1.7 }}>
          {loading ? (
            <p style={{ margin: 0 }}>Loading game…</p>
          ) : error ? (
            <p style={{ margin: 0, color: '#fecaca' }}>{error}</p>
          ) : game ? (
            <>
              <p style={{ margin: '0 0 8px' }}><strong>{game.title || game.id}</strong></p>
              <p style={{ margin: '0 0 6px' }}>Game ID: {game.gameId}</p>
              {game.owner ? <p style={{ margin: '0 0 6px' }}>Made by: {game.owner}</p> : null}
              {game.desc ? <p style={{ margin: '0 0 6px' }}>{game.desc}</p> : null}
              {game.createdAt ? (
                <p style={{ margin: '0 0 6px' }}>Created: {new Date(game.createdAt).toLocaleDateString()}</p>
              ) : null}
              <div style={{ marginTop: 12 }}>
                <a className="btn" href={`/games?playUserGame=${encodeURIComponent(game.id)}`}>Play this game</a>
              </div>
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
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname || '/';
    if (isFocusedAuthPathname(path)) return false;
    return !isSplashDone();
  });
  const [splashVariant, setSplashVariant] = useState<'full' | 'quick'>('full');
  const prevUserRef = React.useRef<User | null>(null);
  const [payPortal, setPayPortal] = useState<PayPortalClientState>(() => getPayPortalClientState());
  const [publicUserId, setPublicUserId] = useState<number | null>(null);
  const [publicGameId, setPublicGameId] = useState<number | null>(null);
  const [routePath, setRoutePath] = useState('');

  useEffect(() => {
    setPayPortal(getPayPortalClientState());
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '/';
      setRoutePath(path);
      const userMatch = path.match(/^\/user\/(\d+)\/?$/);
      const gameMatch = path.match(/^\/game\/(\d+)\/?$/);
      setPublicUserId(userMatch ? Number(userMatch[1]) : null);
      setPublicGameId(gameMatch ? Number(gameMatch[1]) : null);
    }
  }, []);

  useLayoutEffect(() => {
    if (isFocusedAuthPathname(routePath)) {
      setShowSplash(false);
      return;
    }
    if (isSplashDone()) {
      setShowSplash(false);
      return;
    }
  }, [routePath]);

  useEffect(() => {
    if (isRestoring) return;
    if (isFocusedAuthPathname(routePath)) return;
    if (!shouldShowSplash(!!user)) {
      setShowSplash(false);
      return;
    }
    setSplashVariant(user ? 'quick' : 'full');
    setShowSplash(true);
  }, [isRestoring, user, routePath]);

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

  if (isFocusedAuthPathname(routePath)) {
    if (isVerifyPathname(routePath)) {
      return (
        <Suspense
          fallback={
            <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 20 }}>
              <div style={{ color: 'var(--text-dim)' }}>Loading verification…</div>
            </div>
          }
        >
          <VerifyEmailFlow />
        </Suspense>
      );
    }
    if (isSignOutAllPathname(routePath)) {
      return <SignOutAllFlow />;
    }
  }

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
  if (publicGameId && Number.isFinite(publicGameId) && publicGameId > 0) {
    return <PublicGameProfilePage gameId={publicGameId} />;
  }

  return (
    <>
      <UrgentGameBanner />
      {!showSplash && <LoginNotice />}
      {showSplash ? (
        <SplashScreen
          variant={splashVariant}
          onComplete={() => {
            markSplashDone();
            setShowSplash(false);
          }}
        />
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
