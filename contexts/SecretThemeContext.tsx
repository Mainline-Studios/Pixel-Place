'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const STORAGE_KEY = 'pixelplace_secret_theme';
export type SecretThemeId = 'ixelace' | null;

const SECRET_PASSWORDS: Record<string, SecretThemeId> = {
  'ixel ace': 'ixelace',
};

function getStoredSecretTheme(): SecretThemeId {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem(STORAGE_KEY);
  if (s === 'ixelace') return 'ixelace';
  return null;
}

function setStoredSecretTheme(theme: SecretThemeId): void {
  if (typeof window === 'undefined') return;
  if (theme) localStorage.setItem(STORAGE_KEY, theme);
  else localStorage.removeItem(STORAGE_KEY);
}

type SecretThemeContextType = {
  secretTheme: SecretThemeId;
  unlockSecretTheme: (password: string) => boolean;
  clearSecretTheme: () => void;
};

const SecretThemeContext = createContext<SecretThemeContextType>({
  secretTheme: null,
  unlockSecretTheme: () => false,
  clearSecretTheme: () => {},
});

export function useSecretTheme() {
  return useContext(SecretThemeContext);
}

export function SecretThemeProvider({ children }: { children: ReactNode }) {
  const [secretTheme, setSecretThemeState] = useState<SecretThemeId>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSecretThemeState(getStoredSecretTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    if (secretTheme) {
      document.documentElement.setAttribute('data-secret-theme', secretTheme);
    } else {
      document.documentElement.removeAttribute('data-secret-theme');
    }
  }, [mounted, secretTheme]);

  const unlockSecretTheme = (password: string): boolean => {
    const trimmed = (password || '').trim().toLowerCase();
    const theme = SECRET_PASSWORDS[trimmed];
    if (theme) {
      setStoredSecretTheme(theme);
      setSecretThemeState(theme);
      return true;
    }
    return false;
  };

  const clearSecretTheme = () => {
    setStoredSecretTheme(null);
    setSecretThemeState(null);
  };

  return (
    <SecretThemeContext.Provider value={{ secretTheme, unlockSecretTheme, clearSecretTheme }}>
      {children}
    </SecretThemeContext.Provider>
  );
}
