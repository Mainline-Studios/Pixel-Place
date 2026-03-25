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

  const maxTablet = window.matchMedia('(max-width: 1024px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;

  const ua = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  // iPadOS 13+ often uses a desktop "Macintosh" UA with no "iPad" substring — still a touch tablet.
  const isIpadOs =
    /iPad/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Phones and typical Android tablets (incl. wide landscape): mobile UA + touch primary pointer
  if (coarse && ua) return true;
  // iPad / iPadOS "request desktop website": width often > 768px and UA does not match mobile regex
  if (isIpadOs) return true;
  // Touch-first device in a tablet-sized viewport (covers odd UAs; avoids desktop mouse setups)
  if (maxTablet && coarse && noHover) return true;

  return false;
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
    const mqTablet = window.matchMedia('(max-width: 1024px)');
    const mqCoarse = window.matchMedia('(pointer: coarse)');
    const mqNoHover = window.matchMedia('(hover: none)');
    const onChange = () => apply();
    mqTablet.addEventListener('change', onChange);
    mqCoarse.addEventListener('change', onChange);
    mqNoHover.addEventListener('change', onChange);
    return () => {
      mqTablet.removeEventListener('change', onChange);
      mqCoarse.removeEventListener('change', onChange);
      mqNoHover.removeEventListener('change', onChange);
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
