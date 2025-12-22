'use client';

import InstallPrompt from '@/components/InstallPrompt';
import PrivateAccess from '@/components/PrivateAccess';
import { UserProvider, useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';

function AppContent() {
  const { user } = useUser();

  return (
    <>
      {user ? <Dashboard user={user} /> : <Login />}
      <InstallPrompt />
    </>
  );
}

export default function Home() {
  return (
    <PrivateAccess>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </PrivateAccess>
  );
}
