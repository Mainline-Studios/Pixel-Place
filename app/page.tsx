import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import SeoHomeBlurb from '@/components/SeoHomeBlurb';
import { buildSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = buildSiteMetadata({ path: '/' });

export default function Home() {
  return (
    <>
      <SeoHomeBlurb />
      <HomeClient />
    </>
  );
}
