/**
 * Parses stdout from `node scripts/generate-ppaf-keys.mjs` (JSON-string PEM lines).
 */
export function parseGeneratePpafKeysOutput(raw: string): { privatePem: string; publicPem: string } | null {
  const lines = raw.replace(/\r\n/g, '\n');
  const restorationMatch = lines.match(/PPAF RESTORATION KEY:\s*\n([A-Za-z0-9_-]+)\s*\nKEEP THIS SAFE\./m);
  if (restorationMatch?.[1]) {
    try {
      const b64url = restorationMatch[1];
      const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
      const binary = atob(b64 + pad);
      const json = decodeURIComponent(
        Array.from(binary)
          .map((ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join(''),
      );
      const decoded = JSON.parse(json) as {
        privatePem?: string;
        publicPem?: string;
      };
      const privatePem = String(decoded.privatePem || '');
      const publicPem = String(decoded.publicPem || '');
      if (privatePem.includes('BEGIN PRIVATE KEY') && publicPem.includes('BEGIN PUBLIC KEY')) {
        return { privatePem, publicPem };
      }
    } catch {
      return null;
    }
  }

  const privLine = lines.match(/^\s*PPAF_ED25519_PRIVATE_KEY=(.+)$/m);
  const pubLine = lines.match(/^\s*NEXT_PUBLIC_PPAF_ED25519_PUBLIC_KEY=(.+)$/m);
  if (!privLine?.[1] || !pubLine?.[1]) return null;

  const parseVal = (value: string): string => {
    const v = value.trim();
    if (!v) return '';
    try {
      return JSON.parse(v) as string;
    } catch {
      return v.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
    }
  };

  const privatePem = parseVal(privLine[1]);
  const publicPem = parseVal(pubLine[1]);
  if (!privatePem.includes('BEGIN PRIVATE KEY') || !publicPem.includes('BEGIN PUBLIC KEY')) {
    return null;
  }
  return { privatePem, publicPem };
}
