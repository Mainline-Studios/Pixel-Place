import type { Metadata } from 'next';
import HomeClient from '../HomeClient';
import SeoHomeBlurb from '@/components/SeoHomeBlurb';
import { buildSiteMetadata, SITE_ORIGIN } from '@/lib/seo';

/** Same app as home; canonical points to homepage to avoid duplicate indexing. */
export const metadata: Metadata = {
  ...buildSiteMetadata({
    title: 'Play Games — Pixel Place',
    description:
      'Play free browser games on Pixel Place — Showdown, Tag, Snake, 3D runners, and community creations.',
    path: '/',
    noIndex: true,
  }),
  alternates: {
    canonical: SITE_ORIGIN,
  },
};

export default function GamesPage() {
  return (
    <>
      <SeoHomeBlurb />
      <HomeClient />
    </>
  );
}
