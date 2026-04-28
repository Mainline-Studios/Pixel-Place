import { getDb } from '@/lib/db';
import { User } from '@/types';
import { hashPassword } from '@/lib/auth';
import { setDocument, COLLECTIONS } from '@/lib/firestore';

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : fallback;
  } catch {
    return fallback;
  }
}

function parseEquippedAccessories(raw: string | null | undefined): string[] | Record<string, string> {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p;
    if (p && typeof p === 'object') return p as Record<string, string>;
  } catch {
    /* ignore */
  }
  return [];
}

/** Map SQLite `users` row to app `User` (same field intent as Firestore `userFromDoc`). */
export function userFromSqliteRow(row: Record<string, unknown>): User {
  const ownedSkins = parseJsonArray<string>(row.owned_skins as string, []);
  const equippedSkin =
    (row.equipped_skin as string) ||
    (ownedSkins.length > 0 ? ownedSkins[0] : 'starter_classic');

  return {
    username: (row.username as string) || '',
    password: (row.password_hash as string) || '',
    gender: (row.gender as string) || '',
    role: ((row.role as string) || 'user') as User['role'],
    coins: typeof row.coins === 'number' ? row.coins : Number(row.coins) || 0,
    safetyPoints: typeof row.safety_points === 'number' ? row.safety_points : Number(row.safety_points) || 0,
    ownedSkins: ownedSkins.length ? ownedSkins : ['starter_classic'],
    equippedSkin: equippedSkin || 'starter_classic',
    ownedFaces: parseJsonArray<string>(row.owned_faces as string, []),
    equippedFace: (row.equipped_face as string) || undefined,
    ownedAccessories: parseJsonArray<string>(row.owned_accessories as string, []),
    equippedAccessories: parseEquippedAccessories(row.equipped_accessories as string),
    ownedServers: parseJsonArray<string>(row.owned_servers as string, []),
    friends: parseJsonArray<string>(row.friends as string, []),
    friendRequests: parseJsonArray(row.friend_requests as string, []),
    sentFriendRequests: parseJsonArray<string>(row.sent_friend_requests as string, []),
    locale: typeof row.locale === 'string' ? row.locale : undefined,
    shadowBanned: row.shadow_banned === 1 || row.shadow_banned === true,
    chatMutedUntil: typeof row.chat_muted_until === 'number' ? row.chat_muted_until : undefined,
    chatViolationScore: typeof row.chat_violation_score === 'number' ? row.chat_violation_score : undefined,
    lastIpHash: typeof row.last_ip_hash === 'string' ? row.last_ip_hash : undefined,
  };
}

export function getAllUsersFromSqlite(): User[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM users').all() as Record<string, unknown>[];
  return rows.map(userFromSqliteRow);
}

export function getUserByUsernameFromSqlite(username: string): User | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)')
    .get(username) as Record<string, unknown> | undefined;
  return row ? userFromSqliteRow(row) : null;
}

function looksLikeBcrypt(s: string): boolean {
  return s.startsWith('$2a$') || s.startsWith('$2b$') || s.startsWith('$2y$');
}

/**
 * Insert or update user in SQLite. Preserves existing password hash when `user.password` is empty
 * or when the client sends a masked/empty value (so shop updates do not brick login).
 */
