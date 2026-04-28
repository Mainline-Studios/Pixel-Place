/**
 * In-memory rolling placement timestamps per user (process-local).
 * Survives across requests; reset on deploy — acceptable for heuristic abuse signals.
 */

const territoryTs = new Map<string, number[]>();
const progressionTs = new Map<string, number[]>();

function prune(arr: number[], cutoff: number, maxKeep: number): number[] {
  let out = arr.filter((t) => t >= cutoff);
  if (out.length > maxKeep) out = out.slice(-maxKeep);
  return out;
}

export function recordTerritoryPlacement(userId: string, now = Date.now()): void {
  const cutoff = now - 120_000;
  const prev = territoryTs.get(userId) ?? [];
  const next = prune([...prev, now], cutoff, 80);
  territoryTs.set(userId, next);
}

export function territorySnapshot(userId: string, now = Date.now()) {
  const cutoff10 = now - 10_000;
  const arr = territoryTs.get(userId) ?? [];
  const in10 = arr.filter((t) => t >= cutoff10);
  const intervals: number[] = [];
  for (let i = 1; i < arr.length; i++) {
    intervals.push(arr[i]! - arr[i - 1]!);
  }
  let stddev = 0;
  if (intervals.length >= 8) {
    const tail = intervals.slice(-20);
    const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
    const v = tail.reduce((s, x) => s + (x - mean) ** 2, 0) / tail.length;
    stddev = Math.sqrt(v);
  }
  return { count10s: in10.length, intervalsStddevMs: stddev };
}

export function recordProgressionBurst(userId: string, weight: number, now = Date.now()): void {
  const cutoff = now - 60_000;
  const prev = progressionTs.get(userId) ?? [];
  const stamped = [...prev];
  for (let i = 0; i < Math.min(weight, 50); i++) stamped.push(now + i * 0.001);
  const next = prune(stamped, cutoff, 200);
  progressionTs.set(userId, next);
}

export function progressionBurst60s(userId: string, now = Date.now()): number {
  const cutoff = now - 60_000;
  const arr = progressionTs.get(userId) ?? [];
  return arr.filter((t) => t >= cutoff).length;
}
