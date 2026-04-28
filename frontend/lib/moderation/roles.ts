/**
 * Role hierarchy for enforcement (JWT must be refreshed after role changes).
 * head_admin retains full override.
 */

export const ROLE_RANK: Record<string, number> = {
  user: 0,
  mod: 1,
  admin: 2,
  head_admin: 3,
};

export function rank(role: string): number {
  return ROLE_RANK[role] ?? 0;
}

/** View reports queue, audit logs, take mute / dismiss actions */
export function isModerator(role: string): boolean {
  return rank(role) >= ROLE_RANK.mod;
}

/** Shadow ban, hard ban, IP tools, promote roles */
export function isAdminActor(role: string): boolean {
  return rank(role) >= ROLE_RANK.admin;
}
