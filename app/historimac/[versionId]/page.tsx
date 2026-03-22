import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HISTORIMAC_VERSIONS } from '@/lib/historiMacVersions';
import { getHistoriMacVersionByIdParam } from '@/lib/historiMacInvite';
import HistoriMacInviteShell from '@/components/Games/HistoriMacInviteShell';

type Props = { params: Promise<{ versionId: string }> };

/** Static export: pre-render every version invite page. */
export function generateStaticParams() {
  return HISTORIMAC_VERSIONS.map((v) => ({ versionId: v.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { versionId } = await params;
  const v = getHistoriMacVersionByIdParam(versionId);
  if (!v) return { title: 'HistoriMac — Pixel Place' };
  return {
    title: `HistoriMac — ${v.label} | Pixel Place`,
    description: `Play ${v.label} in the browser on Pixel Place HistoriMac.`,
  };
}

export default async function HistoriMacInvitePage({ params }: Props) {
  const { versionId } = await params;
  const v = getHistoriMacVersionByIdParam(versionId);
  if (!v) notFound();
  return <HistoriMacInviteShell versionId={v.id} label={v.label} />;
}
