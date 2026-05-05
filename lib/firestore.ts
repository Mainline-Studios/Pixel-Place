import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getDatabase, Database } from 'firebase-admin/database';

let firestoreDb: Firestore | null = null;
let realtimeDb: Database | null = null;

type WhereOperator = '==' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any';

interface QueryState {
  where: Array<{ field: string; operator: WhereOperator; value: any }>;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}

function toDatabaseUrl(projectId: string): string {
  return `https://${projectId}-default-rtdb.firebaseio.com`;
}

function ensureAdminApp(): boolean {
  try {
    if (getApps().length > 0) return true;
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'pixel-place-823b1';
    const databaseURL = process.env.FIREBASE_DATABASE_URL || toDatabaseUrl(projectId);
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({ credential: cert(serviceAccount), projectId, databaseURL });
        return true;
      } catch {
        console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT, trying without credentials');
      }
    }
    initializeApp({ projectId, databaseURL });
    return true;
  } catch (error: any) {
    console.warn('Firebase Admin initialization error (continuing without it):', error?.message || error);
    return false;
  }
}

function getFirestoreDbInstance(): Firestore | null {
  try {
    if (firestoreDb) return firestoreDb;
    if (!ensureAdminApp()) return null;
    firestoreDb = getFirestore();
    return firestoreDb;
  } catch (error: any) {
    console.warn('Error getting Firestore instance:', error?.message || error);
    return null;
  }
}

function getRealtimeDbInstance(): Database | null {
  try {
    if (realtimeDb) return realtimeDb;
    if (!ensureAdminApp()) return null;
    realtimeDb = getDatabase();
    return realtimeDb;
  } catch (error: any) {
    console.warn('Error getting Realtime Database instance:', error?.message || error);
    return null;
  }
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PUBLISHED_GAMES: 'published_games',
  DRAFTS: 'drafts',
  SCENES: 'scenes',
  BANS: 'bans',
  BAN_APPEALS: 'ban_appeals',
  APPEAL_MESSAGES: 'appeal_messages',
  REPORTS: 'reports',
  FRIEND_REQUESTS: 'friend_requests',
  MESSAGES: 'messages',
  TAB_CONTENT: 'tab_content',
  GAME_SERVERS: 'game_servers',
  SERVER_PLANS: 'server_plans',
  PREBUILT_GAMES: 'prebuilt_games',
  GAMES: 'games',
  SKINS_CATALOG: 'skins_catalog',
  ACCESSORIES_CATALOG: 'accessories_catalog',
  GAME_SUBMISSIONS: 'game_submissions',
  USER_MADE_GAMES: 'user_made_games',
  GYM_PUMP_SESSIONS: 'gym_pump_sessions',
  GYM_PUMP_PROGRESS: 'gym_pump_progress',
  PRESENCE: 'presence', // Online status tracking
  GAME_SESSIONS: 'game_sessions', // Active multiplayer game sessions
  ACHIEVEMENTS: 'achievements', // User achievements
  ACHIEVEMENTS_MASTER: 'achievements_master', // Master list of all achievements
  LEADERBOARDS: 'leaderboards', // Game leaderboards
  CHAT_MESSAGES: 'chat_messages', // Chat messages
  USER_STATS: 'user_stats', // User statistics
  GAME_STATS: 'game_stats', // Game statistics
  GLOBAL_STATS: 'global_stats', // Global platform statistics
  TOURNAMENTS: 'tournaments', // Tournaments and competitions
  USER_CHALLENGES: 'user_challenges', // User challenge progress
  CHALLENGES_MASTER: 'challenges_master', // Master list of challenges
  ACTIVITY_FEED: 'activity_feed', // User activity feed
  NOTIFICATIONS: 'notifications', // User notifications
  USER_SAFETY: 'user_safety', // User safety points and break tracking
  USER_DEVICES: 'user_devices', // per-user list of devices (deviceId + label)
  DEVICE_USERS: 'device_users', // per-device list of usernames that used it
  HARDWARE_BANS: 'hardware_bans' // banned deviceIds (reversible)
};

