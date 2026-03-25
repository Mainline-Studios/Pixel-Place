/** CSS handles most motion; use this for JS-driven animation (e.g. marquee measure). */
export function readReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduce-motion')
  );
}
