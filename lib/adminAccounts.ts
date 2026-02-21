/**
 * Server-only: admin accounts from env. Never import from client.
 * Production: set ADMIN_ACCOUNTS_JSON and/or (ADMIN_USERNAME + ADMIN_PASSWORD).
 * Dev: optional; fallback admin/admin if nothing set.
 */
export interface AdminAccount {
  username: string;
  password: string;
}

export function getAdminAccounts(): AdminAccount[] {
  if (typeof process === 'undefined' || !process.env) return [];
  const raw = process.env.ADMIN_ACCOUNTS_JSON;
  if (raw && typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const list = parsed.filter(
          (a): a is AdminAccount =>
            a && typeof a === 'object' && typeof (a as any).username === 'string' && typeof (a as any).password === 'string'
        );
        if (list.length > 0) return list;
      }
    } catch {
      // fall through
    }
  }
  // Production: single admin via ADMIN_USERNAME + ADMIN_PASSWORD (no JSON needed)
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (u && typeof u === 'string' && p && typeof p === 'string' && u.trim() && p.trim()) {
    return [{ username: u.trim(), password: p }];
  }
  // Development-only fallback
  if (process.env.NODE_ENV !== 'production') {
    return [{ username: 'admin', password: 'admin' }];
  }
  return [];
}

/** Usernames that get head_admin role (can ban anyone). Set HEAD_ADMIN_USERNAMES in env as comma-separated, or default. */
export function getHeadAdminUsernames(): string[] {
  const raw = typeof process !== 'undefined' && process.env && process.env.HEAD_ADMIN_USERNAMES;
  if (raw && typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean);
  return ['admin'];
}
