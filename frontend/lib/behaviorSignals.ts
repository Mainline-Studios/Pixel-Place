/**
 * Client-side behavioral hints for server-side abuse scoring (non-blocking).
 */

let pointerMovesWindow = 0;
let windowStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
const clickIntervals: number[] = [];
let lastClickAt = 0;

function resetWindowIfNeeded(now: number) {
  if (now - windowStart > 10_000) {
    pointerMovesWindow = 0;
    windowStart = now;
  }
}

export function attachBehaviorListeners(): void {
  if (typeof window === 'undefined') return;

  let throttle = 0;
  const onMove = () => {
    const now = performance.now();
    resetWindowIfNeeded(now);
    throttle++;
    if (throttle % 3 === 0) pointerMovesWindow++;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
}

export function recordPlacementClick(): void {
  const now = performance.now();
  resetWindowIfNeeded(now);
  if (lastClickAt > 0) {
    const gap = now - lastClickAt;
    if (gap > 0 && gap < 120_000) {
      clickIntervals.push(Math.round(gap));
      if (clickIntervals.length > 30) clickIntervals.splice(0, clickIntervals.length - 30);
    }
  }
  lastClickAt = now;
}

/** Higher ≈ more varied pointer activity in the last ~10s (0–1). */
export function getBehaviorSnapshot() {
  const now = performance.now();
  resetWindowIfNeeded(now);
  const moves = pointerMovesWindow;
  const entropy = Math.min(1, Math.log10(10 + moves) / Math.log10(90));

  return {
    mouseEntropy: Number(entropy.toFixed(3)),
    pointerMovesLast10s: moves,
    clickIntervalsMs: [...clickIntervals],
  };
}
