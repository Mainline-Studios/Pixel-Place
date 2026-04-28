'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function intlLocaleTag(language: string): string {
  if (!language) return 'en-US';
  const lower = language.toLowerCase();
  if (lower.startsWith('zh')) return 'zh-CN';
  const short = lower.split('-')[0] ?? 'en';
  const map: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
  };
  return map[short] ?? language;
}

export function useLocaleFormat() {
  const { i18n } = useTranslation();
  const locale = intlLocaleTag(i18n.language);

  return useMemo(
    () => ({
      locale,
      language: i18n.language,
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(locale, options).format(value),
      formatDecimal: (value: number, fractionDigits = 2) =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(value),
      formatDate: (input: Date | number, options?: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, options ?? { dateStyle: 'medium' }).format(new Date(input)),
      formatTime: (input: Date | number, options?: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, options ?? { timeStyle: 'short' }).format(new Date(input)),
      formatDateTime: (input: Date | number, options?: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, options ?? { dateStyle: 'medium', timeStyle: 'short' }).format(
          new Date(input)
        ),
      formatCurrency: (value: number, currency = 'USD') =>
        new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value),
    }),
    [locale, i18n.language]
  );
}
