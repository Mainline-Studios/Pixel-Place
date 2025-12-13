'use client';

import { useState, useEffect } from 'react';
import InstallPrompt from '@/components/InstallPrompt';
import { UserProvider, useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';
import SplashScreen from '@/components/SplashScreen';
import PasswordGate from '@/components/PasswordGate';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/Toast';
import SecretPage from '@/components/SecretPage';

function AppContent() {
  const [mounted, setMounted] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
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

  // Secret keyboard sequence listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const secretSequence = 'qwertyuiopasdfghjklzxcvbnm';
    let typedSequence = '';
    let lastKeyTime = Date.now();
    const timeoutDuration = 2000; // Reset if no key pressed for 2 seconds

    const handleKeyPress = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Reset if too much time passed
      if (now - lastKeyTime > timeoutDuration) {
        typedSequence = '';
      }
      
      lastKeyTime = now;
      
      // Only track lowercase letters
      if (e.key.length === 1 && /[a-z]/.test(e.key)) {
        typedSequence += e.key.toLowerCase();
        
        // Check if sequence matches
        if (typedSequence === secretSequence) {
          setShowSecret(true);
          typedSequence = ''; // Reset
        } else if (!secretSequence.startsWith(typedSequence)) {
          // Reset if sequence doesn't match
          typedSequence = e.key.toLowerCase();
        }
      } else {
        // Reset on non-letter keys
        typedSequence = '';
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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
      <ToastContainer />
      {showSecret && <SecretPage onClose={() => setShowSecret(false)} />}
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
