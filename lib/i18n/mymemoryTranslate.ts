/**
 * Client-side translation via MyMemory’s free API (no API key; daily quota applies).
 * @see https://mymemory.translated.net/doc/spec.php
 * Fallback: returns original English if the request fails.
 */

import type { SupportedLocale } from '@/lib/i18n/supportedLocales';

/** MyMemory `langpair` target segment for `en|TARGET` (verified against common API behavior). */
const LOCALE_TO_MYMEMORY_TARGET: Record<SupportedLocale, string> = {
  'en-US': 'en',
  'es-MX': 'es',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'it-IT': 'it',
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-PT',
  'nl-NL': 'nl',
  'pl-PL': 'pl',
  'ru-RU': 'ru',
  'uk-UA': 'uk',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'hi-IN': 'hi',
  'ar-SA': 'ar',
  'tr-TR': 'tr',
  'vi-VN': 'vi',
  'th-TH': 'th',
  'id-ID': 'id',
  'fil-PH': 'tl',
  'sv-SE': 'sv',
  'da-DK': 'da',
  'nb-NO': 'no',
  'fi-FI': 'fi',
  'cs-CZ': 'cs',
  'el-GR': 'el',
  'he-IL': 'he',
  'ro-RO': 'ro',
  'hu-HU': 'hu',
};

const MAX_CHUNK = 420;

function chunkText(s: string): string[] {
  const t = s.trim();
  if (!t) return [];
  if (t.length <= MAX_CHUNK) return [t];
  const parts: string[] = [];
  let i = 0;
  while (i < t.length) {
    let end = Math.min(i + MAX_CHUNK, t.length);
    if (end < t.length) {
      const slice = t.slice(i, end);
      const breakAt = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf('. '));
      if (breakAt > MAX_CHUNK * 0.4) {
        end = i + breakAt + 1;
      }
    }
    parts.push(t.slice(i, end).trim());
    i = end;
  }
  return parts.filter(Boolean);
}

async function fetchChunk(q: string, langpair: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${encodeURIComponent(langpair)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`mymemory ${res.status}`);
  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  const out = data.responseData?.translatedText;
  if (typeof out !== 'string' || !out.trim()) throw new Error('empty translation');
  return out;
}

/**
 * Translate English UI copy into the selected locale using MyMemory (`langpair=en|…`).
 */
export async function translateEnglishWithMyMemory(
  englishText: string,
  locale: SupportedLocale,
): Promise<string> {
  const raw = englishText ?? '';
  if (!raw.trim()) return raw;
  if (locale === 'en-US') return raw;

  const target = LOCALE_TO_MYMEMORY_TARGET[locale];
  if (!target || target === 'en') return raw;

  const langpair = `en|${target}`;
  const chunks = chunkText(raw);
  const out: string[] = [];
  for (const ch of chunks) {
    try {
      const tr = await fetchChunk(ch, langpair);
      out.push(tr);
    } catch {
      out.push(ch);
    }
    await new Promise((r) => setTimeout(r, 110));
  }
  return out.join(chunks.length > 1 ? '\n\n' : '');
}
