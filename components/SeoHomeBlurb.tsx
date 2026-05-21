import Link from 'next/link';
import { SITE_NAME, SITE_TAGLINE, absoluteUrl } from '@/lib/seo';

/**
 * Crawler-visible copy on the home route (static export). Login UI is client-only;
 * this gives search engines real text about Pixel Place.
 */
export default function SeoHomeBlurb() {
  return (
    <section className="seo-home-blurb" aria-label={`About ${SITE_NAME}`}>
      <h1>{SITE_NAME}</h1>
      <p>{SITE_TAGLINE}</p>
      <p>
        Play built-in games like Showdown, Tag, Snake, and 3D runners. Customize skins and accessories,
        add friends, earn Pixel Coins, and publish creations from Game Studio — all in your browser.
      </p>
      <p>
        <Link href="/about">Learn more about Pixel Place</Link>
        {' · '}
        <Link href="/historimac">HistoriMac retro Mac</Link>
        {' · '}
        <a href={absoluteUrl('/')}>Play free games</a>
        {' · '}
        <a href="https://pixelplaceofficial.com">pixelplaceofficial.com</a>
      </p>
    </section>
  );
}
