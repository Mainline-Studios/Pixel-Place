'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseAuth, googleProvider, isFirebaseClientConfigured } from '@/lib/firebaseClient';
import {
  clearWebDeployAuthToken,
  decodeWebDeploySession,
  getWebDeployAuthToken,
  type WebDeploySession,
} from '@/lib/webDeployAuth';
import { exchangeWebDeployGoogleIdToken } from '@/lib/webDeployAuthApi';

type WebDeployAuthContextValue = {
  session: WebDeploySession | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const WebDeployAuthContext = createContext<WebDeployAuthContextValue | null>(null);

export function WebDeployAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WebDeploySession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getWebDeployAuthToken();
    setSession(token ? decodeWebDeploySession(token) : null);
    setLoading(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth || !isFirebaseClientConfigured()) {
      throw new Error('Firebase Auth could not start. Hard-refresh the page or try another browser.');
    }
    const cred = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await cred.user.getIdToken();
    try {
      await firebaseSignOut(firebaseAuth);
    } catch {
      /* keep deploy JWT only */
    }
    const { session: next } = await exchangeWebDeployGoogleIdToken(idToken);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    clearWebDeployAuthToken();
    setSession(null);
    const firebaseAuth = getFirebaseAuth();
    if (firebaseAuth) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const value = useMemo(
    () => ({ session, loading, signInWithGoogle, signOut }),
    [session, loading, signInWithGoogle, signOut],
  );

  return <WebDeployAuthContext.Provider value={value}>{children}</WebDeployAuthContext.Provider>;
}

export function useWebDeployAuth(): WebDeployAuthContextValue {
  const ctx = useContext(WebDeployAuthContext);
  if (!ctx) {
    throw new Error('useWebDeployAuth must be used within WebDeployAuthProvider');
  }
  return ctx;
}
