/** Client session flags — survive tab routes (/games, /coins) that load separate HTML shells. */

export const INACTIVITY_LOGOUT_MS = 60 * 60 * 1000; // 1 hour

const KEYS = {
  splashDone: 'pixelPlaceSplashDone',
  readyAccepted: 'pixelPlaceReadyAccepted',
  lastActivity: 'pixelPlaceLastActivityAt',
  skipSplash: 'pixelPlaceSkipSplash',
} as const;

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function isSplashDone(): boolean {
  return safeGet(KEYS.splashDone) === '1';
}

export function markSplashDone(): void {
  safeSet(KEYS.splashDone, '1');
  safeRemove(KEYS.skipSplash);
}

export function consumeSkipSplashFlag(): boolean {
  if (safeGet(KEYS.skipSplash) === '1') {
    safeRemove(KEYS.skipSplash);
    markSplashDone();
    return true;
  }
  return false;
}

export function isReadyAccepted(): boolean {
  return safeGet(KEYS.readyAccepted) === '1';
}

export function markReadyAccepted(): void {
  safeSet(KEYS.readyAccepted, '1');
}

export function clearSessionFlags(): void {
  safeRemove(KEYS.splashDone);
  safeRemove(KEYS.readyAccepted);
  safeRemove(KEYS.lastActivity);
  safeRemove(KEYS.skipSplash);
}

export function touchActivity(): void {
  safeSet(KEYS.lastActivity, String(Date.now()));
}

export function getLastActivityAt(): number {
  const raw = safeGet(KEYS.lastActivity);
  if (!raw) return Date.now();
  const n = Number(raw);
  return Number.isFinite(n) ? n : Date.now();
}

export function isInactiveBeyondLimit(limitMs = INACTIVITY_LOGOUT_MS): boolean {
  return Date.now() - getLastActivityAt() > limitMs;
}

export function shouldShowSplash(isLoggedIn: boolean): boolean {
  if (consumeSkipSplashFlag()) return false;
  if (isSplashDone()) return false;
  return true;
}
