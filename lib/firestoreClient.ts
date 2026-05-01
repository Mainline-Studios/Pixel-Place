'use client';

/**
 * Client-side Firestore for real-time sync.
 * Subscribes to Firestore so changes (from API, Firebase Console, or admin edits)
 * flow instantly to the app. Writes still go through API for validation.
 *
 * For real-time sync to work, Firestore rules must allow read on:
 * users, games, bans, reports, ban_appeals, game_submissions.
 * Example rule: allow read: if true; (or restrict by auth if needed)
 */

import { getFirestore, onSnapshot, collection, doc } from 'firebase/firestore';
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

let db: ReturnType<typeof getFirestore> | null = null;

function getDb() {
  if (typeof window === 'undefined') return null;
  try {
    if (!db) {
      const app = getOrInitFirebaseApp();
      if (!app) return null;
      db = getFirestore(app);
    }
    return db;
  } catch (e) {
    console.warn('Firestore client init failed:', e);
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
    callback(null);
    return () => {};
  }
  // Users are stored with doc id = username.toLowerCase() per API
  const docRef = doc(database, COLLECTIONS.USERS, username.toLowerCase());
  const unsub = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(userFromDoc({ id: snap.id, ...snap.data() }));
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Firestore user subscription error:', err);
      callback(null);
    }
  );
  return () => unsub();
}

/** Subscribe to all users. Returns unsubscribe function. */
export function subscribeToUsers(callback: (users: User[]) => void): () => void {
  const database = getDb();
  if (!database) {
    callback([]);
    return () => {};
  }
  const ref = collection(database, COLLECTIONS.USERS);
  const unsub = onSnapshot(
    ref,
    (snap) => {
      const users = snap.docs.map((d) => userFromDoc({ id: d.id, ...d.data() }));
      callback(users);
    },
    (err) => {
      console.warn('Firestore users subscription error:', err);
      callback([]);
    }
  );
  return () => unsub();
}

/** Convert Firestore game doc to UserMadeGame shape */
function gameFromDoc(d: { id: string } & Record<string, unknown>): { id: string; title: string; desc: string; owner: string; ts: number; sceneData: { objects: unknown[] }; publishedBy?: string; gameType?: string; fileContent?: string; fileType?: string; gameCode?: string } {
  const doc = d as Record<string, unknown>;
  let sceneData = doc.scene_data;
  if (typeof sceneData === 'string') {
    try { sceneData = JSON.parse(sceneData as string); } catch { sceneData = { objects: [] }; }
  }
  return {
    id: (doc.id as string) || '',
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
  const database = getDb();
  if (!database) {
    callback([]);
    return () => {};
  }
  const ref = collection(database, COLLECTIONS.GAMES);
  const unsub = onSnapshot(
    ref,
    (snap) => {
      const games = snap.docs.map((d) => gameFromDoc({ id: d.id, ...d.data() }));
      callback(games);
    },
    (err) => {
      console.warn('Firestore games subscription error:', err);
      callback([]);
    }
  );
  return () => unsub();
}

/** Subscribe to bans collection */
export function subscribeToBans(
  callback: (bans: Array<{ id: string } & Record<string, unknown>>) => void
): () => void {
  const database = getDb();
  if (!database) {
    callback([]);
    return () => {};
  }
  const ref = collection(database, COLLECTIONS.BANS);
  const unsub = onSnapshot(
    ref,
    (snap) => {
      const bans = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(bans);
    },
    (err) => {
      console.warn('Firestore bans subscription error:', err);
      callback([]);
    }
  );
  return () => unsub();
}

/** Subscribe to reports collection */
export function subscribeToReports(
  callback: (reports: Array<{ id: string } & Record<string, unknown>>) => void
): () => void {
  const database = getDb();
  if (!database) {
    callback([]);
    return () => {};
  }
  const ref = collection(database, COLLECTIONS.REPORTS);
  const unsub = onSnapshot(
    ref,
    (snap) => {
      const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(reports);
    },
    (err) => {
      console.warn('Firestore reports subscription error:', err);
      callback([]);
    }
  );
  return () => unsub();
}
