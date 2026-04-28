'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { StyleTheme, getStoredStyle, setStoredStyle } from '@/lib/styleTheme';

type StyleContextType = { style: StyleTheme; setStyle: (s: StyleTheme) => void };
const StyleContext = createContext<StyleContextType>({ style: 'normal', setStyle: () => {} });

export function useStyle() {
  return useContext(StyleContext);
}

export function StyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<StyleTheme>('normal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStyleState(getStoredStyle());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-style', style);
  }, [mounted, style]);

  const setStyle = (s: StyleTheme) => {
    setStoredStyle(s);
    setStyleState(s);
  };

  return (
    <StyleContext.Provider value={{ style, setStyle }}>
      {children}
    </StyleContext.Provider>
  );
}
