import { filterForDisplayServer } from '@/lib/pyx';

const DEFAULT_KEYWORDS = [
  'kill yourself',
  'kys',
  'nazi',
  'terrorist',
  'rape',
  'child porn',
];

function envKeywords(): string[] {
  const raw = process.env.MODERATION_BLOCK_KEYWORDS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Fast local keyword gate before Pyx (latency). */
export function hitsBlockedKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  const all = [...DEFAULT_KEYWORDS, ...envKeywords()];
  return all.some((k) => k.length > 0 && lower.includes(k));
}

export type TextModerationResult =
  | { ok: true; filteredText: string }
  | { ok: false; reason: 'keyword' | 'pyx'; filteredText?: string };

export async function moderateOutgoingText(text: string): Promise<TextModerationResult> {
  if (!text || typeof text !== 'string') return { ok: true, filteredText: '' };
  if (hitsBlockedKeyword(text)) {
    return { ok: false, reason: 'keyword' };
  }
  const filtered = await filterForDisplayServer(text);
  return { ok: true, filteredText: filtered };
}

/** Heuristic “pixel abuse”: oversized payload or uniform flood (same color repeated). */
export function evaluatePixelPayload(body: {
  color?: string;
  imageBase64?: string;
  x?: number;
  y?: number;
}): { ok: true } | { ok: false; reason: string } {
  if (body.imageBase64 && body.imageBase64.length > 800_000) {
    return { ok: false, reason: 'image_too_large' };
  }
  return { ok: true };
}
