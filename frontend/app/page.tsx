'use client';

import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import { getPlaytimeTracker } from '@/lib/playtimeTracker';
import { User } from '@/types';
import ErrorBoundary from '@/components/ErrorBoundary';
import KonamiCodeEasterEgg from '@/components/KonamiCodeEasterEgg';


function AppContent() {
  const { user } = useUser();
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

  // Start playtime tracking when user signs in (no popup)
  useEffect(() => {
    if (user && !prevUserRef.current) {
      // User just signed in - start tracking but don't show popup
      // Start playtime tracking
      if (typeof window !== 'undefined') {
        const tracker = getPlaytimeTracker();
        tracker.startTracking(user.username);
      }
    } else if (!user && prevUserRef.current) {
      // User logged out - stop tracking
      const tracker = getPlaytimeTracker();
      tracker.stopTracking();
    }
    prevUserRef.current = user;

    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined') {
        const tracker = getPlaytimeTracker();
        tracker.stopTracking();
      }
    };
  }, [user]);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : !user ? (
        <Login />
      ) : (
        <Dashboard user={user} />
      )}
      
      
      {/* Ensure background is visible - avoid pure black */}
      <style jsx global>{`
        html, body {
          background: #1a1d29 !important;
          background-image: radial-gradient(circle at 20% 20%, #2a2e3d 0%, #1a1d29 60%) !important;
          color: #f2f2f5 !important;
          min-height: 100vh;
        }
      `}</style>    </>
  );
}

export default function Home() {
  // Catch any unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);    };
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
