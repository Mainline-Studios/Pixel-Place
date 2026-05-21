import type { Metadata } from 'next';
import Link from 'next/link';
import { buildSiteMetadata, SITE_NAME, absoluteUrl } from '@/lib/seo';
import {
  MAINLINE_STUDIOS_DISCORD,
  PIXEL_PLACE_GITHUB,
  PIXEL_PLACE_YOUTUBE,
} from '@/lib/siteLinks';

export const metadata: Metadata = buildSiteMetadata({
  title: `About ${SITE_NAME} — Free Browser Games & Game Studio`,
  description:
    'Pixel Place is a free online game platform: play multiplayer browser games, customize your avatar, use Game Studio to build and share games, and join the Mainline Studios community.',
  path: '/about',
});

const FEATURES = [
  {
    title: 'Free to play',
    body: 'Create an account and jump into built-in games — no install, no store fee. Works on modern desktop and mobile browsers.',
  },
  {
    title: 'Avatar & Pixel Coins',
    body: 'Equip skins and accessories, earn Pixel Coins from play and challenges, and show off your style in-game.',
  },
  {
    title: 'Game Studio',
    body: 'Build worlds, publish to the community, and explore creations from other players — your own mini games on the web.',
  },
  {
    title: 'Friends & safety',
    body: 'Add friends, report issues, verify email for rewards, and use privacy tools in Settings — built for a safer community.',
  },
  {
    title: 'HistoriMac & classics',
    body: 'Try retro Mac experiences in the browser via HistoriMac invites — shareable links for System 7, Mac OS 9, and more.',
  },
  {
    title: 'By Mainline Studios',
    body: 'Pixel Place is developed by Mainline Studios. Follow updates on YouTube and GitHub, or chat on Discord.',
  },
];

const FAQ = [
  {
    q: 'Is Pixel Place free?',
    a: 'Yes. Playing, creating an account, and many games are free in your browser. Optional donations and in-app Pixel Coin purchases support the platform.',
  },
  {
    q: 'Do I need to download anything?',
    a: 'No. Open pixelplaceofficial.com, sign up, and play. You can also install it as a PWA for a home-screen shortcut.',
  },
  {
    q: 'What games are on Pixel Place?',
    a: 'Built-in titles include Showdown, Tag, Snake, 3D Avatar Runner, Memory, Tic-Tac-Toe, City Life, Hide and Seek, Gym Pump, and community-published games from Game Studio.',
  },
  {
    q: 'Can I make my own game?',
    a: 'Yes. Game Studio lets you build, test, and publish games to share with friends and the community.',
  },
  {
    q: 'Is Pixel Place like Roblox?',
    a: 'Pixel Place is a browser-based platform with avatars, social play, and user-made games — similar spirit, but it runs on the web without a separate client download.',
  },
];

export default function AboutPage() {
  return (
    <main className="seo-about-page">
      <header className="seo-about-page__hero">
        <Link href="/" className="seo-about-page__logo-link">
          <img src="/logo.png" alt="" width={72} height={72} />
        </Link>
        <h1>{SITE_NAME}</h1>
        <p className="seo-about-page__lead">
          Free browser games, 3D avatars, and a studio to build your own — from Mainline Studios.
        </p>
        <div className="seo-about-page__cta">
          <Link href="/" className="seo-about-page__btn seo-about-page__btn--primary">
            Play now — create free account
          </Link>
          <a href={absoluteUrl('/games')} className="seo-about-page__btn">
            Browse games
          </a>
        </div>
      </header>

      <section className="seo-about-page__grid" aria-labelledby="features-heading">
        <h2 id="features-heading">What you get</h2>
        <ul>
          {FEATURES.map((f) => (
            <li key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="seo-about-page__faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently asked questions</h2>
        <dl>
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="seo-about-page__links" aria-labelledby="discover-heading">
        <h2 id="discover-heading">Explore</h2>
        <ul>
          <li>
            <Link href="/historimac">HistoriMac — retro Mac versions in your browser</Link>
          </li>
        </ul>
      </section>

      <section className="seo-about-page__links" aria-labelledby="community-heading">
        <h2 id="community-heading">Community & updates</h2>
        <ul>
          <li>
            <a href={PIXEL_PLACE_YOUTUBE} rel="noopener noreferrer">
              YouTube — @PixelPlaceOfficial
            </a>
          </li>
          <li>
            <a href={PIXEL_PLACE_GITHUB} rel="noopener noreferrer">
              GitHub — Mainline-Studios/Pixel-Place
            </a>
          </li>
          <li>
            <a href={MAINLINE_STUDIOS_DISCORD} rel="noopener noreferrer">
              Discord — Mainline Studios
            </a>
          </li>
        </ul>
      </section>

      <footer className="seo-about-page__footer">
        <p>
          <Link href="/">Back to {SITE_NAME}</Link>
        </p>
        <p className="seo-about-page__fine">
          Pixel Place by Mainline Studios · {absoluteUrl('/')}
        </p>
      </footer>
    </main>
  );
}
