import type { User } from '@/types';

/**
 * Plain account snapshot for PPAF signing (no password; server adds Ed25519 signature).
 */
export function buildPpafAccountPayload(user: User): Record<string, unknown> {
  const { password: _omit, ...rest } = user;
  return { ...rest, password: '[REDACTED]' };
}
