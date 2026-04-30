import { ppafSigningUtf8 } from '@/lib/ppafCanonical';
import { PPAF_DOC_FORMAT, PPAF_DOC_VERSION } from '@/lib/ppafConstants';

function pemPrivatePkcs8ToUint8Array(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/gi, '')
    .replace(/-----END PRIVATE KEY-----/gi, '')
    .replace(/\s/g, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/** Ed25519 sign in the browser (same canonical message as Cloud Functions). */
export async function signPpafDocumentWithPrivateKey(
  payload: unknown,
  privatePemInput: string,
): Promise<Record<string, unknown>> {
  const pem = privatePemInput.replace(/\\n/g, '\n').trim();
  const issuedAt = new Date().toISOString();
  const msg = ppafSigningUtf8(PPAF_DOC_VERSION, issuedAt, payload);
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('Web Crypto is not available in this browser.');
  const pkcs8 = pemPrivatePkcs8ToUint8Array(pem);
  const key = await subtle.importKey('pkcs8', pkcs8, { name: 'Ed25519' }, false, ['sign']);
  const sigBuf = await subtle.sign({ name: 'Ed25519' }, key, new TextEncoder().encode(msg));
  const signature = uint8ToBase64(new Uint8Array(sigBuf));
  return {
    format: PPAF_DOC_FORMAT,
    ppafVersion: PPAF_DOC_VERSION,
    algorithm: 'ed25519',
    issuedAt,
    payload,
    signature,
  };
}
