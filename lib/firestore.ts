import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side only)
let firestore: Firestore | null = null;

function getFirestoreInstance(): Firestore {
  if (firestore) return firestore;

  // Check if Firebase Admin is already initialized
  if (getApps().length === 0) {
    // Initialize with service account or use default credentials
    // For production, use environment variables for credentials
    try {
      // Try to initialize with service account from environment
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({
          credential: cert(serviceAccount),
          projectId: 'pixel-place-823b1'
        });
      } else {
        // Use default credentials (for local development with Firebase emulator or gcloud auth)
        // For Firestore to work, you need to set GOOGLE_APPLICATION_CREDENTIALS or use Firebase emulator
        initializeApp({
          projectId: 'pixel-place-823b1'
        });
      }
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      // Fallback: initialize without credentials (will use default if available)
      initializeApp({
        projectId: 'pixel-place-823b1'
      });
    }
  }

  firestore = getFirestore();
  return firestore;
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
  ACCESSORIES_CATALOG: 'accessories_catalog'
};

// Helper functions for Firestore operations
export async function getDocument(collection: string, docId: string): Promise<any> {
  const db = getFirestoreInstance();
  const doc = await db.collection(collection).doc(docId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function getDocuments(collection: string, queryFn?: (ref: any) => any): Promise<any[]> {
  const db = getFirestoreInstance();
  let query: any = db.collection(collection);
  
  if (queryFn) {
    query = queryFn(query);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function setDocument(collection: string, docId: string, data: any): Promise<void> {
  const db = getFirestoreInstance();
  await db.collection(collection).doc(docId).set(data, { merge: true });
}

export async function addDocument(collection: string, data: any): Promise<string> {
  const db = getFirestoreInstance();
  const docRef = await db.collection(collection).add(data);
  return docRef.id;
}

export async function updateDocument(collection: string, docId: string, data: any): Promise<void> {
  const db = getFirestoreInstance();
  await db.collection(collection).doc(docId).update(data);
}

export async function deleteDocument(collection: string, docId: string): Promise<void> {
  const db = getFirestoreInstance();
  await db.collection(collection).doc(docId).delete();
}

export async function queryDocuments(
  collection: string,
  field: string,
  operator: '==' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any',
  value: any
): Promise<any[]> {
  const db = getFirestoreInstance();
  const snapshot = await db.collection(collection).where(field, operator, value).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { getFirestoreInstance };
