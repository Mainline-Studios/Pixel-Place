import {
  MAINLINE_STUDIOS_DISCORD,
  MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT,
  PIXEL_PLACE_GITHUB,
  PIXEL_PLACE_YOUTUBE,
} from '@/lib/siteLinks';
import { SITE_ORIGIN, SITE_NAME } from '@/lib/seo';

export function getSchemaOrgJsonLd() {
  const cleanUrl = SITE_ORIGIN;
  const orgId = `${cleanUrl}/#organization`;
  const webappId = `${cleanUrl}/#webapp`;
  const websiteId = `${cleanUrl}/#website`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: 'Mainline Studios',
        url: cleanUrl,
        logo: `${cleanUrl}/logo.png`,
        sameAs: [
          PIXEL_PLACE_GITHUB,
          PIXEL_PLACE_YOUTUBE,
          MAINLINE_STUDIOS_DISCORD,
          MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT,
        ],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: SITE_NAME,
        url: cleanUrl,
        description:
          'Free browser games, avatar customization, and Game Studio — play and create online with Mainline Studios.',
        publisher: { '@id': orgId },
        inLanguage: 'en',
        potentialAction: {
          '@type': 'ReadAction',
          target: [`${cleanUrl}/about`, `${cleanUrl}/games`, cleanUrl],
        },
      },
      {
        '@type': 'WebApplication',
        '@id': webappId,
        name: SITE_NAME,
        description:
          'Pixel Place is a free web gaming platform: play built-in and community games, customize your 3D avatar, earn Pixel Coins, and publish games from Game Studio. No download required.',
        url: cleanUrl,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Works in modern browsers.',
        author: { '@id': orgId },
        publisher: { '@id': orgId },
        isAccessibleForFree: true,
        image: `${cleanUrl}/logo.png`,
        featureList: [
          'Free browser games — Showdown, Tag, Snake, 3D runners, and more',
          'Avatar skins and accessories',
          'Game Studio — build and publish your own games',
          'Friends, community creations, Pixel Coins',
          'HistoriMac retro Mac experiences in the browser',
          'Email verification and account safety tools',
        ],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        sameAs: [
          PIXEL_PLACE_GITHUB,
          PIXEL_PLACE_YOUTUBE,
          MAINLINE_STUDIOS_DISCORD,
          MAINLINE_STUDIOS_OFFICIAL_MUSIC_BEAT,
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${cleanUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is Pixel Place free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. You can create an account and play many games free in your browser at pixelplaceofficial.com.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need to download Pixel Place?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Pixel Place runs in your web browser. You can optionally install it as a PWA for a home-screen shortcut.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I make my own games on Pixel Place?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Game Studio lets you build, test, and publish games to share with the community.',
            },
          },
          {
            '@type': 'Question',
            name: 'Who made Pixel Place?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Pixel Place is developed by Mainline Studios.',
            },
          },
        ],
      },
    ],
  };
}
