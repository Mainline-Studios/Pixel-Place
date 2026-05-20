'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ColorMode, getStoredColorMode, setStoredColorMode } from '@/lib/colorMode';

type ColorModeContextType = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
};

const ColorModeContext = createContext<ColorModeContextType>({
  colorMode: 'dark',
  setColorMode: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setColorModeState(getStoredColorMode());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setStoredColorMode(colorMode);
  }, [mounted, colorMode]);

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
    setStoredColorMode(mode);
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}
