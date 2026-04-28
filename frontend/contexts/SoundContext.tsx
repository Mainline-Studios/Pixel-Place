'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as sounds from '@/lib/sounds';

interface SoundContextType {
  soundsEnabled: boolean;
  setSoundsEnabled: (v: boolean) => void;
  playClick: () => void;
  playTabSwitch: () => void;
  playSuccess: () => void;
  playError: () => void;
  playEquip: () => void;
  playPurchase: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const STORAGE_KEY = 'pixelplace_sounds';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundsEnabled, setSoundsEnabledState] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setSoundsEnabledState(stored === '1');
      }
    } catch {}
  }, []);

  const setSoundsEnabled = useCallback((v: boolean) => {
    setSoundsEnabledState(v);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
      } catch {}
    }
  }, []);

  const wrap = useCallback(
    (fn: () => void) => () => {
      if (soundsEnabled) fn();
    },
    [soundsEnabled]
  );

  const value: SoundContextType = {
    soundsEnabled,
    setSoundsEnabled,
    playClick: wrap(sounds.playClick),
    playTabSwitch: wrap(sounds.playTabSwitch),
    playSuccess: wrap(sounds.playSuccess),
    playError: wrap(sounds.playError),
    playEquip: wrap(sounds.playEquip),
    playPurchase: wrap(sounds.playPurchase),
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      soundsEnabled: true,
      setSoundsEnabled: () => {},
      playClick: () => {},
      playTabSwitch: () => {},
      playSuccess: () => {},
      playError: () => {},
      playEquip: () => {},
      playPurchase: () => {},
    };
  }
  return ctx;
}
