'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { resolveClientApiUrl } from '@/lib/apiBaseUrl';
import { getStatusPageUrl } from '@/lib/statusPageUrl';

/**
 * Mirrors status.pixelplaceofficial.com urgent bar when admins enable it.
 * Explains possible miscolors / odd UI so players aren’t confused.
 */
export default function UrgentGameBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!message || !el) {
      document.body.classList.remove('has-urgent-game-banner');
      document.documentElement.style.removeProperty('--urgent-game-banner-h');
      return;
    }
    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--urgent-game-banner-h', `${h}px`);
      document.body.classList.add('has-urgent-game-banner');
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.body.classList.remove('has-urgent-game-banner');
      document.documentElement.style.removeProperty('--urgent-game-banner-h');
    };
  }, [message]);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetch(resolveClientApiUrl('/status-page'))
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          if (cancelled) return;
          const u = data?.urgent;
          const msg =
            u?.active && String(u.message || '').trim() ? String(u.message).trim() : null;
          setMessage(msg);
        })
        .catch(() => {
          if (!cancelled) setMessage(null);
        });
    }

    load();
    const interval = window.setInterval(load, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!message) return null;

  const href = getStatusPageUrl();

  return (
    <div ref={rootRef} className="urgent-game-banner" role="alert" aria-live="assertive">
      <div className="urgent-game-banner__strip" aria-hidden />
      <div className="urgent-game-banner__inner">
        <span className="urgent-game-banner__badge">URGENT</span>
        <div className="urgent-game-banner__copy">
          <p className="urgent-game-banner__text">{message}</p>
          <p className="urgent-game-banner__sub">
            Custom colors or themes here may look off while we work on this — that&apos;s expected. Official
            details on the status page.
          </p>
        </div>
        <a
          className="urgent-game-banner__link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Status ↗
        </a>
      </div>
      <div className="urgent-game-banner__strip" aria-hidden />
    </div>
  );
}
