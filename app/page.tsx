'use client';

import { useUser } from '@/contexts/UserContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard/Dashboard';

export default function Home() {
  const { user } = useUser();

  return user ? <Dashboard user={user} /> : <Login />;
}
