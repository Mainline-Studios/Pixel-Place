import {
  MAINLINE_STUDIOS_DISCORD,
  MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT,
  PIXEL_PLACE_GITHUB,
  PIXEL_PLACE_YOUTUBE,
} from '@/lib/siteLinks';

export function getSchemaOrgJsonLd() {
  const baseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_URL) ||
    'https://pixelplaceofficial.com';
  const withSlash = baseUrl.replace(/\/$/, '') || baseUrl;
  let cleanUrl: string;
  try {
    cleanUrl = new URL(withSlash).origin;
  } catch {
    cleanUrl = withSlash.split('/').slice(0, 3).join('/') || 'https://pixelplaceofficial.com';
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${cleanUrl}/#webapp`,
        name: 'Pixel Place',
        description:
          'Pixel Place is a web-based gaming platform and creative studio by Mainline Studios. Build games, play with friends, customize your avatar, and explore a community of creators. Features built-in games (Showdown, Tag, Snake, 3D runners), Game Studio, avatar customization, Pixel Coins, and AI-assisted coding.',
        url: cleanUrl,
        applicationCategory: 'Game',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Works in modern browsers.',
        author: {
          '@type': 'Organization',
          '@id': `${cleanUrl}/#organization`,
          name: 'Mainline Studios',
          url: cleanUrl,
        },
        publisher: { '@id': `${cleanUrl}/#organization` },
        image: `${cleanUrl}/logo.png`,
        featureList: [
          'Avatar customization with skins and accessories',
          'Built-in games: Showdown, Tag, Snake, 3D Avatar Runner, Memory, Tic-Tac-Toe, and more',
          'Game Studio to build and publish your own games',
          'Social features: friends, community creations, sharing',
          'Pixel Coins economy',
          'AI-powered coding assistance',
        ],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        sameAs: [
          PIXEL_PLACE_GITHUB,
          PIXEL_PLACE_YOUTUBE,
          MAINLINE_STUDIOS_DISCORD,
          MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT,
        ],
        license: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
      },
      {
        '@type': 'Organization',
        '@id': `${cleanUrl}/#organization`,
        name: 'Mainline Studios',
        url: cleanUrl,
        sameAs: [
          PIXEL_PLACE_GITHUB,
          PIXEL_PLACE_YOUTUBE,
          MAINLINE_STUDIOS_DISCORD,
          MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT,
        ],
      },
    ],
  };
}
