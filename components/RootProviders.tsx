'use client';

import { UserProvider } from '@/contexts/UserContext';
import { StyleProvider } from './StyleProvider';

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </StyleProvider>
  );
}
