import {
  LOCALE_CHOICES,
  RTL_LOCALES,
  type SupportedLocale,
  isSupportedLocale,
} from '@/lib/i18n/supportedLocales';

export type { SupportedLocale };
export { LOCALE_CHOICES, isSupportedLocale };

const STORAGE_KEY = 'pixelplace_locale_v1';

function normalizeLangTag(tag: string): string {
  return String(tag || '')
    .trim()
    .replace(/_/g, '-')
    .toLowerCase();
}

/** Map full BCP-47 tag (lowercase, hyphen) → app locale. */
const TAG_TO_LOCALE: Record<string, SupportedLocale> = {
  'en': 'en-US',
  'en-us': 'en-US',
  'en-gb': 'en-US',
  'en-au': 'en-US',
  'en-ca': 'en-US',
  'es': 'es-MX',
  'es-mx': 'es-MX',
  'es-ar': 'es-MX',
  'es-co': 'es-MX',
  'es-cl': 'es-MX',
  'es-pe': 'es-MX',
  'es-ve': 'es-MX',
  'es-uy': 'es-MX',
  'es-py': 'es-MX',
  'es-ec': 'es-MX',
  'es-bo': 'es-MX',
  'es-cr': 'es-MX',
  'es-pa': 'es-MX',
  'es-do': 'es-MX',
  'es-gt': 'es-MX',
  'es-hn': 'es-MX',
  'es-ni': 'es-MX',
  'es-sv': 'es-MX',
  'es-pr': 'es-MX',
  'es-es': 'es-ES',
  'fr': 'fr-FR',
  'fr-fr': 'fr-FR',
  'fr-ca': 'fr-FR',
  'fr-be': 'fr-FR',
  'fr-ch': 'fr-FR',
  'de': 'de-DE',
  'de-de': 'de-DE',
  'de-at': 'de-DE',
  'de-ch': 'de-DE',
  'it': 'it-IT',
  'it-it': 'it-IT',
  'pt': 'pt-BR',
  'pt-br': 'pt-BR',
  'pt-pt': 'pt-PT',
  'nl': 'nl-NL',
  'nl-nl': 'nl-NL',
  'nl-be': 'nl-NL',
  'pl': 'pl-PL',
  'pl-pl': 'pl-PL',
  'ru': 'ru-RU',
  'ru-ru': 'ru-RU',
  'uk': 'uk-UA',
  'uk-ua': 'uk-UA',
  'ja': 'ja-JP',
  'ja-jp': 'ja-JP',
  'ko': 'ko-KR',
  'ko-kr': 'ko-KR',
  'zh': 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-sg': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh-hk': 'zh-TW',
  'zh-mo': 'zh-TW',
  'hi': 'hi-IN',
  'hi-in': 'hi-IN',
  'ar': 'ar-SA',
  'ar-sa': 'ar-SA',
  'ar-ae': 'ar-SA',
  'ar-eg': 'ar-SA',
  'tr': 'tr-TR',
  'tr-tr': 'tr-TR',
  'vi': 'vi-VN',
  'vi-vn': 'vi-VN',
  'th': 'th-TH',
  'th-th': 'th-TH',
  'id': 'id-ID',
  'id-id': 'id-ID',
  'fil': 'fil-PH',
  'fil-ph': 'fil-PH',
  'tl': 'fil-PH',
  'tl-ph': 'fil-PH',
  'sv': 'sv-SE',
  'sv-se': 'sv-SE',
  'da': 'da-DK',
  'da-dk': 'da-DK',
  'nb': 'nb-NO',
  'nb-no': 'nb-NO',
  'nn': 'nb-NO',
  'nn-no': 'nb-NO',
  'no': 'nb-NO',
  'fi': 'fi-FI',
  'fi-fi': 'fi-FI',
  'cs': 'cs-CZ',
  'cs-cz': 'cs-CZ',
  'el': 'el-GR',
  'el-gr': 'el-GR',
  'he': 'he-IL',
  'he-il': 'he-IL',
  'ro': 'ro-RO',
  'ro-ro': 'ro-RO',
  'hu': 'hu-HU',
  'hu-hu': 'hu-HU',
};

