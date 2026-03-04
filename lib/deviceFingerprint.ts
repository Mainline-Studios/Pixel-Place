/**
 * Client-side device fingerprint for hardware ban tracking.
 * Produces a stable hash (deviceId) and a human-readable label (e.g. "Windows 10", "Mac OS").
 * Safe to call in browser only.
 */

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return Math.abs(h).toString(36) + str.length.toString(36);
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
 * Returns a stable device fingerprint and label. Call in browser only.
 */
export function getDeviceFingerprint(): { deviceId: string; label: string } {
  if (typeof navigator === 'undefined' || typeof screen === 'undefined') {
    return { deviceId: 'unknown', label: 'Unknown' };
  }
  const parts = [
    navigator.platform || '',
    navigator.userAgent || '',
    String(screen.width || 0),
    String(screen.height || 0),
    String(screen.colorDepth || 0),
    navigator.language || '',
    navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : '',
  ];
  const deviceId = simpleHash(parts.join('|'));
  const label = getLabel();
  return { deviceId, label };
}
