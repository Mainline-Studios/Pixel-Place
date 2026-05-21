import type { Metadata } from 'next';
import Link from 'next/link';
import { HISTORIMAC_VERSIONS } from '@/lib/historiMacVersions';
import { buildSiteMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildSiteMetadata({
  title: `HistoriMac — Retro Mac in Your Browser | ${SITE_NAME}`,
  description:
    'Play classic Mac OS versions in the browser on Pixel Place HistoriMac: System 1, System 7, Mac OS 9, NeXTSTEP, and more — free shareable invite links.',
  path: '/historimac',
});

export default function HistoriMacIndexPage() {
  return (
    <main className="seo-about-page">
      <header className="seo-about-page__hero">
        <Link href="/" className="seo-about-page__logo-link">
          <img src="/logo.png" alt="" width={72} height={72} />
        </Link>
        <h1>HistoriMac on {SITE_NAME}</h1>
        <p className="seo-about-page__lead">
          Free browser-based retro Mac experiences — pick a version and share invite links with friends.
        </p>
        <div className="seo-about-page__cta">
          <Link href="/" className="seo-about-page__btn seo-about-page__btn--primary">
            Back to {SITE_NAME}
          </Link>
          <Link href="/about" className="seo-about-page__btn">
            About Pixel Place
          </Link>
        </div>
      </header>

      <section className="seo-about-page__grid" aria-labelledby="historimac-versions">
        <h2 id="historimac-versions">Choose a Mac version</h2>
        <ul>
          {HISTORIMAC_VERSIONS.map((v) => (
            <li key={v.id}>
              <h3>
                <Link href={`/historimac/${v.id}`}>{v.label}</Link>
              </h3>
              {v.backgroundInfo && <p>{v.backgroundInfo}</p>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
