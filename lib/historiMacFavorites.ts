/**
 * Persisted “saved” picks for HistoriMac (localStorage only).
 * Emulator disk state lives on Infinite Mac — we only store version IDs here.
 */
const FAVORITES_KEY = 'historiMac_favorites_v1';

export function readFavoriteVersionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeFavoriteVersionIds(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    /* quota / private mode */
  }
}

export function isFavoriteVersion(id: string): boolean {
  return readFavoriteVersionIds().includes(id);
}

/** @returns true if the version is favorited after the toggle */
export function toggleFavoriteVersion(id: string): boolean {
  const cur = [...readFavoriteVersionIds()];
  const i = cur.indexOf(id);
  if (i >= 0) {
    cur.splice(i, 1);
    writeFavoriteVersionIds(cur);
    return false;
  }
  cur.push(id);
  writeFavoriteVersionIds(cur);
  return true;
}
