'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18n, i18n } from '@/lib/i18n/client';
import { isRtlLocale, normalizeLocale } from '@/lib/i18n/settings';
import type { AppLocale } from '@/lib/i18n/settings';
import { useUser } from '@/contexts/UserContext';

type I18nBridge = {
  ready: boolean;
  setLanguage: (lng: AppLocale) => Promise<void>;
};

const BridgeContext = createContext<I18nBridge | undefined>(undefined);

export function useI18nBridge(): I18nBridge {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error('useI18nBridge must be used within I18nProvider');
  return ctx;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useUser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void initI18n().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply logged-in user locale when profile loads (overrides detector once)
  useEffect(() => {
    if (!ready || !user?.locale) return;
    const n = normalizeLocale(user.locale);
    if (n && i18n.language !== n) {
      void i18n.changeLanguage(n);
    }
  }, [ready, user?.locale]);

  const setLanguage = useCallback(
    async (lng: AppLocale) => {
      await i18n.changeLanguage(lng);
      try {
        localStorage.setItem('pixelplace_locale', lng);
      } catch {
        /* ignore */
      }
      if (user) {
        await updateUser({ locale: lng });
      }
    },
    [user, updateUser]
  );

  useEffect(() => {
    if (!ready) return;
    const applyDom = (lng: string) => {
      if (typeof document === 'undefined') return;
      document.documentElement.setAttribute('lang', lng);
      document.documentElement.setAttribute('dir', isRtlLocale(lng) ? 'rtl' : 'ltr');
    };
    applyDom(i18n.language);
    i18n.on('languageChanged', applyDom);
    return () => {
      i18n.off('languageChanged', applyDom);
    };
  }, [ready]);

  const bridge = useMemo<I18nBridge>(() => ({ ready, setLanguage }), [ready, setLanguage]);

  if (!ready) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="loading"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1d29',
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.15)',
            borderTopColor: '#4a90e2',
            borderRadius: '50%',
            animation: 'pp-i18n-spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes pp-i18n-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <BridgeContext.Provider value={bridge}>{children}</BridgeContext.Provider>
    </I18nextProvider>
  );
}
