'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_FORCE_DESKTOP = 'pixelplace_force_desktop';

export type MobileBetaContextValue = {
  /** True when using the simplified mobile / touch-first experience */
  isMobileBeta: boolean;
  /** User opted into full desktop layout on this device (Settings) */
  forceDesktop: boolean;
  setForceDesktop: (force: boolean) => void;
};

const MobileBetaContext = createContext<MobileBetaContextValue | null>(null);

function detectRawMobileLayout(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).get('desktop') === '1') return false;
  } catch {
    /* ignore */
  }
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const ua = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  return narrow || (coarse && ua);
}

export function MobileBetaProvider({ children }: { children: React.ReactNode }) {
  const [forceDesktop, setForceDesktopState] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(STORAGE_FORCE_DESKTOP) === '1';
    } catch {
      return false;
    }
  });
  const [rawMobile, setRawMobile] = useState(() =>
    typeof window !== 'undefined' ? detectRawMobileLayout() : false,
  );

  useEffect(() => {
    const apply = () => setRawMobile(detectRawMobileLayout());
    apply();
    const mqNarrow = window.matchMedia('(max-width: 768px)');
    const mqCoarse = window.matchMedia('(pointer: coarse)');
    const onChange = () => apply();
    mqNarrow.addEventListener('change', onChange);
    mqCoarse.addEventListener('change', onChange);
    return () => {
      mqNarrow.removeEventListener('change', onChange);
      mqCoarse.removeEventListener('change', onChange);
    };
  }, []);

  const isMobileBeta = !forceDesktop && rawMobile;

  const setForceDesktop = useCallback((force: boolean) => {
    try {
      if (force) localStorage.setItem(STORAGE_FORCE_DESKTOP, '1');
      else localStorage.removeItem(STORAGE_FORCE_DESKTOP);
    } catch {
      /* ignore */
    }
    setForceDesktopState(force);
  }, []);

  const value = useMemo(
    () => ({ isMobileBeta, forceDesktop, setForceDesktop }),
    [isMobileBeta, forceDesktop, setForceDesktop],
  );

  return <MobileBetaContext.Provider value={value}>{children}</MobileBetaContext.Provider>;
}

export function useMobileBeta(): MobileBetaContextValue {
  const ctx = useContext(MobileBetaContext);
  if (!ctx) {
    return { isMobileBeta: false, forceDesktop: false, setForceDesktop: () => {} };
  }
  return ctx;
}
