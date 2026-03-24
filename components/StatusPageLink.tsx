'use client';

import { useEffect, useState } from 'react';
import { resolveClientApiUrl } from '@/lib/apiBaseUrl';
import { getStatusPageUrl } from '@/lib/statusPageUrl';
import { statusDotColorFromPixelPlace } from '@/lib/statusDotColor';

const CTA_LINE = 'Having Issues? Click here to see the status';

type StatusPageLinkVariant = 'footer' | 'login';

export default function StatusPageLink({ variant = 'footer' }: { variant?: StatusPageLinkVariant }) {
  const [dotColor, setDotColor] = useState<string>('#34d399');

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetch(resolveClientApiUrl('/status-page'))
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          if (cancelled || !data?.pixelPlace) return;
          setDotColor(statusDotColorFromPixelPlace(data.pixelPlace));
        })
        .catch(() => {
          if (!cancelled) setDotColor('#34d399');
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
      title="Open the Pixel Place status page (new tab)"
      aria-label={`${CTA_LINE} Opens in a new tab.`}
    >
      <span
        className="status-page-link__dot"
        aria-hidden
        style={{
          background: dotColor,
          boxShadow: `0 0 10px ${dotColor}, 0 0 22px ${dotColor}66`,
        }}
      />
      <span className="status-page-link__line">{CTA_LINE}</span>
      <span className="status-page-link__hint">New tab ↗</span>
    </a>
  );
}
