'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { resolveClientApiUrl } from '@/lib/apiBaseUrl';
import { getStatusPageUrl } from '@/lib/statusPageUrl';

const STORAGE_KEY = 'pixelplace_urgent_autodismiss_v1';

type UrgentPayload = { message: string; dismissKey: string };

/**
 * Urgent bar from /status-page: scrolls long text once, then pauses and auto-dismisses.
 * Same dismissKey (updatedAt + message) won't show again in this tab until payload changes.
 */
export default function UrgentGameBanner() {
  const [payload, setPayload] = useState<UrgentPayload | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!payload || !el) {
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
  }, [payload]);

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
          if (!msg) {
            setPayload(null);
            return;
          }
          const dismissKey = `${data.updatedAt || ''}|${msg}`;
          try {
            if (sessionStorage.getItem(STORAGE_KEY) === dismissKey) {
              setPayload(null);
              return;
            }
          } catch {
            /* ignore */
          }
          setPayload((prev) =>
            prev?.dismissKey === dismissKey ? prev : { message: msg, dismissKey },
          );
        })
        .catch(() => {
          if (!cancelled) setPayload(null);
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

  useEffect(() => {
    if (!payload) return;

    const { dismissKey } = payload;
    const timeouts: number[] = [];
    let raf1 = 0;
    let raf2 = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem(STORAGE_KEY, dismissKey);
      } catch {
        /* ignore */
      }
      setPayload(null);
    };

    const resetTextStyles = (text: HTMLSpanElement) => {
      text.classList.remove('urgent-game-banner__marquee-text--scrolling');
      text.style.removeProperty('transform');
      text.style.removeProperty('--urgent-scroll-to');
      text.style.removeProperty('animation-duration');
    };

    const runMeasure = () => {
      if (done) return;
      const text = textRef.current;
      const track = trackRef.current;
      if (!text || !track) {
        timeouts.push(window.setTimeout(finish, 10_000));
        return;
      }

      resetTextStyles(text);
      const trackW = track.clientWidth;
      const scrollW = text.scrollWidth;
      const overflow = scrollW - trackW;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (overflow <= 4) {
        timeouts.push(window.setTimeout(finish, 10_000));
        return;
      }

      if (reduceMotion) {
        text.style.transform = `translateX(${-overflow}px)`;
        timeouts.push(window.setTimeout(finish, 5000));
        return;
      }

      text.style.setProperty('--urgent-scroll-to', `${-overflow}px`);
      const durSec = Math.min(25, Math.max(3, overflow / 55));
      text.style.animationDuration = `${durSec}s`;

      const onAnimEnd = () => {
        if (done) return;
        timeouts.push(window.setTimeout(finish, 5000));
      };
      text.addEventListener('animationend', onAnimEnd, { once: true });
      void text.offsetWidth;
      text.classList.add('urgent-game-banner__marquee-text--scrolling');
    };

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(runMeasure);
    });

    return () => {
      done = true;
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      timeouts.forEach((t) => window.clearTimeout(t));
      const text = textRef.current;
      if (text) resetTextStyles(text);
    };
  }, [payload]);

  if (!payload) return null;

  const href = getStatusPageUrl();

  return (
    <div ref={rootRef} className="urgent-game-banner" role="alert" aria-live="assertive">
      <div className="urgent-game-banner__strip" aria-hidden />
      <div className="urgent-game-banner__inner">
        <div className="urgent-game-banner__toprow">
          <span className="urgent-game-banner__badge">URGENT ALERT</span>
          <div ref={trackRef} className="urgent-game-banner__marquee-track">
            <span ref={textRef} className="urgent-game-banner__marquee-text">
              {payload.message}
            </span>
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
      </div>
      <div className="urgent-game-banner__strip" aria-hidden />
    </div>
  );
}
