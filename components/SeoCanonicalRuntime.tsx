'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SITE_ORIGIN, isIndexableMarketingPath, SEO_NOINDEX_PATHS } from '@/lib/seo';

function normalizePath(pathname: string): string {
  return (pathname || '/').replace(/\/+$/, '') || '/';
}

function setCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

function setRobots(content: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'robots';
    document.head.appendChild(meta);
  }
  meta.content = content;
}

/**
 * SPA routes served from index.html need runtime canonical/noindex so Google
 * does not treat /games, /settings, etc. as duplicate homepages.
 */
export default function SeoCanonicalRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const path = normalizePath(pathname);

    if (isIndexableMarketingPath(path)) {
      return;
    }

    if ((SEO_NOINDEX_PATHS as readonly string[]).includes(path)) {
      setCanonical(SITE_ORIGIN);
      setRobots('noindex, follow');
      return;
    }

    setCanonical(SITE_ORIGIN);
    setRobots('noindex, follow');
  }, [pathname]);

  return null;
}
