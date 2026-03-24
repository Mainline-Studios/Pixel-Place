'use client';

import { useEffect, useState } from 'react';
import { resolveClientApiUrl } from '@/lib/apiBaseUrl';
import { getStatusPageUrl } from '@/lib/statusPageUrl';
import { statusDotColorFromPixelPlace } from '@/lib/statusDotColor';

const LABELS: Record<string, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  maintenance: 'Maintenance',
  outage: 'Outage',
};

type StatusPageLinkVariant = 'footer' | 'login';

export default function StatusPageLink({ variant = 'footer' }: { variant?: StatusPageLinkVariant }) {
  const [line, setLine] = useState<string>('System status');
  const [dotColor, setDotColor] = useState<string>('#34d399');

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetch(resolveClientApiUrl('/status-page'))
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          if (cancelled || !data?.pixelPlace) return;
          const pp = data.pixelPlace;
          const s = String(pp.status || 'operational').toLowerCase();
          const custom = String(pp.customStatusLabel || '').trim();
          setDotColor(statusDotColorFromPixelPlace(pp));
          const word = custom || LABELS[s] || 'Operational';
          setLine(`${word} · System status`);
        })
        .catch(() => {
          if (!cancelled) {
            setLine('System status');
            setDotColor('#34d399');
          }
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

  const href = getStatusPageUrl();

  const className =
    variant === 'login' ? 'status-page-link status-page-link--login' : 'status-page-link';

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Open the full status page (new tab)"
      aria-label={`${line}. Opens the Pixel Place status page in a new tab.`}
    >
      <span
        className="status-page-link__dot"
        aria-hidden
        style={{
          background: dotColor,
          boxShadow: `0 0 10px ${dotColor}, 0 0 22px ${dotColor}66`,
        }}
      />
      <span className="status-page-link__line">{line}</span>
      <span className="status-page-link__hint">New tab ↗</span>
    </a>
  );
}
