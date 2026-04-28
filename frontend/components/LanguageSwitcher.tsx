'use client';

import { useTranslation } from 'react-i18next';
import { useI18nBridge } from '@/contexts/I18nProvider';
import { LOCALE_LABELS, SUPPORTED_LOCALES, normalizeLocale, type AppLocale } from '@/lib/i18n/settings';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation('settings');
  const { setLanguage } = useI18nBridge();
  const current = normalizeLocale(i18n.language) ?? 'en';

  return (
    <select
      aria-label={t('language')}
      value={current}
      onChange={(e) => void setLanguage(e.target.value as AppLocale)}
      className={cn(
        'flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm',
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      {SUPPORTED_LOCALES.map((lng) => (
        <option key={lng} value={lng}>
          {LOCALE_LABELS[lng]}
        </option>
      ))}
    </select>
  );
}
