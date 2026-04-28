/**
 * Defer texture/network work until the browser is idle — reduces main-thread contention during first paint.
 */
export function loadWhenIdle<T>(fn: () => Promise<T>, timeoutMs = 2500): Promise<T> {
  return new Promise((resolve, reject) => {
    const run = () => {
      void fn().then(resolve, reject);
    };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(run, { timeout: timeoutMs });
    } else {
      setTimeout(run, 0);
    }
  });
}

export type LazyTextureOptions = {
  /** When true, delay start until idle (see `loadWhenIdle`) */
  lazy?: boolean;
  /** Optional IntersectionObserver root margin */
  rootMargin?: string;
};

/**
 * Start loading only after `element` intersects the viewport (or idle fallback if IO unsupported).
 */
export function loadTextureWhenVisible<T>(
  element: Element,
  fn: () => Promise<T>,
  options?: { rootMargin?: string }
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof IntersectionObserver === 'undefined') {
      void loadWhenIdle(fn).then(resolve, reject);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        void fn().then(resolve, reject);
      },
      { rootMargin: options?.rootMargin ?? '200px', threshold: 0.01 }
    );
    obs.observe(element);
  });
}
