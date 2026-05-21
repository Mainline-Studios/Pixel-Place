import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { HISTORIMAC_VERSIONS } from '@/lib/historiMacVersions';
import { getHistoriMacVersionByIdParam, historiMacInviteOgTitle } from '@/lib/historiMacInvite';
import HistoriMacInviteShell from '@/components/Games/HistoriMacInviteShell';
import { absoluteUrl, buildSiteMetadata } from '@/lib/seo';

type Props = { params: Promise<{ versionId: string }> };

/** Static export: pre-render every version invite page. */
export function generateStaticParams() {
  return HISTORIMAC_VERSIONS.map((v) => ({ versionId: v.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { versionId } = await params;
  const v = getHistoriMacVersionByIdParam(versionId);
  if (!v) return { title: 'HistoriMac — Pixel Place' };
  const title = historiMacInviteOgTitle(v.label);
  const description = `Open this invite to play ${v.label} in your browser — HistoriMac on Pixel Place (Infinite Mac).`;
  const path = `/historimac/${encodeURIComponent(v.id)}`;
  return {
    ...buildSiteMetadata({ title, description, path }),
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: 'Pixel Place',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: '/images/games/historimac-play.png',
          width: 512,
          height: 512,
          alt: `HistoriMac — ${v.label}`,
        },
      ],
    },
  };
}

export default async function HistoriMacInvitePage({ params }: Props) {
  const { versionId } = await params;
  const v = getHistoriMacVersionByIdParam(versionId);
  if (!v) notFound();
  return (
    <Suspense fallback={null}>
      <HistoriMacInviteShell versionId={v.id} label={v.label} />
    </Suspense>
  );
}
