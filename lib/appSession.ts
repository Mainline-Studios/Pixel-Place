/** Client session flags — survive tab routes (/games, /coins) that load separate HTML shells. */

import { getDeviceFingerprint } from '@/lib/deviceFingerprint';

export const INACTIVITY_LOGOUT_MS = 60 * 60 * 1000; // 1 hour

/** When true, every device sees the full startup splash (device flag still saved for later). */
export const SPLASH_SHOW_ON_EVERY_DEVICE_FOR_NOW = true;

const KEYS = {
  splashDone: 'pixelPlaceSplashDone',
  readyAccepted: 'pixelPlaceReadyAccepted',
  lastActivity: 'pixelPlaceLastActivityAt',
  skipSplash: 'pixelPlaceSkipSplash',
  firstOpenSplash: 'pixelPlaceFirstOpenSplashDone',
  replaySplash: 'pixelPlaceReplaySplash',
} as const;

function deviceSplashKey(deviceId: string): string {
  const safe = String(deviceId).slice(0, 128).replace(/[^a-zA-Z0-9_-]/g, '') || 'unknown';
  return `pixelPlaceDeviceSplash_${safe}`;
}

function safeLocalGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

function safeLocalRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

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

/** Device has finished the full startup splash at least once. */
export function hasDeviceSeenSplash(deviceId: string): boolean {
  if (SPLASH_SHOW_ON_EVERY_DEVICE_FOR_NOW) return false;
  return safeLocalGet(deviceSplashKey(deviceId)) === '1';
}

export function markDeviceSplashSeen(deviceId: string): void {
  safeLocalSet(deviceSplashKey(deviceId), '1');
  safeLocalSet(KEYS.firstOpenSplash, '1');
}

export function clearDeviceSplashSeen(deviceId: string): void {
  safeLocalRemove(deviceSplashKey(deviceId));
  safeLocalRemove(KEYS.firstOpenSplash);
}

/** @deprecated Use hasDeviceSeenSplash(deviceId) */
export function hasSeenFirstOpenSplash(): boolean {
  const { deviceId } = getDeviceFingerprint();
  return hasDeviceSeenSplash(deviceId);
}

/** @deprecated Use markDeviceSplashSeen(deviceId) */
export function markFirstOpenSplashSeen(): void {
  const { deviceId } = getDeviceFingerprint();
  markDeviceSplashSeen(deviceId);
}

/** Settings → replay startup: clears device flag and reloads home with splash. */
export function requestSplashReplay(): void {
  const { deviceId } = getDeviceFingerprint();
  clearDeviceSplashSeen(deviceId);
  safeSet(KEYS.replaySplash, '1');
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export function consumeSplashReplayFlag(): boolean {
  if (safeGet(KEYS.replaySplash) === '1') {
    safeRemove(KEYS.replaySplash);
    return true;
  }
  return false;
}

/** One-shot skip for error recovery links — does not block splash on the next visit. */
export function consumeSkipSplashFlag(): boolean {
  if (safeGet(KEYS.skipSplash) === '1') {
    safeRemove(KEYS.skipSplash);
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

/** Call before in-app tab navigation — skips loading overlay only, not the branding splash. */
export function armAppSessionForRouteChange(): void {
  markReadyAccepted();
  touchActivity();
}

export function shouldShowFullDeviceSplash(deviceId: string): boolean {
  if (consumeSplashReplayFlag()) return true;
  return !hasDeviceSeenSplash(deviceId);
}
