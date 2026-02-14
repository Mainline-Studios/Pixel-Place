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
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
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

  // Show popup when user signs in and start playtime tracking
  useEffect(() => {
    if (user && !prevUserRef.current) {
      // User just signed in
      const offlineStatus = typeof window !== 'undefined' && sessionStorage.getItem('pixelPlaceOffline') === 'true';
      setIsOffline(offlineStatus);
      setPopupMessage(offlineStatus 
        ? 'Not connected. You can still play offline games! Your data will sync when you reconnect.' 
        : 'Logged in Successfully');
      setShowPopup(true);
      // Auto-hide popup after 4 seconds for offline mode (longer to read message)
      setTimeout(() => {
        setShowPopup(false);
      }, offlineStatus ? 5000 : 3000);

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
          <Dashboard user={displayUser} initialTab={initialTab} isPreview={isPreview} />
          {isPreview && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: 'linear-gradient(135deg, rgba(0, 170, 255, 0.95) 0%, rgba(0, 120, 200, 0.95) 100%)',
                color: '#fff',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                Explore Pixel Place — Log in or sign up to play games and save your progress!
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowLoginForm(true)}
                  style={{
                    padding: '10px 20px',
                    background: '#fff',
                    color: '#0066aa',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Log in
                </button>
                <button
                  onClick={() => setShowLoginForm(true)}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255,255,255,0.25)',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Sign up
                </button>
              </div>
            </div>
          )}
          <InstallPrompt />
          {user && <BreakReminder />}
        </>
      )}
      
      {/* Status Popup */}
      {showPopup && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: isOffline ? '#ff9800' : '#4caf50',
            color: '#ffffff',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 10000,
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {isOffline ? '⚠️ Not Connected' : '✅ Logged in Successfully'}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {popupMessage}
              </div>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
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
