'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import PasswordGate from '@/components/PasswordGate';

export default function Home() {
  const { user } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [passwordVerified, setPasswordVerified] = useState(false);

  useEffect(() => {
    // Check if password has been verified in this session
    const verified = sessionStorage.getItem('passwordVerified');
    if (verified === 'true') {
      setPasswordVerified(true);
    }
    // Check if splash has been shown before in this session
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handlePasswordSuccess = () => {
    setPasswordVerified(true);
  };

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  if (!passwordVerified) {
    return <PasswordGate onSuccess={handlePasswordSuccess} />;
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return user ? <Dashboard user={user} /> : <Login />;
}
