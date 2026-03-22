import { HISTORIMAC_VERSIONS, type HistoriMacVersion } from '@/lib/historiMacVersions';

/** Path prefix for invite-style deep links (e.g. `/historimac/system5`). */
export const HISTORIMAC_INVITE_PATH = '/historimac';

export function getHistoriMacVersionByIdParam(param: string): HistoriMacVersion | undefined {
  const id = decodeURIComponent(param.trim());
  return HISTORIMAC_VERSIONS.find((v) => v.id === id);
}

/**
 * Link-preview title for Messages / Open Graph (static HTML — no `?inviter=`).
 * Crawlers don’t personalize per user without a dynamic OG endpoint.
 */
export function historiMacInviteOgTitle(label: string): string {
  return `Someone invites you to play HistoriMac (${label}) on Pixel Place.`;
}

/** When `?inviter=` is present (client): browser tab + optional head meta. */
export function historiMacInvitePersonalTitle(inviter: string, label: string): string {
  return `${inviter} invites you to play HistoriMac (${label}) on Pixel Place.`;
}

/** Canonical invite URL for sharing (browser: current origin). Optional `inviter` for tab title + future OG. */
export function buildHistoriMacInviteUrl(versionId: string, inviter?: string | null): string {
  const path = `${HISTORIMAC_INVITE_PATH}/${encodeURIComponent(versionId)}`;
  const q = inviter?.trim()
    ? `?inviter=${encodeURIComponent(inviter.trim())}`
    : '';
  if (typeof window === 'undefined') {
    return `${path}${q}`;
  }
  const u = new URL(path + q, window.location.origin);
  return u.toString();
}
