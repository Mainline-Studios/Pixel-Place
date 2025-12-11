'use client';

import { useState, useEffect } from 'react';
import InstallPrompt from '@/components/InstallPrompt';
import { UserProvider, useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import PasswordGate from '@/components/PasswordGate';
import ErrorBoundary from '@/components/ErrorBoundary';

function AppContent() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [passwordVerified, setPasswordVerified] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only access sessionStorage on client side
    if (typeof window === 'undefined') return;
    
    // Check if password has been verified in this session
    try {
      const verified = sessionStorage.getItem('passwordVerified');
      if (verified === 'true') {
        setPasswordVerified(true);
      }
      // Check if splash has been shown before in this session
      const splashShown = sessionStorage.getItem('splashShown');
      if (splashShown) {
        setShowSplash(false);
      }
    } catch (e) {
      console.error('Error accessing sessionStorage:', e);
    }
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const handlePasswordSuccess = () => {
    setPasswordVerified(true);
  };

  const handleSplashComplete = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('splashShown', 'true');
      } catch (e) {
        console.error('Error setting sessionStorage:', e);
      }
    }
    setShowSplash(false);
  };

  if (!passwordVerified) {
    return <PasswordGate onSuccess={handlePasswordSuccess} />;
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <>
      {user ? <Dashboard user={user} /> : <Login />}
      <InstallPrompt />
    </>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ErrorBoundary>
  );
}
