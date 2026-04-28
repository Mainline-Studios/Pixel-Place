/**
 * Lightweight browser fingerprint (SHA-256 hex) for abuse correlation — not for auth.
 * Stable enough for bot signals; privacy-conscious vs cross-site tracking.
 */

let cached: string | null = null;

async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getDeviceFingerprint(): Promise<string> {
  if (cached) return cached;
  if (typeof window === 'undefined') return '';

  try {
    const parts = [
      navigator.userAgent,
      navigator.language,
      (navigator.languages || []).join(','),
      String(screen.width),
      String(screen.height),
      String(screen.colorDepth),
      String(window.devicePixelRatio ?? 1),
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      String(navigator.hardwareConcurrency ?? 0),
      navigator.platform || '',
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 220;
      canvas.height = 48;
      ctx.textBaseline = 'top';
      ctx.font = '14px system-ui';
      ctx.fillStyle = '#4a90e2';
      ctx.fillText('pixel-place', 4, 8);
      ctx.fillStyle = '#1a1d29';
      ctx.fillRect(80, 12, 60, 20);
      parts.push(canvas.toDataURL());
    }

    cached = await sha256Hex(parts.join('|'));
    return cached;
  } catch {
    cached = await sha256Hex(navigator.userAgent + String(Date.now()));
    return cached;
  }
}
