/**
 * Parses stdout from `node scripts/generate-ppaf-keys.mjs` (JSON-string PEM lines).
 */
export function parseGeneratePpafKeysOutput(raw: string): { privatePem: string; publicPem: string } | null {
  const lines = raw.replace(/\r\n/g, '\n');
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