const PREFIX_FALLBACK: [string, SupportedLocale][] = [
  ['zh', 'zh-CN'],
  ['en', 'en-US'],
  ['es', 'es-MX'],
  ['fr', 'fr-FR'],
  ['de', 'de-DE'],
  ['it', 'it-IT'],
  ['pt', 'pt-BR'],
  ['nl', 'nl-NL'],
  ['pl', 'pl-PL'],
  ['ru', 'ru-RU'],
  ['uk', 'uk-UA'],
  ['ja', 'ja-JP'],
  ['ko', 'ko-KR'],
  ['hi', 'hi-IN'],
  ['ar', 'ar-SA'],
  ['tr', 'tr-TR'],
  ['vi', 'vi-VN'],
  ['th', 'th-TH'],
  ['id', 'id-ID'],
  ['fil', 'fil-PH'],
  ['sv', 'sv-SE'],
  ['da', 'da-DK'],
  ['nb', 'nb-NO'],
  ['fi', 'fi-FI'],
  ['cs', 'cs-CZ'],
  ['el', 'el-GR'],
  ['he', 'he-IL'],
  ['ro', 'ro-RO'],
  ['hu', 'hu-HU'],
];

function localeFromNavigatorTag(tag: string): SupportedLocale | null {
  const n = normalizeLangTag(tag);
  if (!n) return null;
  if (TAG_TO_LOCALE[n]) return TAG_TO_LOCALE[n];
  const base = n.split('-')[0];
  if (TAG_TO_LOCALE[base]) return TAG_TO_LOCALE[base];
  for (const [prefix, loc] of PREFIX_FALLBACK) {
    if (base === prefix) return loc;
  }
  return null;
}

function localeFromTimeZone(tzRaw: string): SupportedLocale | null {
  const tz = (tzRaw || '').toLowerCase();
  if (!tz) return null;
  if (tz.includes('mexico') || tz === 'america/cancun') return 'es-MX';
  if (tz.includes('madrid')) return 'es-ES';
  if (tz.includes('paris') || tz.includes('brussels')) return 'fr-FR';
  if (tz.includes('berlin') || tz.includes('vienna') || tz.includes('zurich')) return 'de-DE';
  if (tz.includes('rome') || tz.includes('milan')) return 'it-IT';
  if (tz.includes('lisbon')) return 'pt-PT';
  if (tz.includes('sao_paulo') || tz.includes('rio_branco') || tz.includes('fortaleza')) return 'pt-BR';
  if (tz.includes('amsterdam')) return 'nl-NL';
  if (tz.includes('warsaw')) return 'pl-PL';
  if (tz.includes('kyiv') || tz.includes('kiev')) return 'uk-UA';
  if (tz.includes('moscow') || tz.includes('yekaterinburg') || tz.includes('novosibirsk')) return 'ru-RU';
  if (tz === 'asia/tokyo') return 'ja-JP';
  if (tz === 'asia/seoul') return 'ko-KR';
  if (tz === 'asia/shanghai' || tz === 'asia/urumqi') return 'zh-CN';
  if (tz === 'asia/taipei' || tz === 'asia/hong_kong' || tz === 'asia/macau') return 'zh-TW';
  if (tz === 'asia/kolkata' || tz === 'asia/calcutta') return 'hi-IN';
  if (tz.includes('riyadh') || tz.includes('dubai') || tz.includes('baghdad') || tz.includes('cairo')) return 'ar-SA';
  if (tz.includes('istanbul')) return 'tr-TR';
  if (tz.includes('ho_chi_minh') || tz.includes('hanoi')) return 'vi-VN';
  if (tz === 'asia/bangkok') return 'th-TH';
  if (tz.includes('jakarta')) return 'id-ID';
  if (tz.includes('manila')) return 'fil-PH';
  if (tz.includes('stockholm')) return 'sv-SE';
  if (tz.includes('copenhagen')) return 'da-DK';
  if (tz.includes('oslo')) return 'nb-NO';
  if (tz.includes('helsinki')) return 'fi-FI';
  if (tz.includes('prague') || tz.includes('bratislava')) return 'cs-CZ';
  if (tz.includes('athens')) return 'el-GR';
  if (tz.includes('jerusalem') || tz.includes('tel_aviv')) return 'he-IL';
  if (tz.includes('bucharest')) return 'ro-RO';
  if (tz.includes('budapest')) return 'hu-HU';
  return null;
}

export function detectAutoLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en-US';

  try {
    const list =
      typeof navigator.languages !== 'undefined' && navigator.languages?.length
        ? navigator.languages
        : [navigator.language];
    for (const tag of list) {
      const hit = localeFromNavigatorTag(tag);
      if (hit) return hit;
    }
  } catch {
    /* ignore */
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const fromTz = localeFromTimeZone(tz);
    if (fromTz) return fromTz;
  } catch {
    /* ignore */
  }

  return 'en-US';
}

export function getStoredLocale(): SupportedLocale | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && isSupportedLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredLocale(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function getEffectiveLocale(): SupportedLocale {
  return getStoredLocale() || detectAutoLocale();
}

export function applyDocumentLocale(locale: SupportedLocale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}
