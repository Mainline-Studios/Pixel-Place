/**
 * Server-only: admin accounts from env. Never import from client.
 * Set ADMIN_ACCOUNTS_JSON in .env: [{"username":"admin","password":"secret"},...]
 */
export interface AdminAccount {
  username: string;
  password: string;
}

export function getAdminAccounts(): AdminAccount[] {
  if (typeof process === 'undefined' || !process.env) return [];
  const raw = process.env.ADMIN_ACCOUNTS_JSON;
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is AdminAccount =>
        a && typeof a === 'object' && typeof (a as any).username === 'string' && typeof (a as any).password === 'string'
    );
  } catch {
    return [];
  }
}

/** Usernames that get head_admin role (can ban anyone). Set HEAD_ADMIN_USERNAMES in env as comma-separated, or default. */
export function getHeadAdminUsernames(): string[] {
  const raw = typeof process !== 'undefined' && process.env && process.env.HEAD_ADMIN_USERNAMES;
  if (raw && typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean);
  return ['admin'];
}
