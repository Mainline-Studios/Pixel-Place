/**
 * Client-side device id for hardware ban tracking.
 * Uses a persisted random id so the same browser profile keeps one id across sessions
 * (not a new id every tab from UA/screen noise).
 */

const STORAGE_KEY = 'pixelplace_device_id_v1';

function sanitizeStoredId(raw: string): string {
  const s = String(raw).slice(0, 128).replace(/[^a-zA-Z0-9_-]/g, '');
  return s.length >= 8 ? s : '';
}

function readStoredId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const a = sanitizeStoredId(localStorage.getItem(STORAGE_KEY) || '');
    if (a) return a;
  } catch {
    /* private mode */
  }
  try {
    const b = sanitizeStoredId(sessionStorage.getItem(STORAGE_KEY) || '');
    if (b) return b;
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
    return;
  } catch {
    /* fall through */
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

function newDeviceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return sanitizeStoredId(crypto.randomUUID().replace(/-/g, '')) || fallbackId();
  }
  return fallbackId();
}

function fallbackId(): string {
  const t = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  const r = Math.random().toString(36).slice(2, 12);
  return sanitizeStoredId(`pp_${Math.floor(t)}_${r}`) || 'pp_unknown';
}

function getLabel(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  const plat = navigator.platform || '';
  if (/Win/i.test(ua) || /Windows/i.test(plat)) return 'Windows';
  if (/Mac/i.test(ua) || /Macintosh|MacIntel/i.test(plat)) return 'Mac OS';
  if (/Linux/i.test(ua) || /Linux/i.test(plat)) return 'Linux';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/CrOS/i.test(ua)) return 'Chrome OS';
  return plat || 'Unknown';
}

/**
 * Returns a stable device id (per browser storage profile) and a human-readable label.
 */
export function getDeviceFingerprint(): { deviceId: string; label: string } {
  if (typeof window === 'undefined') {
    return { deviceId: 'unknown', label: 'Unknown' };
  }
  let id = readStoredId();
  if (!id) {
    id = newDeviceId();
    if (id) writeStoredId(id);
  }
  return { deviceId: id || 'unknown', label: getLabel() };
}
