/** Pixel Place Web Deploy Services — third-party static hosting on *.pixelplaceofficial.com */

export const WEB_DEPLOY_BASE_HOST = 'pixelplaceofficial.com';

export const WEB_DEPLOY_RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'pay',
  'status',
  'historimac',
  'mail',
  'smtp',
  'admin',
  'cdn',
  'static',
  'dev',
  'staging',
  'test',
  'pixel',
  'pixelplace',
  'games',
  'studio',
  'report',
  'verify',
  'login',
  'auth',
  'firebase',
  'web',
  'deploy',
  'web-deploy',
]);

export type WebDeploySourceType = 'git' | 'files';
export type WebDeployRequestStatus = 'pending' | 'approved' | 'rejected' | 'live';

export interface WebDeployRequest {
  id: string;
  requestedBy: string;
  predomain: string;
  sourceType: WebDeploySourceType;
  gitUrl?: string;
  filesDescription?: string;
  projectName: string;
  contactEmail?: string;
  notes?: string;
  status: WebDeployRequestStatus;
  reviewedBy?: string;
  adminNotes?: string;
  reviewedAt?: number;
  createdAt: number;
  liveUrl?: string;
}

export function normalizePredomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function validatePredomain(predomain: string): { ok: true; value: string } | { ok: false; error: string } {
  const v = normalizePredomain(predomain);
  if (!v) return { ok: false, error: 'Enter a subdomain name (letters, numbers, hyphens).' };
  if (v.length < 2 || v.length > 40) return { ok: false, error: 'Subdomain must be 2–40 characters.' };
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(v)) {
    return { ok: false, error: 'Use lowercase letters, numbers, and hyphens (not at the start or end).' };
  }
  if (WEB_DEPLOY_RESERVED_SUBDOMAINS.has(v)) {
    return { ok: false, error: 'That subdomain is reserved.' };
  }
  return { ok: true, value: v };
}

export function predomainToLiveUrl(predomain: string): string {
  return `https://${normalizePredomain(predomain)}.${WEB_DEPLOY_BASE_HOST}`;
}

export function isGitProviderUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const h = u.hostname.toLowerCase();
    return (
      h === 'github.com' ||
      h.endsWith('.github.com') ||
      h === 'gitlab.com' ||
      h.endsWith('.gitlab.com') ||
      h === 'bitbucket.org' ||
      h.endsWith('.bitbucket.org') ||
      h === 'codeberg.org' ||
      h.endsWith('.codeberg.org')
    );
  } catch {
    return false;
  }
}
