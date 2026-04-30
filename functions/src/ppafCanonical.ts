/**
 * Canonical JSON for PPAF signatures — must stay byte-identical to lib/ppafCanonical.ts.
 */
export function ppafCanonicalStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(ppafCanonicalStringify).join(',') + ']';
  }
  const o = value as Record<string, unknown>;
  const keys = Object.keys(o).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + ppafCanonicalStringify(o[k])).join(',') + '}';
}

export function ppafSigningUtf8(ppafVersion: number, issuedAt: string, payload: unknown): string {
  return ppafCanonicalStringify({ ppafVersion, issuedAt, payload });
}
