import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

const PREFIX = 'pp:v1:';

function key32(): Buffer {
  const k = env.DATA_ENCRYPTION_KEY;
  if (!k) throw new Error('DATA_ENCRYPTION_KEY is not configured');
  const buf = Buffer.from(k, 'base64');
  if (buf.length !== 32) throw new Error('DATA_ENCRYPTION_KEY must be exactly 32 bytes (base64-encoded)');
  return buf;
}

/** True when optional at-rest envelope encryption can be used (export bundles, secrets). */
export function isEncryptionKeyConfigured(): boolean {
  try {
    return !!(env.DATA_ENCRYPTION_KEY && key32());
  } catch {
    return false;
  }
}

/** AES-256-GCM with random IV prepended — format `pp:v1:<base64url(iv||tag||ct)>`. */
export function encryptSensitiveUtf8(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key32(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const body = Buffer.concat([iv, tag, enc]);
  return PREFIX + body.toString('base64url');
}

export function decryptSensitiveUtf8(serialized: string): string {
  if (!serialized.startsWith(PREFIX)) throw new Error('Invalid ciphertext prefix');
  const raw = Buffer.from(serialized.slice(PREFIX.length), 'base64url');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ct = raw.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key32(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}
