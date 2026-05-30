/**
 * Register per-subdomain custom domains on Firebase Hosting (classic).
 * Wildcard `*.pixelplaceofficial.com` is NOT supported in the Firebase Console UI.
 */
import * as admin from 'firebase-admin';

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'pixel-place-823b1';
const SITE_ID = process.env.WEB_DEPLOY_HOSTING_SITE || 'pixelplace-deploy';
const BASE_HOST = 'pixelplaceofficial.com';

export function webDeployFullHost(predomain: string): string {
  return `${predomain}.${BASE_HOST}`;
}

async function getGoogleAccessToken(): Promise<string | null> {
  try {
    const cred = admin.app().options.credential;
    if (!cred) return null;
    const tok = await cred.getAccessToken();
    return tok.access_token || null;
  } catch {
    return null;
  }
}

/** Try wildcard via API (Console UI rejects *; API may accept). Best-effort one-time. */
export async function registerWebDeployWildcardDomain(): Promise<{ ok: boolean; message: string }> {
  const host = `*.${BASE_HOST}`;
  const token = await getGoogleAccessToken();
  if (!token) return { ok: false, message: 'No credentials for Firebase Hosting API.' };

  const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${PROJECT_ID}/sites/${SITE_ID}/customDomains?customDomainId=${encodeURIComponent(host)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok || res.status === 409) {
      return { ok: true, message: `Wildcard ${host} registered on Hosting.` };
    }
    const text = await res.text();
    if (text.includes('ALREADY_EXISTS')) return { ok: true, message: `Wildcard ${host} already on Hosting.` };
    return { ok: false, message: `Wildcard not supported via API (${res.status}); using per-subdomain hosts.` };
  } catch {
    return { ok: false, message: 'Wildcard Hosting registration skipped.' };
  }
}

/** Register e.g. yourapp.pixelplaceofficial.com on site pixelplace-deploy (idempotent). */
export async function registerWebDeployHostingDomain(
  predomain: string,
): Promise<{ ok: boolean; host: string; message: string }> {
  const host = webDeployFullHost(predomain);
  const token = await getGoogleAccessToken();
  if (!token) {
    return {
      ok: false,
      host,
      message: 'Could not obtain credentials to register hosting domain (add manually in Firebase Console).',
    };
  }

  const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${PROJECT_ID}/sites/${SITE_ID}/customDomains?customDomainId=${encodeURIComponent(host)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      return { ok: true, host, message: `Registered ${host} on Firebase Hosting (${SITE_ID}).` };
    }

    const text = await res.text();
    if (res.status === 409 || text.includes('ALREADY_EXISTS') || text.includes('already exists')) {
      return { ok: true, host, message: `${host} is already on Firebase Hosting.` };
    }

    console.error('Firebase Hosting customDomains.create:', res.status, text);
    return {
      ok: false,
      host,
      message: `Firebase Hosting API (${res.status}): add ${host} manually under site “${SITE_ID}”.`,
    };
  } catch (e) {
    console.error('registerWebDeployHostingDomain:', e);
    return {
      ok: false,
      host,
      message: `Failed to register ${host} — add it manually in Firebase Console → Hosting → ${SITE_ID}.`,
    };
  }
}
