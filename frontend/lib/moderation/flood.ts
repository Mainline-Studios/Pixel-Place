/**
 * In-memory flood detection for pixel placement (same tile spam).
 * Not shared across instances — pair with Redis in production at scale.
 */

const recent = new Map<string, { x: number; y: number; t: number }[]>();

const WINDOW_MS = 30_000;
const MAX_SAME_TILE = 12;

export function recordPixelHit(
  userKey: string,
  x: number,
  y: number
): { ok: true } | { ok: false; reason: 'flood' } {
  const now = Date.now();
  const key = `${userKey}:${x}:${y}`;
  const arr = recent.get(key) || [];
  const pruned = arr.filter((e) => now - e.t < WINDOW_MS);
  pruned.push({ x, y, t: now });
  recent.set(key, pruned);
  if (pruned.length > MAX_SAME_TILE) return { ok: false, reason: 'flood' };
  return { ok: true };
}
