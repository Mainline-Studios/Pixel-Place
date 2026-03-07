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

  return (
    <>
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
          Loading…
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
