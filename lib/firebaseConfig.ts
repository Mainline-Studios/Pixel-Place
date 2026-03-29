/**
 * Firebase Web SDK config — values MUST come from environment at build time.
 * Never commit real API keys; copy keys from Firebase Console → Project settings → Your apps.
 *
 * Required for client Firestore/Auth: NEXT_PUBLIC_FIREBASE_* (see .env.example).
 */
import type { FirebaseOptions } from 'firebase/app';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';

function readPublicEnv(name: string): string {
  if (typeof process === 'undefined') return '';
  const v = process.env[name];
  return typeof v === 'string' ? v.trim() : '';
}

export const firebaseConfig: FirebaseOptions = {
  apiKey: readPublicEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: readPublicEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: readPublicEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: readPublicEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readPublicEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readPublicEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const measurementId = readPublicEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID');
if (measurementId) {
  (firebaseConfig as FirebaseOptions & { measurementId?: string }).measurementId = measurementId;
}

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.authDomain,
  );
}

/**
 * Single Firebase app for browser SDK. Returns null if env is incomplete (no keys in repo).
 */
export function getOrInitFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseClientConfigured()) return null;
  try {
    if (getApps().length > 0) return getApps()[0]!;
    return initializeApp(firebaseConfig);
  } catch (e) {
    console.warn('[Firebase] initializeApp failed:', e);
    return null;
  }
}

// Pixel Place Pay: orders + fulfillment run in Cloud Functions; optional PIXEL_PAY_INSTRUCTIONS in functions/.env.
