'use client';

/**
 * Hybrid realtime client:
 * - RTDB: users + bans (fast login/session checks)
 * - Firestore: everything else
 * Writes still go through API routes for validation.
 */

import { getDatabase, onValue, ref } from 'firebase/database';
import { getFirestore, onSnapshot, collection as fsCollection, doc as fsDoc } from 'firebase/firestore';
import { getOrInitFirebaseApp } from './firebaseConfig';
import { User } from '@/types';

const COLLECTIONS = {
  USERS: 'users',
  GAMES: 'games', // User-made games (same as API)
  BANS: 'bans',
  REPORTS: 'reports',
  BAN_APPEALS: 'ban_appeals',
  GAME_SUBMISSIONS: 'game_submissions',
};

let db: ReturnType<typeof getDatabase> | null = null;
let firestoreDb: ReturnType<typeof getFirestore> | null = null;

function getDb() {
  if (typeof window === 'undefined') return null;
  try {
    if (!db) {
      const app = getOrInitFirebaseApp();
      if (!app) return null;
      db = getDatabase(app);
    }
    return db;
  } catch (e) {
    console.warn('Realtime Database client init failed:', e);
    return null;
  }
}

function getFirestoreFallbackDb() {
  if (typeof window === 'undefined') return null;
  try {
    if (!firestoreDb) {
      const app = getOrInitFirebaseApp();
      if (!app) return null;
      firestoreDb = getFirestore(app);
    }
    return firestoreDb;
  } catch (e) {
    console.warn('Firestore fallback init failed:', e);
    return null;
  }
}

/** Normalize equipped_accessories from Firestore (can be object or array). */
function normalizeEquippedAccessories(val: unknown): string[] | Record<string, string> {
  if (val == null) return {};
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'object') return val as Record<string, string>;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? parsed : {});
    } catch { return {}; }
  }
  return {};
}

/** Convert Firestore user doc to User type */
function userFromDoc(d: { id: string } & Record<string, unknown>): User {
  const doc = d as Record<string, unknown>;
  return {
    userId: typeof doc.user_id === 'number' ? (doc.user_id as number) : undefined,
    username: (doc.username as string) || doc.id,
    password: '',
    gender: (doc.gender as string) || '',
    role: ((doc.role as string) || 'user') as 'admin' | 'user' | 'head_admin',
    coins: (doc.coins as number) ?? 0,
    ownedSkins: Array.isArray(doc.owned_skins) ? doc.owned_skins as string[] : [],
    equippedSkin: (doc.equipped_skin as string) || '',
    ownedAccessories: Array.isArray(doc.owned_accessories) ? doc.owned_accessories as string[] : [],
    equippedAccessories: normalizeEquippedAccessories(doc.equipped_accessories),
    ownedServers: Array.isArray(doc.owned_servers) ? doc.owned_servers as string[] : [],
    friends: Array.isArray(doc.friends) ? doc.friends as string[] : [],
    friendRequests: Array.isArray(doc.friend_requests) ? doc.friend_requests as any[] : [],
    sentFriendRequests: Array.isArray(doc.sent_friend_requests) ? doc.sent_friend_requests as string[] : [],
    favoriteGameIds: Array.isArray(doc.favorite_game_ids) ? doc.favorite_game_ids as string[] : [],
    ownedFaces: Array.isArray(doc.owned_faces) ? doc.owned_faces as string[] : undefined,
    equippedFace: (doc.equipped_face as string) || undefined,
    safetyPoints: typeof doc.safety_points === 'number' ? doc.safety_points : undefined,
    recentlyPlayed: (() => {
      const rp = doc.recently_played;
      if (Array.isArray(rp)) return rp as string[];
      if (typeof rp === 'string') {
        try {
          const parsed = JSON.parse(rp);
          return Array.isArray(parsed) ? (parsed as string[]) : [];
        } catch {
          return [];
        }
      }
      return [];
    })(),
  };
}

