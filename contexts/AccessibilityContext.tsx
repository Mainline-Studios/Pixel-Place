'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

type AccessibilityContextType = {
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  invertColors: boolean;
  setInvertColors: (v: boolean) => void;
  colorBlindMode: ColorBlindMode;
  setColorBlindMode: (v: ColorBlindMode) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const KEY_REDUCE = 'pixelplace_a11y_reduce_motion';
const KEY_INVERT = 'pixelplace_a11y_invert';
const KEY_CVD = 'pixelplace_a11y_colorblind';

function parseColorBlind(raw: string | null): ColorBlindMode {
  if (raw === 'protanopia' || raw === 'deuteranopia' || raw === 'tritanopia') return raw;
  return 'none';
}

function buildHtmlFilter(colorBlindMode: ColorBlindMode, invertColors: boolean): string {
  const parts: string[] = [];
  if (colorBlindMode === 'protanopia') parts.push('url(#pixelplace-cvd-protanopia)');
  if (colorBlindMode === 'deuteranopia') parts.push('url(#pixelplace-cvd-deuteranopia)');
  if (colorBlindMode === 'tritanopia') parts.push('url(#pixelplace-cvd-tritanopia)');
  if (invertColors) parts.push('invert(1) hue-rotate(180deg)');
  return parts.join(' ');
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [invertColors, setInvertColorsState] = useState(false);
  const [colorBlindMode, setColorBlindModeState] = useState<ColorBlindMode>('none');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setReduceMotionState(localStorage.getItem(KEY_REDUCE) === '1');
      setInvertColorsState(localStorage.getItem(KEY_INVERT) === '1');
      setColorBlindModeState(parseColorBlind(localStorage.getItem(KEY_CVD)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const setReduceMotion = useCallback((v: boolean) => {
    setReduceMotionState(v);
    try {
      localStorage.setItem(KEY_REDUCE, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const setInvertColors = useCallback((v: boolean) => {
    setInvertColorsState(v);
    try {
      localStorage.setItem(KEY_INVERT, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const setColorBlindMode = useCallback((v: ColorBlindMode) => {
    setColorBlindModeState(v);
    try {
      localStorage.setItem(KEY_CVD, v);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof document === 'undefined') return;
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [hydrated, reduceMotion]);

  useEffect(() => {
    if (!hydrated || typeof document === 'undefined') return;
    const f = buildHtmlFilter(colorBlindMode, invertColors);
    if (f) document.documentElement.style.filter = f;
    else document.documentElement.style.removeProperty('filter');
  }, [hydrated, colorBlindMode, invertColors]);

  const value = useMemo(
    () => ({
      reduceMotion,
      setReduceMotion,
      invertColors,
      setInvertColors,
      colorBlindMode,
      setColorBlindMode,
    }),
    [
      reduceMotion,
      setReduceMotion,
      invertColors,
      setInvertColors,
      colorBlindMode,
      setColorBlindMode,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      <svg
        aria-hidden
        focusable="false"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter id="pixelplace-cvd-protanopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="pixelplace-cvd-deuteranopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.01182 0.04294 0.968881 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="pixelplace-cvd-tritanopia" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 -0.147602 0 0  0.004733 0.691367 0.3039 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    return {
      reduceMotion: false,
      setReduceMotion: () => {},
      invertColors: false,
      setInvertColors: () => {},
      colorBlindMode: 'none' as ColorBlindMode,
      setColorBlindMode: () => {},
    };
  }
  return ctx;
}

/** OS “reduce motion” or in-app toggle (for canvas / JS-driven motion). */
export function useReducedMotionEffective(): boolean {
  const { reduceMotion: userRm } = useAccessibility();
  const [osRm, setOsRm] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsRm(mq.matches);
    const onChange = () => setOsRm(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return userRm || osRm;
}
