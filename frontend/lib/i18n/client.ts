'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SUPPORTED_LOCALES } from './settings';

/** Namespaces loaded on demand via HTTP (lazy). */
export const I18N_NAMESPACES = [
  'common',
  'nav',
  'auth',
  'dashboard',
  'sidebar',
  'topbar',
  'settings',
  'shop',
  'games',
  'coins',
  'friends',
  'errors',
  'splash',
  'waiting',
  'break',
  'install',
  'ban',
  'fullscreen',
  'admin',
  'progression',
  'factions',
  'premium',
  'parent',
] as const;

let initPromise: Promise<typeof i18n> | null = null;

export function initI18n(): Promise<typeof i18n> {
  if (i18n.isInitialized) return Promise.resolve(i18n);
  if (initPromise) return initPromise;

  initPromise = i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: [...SUPPORTED_LOCALES],
      ns: [...I18N_NAMESPACES],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'pixelplace_locale',
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      partialBundledLanguages: false,
    })
    .then(() => i18n);

  return initPromise;
}

export { i18n };
