/**
 * Parses PPAF restoration material: bare base64url token, labeled block, or legacy env lines.
 */

export function decodePpafRestorationBase64Url(b64url: string): { privatePem: string; publicPem: string } | null {
  const trimmed = b64url.trim();
  if (!trimmed || trimmed.length < 32) return null;
  try {
    const b64 = trimmed.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const binary = atob(b64 + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder('utf-8').decode(bytes);
    const decoded = JSON.parse(json) as {
      privatePem?: string;
      publicPem?: string;
    };
    const privatePem = String(decoded.privatePem || '').replace(/\\n/g, '\n').trim();
    const publicPem = String(decoded.publicPem || '').replace(/\\n/g, '\n').trim();
    if (privatePem.includes('BEGIN PRIVATE KEY') && publicPem.includes('BEGIN PUBLIC KEY')) {
      return { privatePem, publicPem };
    }
  } catch {
    return null;
  }
  return null;
}

function stripCodeFences(raw: string): string {
  let s = raw.replace(/\r\n/g, '\n').trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  }
  return s;
}

/** Collapse whitespace inside a single base64url line (e.g. word-wrapped paste). */
function compactBase64UrlCandidate(s: string): string {
  return s.replace(/\s+/g, '');
}

/**
 * Parses stdout from `node scripts/generate-ppaf-keys.mjs`, a bare restoration token, or legacy env lines.
 */
export function parseGeneratePpafKeysOutput(raw: string): { privatePem: string; publicPem: string } | null {
  const normalized = stripCodeFences(raw);
  const lines = normalized.replace(/\r\n/g, '\n');

  // Labeled block (with or without "KEEP THIS SAFE", same-line token allowed)
  const labeled = lines.match(
    /PPAF\s+RESTORATION\s+KEY:\s*\r?\n?\s*([A-Za-z0-9_-]+)|PPAF\s+RESTORATION\s+KEY:\s*([A-Za-z0-9_-]+)/i,
  );
  const fromLabel = labeled?.[1] || labeled?.[2];
  if (fromLabel) {
    const decoded = decodePpafRestorationBase64Url(fromLabel);
    if (decoded) return decoded;
  }

  // Bare token: one line or word-wrapped base64url
  const compact = compactBase64UrlCandidate(normalized);
  if (/^[A-Za-z0-9_-]+$/.test(compact) && compact.length >= 32) {
    const decoded = decodePpafRestorationBase64Url(compact);
    if (decoded) return decoded;
  }

  // Strict three-line block (original script output)
  const restorationMatch = lines.match(/PPAF RESTORATION KEY:\s*\n([A-Za-z0-9_-]+)\s*\nKEEP THIS SAFE\.?/im);
  if (restorationMatch?.[1]) {
    const decoded = decodePpafRestorationBase64Url(restorationMatch[1]);
    if (decoded) return decoded;
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
