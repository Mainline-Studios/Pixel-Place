'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { SupportedLocale } from '@/lib/i18n/supportedLocales';
import { LOCALE_CHOICES } from '@/lib/i18n/supportedLocales';
import {
  getEffectiveLocale,
  setStoredLocale,
  applyDocumentLocale,
  isSupportedLocale,
} from '@/lib/locale';
import { translateEnglishWithMyMemory } from '@/lib/i18n/mymemoryTranslate';
import { SITE_TRANSLATION_CACHE_KEY } from '@/lib/siteTranslationCache';

export const SITE_LOCALE_EVENT = 'pixelplace-site-locale';

type SiteLanguageContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  localeChoices: typeof LOCALE_CHOICES;
  /** Cached machine translation for arbitrary English UI strings (MyMemory). */
  translate: (englishText: string) => Promise<string>;
};

const SiteLanguageContext = createContext<SiteLanguageContextValue | null>(null);

const CACHE_PREFIX = SITE_TRANSLATION_CACHE_KEY;
const MAX_CACHE_ENTRIES = 400;

function cacheKey(locale: SupportedLocale, text: string): string {
  return `${locale}::${text}`;
}

function readCache(): Map<string, string> {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX);
    if (!raw) return new Map();
    const o = JSON.parse(raw) as Record<string, string>;
    return new Map(Object.entries(o));
  } catch {
    return new Map();
  }
}

function writeCache(map: Map<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    const entries = [...map.entries()];
    const trimmed = entries.slice(-MAX_CACHE_ENTRIES);
    sessionStorage.setItem(CACHE_PREFIX, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    /* quota */
  }
}

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() =>
    typeof window !== 'undefined' ? getEffectiveLocale() : 'en-US',
  );
  const cacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    cacheRef.current = readCache();
    const L = getEffectiveLocale();
    setLocaleState(L);
    applyDocumentLocale(L);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'pixelplace_locale_v1' || !e.newValue) return;
      if (isSupportedLocale(e.newValue)) {
        setLocaleState(e.newValue);
        applyDocumentLocale(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLocale = useCallback((next: SupportedLocale) => {
    setStoredLocale(next);
    setLocaleState(next);
    applyDocumentLocale(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SITE_LOCALE_EVENT, { detail: next }));
    }
  }, []);

  const translate = useCallback((englishText: string) => {
    const key = cacheKey(locale, englishText);
    const hit = cacheRef.current.get(key);
    if (hit != null) return Promise.resolve(hit);
    if (locale === 'en-US') return Promise.resolve(englishText);

    return (async () => {
      const result = await translateEnglishWithMyMemory(englishText, locale);
      cacheRef.current.set(key, result);
      writeCache(cacheRef.current);
      return result;
    })();
  }, [locale]);

  const value = useMemo(
    (): SiteLanguageContextValue => ({
      locale,
      setLocale,
      localeChoices: LOCALE_CHOICES,
      translate,
    }),
    [locale, setLocale, translate],
  );

  return <SiteLanguageContext.Provider value={value}>{children}</SiteLanguageContext.Provider>;
}

export function useSiteLanguage(): SiteLanguageContextValue {
  const ctx = useContext(SiteLanguageContext);
  if (!ctx) {
    throw new Error('useSiteLanguage must be used within SiteLanguageProvider');
  }
  return ctx;
}
