import type { ReactNode } from 'react';
import { WebDeployAuthProvider } from '@/contexts/WebDeployAuthContext';

export default function WebDeployLayout({ children }: { children: ReactNode }) {
  return <WebDeployAuthProvider>{children}</WebDeployAuthProvider>;
}
