/**
 * Generate Ed25519 PPAF keys in the browser (Web Crypto).
 * PEM and restoration blob format match `scripts/generate-ppaf-keys.mjs`.
 */

function uint8ToPemDer(bytes: Uint8Array, label: 'PRIVATE KEY' | 'PUBLIC KEY'): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  const lines = b64.match(/.{1,64}/g) ?? [b64];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

function utf8ToBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export type PpafBrowserGeneratedKeys = {
  privatePem: string;
  publicPem: string;
  /** Same shape as `node scripts/generate-ppaf-keys.mjs` stdout (three lines). */
  restorationBlock: string;
};

export async function generatePpafKeyPairInBrowser(): Promise<PpafBrowserGeneratedKeys> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('Web Crypto is not available in this browser.');

  const pair = await subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const privDer = await subtle.exportKey('pkcs8', pair.privateKey);
  const pubDer = await subtle.exportKey('spki', pair.publicKey);

  const privatePem = uint8ToPemDer(new Uint8Array(privDer), 'PRIVATE KEY').trim();
  const publicPem = uint8ToPemDer(new Uint8Array(pubDer), 'PUBLIC KEY').trim();

  const payload = {
    version: 1,
    algorithm: 'ed25519',
    generatedAt: new Date().toISOString(),
    runId: globalThis.crypto?.randomUUID?.() || `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    privatePem,
    publicPem,
  };
  const restorationKey = utf8ToBase64Url(JSON.stringify(payload));
  const restorationBlock = `PPAF RESTORATION KEY:\n${restorationKey}\nKEEP THIS SAFE.`;

  return { privatePem, publicPem, restorationBlock };
}
