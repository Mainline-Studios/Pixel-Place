import type { Metadata } from 'next';
import HistoriMacHub from '@/components/Games/HistoriMacHub';
import { HISTORIMAC_TAGLINE } from '@/lib/historiMacMarketing';
import { buildSiteMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildSiteMetadata({
  title: `HistoriMac — Retro Mac in Your Browser | ${SITE_NAME}`,
  description: HISTORIMAC_TAGLINE,
  path: '/historimac',
});

export default function HistoriMacIndexPage() {
  return <HistoriMacHub />;
}