/** Subscribe to a single user (by username). Returns unsubscribe function. */
export function subscribeToUser(
  username: string,
  callback: (user: User | null) => void
): () => void {
  const database = getDb();
  if (!database) {
    const fb = getFirestoreFallbackDb();
    if (!fb) {
      callback(null);
      return () => {};
    }
    return onSnapshot(fsDoc(fb, COLLECTIONS.USERS, username.toLowerCase()), (snap) => {
      callback(snap.exists() ? userFromDoc({ id: snap.id, ...snap.data() }) : null);
    });
  }
  const userRef = ref(database, `${COLLECTIONS.USERS}/${username.toLowerCase()}`);
  let fallbackUnsub: (() => void) | null = null;
  const unsub = onValue(
    userRef,
    (snap) => {
      if (!snap.exists()) {
        if (!fallbackUnsub) {
          const fb = getFirestoreFallbackDb();
          if (fb) {
            fallbackUnsub = onSnapshot(fsDoc(fb, COLLECTIONS.USERS, username.toLowerCase()), (fbSnap) => {
              callback(fbSnap.exists() ? userFromDoc({ id: fbSnap.id, ...fbSnap.data() }) : null);
            });
          } else {
            callback(null);
          }
        }
        return;
      }
      if (fallbackUnsub) {
        fallbackUnsub();
        fallbackUnsub = null;
      }
      const value = snap.val();
      callback(userFromDoc({ id: username.toLowerCase(), ...(value || {}) }));
    },
    (err) => {
      console.warn('RTDB user subscription error:', err);
      callback(null);
    },
  );
  return () => {
    unsub();
    if (fallbackUnsub) fallbackUnsub();
  };
}

/** Subscribe to all users. Returns unsubscribe function. */
export function subscribeToUsers(callback: (users: User[]) => void): () => void {
  const database = getDb();
  if (!database) {
    const fb = getFirestoreFallbackDb();
    if (!fb) {
      callback([]);
      return () => {};
    }
    return onSnapshot(fsCollection(fb, COLLECTIONS.USERS), (snap) => {
      callback(snap.docs.map((d) => userFromDoc({ id: d.id, ...d.data() })));
    });
  }
  const usersRef = ref(database, COLLECTIONS.USERS);
  const usersById = new Map<string, User>();
  const emitMerged = () => callback(Array.from(usersById.values()));

  const rtdbUnsub = onValue(
    usersRef,
    (snap) => {
      const payload = snap.val();
      const rtdbIds = new Set<string>();
      if (payload && typeof payload === 'object') {
        Object.entries(payload).forEach(([id, data]) => {
          rtdbIds.add(id);
          usersById.set(id, userFromDoc({ id, ...(data as Record<string, unknown>) }));
        });
      }
      for (const [id, user] of usersById.entries()) {
        if (!(user as any).__fromFirestore && !rtdbIds.has(id)) usersById.delete(id);
      }
      emitMerged();
    },
    (err) => {
      console.warn('RTDB users subscription error:', err);
      emitMerged();
    },
  );

  const fb = getFirestoreFallbackDb();
  const fsUnsub = fb
    ? onSnapshot(
        fsCollection(fb, COLLECTIONS.USERS),
        (snap) => {
          const fsIds = new Set<string>();
          snap.docs.forEach((d) => {
            fsIds.add(d.id);
            if (!usersById.has(d.id)) {
              const u = userFromDoc({ id: d.id, ...d.data() }) as User & { __fromFirestore?: boolean };
              u.__fromFirestore = true;
              usersById.set(d.id, u);
            }
          });
          // Remove stale firestore-only entries.
          for (const [id, user] of usersById.entries()) {
            if ((user as any).__fromFirestore && !fsIds.has(id)) usersById.delete(id);
          }
          emitMerged();
        },
        (err) => {
          console.warn('Firestore users fallback subscription error:', err);
          emitMerged();
        },
      )
    : () => {};

  return () => {
    rtdbUnsub();
    fsUnsub();
  };
}