const RTDB_COLLECTIONS = new Set<string>([
  COLLECTIONS.USERS,
  COLLECTIONS.BANS,
  COLLECTIONS.HARDWARE_BANS,
  COLLECTIONS.SKINS_CATALOG,
]);

function isRtdbCollection(collection: string): boolean {
  return RTDB_COLLECTIONS.has(collection);
}

function collectionValuesToArray(payload: any): Array<{ id: string } & Record<string, any>> {
  if (!payload || typeof payload !== 'object') return [];
  return Object.entries(payload).map(([id, value]) => ({ id, ...(value as Record<string, any>) }));
}

function applyWhere(rows: Array<{ id: string } & Record<string, any>>, where: QueryState['where']) {
  return rows.filter((row) =>
    where.every(({ field, operator, value }) => {
      const current = row[field];
      switch (operator) {
        case '==':
          return current === value;
        case '<':
          return current < value;
        case '<=':
          return current <= value;
        case '>':
          return current > value;
        case '>=':
          return current >= value;
        case 'array-contains':
          return Array.isArray(current) && current.includes(value);
        case 'in':
          return Array.isArray(value) && value.includes(current);
        case 'array-contains-any':
          return Array.isArray(current) && Array.isArray(value) && value.some((v) => current.includes(v));
        default:
          return false;
      }
    }),
  );
}

function applyOrderAndLimit(rows: Array<{ id: string } & Record<string, any>>, state: QueryState) {
  const sorted = [...rows];
  if (state.orderBy) {
    const { field, direction } = state.orderBy;
    sorted.sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av > bv ? 1 : -1;
      return direction === 'desc' ? -cmp : cmp;
    });
  }
  if (typeof state.limit === 'number' && state.limit >= 0) {
    return sorted.slice(0, state.limit);
  }
  return sorted;
}

async function resolveCollection(collection: string, state?: QueryState): Promise<Array<{ id: string } & Record<string, any>>> {
  const db = getRealtimeDbInstance();
  if (!db) return [];
  const snap = await db.ref(collection).get();
  const allDocs = collectionValuesToArray(snap.val());
  const byId = new Map<string, Record<string, any>>();
  allDocs.forEach((doc) => byId.set(doc.id, doc));
  const fs = getFirestoreDbInstance();
  if (fs) {
    try {
      const fsSnap = await fs.collection(collection).get();
      fsSnap.docs.forEach((doc: any) => {
        if (!byId.has(doc.id)) byId.set(doc.id, { id: doc.id, ...(doc.data() || {}) });
      });
    } catch (error: any) {
      console.warn(`Firestore fallback collection read failed for ${collection}:`, error?.message || error);
    }
  }
  const mergedDocs = Array.from(byId.values()) as Array<{ id: string } & Record<string, any>>;
  if (!state) return mergedDocs;
  return applyOrderAndLimit(applyWhere(mergedDocs, state.where), state);
}

function wrapDoc(id: string, data: Record<string, any>) {
  return {
    id,
    data: () => data,
    exists: true,
    ref: { id },
  };
}

function createCollectionRef(collection: string, state?: QueryState) {
  const qState: QueryState = state || { where: [] };
  return {
    id: collection,
    doc(docId: string) {
      return createDocumentRef(collection, docId);
    },
    async add(data: any) {
      const db = getRealtimeDbInstance();
      if (!db) throw new Error('Realtime Database not available');
      const pushed = db.ref(collection).push();
      await pushed.set(data);
      return { id: String(pushed.key || ''), key: String(pushed.key || '') };
    },
    where(field: string, operator: WhereOperator, value: any) {
      qState.where.push({ field, operator, value });
      return createCollectionRef(collection, qState);
    },
    orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
      qState.orderBy = { field, direction };
      return createCollectionRef(collection, qState);
    },
    limit(n: number) {
      qState.limit = Number(n);
      return createCollectionRef(collection, qState);
    },
    async get() {
      const docs = await resolveCollection(collection, qState);
      return {
        docs: docs.map((d) => wrapDoc(d.id, d)),
        empty: docs.length === 0,
        size: docs.length,
      };
    },
    __state: qState,
  };
}