export async function upsertUserToSqlite(user: User): Promise<void> {
  const db = getDb();
  const key = user.username;
  const existing = db
    .prepare('SELECT password_hash FROM users WHERE LOWER(username) = LOWER(?)')
    .get(key) as { password_hash: string } | undefined;

  let passwordHash = existing?.password_hash || '';
  if (user.password && user.password.length > 0) {
    if (looksLikeBcrypt(user.password)) {
      passwordHash = user.password;
    } else {
      passwordHash = await hashPassword(user.password);
    }
  } else if (!passwordHash) {
    // New user with no password — use unusable hash placeholder (should not happen for real sign-up)
    passwordHash = await hashPassword(Math.random().toString(36));
  }

  const ownedSkins = JSON.stringify(user.ownedSkins || ['starter_classic']);
  const ownedAcc = JSON.stringify(user.ownedAccessories || []);
  const eqAcc = JSON.stringify(
    user.equippedAccessories && typeof user.equippedAccessories === 'object'
      ? user.equippedAccessories
      : Array.isArray(user.equippedAccessories)
        ? user.equippedAccessories
        : {}
  );
  const ownedServers = JSON.stringify(user.ownedServers || []);
  const friends = JSON.stringify(user.friends || []);
  const fr = JSON.stringify(user.friendRequests || []);
  const sfr = JSON.stringify(user.sentFriendRequests || []);
  const ownedFaces = JSON.stringify(user.ownedFaces || []);

  db.prepare(
    `
    INSERT INTO users (
      username, password_hash, gender, role, coins, safety_points,
      owned_skins, equipped_skin, owned_faces, equipped_face,
      owned_accessories, equipped_accessories,
      owned_servers, friends, friend_requests, sent_friend_requests,
      is_donor, locale, shadow_banned, chat_muted_until, chat_violation_score, last_ip_hash,
      updated_at
    ) VALUES (
      @username, @password_hash, @gender, @role, @coins, @safety_points,
      @owned_skins, @equipped_skin, @owned_faces, @equipped_face,
      @owned_accessories, @equipped_accessories,
      @owned_servers, @friends, @friend_requests, @sent_friend_requests,
      @is_donor, @locale, @shadow_banned, @chat_muted_until, @chat_violation_score, @last_ip_hash,
      strftime('%s','now')
    )
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      gender = excluded.gender,
      role = excluded.role,
      coins = excluded.coins,
      safety_points = excluded.safety_points,
      owned_skins = excluded.owned_skins,
      equipped_skin = excluded.equipped_skin,
      owned_faces = excluded.owned_faces,
      equipped_face = excluded.equipped_face,
      owned_accessories = excluded.owned_accessories,
      equipped_accessories = excluded.equipped_accessories,
      owned_servers = excluded.owned_servers,
      friends = excluded.friends,
      friend_requests = excluded.friend_requests,
      sent_friend_requests = excluded.sent_friend_requests,
      is_donor = excluded.is_donor,
      locale = excluded.locale,
      shadow_banned = excluded.shadow_banned,
      chat_muted_until = excluded.chat_muted_until,
      chat_violation_score = excluded.chat_violation_score,
      last_ip_hash = excluded.last_ip_hash,
      updated_at = strftime('%s','now')
    `
  ).run({
    username: user.username,
    password_hash: passwordHash,
    gender: user.gender ?? '',
    role: user.role || 'user',
    coins: user.coins ?? 0,
    safety_points: user.safetyPoints ?? 0,
    owned_skins: ownedSkins,
    equipped_skin: user.equippedSkin || 'starter_classic',
    owned_faces: ownedFaces,
    equipped_face: user.equippedFace ?? null,
    owned_accessories: ownedAcc,
    equipped_accessories: eqAcc,
    owned_servers: ownedServers,
    friends,
    friend_requests: fr,
    sent_friend_requests: sfr,
    is_donor: user.role === 'admin' || user.role === 'head_admin' ? 1 : 0,
    locale: user.locale ?? '',
    shadow_banned: user.shadowBanned ? 1 : 0,
    chat_muted_until: user.chatMutedUntil ?? null,
    chat_violation_score: user.chatViolationScore ?? 0,
    last_ip_hash: user.lastIpHash ?? null,
  });
}

/** Merge two user lists; entries in `overwrite` replace same username (lower) from `base`. */
export function mergeUserLists(base: User[], overwrite: User[]): User[] {
  const map = new Map<string, User>();
  for (const u of base) {
    map.set(u.username.toLowerCase(), u);
  }
  for (const u of overwrite) {
    map.set(u.username.toLowerCase(), u);
  }
  return [...map.values()];
}

/** Save one user to Firestore (when configured) and always to SQLite. */
export async function persistUserCloudAndLocal(user: User): Promise<void> {
  await setDocument(COLLECTIONS.USERS, user.username.toLowerCase(), {
    username: user.username,
    username_lower: user.username.toLowerCase(),
    password_hash: user.password,
    gender: user.gender,
    role: user.role,
    coins: user.coins,
    safety_points: user.safetyPoints ?? 0,
    owned_skins: user.ownedSkins || [],
    equipped_skin: user.equippedSkin || '',
    owned_faces: user.ownedFaces || [],
    equipped_face: user.equippedFace || '',
    owned_accessories: user.ownedAccessories || [],
    equipped_accessories: user.equippedAccessories || [],
    owned_servers: user.ownedServers || [],
    friends: user.friends || [],
    friend_requests: user.friendRequests || [],
    sent_friend_requests: user.sentFriendRequests || [],
    is_donor: user.role === 'admin' || user.role === 'head_admin' ? 1 : 0,
    locale: user.locale || '',
    updated_at: Date.now(),
  });
  await upsertUserToSqlite(user);
}
