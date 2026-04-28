import crypto from 'crypto';

const ALNUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function randomInviteCode(length = 10): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALNUM[bytes[i]! % ALNUM.length];
  }
  return out;
}

export function normalizeFactionTag(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
}
