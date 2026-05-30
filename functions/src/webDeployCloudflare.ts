/** Cloudflare DNS — automatic wildcard + per-subdomain records for Web Deploy. */

import { WEB_DEPLOY_DEPLOY_HOST } from './webDeployPlaceholder';

/** Cloudflare DNS record TTL (seconds). Minimum 60 for most zones. */
export const WEB_DEPLOY_DNS_TTL = 60;

export type DnsRecordInstruction = {
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
  purpose: string;
};

const BASE_HOST = 'pixelplaceofficial.com';
const DEPLOY_TARGET = process.env.WEB_DEPLOY_DEPLOY_HOST || WEB_DEPLOY_DEPLOY_HOST;

function cfHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function cfConfigured(): { token: string; zoneId: string } | null {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
  if (!token || !zoneId) return null;
  return { token, zoneId };
}

async function upsertCloudflareRecord(
  token: string,
  zoneId: string,
  type: string,
  name: string,
  content: string,
  proxied: boolean,
): Promise<boolean> {
  const search = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${type}&name=${encodeURIComponent(name)}`,
    { headers: cfHeaders(token) },
  );
  const searchJson = (await search.json()) as { result?: Array<{ id: string }> };
  const existing = searchJson.result?.[0];
  const body = { type, name, content, ttl: WEB_DEPLOY_DNS_TTL, proxied };

  if (existing?.id) {
    const patch = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`, {
      method: 'PATCH',
      headers: cfHeaders(token),
      body: JSON.stringify(body),
    });
    return patch.ok;
  }
  const post = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
    method: 'POST',
    headers: cfHeaders(token),
    body: JSON.stringify(body),
  });
  return post.ok;
}

/** One-time: *.pixelplaceofficial.com → pixelplace-deploy.web.app so new subdomains work without manual DNS. */
export async function ensureWebDeployWildcardCname(): Promise<{ ok: boolean; message: string }> {
  const cf = cfConfigured();
  if (!cf) {
    return {
      ok: false,
      message: 'Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID on Cloud Functions for automatic DNS.',
    };
  }
  const wildcardName = `*.${BASE_HOST}`;
  try {
    const ok = await upsertCloudflareRecord(cf.token, cf.zoneId, 'CNAME', wildcardName, DEPLOY_TARGET, false);
    return ok
      ? { ok: true, message: `Wildcard DNS ${wildcardName} → ${DEPLOY_TARGET} is configured.` }
      : { ok: false, message: 'Could not create wildcard CNAME in Cloudflare.' };
  } catch (e) {
    console.error('ensureWebDeployWildcardCname:', e);
    return { ok: false, message: 'Cloudflare wildcard DNS setup failed.' };
  }
}

export function firebaseHostingDnsRecords(predomain: string): DnsRecordInstruction[] {
  const host = `${predomain}.${BASE_HOST}`;
  return [
    {
      type: 'CNAME',
      name: host,
      content: DEPLOY_TARGET,
      proxied: false,
      ttl: WEB_DEPLOY_DNS_TTL,
      purpose: `Points ${host} at Firebase Hosting (${DEPLOY_TARGET})`,
    },
  ];
}

export async function applyCloudflareDnsRecords(
  predomain: string,
): Promise<{ applied: boolean; records: DnsRecordInstruction[]; message?: string }> {
  const records = firebaseHostingDnsRecords(predomain);
  const cf = cfConfigured();
  if (!cf) {
    return {
      applied: false,
      records,
      message: 'Cloudflare API not configured on Functions — DNS must be added manually.',
    };
  }

  const host = `${predomain}.${BASE_HOST}`;
  try {
    await ensureWebDeployWildcardCname();
    const ok = await upsertCloudflareRecord(cf.token, cf.zoneId, 'CNAME', host, DEPLOY_TARGET, false);
    return {
      applied: ok,
      records,
      message: ok
        ? `DNS configured for ${host} (and wildcard *.${BASE_HOST}). “Getting this site ready” should appear within a few minutes.`
        : 'Could not create subdomain CNAME in Cloudflare.',
    };
  } catch (e) {
    console.error('applyCloudflareDnsRecords:', e);
    return {
      applied: false,
      records,
      message: 'Cloudflare API error — use the records below manually.',
    };
  }
}