function createDocumentRef(collection: string, docId: string) {
  return {
    id: docId,
    async get() {
      const db = getRealtimeDbInstance();
      if (!db) return { exists: false, id: docId, data: () => undefined };
      const snap = await db.ref(`${collection}/${docId}`).get();
      if (!snap.exists()) {
        const fs = getFirestoreDbInstance();
        if (fs) {
          try {
            const fsDoc = await fs.collection(collection).doc(docId).get();
            if (fsDoc.exists) {
              return { exists: true, id: docId, data: () => fsDoc.data() || {}, ref: { id: docId } };
            }
          } catch (error: any) {
            console.warn(`Firestore fallback doc read failed for ${collection}/${docId}:`, error?.message || error);
          }
        }
        return { exists: false, id: docId, data: () => undefined };
      }
      const val = snap.val();
      const docData = val && typeof val === 'object' ? (val as Record<string, any>) : { value: val };
      return { exists: true, id: docId, data: () => docData, ref: { id: docId } };
    },
    async set(data: any, options?: { merge?: boolean }) {
      const db = getRealtimeDbInstance();
      if (!db) return;
      if (options?.merge) {
        await db.ref(`${collection}/${docId}`).update(data);
      } else {
        await db.ref(`${collection}/${docId}`).set(data);
      }
    },
    async update(data: any) {
      const db = getRealtimeDbInstance();
      if (!db) return;
      await db.ref(`${collection}/${docId}`).update(data);
    },
    async delete() {
      const db = getRealtimeDbInstance();
      if (!db) return;
      await db.ref(`${collection}/${docId}`).remove();
      const fs = getFirestoreDbInstance();
      if (fs) {
        try {
          const fsRef = fs.collection(collection).doc(docId);
          const fsSnap = await fsRef.get();
          if (fsSnap.exists) await fsRef.delete();
        } catch (e: any) {
          console.warn(`Firestore fallback delete failed for ${collection}/${docId}:`, e?.message || e);
        }
      }
    },
  };
}

function createBatch() {
  const writes: Array<() => Promise<void>> = [];
  return {
    set(docRef: any, data: any, options?: { merge?: boolean }) {
      writes.push(() => docRef.set(data, options));
      return this;
    },
    update(docRef: any, data: any) {
      writes.push(() => docRef.update(data));
      return this;
    },
    delete(docRef: any) {
      writes.push(() => docRef.delete());
      return this;
    },
    async commit() {
      for (const write of writes) {
        await write();
      }
    },
  };
}

function getFirestoreInstance() {
  const fs = getFirestoreDbInstance();
  const rtdb = getRealtimeDbInstance();
  if (!fs && !rtdb) return null;
  return {
    collection(name: string) {
      if (isRtdbCollection(name)) return createCollectionRef(name);
      if (!fs) throw new Error('Firestore unavailable');
      return fs.collection(name);
    },
    batch() {
      return createBatch();
    },
    runTransaction<T>(fn: any) {
      if (!fs) throw new Error('Firestore unavailable');
      return fs.runTransaction(fn);
    },
    ref(path: string) {
      if (!rtdb) throw new Error('Realtime Database unavailable');
      return rtdb.ref(path);
    },
  };
}

// Helper functions for Realtime Database operations
export async function getDocument(collection: string, docId: string): Promise<any> {
  try {
    if (isRtdbCollection(collection)) {
      const db = getRealtimeDbInstance();
      if (!db) return null;
      const snap = await db.ref(`${collection}/${docId}`).get();
      if (!snap.exists()) return null;
      const value = snap.val();
      if (!value || typeof value !== 'object') return { id: docId, value };
      return { id: docId, ...(value as Record<string, any>) };
    }
    const fs = getFirestoreDbInstance();
    if (!fs) return null;
    const doc = await fs.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error: any) {
    console.warn('Error getting document:', error?.message || error);
    return null;
  }
}

