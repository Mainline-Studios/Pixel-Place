/**
 * Built-in admin usernames (must stay aligned with `frontend/lib/storage.ts` ADMIN_ACCOUNTS / HEAD_ADMIN).
 * Used so Postgres accounts that were created as `user` still get correct JWT + API role.
 */

const HEAD = ['admin'] as const;

const ALL_BOOTSTRAP = [
  'admin',
  'TicTAK',
  "IDon'tKnow",
  'Administrator1237',
  'Billibob',
  'Daniello1',
  'FunBoy',
  'BelloBoy1',
  'Bob',
  'Mr.Noob',
  'BDawgsAwesome1',
] as const;

export function adminUsernameKey(username: string): string {
  return (username || '').replace(/\s+/g, '').toLowerCase();
}

export function effectiveRoleForBuiltinAccount(username: string, dbRole: string): string {
  const k = adminUsernameKey(username);
  if (HEAD.some((h) => adminUsernameKey(h) === k)) return 'head_admin';
  if (ALL_BOOTSTRAP.some((u) => adminUsernameKey(u) === k)) return 'admin';
  return dbRole;
}
