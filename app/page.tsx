'use client';

import { useState, useEffect } from 'react';
import InstallPrompt from '@/components/InstallPrompt';
import { UserProvider, useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';

function AppContent() {
  const { user } = useUser();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    // Wait a moment for user restoration from sessionStorage
    const timer = setTimeout(() => {
      setIsRestoring(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show nothing while restoring to prevent flash of login screen
  if (isRestoring) {
    return null;
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
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