export async function getDocuments(collection: string, queryFn?: (ref: any) => any): Promise<any[]> {
  try {
    if (isRtdbCollection(collection)) {
      if (!getRealtimeDbInstance()) return [];
      if (!queryFn) return resolveCollection(collection);
      const configured = queryFn(createCollectionRef(collection)) || createCollectionRef(collection);
      const state: QueryState = configured.__state || { where: [] };
      return resolveCollection(collection, state);
    }
    const fs = getFirestoreDbInstance();
    if (!fs) return [];
    let query: any = fs.collection(collection);
    if (queryFn) query = queryFn(query);
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn('Error getting documents:', error?.message || error);
    return [];
  }
}

export async function setDocument(collection: string, docId: string, data: any): Promise<void> {
  try {
    if (isRtdbCollection(collection)) {
      const db = getRealtimeDbInstance();
      if (!db) return;
      await db.ref(`${collection}/${docId}`).update(data);
      return;
    }
    const fs = getFirestoreDbInstance();
    if (!fs) return;
    await fs.collection(collection).doc(docId).set(data, { merge: true });
  } catch (error: any) {
    console.warn('Error setting document:', error?.message || error);
    // Don't throw - allow the app to continue without Firestore
  }
}

export async function addDocument(collection: string, data: any): Promise<string> {
  try {
    if (isRtdbCollection(collection)) {
      const db = getRealtimeDbInstance();
      if (!db) throw new Error('Realtime Database not available');
      const docRef = db.ref(collection).push();
      await docRef.set(data);
      return String(docRef.key || '');
    }
    const fs = getFirestoreDbInstance();
    if (!fs) throw new Error('Firestore not available');
    const docRef = await fs.collection(collection).add(data);
    return docRef.id;
  } catch (error: any) {
    console.warn('Error adding document:', error?.message || error);
    throw error;
  }
}

export async function updateDocument(collection: string, docId: string, data: any): Promise<void> {
  try {
    if (isRtdbCollection(collection)) {
      const db = getRealtimeDbInstance();
      if (!db) return;
      await db.ref(`${collection}/${docId}`).update(data);
      return;
    }
    const fs = getFirestoreDbInstance();
    if (!fs) return;
    await fs.collection(collection).doc(docId).update(data);
  } catch (error: any) {
    console.warn('Error updating document:', error?.message || error);
  }
}

export async function deleteDocument(collection: string, docId: string): Promise<void> {
  try {
    if (isRtdbCollection(collection)) {
      const db = getRealtimeDbInstance();
      if (!db) return;
      await db.ref(`${collection}/${docId}`).remove();
      const fs = getFirestoreDbInstance();
      if (fs) {
        try {
          const fsRef = fs.collection(collection).doc(docId);
          const fsSnap = await fsRef.get();
          if (fsSnap.exists) await fsRef.delete();
        } catch (e: any) {
          console.warn(`Firestore fallback delete failed for ${collection}/${docId}:`, e?.message || e);
        }
      }
      return;
    }
    const fs = getFirestoreDbInstance();
    if (!fs) return;
    await fs.collection(collection).doc(docId).delete();
  } catch (error: any) {
    console.warn('Error deleting document:', error?.message || error);
  }
}

export async function queryDocuments(
  collection: string,
  field: string,
  operator: WhereOperator,
  value: any
): Promise<any[]> {
  try {
    if (isRtdbCollection(collection)) {
      const db = getRealtimeDbInstance();
      if (!db) return [];
      const snap = await db.ref(collection).get();
      const allDocs = collectionValuesToArray(snap.val());
      return applyWhere(allDocs, [{ field, operator, value }]);
    }
    const fs = getFirestoreDbInstance();
    if (!fs) return [];
    const snapshot = await fs.collection(collection).where(field, operator as any, value).get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn('Error querying documents:', error?.message || error);
    return [];
  }
}

export { getFirestoreInstance };
