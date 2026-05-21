import type { Metadata } from 'next';
import { buildSiteMetadata } from '@/lib/seo';

export type AppTabSeoEntry = {
  path: string;
  title: string;
  description: string;
  heading: string;
  blurb: string;
  priority: number;
  changefreq: 'daily' | 'weekly' | 'monthly';
};

/** Main dashboard tabs — paths match lib/routing.ts TAB_TO_PATH */
export const APP_TAB_SEO: Record<string, AppTabSeoEntry> = {
  games: {
    path: '/games',
    title: 'Free Browser Games — Play Online',
    description:
      'Play Showdown, Tag, Snake, 3D Avatar Runner, Memory, community games, and more — free in your browser on Pixel Place.',
    heading: 'Games on Pixel Place',
    blurb:
      'Browse built-in multiplayer games and community creations. Press G anytime to return to the games tab.',
    priority: 0.95,
    changefreq: 'daily',
  },
  studio: {
    path: '/studio',
    title: 'Game Studio — Build & Publish Games',
    description:
      'Create worlds, test gameplay, and publish your own browser games with Pixel Place Game Studio — no download required.',
    heading: 'Game Studio',
    blurb: 'Build scenes, publish to the community, and share playable links with friends.',
    priority: 0.9,
    changefreq: 'weekly',
  },
  avatarShop: {
    path: '/avatarshop',
    title: 'Avatar Shop — Skins & Accessories',
    description:
      'Customize your 3D Pixel Place avatar with skins, faces, and accessories. Equip items and show your style in-game.',
    heading: 'Avatar Shop',
    blurb: 'Equip skins and accessories, preview your avatar, and stand out in every game.',
    priority: 0.88,
    changefreq: 'weekly',
  },
  coins: {
    path: '/coins',
    title: 'Pixel Coins — Earn & Spend In-Game Currency',
    description:
      'Earn Pixel Coins from play and challenges, then spend them on avatar items and game features on Pixel Place.',
    heading: 'Pixel Coins',
    blurb: 'Track your balance, earn rewards, and unlock cosmetics across the platform.',
    priority: 0.85,
    changefreq: 'weekly',
  },
  friends: {
    path: '/friends',
    title: 'Friends — Play Together on Pixel Place',
    description:
      'Add friends, accept requests, and play Pixel Place games together. Social features built for a safer community.',
    heading: 'Friends',
    blurb: 'Send friend requests, manage your list, and find players to game with.',
    priority: 0.84,
    changefreq: 'weekly',
  },
  report: {
    path: '/report',
    title: 'Safety & Privacy — Reports & Account Tools',
    description:
      'Report issues, manage safety settings, export your data, and read release notes in Pixel Place Settings & Safety.',
    heading: 'Safety & Privacy',
    blurb: 'Report problems, review privacy tools, and keep your account secure.',
    priority: 0.8,
    changefreq: 'monthly',
  },
  settings: {
    path: '/settings',
    title: 'Settings — Account, Accessibility & Updates',
    description:
      'Manage your Pixel Place account, accessibility options, release notes, email verification, and preferences.',
    heading: 'Settings',
    blurb: 'Update your profile, accessibility, and read the latest Pixel Place patch notes.',
    priority: 0.82,
    changefreq: 'weekly',
  },
  donation: {
    path: '/donation',
    title: 'Support Pixel Place — Donations',
    description:
      'Support Mainline Studios and Pixel Place development. Optional donations help keep the platform running.',
    heading: 'Support Pixel Place',
    blurb: 'Learn how donations help the platform and community.',
    priority: 0.75,
    changefreq: 'monthly',
  },
};

export function buildAppTabMetadata(tabKey: keyof typeof APP_TAB_SEO): Metadata {
  const entry = APP_TAB_SEO[tabKey];
  return buildSiteMetadata({
    title: entry.title,
    description: entry.description,
    path: entry.path,
  });
}

export const APP_TAB_KEYS = Object.keys(APP_TAB_SEO) as (keyof typeof APP_TAB_SEO)[];
