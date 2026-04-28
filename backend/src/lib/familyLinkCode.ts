import { createHash, randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateFamilyLinkCode(): string {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += ALPHABET[randomBytes(1)[0]! % ALPHABET.length];
  }
  return s;
}

export function hashFamilyLinkCode(code: string): string {
  return createHash('sha256').update(code.toUpperCase().trim()).digest('hex');
}
