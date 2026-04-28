/** BCP 47 codes used by i18next / Intl */
export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'zh-CN'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  'zh-CN': '中文（简体）',
};

/** Locales that use RTL layout when selected (future languages). */
export const RTL_LOCALE_PREFIXES = ['ar', 'he', 'fa', 'ur'];

export function isRtlLocale(language: string): boolean {
  const low = language.toLowerCase();
  return RTL_LOCALE_PREFIXES.some((p) => low === p || low.startsWith(`${p}-`));
}

export function normalizeLocale(raw: string | undefined | null): AppLocale | null {
  if (!raw || typeof raw !== 'string') return null;
  const t = raw.trim();
  if ((SUPPORTED_LOCALES as readonly string[]).includes(t)) return t as AppLocale;
  const lower = t.toLowerCase();
  if (lower === 'zh' || lower.startsWith('zh-cn') || lower === 'zh_cn') return 'zh-CN';
  const short = lower.split('-')[0];
  if (short === 'en') return 'en';
  if (short === 'es') return 'es';
  if (short === 'fr') return 'fr';
  if (short === 'de') return 'de';
  return null;
}
