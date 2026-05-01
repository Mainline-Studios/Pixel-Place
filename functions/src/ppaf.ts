/**
 * Pixel Place Account File (PPAF) — Ed25519-signed backups.
 * Set PPAF_ED25519_PRIVATE_KEY (PKCS#8 PEM, optional \n escapes) on the Cloud Function.
 */
import { createPrivateKey, createPublicKey, sign, verify } from 'crypto';
import type { Request, Response } from 'express';
import { getAuthFromRequest } from './authMiddleware';
import { ppafSigningUtf8 } from './ppafCanonical';

export const PPAF_FORMAT = 'pixel-place-account-file';
export const PPAF_VERSION = 1;
const PPAF_MAX_RESTORE_AGE_MS = 90 * 24 * 60 * 60 * 1000;
/** Client may show deployment instructions when this code is returned. */
export const PPAF_NOT_CONFIGURED_CODE = 'PPAF_NOT_CONFIGURED';

function loadPrivateKey() {
  const raw = process.env.PPAF_ED25519_PRIVATE_KEY;
  if (!raw || !raw.trim()) return null;
  const normalized = raw.trim().replace(/\\n/g, '\n');
  try {
    return createPrivateKey(normalized);
  } catch {
    try {
      return createPrivateKey({
        key: Buffer.from(raw.trim(), 'base64'),
        format: 'der',
        type: 'pkcs8',
      });
    } catch {
      return null;
    }
  }
}

/** Builds signed document (same shape clients persist as `.ppaf`). */
export function signAccountPayload(payload: unknown): { ok: true; doc: Record<string, unknown> } | { ok: false; error: string } {
  const pk = loadPrivateKey();
  if (!pk) return { ok: false, error: 'PPAF signing key not configured on server' };
  const issuedAt = new Date().toISOString();
  const msg = ppafSigningUtf8(PPAF_VERSION, issuedAt, payload);
  const sig = sign(null, Buffer.from(msg, 'utf8'), pk);
  return {
    ok: true,
    doc: {
      format: PPAF_FORMAT,
      ppafVersion: PPAF_VERSION,
      algorithm: 'ed25519',
      issuedAt,
      payload,
      signature: sig.toString('base64'),
    },
  };
}

export function verifyPpafDocument(body: unknown): { ok: true } | { ok: false; error: string; code?: string } {
  const pk = loadPrivateKey();
  if (!pk) {
    return {
      ok: false,
      error: 'Server verify unavailable — add PPAF_ED25519_PRIVATE_KEY to Cloud Functions.',
      code: PPAF_NOT_CONFIGURED_CODE,
    };
  }
  const pub = createPublicKey(pk);

  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid PPAF document' };
  }
  const d = body as Record<string, unknown>;
  if (d.format !== PPAF_FORMAT) {
    return { ok: false, error: 'Not a Pixel Place account file (wrong format field)' };
  }
  if (typeof d.signature !== 'string' || typeof d.issuedAt !== 'string') {
    return { ok: false, error: 'Invalid PPAF document (missing signature or issuedAt)' };
  }
  if (d.algorithm !== 'ed25519') {
    return { ok: false, error: 'Unsupported PPAF algorithm' };
  }
  const issuedAtMs = Date.parse(d.issuedAt);
  if (!Number.isFinite(issuedAtMs)) {
    return { ok: false, error: 'Invalid PPAF issuedAt timestamp' };
  }
  const now = Date.now();
  if (issuedAtMs > now + 10 * 60 * 1000) {
    return { ok: false, error: 'PPAF issuedAt is in the future' };
  }
  if (now - issuedAtMs > PPAF_MAX_RESTORE_AGE_MS) {
    return { ok: false, error: 'PPAF is too old to restore' };
  }
  if (d.payload === null || typeof d.payload !== 'object') {
    return { ok: false, error: 'Invalid PPAF payload' };
  }
  const ppafVersion = Number(d.ppafVersion);
  if (ppafVersion !== PPAF_VERSION) {
    return { ok: false, error: `Unsupported PPAF version: ${String(d.ppafVersion)}` };
  }
  const msg = ppafSigningUtf8(ppafVersion, d.issuedAt, d.payload);
  let sigBuf: Buffer;
  try {
    sigBuf = Buffer.from(d.signature, 'base64');
  } catch {
    return { ok: false, error: 'Invalid signature encoding' };
  }
  const ok = verify(null, Buffer.from(msg, 'utf8'), pub, sigBuf);
  return ok ? { ok: true } : { ok: false, error: 'Signature verification failed (corrupted or tampered file)' };
}

export function postPpafSign(req: Request, res: Response): void {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!loadPrivateKey()) {
    res.status(503).json({
      error: 'Account backup signing is not configured on this deployment.',
      code: PPAF_NOT_CONFIGURED_CODE,
    });
    return;
  }

  const payload = req.body?.payload;
  if (!payload || typeof payload !== 'object') {
    res.status(400).json({ error: 'payload object required' });
    return;
  }
  const uname = typeof (payload as { username?: string }).username === 'string'
    ? String((payload as { username?: string }).username).trim()
    : '';
  if (!uname || uname.toLowerCase() !== auth.username.toLowerCase()) {
    res.status(403).json({ error: 'Payload username must match signed-in user' });
    return;
  }

  const raw = JSON.stringify(payload);
  if (raw.length > 900_000) {
    res.status(413).json({ error: 'Payload too large' });
    return;
  }

  const result = signAccountPayload(payload);
  if (!result.ok) {
    res.status(500).json({ error: result.error });
    return;
  }
  res.json(result.doc);
}

export function postPpafVerify(req: Request, res: Response): void {
  const doc = req.body?.document ?? req.body;
  const r = verifyPpafDocument(doc);
  if (!r.ok) {
    res.json({ valid: false, error: r.error, ...(r.code ? { code: r.code } : {}) });
    return;
  }
  res.json({ valid: true });
}
