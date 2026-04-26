/** BCP-47 tags we ship UI copy for (login + modals). */
export type SupportedLocale =
  | 'en-US'
  | 'es-MX'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'pt-BR'
  | 'pt-PT'
  | 'nl-NL'
  | 'pl-PL'
  | 'ru-RU'
  | 'uk-UA'
  | 'ja-JP'
  | 'ko-KR'
  | 'zh-CN'
  | 'zh-TW'
  | 'hi-IN'
  | 'ar-SA'
  | 'tr-TR'
  | 'vi-VN'
  | 'th-TH'
  | 'id-ID'
  | 'fil-PH'
  | 'sv-SE'
  | 'da-DK'
  | 'nb-NO'
  | 'fi-FI'
  | 'cs-CZ'
  | 'el-GR'
  | 'he-IL'
  | 'ro-RO'
  | 'hu-HU';

export const SUPPORTED_LOCALES = [
  'en-US',
  'es-MX',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'pt-BR',
  'pt-PT',
  'nl-NL',
  'pl-PL',
  'ru-RU',
  'uk-UA',
  'ja-JP',
  'ko-KR',
  'zh-CN',
  'zh-TW',
  'hi-IN',
  'ar-SA',
  'tr-TR',
  'vi-VN',
  'th-TH',
  'id-ID',
  'fil-PH',
  'sv-SE',
  'da-DK',
  'nb-NO',
  'fi-FI',
  'cs-CZ',
  'el-GR',
  'he-IL',
  'ro-RO',
  'hu-HU',
] as const satisfies readonly SupportedLocale[];

const SET = new Set<string>(SUPPORTED_LOCALES);

export function isSupportedLocale(v: string): v is SupportedLocale {
  return SET.has(v);
}

/** Right-to-left document direction for accessibility. */
export const RTL_LOCALES: ReadonlySet<SupportedLocale> = new Set<SupportedLocale>(['ar-SA', 'he-IL']);

/** Language picker labels (native). Order: widely used first, then alphabetical by English name. */
export const LOCALE_CHOICES: { value: SupportedLocale; label: string }[] = [
  { value: 'en-US', label: 'English' },
  { value: 'es-MX', label: 'Español (Latinoamérica)' },
  { value: 'es-ES', label: 'Español (España)' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'it-IT', label: 'Italiano' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'pt-PT', label: 'Português (Portugal)' },
  { value: 'nl-NL', label: 'Nederlands' },
  { value: 'pl-PL', label: 'Polski' },
  { value: 'ru-RU', label: 'Русский' },
  { value: 'uk-UA', label: 'Українська' },
  { value: 'cs-CZ', label: 'Čeština' },
  { value: 'hu-HU', label: 'Magyar' },
  { value: 'ro-RO', label: 'Română' },
  { value: 'el-GR', label: 'Ελληνικά' },
  { value: 'sv-SE', label: 'Svenska' },
  { value: 'da-DK', label: 'Dansk' },
  { value: 'nb-NO', label: 'Norsk (bokmål)' },
  { value: 'fi-FI', label: 'Suomi' },
  { value: 'tr-TR', label: 'Türkçe' },
  { value: 'ar-SA', label: 'العربية' },
  { value: 'he-IL', label: 'עברית' },
  { value: 'hi-IN', label: 'हिन्दी' },
  { value: 'th-TH', label: 'ไทย' },
  { value: 'vi-VN', label: 'Tiếng Việt' },
  { value: 'id-ID', label: 'Bahasa Indonesia' },
  { value: 'fil-PH', label: 'Filipino' },
  { value: 'zh-CN', label: '中文（简体）' },
  { value: 'zh-TW', label: '中文（繁體）' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'ko-KR', label: '한국어' },
];
