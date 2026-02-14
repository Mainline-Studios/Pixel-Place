'use client';

import React, { useState, useEffect } from 'react';
import InstallPrompt from '@/components/InstallPrompt';
import { UserProvider, useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import BreakReminder from '@/components/BreakReminder';
import { getPlaytimeTracker } from '@/lib/playtimeTracker';
import { User } from '@/types';
import ErrorBoundary from '@/components/ErrorBoundary';

const GUEST_USER: User = {
  username: 'Guest',
  password: '',
  gender: '',
  role: 'user',
  coins: 0,
  ownedSkins: ['starter_classic'],
  equippedSkin: 'starter_classic',
  ownedAccessories: [],
  equippedAccessories: {} as Record<string, string>,
  ownedServers: [],
  friends: [],
};

import { pathToTab } from '@/lib/routing';

function AppContent() {
  const { user } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [initialTab, setInitialTab] = useState<string>('home');
  const prevUserRef = React.useRef<User | null>(null);

  // Read pathname for initial tab (preview)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => {
      const tab = pathToTab(window.location.pathname);
      setInitialTab(tab);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  // Close login form when user successfully signs in
  useEffect(() => {
    if (user && showLoginForm) {
      setShowLoginForm(false);
    }
  }, [user, showLoginForm]);

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

  const displayUser = user || GUEST_USER;
  const isPreview = !user;

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : showLoginForm ? (
        <>
          <Login onBack={() => setShowLoginForm(false)} />
          <InstallPrompt />
        </>
      ) : (
        <>
          <Dashboard user={displayUser} />
          <InstallPrompt />
          {user && <BreakReminder />}
        </>
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
    </ErrorBoundary>
  );
}
