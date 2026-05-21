import Link from 'next/link';
import type { AppTabSeoEntry } from '@/lib/appTabSeo';
import { SITE_NAME } from '@/lib/seo';

export default function AppTabSeoBlurb({ entry }: { entry: AppTabSeoEntry }) {
  return (
    <section className="seo-home-blurb" aria-label={entry.heading}>
      <h1>{entry.heading}</h1>
      <p>{entry.blurb}</p>
      <p>
        <Link href="/about">About {SITE_NAME}</Link>
        {' · '}
        <Link href="/historimac">HistoriMac</Link>
        {' · '}
        <Link href="/">Sign in / Play</Link>
      </p>
    </section>
  );
}
