const KEY = 'pixelplace_verified_assets_only_v1';

export function getVerifiedAssetsOnlyMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setVerifiedAssetsOnlyMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function isUserAssetApprovedForVerifiedMode(record: {
  moderation?: { reviewStatus?: string; source?: string };
}): boolean {
  const m = record.moderation;
  if (!m || m.reviewStatus !== 'approved') return false;
  if (m.source === 'local_filename_only') return false;
  return Boolean(m.scanId);
}
