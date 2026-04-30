import type { User } from '@/types';
import { ppafSigningUtf8 } from '@/lib/ppafCanonical';
import { apiUrl } from '@/lib/apiBaseUrl';
import { getAuthToken } from '@/lib/api';
import { buildPpafAccountPayload } from '@/lib/privacyExport';
import { PPAF_EMBEDDED_PUBLIC_KEY_PEM } from '@/lib/ppafEmbeddedPublicKey';

function getClientPpafPublicKeyPem(): string {
  const fromEnv =
    typeof process.env.NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY === 'string'
      ? process.env.NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY.trim()
      : '';
  return fromEnv || PPAF_EMBEDDED_PUBLIC_KEY_PEM;
}

/** MIME type for `.ppaf` downloads (still uses `.ppaf` extension). */
export const PPAF_MEDIA_TYPE = 'application/vnd.pixelplace.ppaf+json';

/** Matches Cloud Function `PPAF_NOT_CONFIGURED_CODE` — show configure instructions in UI. */
export const PPAF_NOT_CONFIGURED_CODE = 'PPAF_NOT_CONFIGURED';

export type DownloadPpafResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

export async function downloadSignedPpaf(user: User): Promise<DownloadPpafResult> {
  const token = getAuthToken();
  if (!token) {
    return { ok: false, error: 'Sign in again to download a signed backup.' };
  }
  const payload = buildPpafAccountPayload(user);
  try {
    const res = await fetch(apiUrl('/api/account/ppaf/sign'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ payload }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    if (!res.ok) {
      const err = typeof data.error === 'string' ? data.error : 'Could not create signed backup.';
      const code = typeof data.code === 'string' ? data.code : undefined;
      return { ok: false, error: err, code };
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: PPAF_MEDIA_TYPE });
    const a = document.createElement('a');
    const safe = (user.username || 'account').replace(/[^\w.-]+/g, '_').slice(0, 64);
    a.href = URL.createObjectURL(blob);
    a.download = `${safe}.ppaf`;
    a.rel = 'noopener';
    a.click();
    URL.revokeObjectURL(a.href);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error while creating backup.' };
  }
}

function pemPublicKeyToUint8Array(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/gi, '')
    .replace(/-----END PUBLIC KEY-----/gi, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s/g, '');
  const pad = clean.length % 4 === 0 ? '' : '='.repeat(4 - (clean.length % 4));
  const bin = atob(clean + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyEd25519Local(doc: Record<string, unknown>, pem: string): Promise<boolean> {
  if (doc.format !== 'pixel-place-account-file') return false;
  if (doc.algorithm !== 'ed25519') return false;
  if (typeof doc.signature !== 'string' || typeof doc.issuedAt !== 'string') return false;
  if (doc.payload === null || typeof doc.payload !== 'object') return false;
  const ppafVersion = Number(doc.ppafVersion);
  const msg = ppafSigningUtf8(ppafVersion, doc.issuedAt, doc.payload);
  const keyBuf = pemPublicKeyToUint8Array(pem.replace(/\\n/g, '\n'));
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return false;
  const key = await subtle.importKey('spki', keyBuf, { name: 'Ed25519' }, false, ['verify']);
  const sigBytes = base64ToBytes(doc.signature);
  const msgBytes = new TextEncoder().encode(msg);
  return subtle.verify({ name: 'Ed25519' }, key, sigBytes, msgBytes);
}

/**
 * Verifies Ed25519 signature (browser public key if configured, else API).
 * Forged or corrupted JSON fails unless the signature matches the official key pair.
 */
export async function verifyPpafFile(
  parsed: unknown,
): Promise<
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: string; code?: string }
> {
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Invalid file (not JSON).' };
  }
  const doc = parsed as Record<string, unknown>;

  const pem = getClientPpafPublicKeyPem();

  if (pem) {
    try {
      if (await verifyEd25519Local(doc, pem)) {
        return { ok: true, payload: doc.payload as Record<string, unknown> };
      }
    } catch {
      /* try server */
    }
  }

  try {
    const res = await fetch(apiUrl('/api/account/ppaf/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: parsed }),
    });
    const j = (await res.json()) as { valid?: boolean; error?: string; code?: string };
    if (j.valid) {
      return { ok: true, payload: doc.payload as Record<string, unknown> };
    }
    const code = typeof j.code === 'string' ? j.code : undefined;
    return {
      ok: false,
      error:
        j.error ||
        (pem
          ? 'Signature invalid — file may be corrupted or edited.'
          : 'Could not verify backup. Add NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY for offline checks, or stay online.'),
      code,
    };
  } catch {
    return {
      ok: false,
      error: pem
        ? 'Signature check failed.'
        : 'Offline — set NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY to verify without network.',
    };
  }
}

/** Apply verified backup fields; never applies password, username, or role from file. */
export function mergePpafPayloadIntoUserUpdates(payload: Record<string, unknown>): Partial<User> {
  const skip = new Set(['password', 'username', 'role', 'exportNote', 'exportedAt']);
  const out: Partial<User> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (skip.has(k)) continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
}
