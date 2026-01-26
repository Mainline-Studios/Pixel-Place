import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side only)
let firestore: Firestore | null = null;

function getFirestoreInstance(): Firestore | null {
  try {
    if (firestore) {
      return firestore;
    }

    // Check if Firebase Admin is already initialized
    if (getApps().length === 0) {
      // Initialize with service account or use default credentials
      try {
        // Try to initialize with service account from environment
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
              credential: cert(serviceAccount),
              projectId: 'pixel-place-823b1'
            });
          } catch (parseError) {
            console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT, trying without credentials');
            initializeApp({
              projectId: 'pixel-place-823b1'
            });
          }
        } else {
          // Use default credentials (for local development with Firebase emulator or gcloud auth)
          initializeApp({
            projectId: 'pixel-place-823b1'
          });
        }
      } catch (error: any) {
        console.warn('Firebase Admin initialization error (continuing without it):', error?.message || error);
        return null; // Return null if initialization fails
      }
    }

    try {
      firestore = getFirestore();
      return firestore;
    } catch (error: any) {
      console.warn('Error getting Firestore instance:', error?.message || error);
      return null;
    }
  } catch (error: any) {
    console.warn('Unexpected error in getFirestoreInstance:', error?.message || error);
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
  GAME_SESSIONS: 'game_sessions' // Active multiplayer game sessions
};

// Helper functions for Firestore operations
export async function getDocument(collection: string, docId: string): Promise<any> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return null;
    }
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error: any) {
    console.warn('Error getting document:', error?.message || error);
    return null;
  }
}

export async function getDocuments(collection: string, queryFn?: (ref: any) => any): Promise<any[]> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return [];
    }
    let query: any = db.collection(collection);
    
    if (queryFn) {
      query = queryFn(query);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn('Error getting documents:', error?.message || error);
    return [];
  }
}

export async function setDocument(collection: string, docId: string, data: any): Promise<void> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return; // Silently fail if Firestore is not available
    }
    await db.collection(collection).doc(docId).set(data, { merge: true });
  } catch (error: any) {
    console.warn('Error setting document:', error?.message || error);
    // Don't throw - allow the app to continue without Firestore
  }
}

export async function addDocument(collection: string, data: any): Promise<string> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      throw new Error('Firestore not available');
    }
    const docRef = await db.collection(collection).add(data);
    return docRef.id;
  } catch (error: any) {
    console.warn('Error adding document:', error?.message || error);
    throw error;
  }
}

export async function updateDocument(collection: string, docId: string, data: any): Promise<void> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return; // Silently fail if Firestore is not available
    }
    await db.collection(collection).doc(docId).update(data);
  } catch (error: any) {
    console.warn('Error updating document:', error?.message || error);
  }
}

export async function deleteDocument(collection: string, docId: string): Promise<void> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return; // Silently fail if Firestore is not available
    }
    await db.collection(collection).doc(docId).delete();
  } catch (error: any) {
    console.warn('Error deleting document:', error?.message || error);
  }
}

export async function queryDocuments(
  collection: string,
  field: string,
  operator: '==' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any',
  value: any
): Promise<any[]> {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return [];
    }
    const snapshot = await db.collection(collection).where(field, operator, value).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn('Error querying documents:', error?.message || error);
    return [];
  }
}

export { getFirestoreInstance };