/** Convert Firestore game doc to UserMadeGame shape */
function gameFromDoc(d: { id: string } & Record<string, unknown>): { id: string; gameId?: number; title: string; desc: string; owner: string; ts: number; sceneData: { objects: unknown[] }; publishedBy?: string; gameType?: string; fileContent?: string; fileType?: string; gameCode?: string } {
  const doc = d as Record<string, unknown>;
  let sceneData = doc.scene_data;
  if (typeof sceneData === 'string') {
    try { sceneData = JSON.parse(sceneData as string); } catch { sceneData = { objects: [] }; }
  }
  return {
    id: (doc.id as string) || '',
    gameId: typeof doc.game_id === 'number' ? (doc.game_id as number) : undefined,
    title: (doc.title as string) || '',
    desc: (doc.description as string) || '',
    owner: (doc.owner as string) || '',
    ts: (doc.ts as number) || 0,
    sceneData: (sceneData as { objects: unknown[] }) || { objects: [] },
    publishedBy: doc.published_by as string | undefined,
    gameType: doc.game_type as string | undefined,
    fileContent: doc.file_content as string | undefined,
    fileType: doc.file_type as string | undefined,
    gameCode: doc.game_code as string | undefined,
  };
}

/** Subscribe to games collection (user-made games). Returns unsubscribe function. */
export function subscribeToUserMadeGames(
  callback: (games: Array<{ id: string; title: string; desc: string; owner: string; ts: number; sceneData: unknown }>) => void
): () => void {
  const fb = getFirestoreFallbackDb();
  if (!fb) {
    callback([]);
    return () => {};
  }
  return onSnapshot(
    fsCollection(fb, COLLECTIONS.GAMES),
    (snap) => callback(snap.docs.map((d) => gameFromDoc({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('Firestore games subscription error:', err);
      callback([]);
    },
  );
}

/** Subscribe to bans collection */
export function subscribeToBans(
  callback: (bans: Array<{ id: string } & Record<string, unknown>>) => void
): () => void {
  const database = getDb();
  if (!database) {
    const fb = getFirestoreFallbackDb();
    if (!fb) {
      callback([]);
      return () => {};
    }
    return onSnapshot(fsCollection(fb, COLLECTIONS.BANS), (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }
  const bansRef = ref(database, COLLECTIONS.BANS);
  const bansById = new Map<string, Record<string, unknown>>();
  const emitMerged = () => callback(Array.from(bansById.entries()).map(([id, data]) => ({ id, ...data })));

  const rtdbUnsub = onValue(
    bansRef,
    (snap) => {
      const payload = snap.val();
      const rtdbIds = new Set<string>();
      if (payload && typeof payload === 'object') {
        Object.entries(payload).forEach(([id, data]) => {
          rtdbIds.add(id);
          bansById.set(id, data as Record<string, unknown>);
        });
      }
      for (const id of bansById.keys()) {
        if (!rtdbIds.has(id)) bansById.delete(id);
      }
      emitMerged();
    },
    (err) => {
      console.warn('RTDB bans subscription error:', err);
      emitMerged();
    },
  );

  const fb = getFirestoreFallbackDb();
  const fsUnsub = fb
    ? onSnapshot(
        fsCollection(fb, COLLECTIONS.BANS),
        (snap) => {
          snap.docs.forEach((d) => {
            if (!bansById.has(d.id)) bansById.set(d.id, d.data() as Record<string, unknown>);
          });
          emitMerged();
        },
        (err) => {
          console.warn('Firestore bans fallback subscription error:', err);
          emitMerged();
        },
      )
    : () => {};

  return () => {
    rtdbUnsub();
    fsUnsub();
  };
}

/** Subscribe to reports collection */
export function subscribeToReports(
  callback: (reports: Array<{ id: string } & Record<string, unknown>>) => void
): () => void {
  const fb = getFirestoreFallbackDb();
  if (!fb) {
    callback([]);
    return () => {};
  }
  return onSnapshot(
    fsCollection(fb, COLLECTIONS.REPORTS),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn('Firestore reports subscription error:', err);
      callback([]);
    },
  );
}
