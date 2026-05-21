import type { Anti67State } from '@/lib/anti67';

const SESSION_KEY = 'pixelplace_anti67_lock';

export function syncAnti67Session(anti67: Anti67State): void {
  if (typeof window === 'undefined') return;
  try {
    if (anti67.locked) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(anti67));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function readAnti67Session(): Anti67State | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Anti67State;
    if (!parsed || typeof parsed !== 'object' || parsed.locked !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAnti67Session(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
