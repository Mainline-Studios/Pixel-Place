import type { Metadata } from 'next';
import {
  MAINLINE_STUDIOS_DISCORD,
  PIXEL_PLACE_GITHUB,
  PIXEL_PLACE_YOUTUBE,
} from '@/lib/siteLinks';

/** Canonical public site URL (Search Console, OG, sitemap). */
export const SITE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_URL) ||
  'https://pixelplaceofficial.com';

export const SITE_ORIGIN = SITE_URL.replace(/\/+$/, '');

export const SITE_NAME = 'Pixel Place';

export const SITE_TAGLINE = 'Free browser games, avatars & Game Studio — by Mainline Studios';

/** High-intent phrases people search (Roblox-adjacent, free games, studio). */
export const SEO_KEYWORDS = [
  'Pixel Place',
  'Pixel Place games',
  'Mainline Studios',
  'free online games',
  'browser games',
  'play games online free',
  'make your own game',
  'game studio online',
  'avatar creator',
  'customize avatar',
  'multiplayer browser games',
  'Roblox alternative',
  'free game platform',
  '3D avatar games',
  'HistoriMac',
  'Pixel Coins',
];

export function absoluteUrl(path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const normalized = p.replace(/\/+$/, '') || '/';
  return normalized === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${normalized}`;
}

/** Dashboard tab paths (each has dedicated metadata via per-tab page routes). */
export const SEO_APP_TAB_PATHS = [
  '/games',
  '/avatarshop',
  '/coins',
  '/friends',
  '/settings',
  '/donation',
  '/report',
] as const;

/** Utility / auth flows — never index. */
export const SEO_NOINDEX_PATHS = [
  '/verify',
  '/signoutall',
  '/mainlinelogin',
  '/safety',
] as const;

export function isIndexableMarketingPath(pathname: string): boolean {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  if (p === '/' || p === '/about' || p === '/historimac') return true;
  if (p.startsWith('/historimac/') && p !== '/historimac') return true;
  if ((SEO_APP_TAB_PATHS as readonly string[]).includes(p)) return true;
  return false;
}

/** Strip trailing slash for canonical URLs (except root). */
export function canonicalPath(pathname: string): string {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  return p;
}

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function buildSiteMetadata(options: MetadataOptions = {}): Metadata {
  const path = options.path ?? '/';
  const url = absoluteUrl(path);
  const title = options.title ?? `${SITE_NAME} — ${SITE_TAGLINE}`;
  const description =
    options.description ??
    'Play free browser games, customize your 3D avatar, earn Pixel Coins, and build games in Game Studio. Pixel Place is a free gaming platform by Mainline Studios — no download required.';

  const ogImage = absoluteUrl('/logo.png');

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: SEO_KEYWORDS,
    authors: [{ name: 'Mainline Studios', url: SITE_ORIGIN }],
    creator: 'Mainline Studios',
    publisher: 'Mainline Studios',
    applicationName: SITE_NAME,
    category: 'games',
    robots: options.noIndex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    alternates: {
      canonical: url,
      languages: { 'en-US': url },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    other: {
      'og:see_also': [PIXEL_PLACE_YOUTUBE, PIXEL_PLACE_GITHUB, MAINLINE_STUDIOS_DISCORD].join(','),
    },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}
