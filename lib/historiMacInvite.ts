import { HISTORIMAC_VERSIONS, type HistoriMacVersion } from '@/lib/historiMacVersions';

/** Path prefix for invite-style deep links (e.g. `/historimac/system5`). */
export const HISTORIMAC_INVITE_PATH = '/historimac';

export function getHistoriMacVersionByIdParam(param: string): HistoriMacVersion | undefined {
  const id = decodeURIComponent(param.trim());
  return HISTORIMAC_VERSIONS.find((v) => v.id === id);
}

/** Canonical invite URL for sharing (uses current origin in browser). */
export function buildHistoriMacInviteUrl(versionId: string): string {
  if (typeof window === 'undefined') {
    return `${HISTORIMAC_INVITE_PATH}/${encodeURIComponent(versionId)}`;
  }
  return `${window.location.origin}${HISTORIMAC_INVITE_PATH}/${encodeURIComponent(versionId)}`;
}
