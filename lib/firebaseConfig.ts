/**
 * Firebase Web SDK config for the Pixel Place web app.
 * Use NEXT_PUBLIC_FIREBASE_* at build time when set; otherwise the public fallback below
 * (same values as Firebase Console → Project settings → Pixel Place Web).
 */
import type { FirebaseOptions } from 'firebase/app';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';

/** Public web client config — not a secret; restrict by domain in Google Cloud Console. */
const PIXEL_PLACE_WEB_FALLBACK: FirebaseOptions = {
  apiKey: 'AIzaSyCccrF6i4LBBjuFU8KH3WOQeJjXdc0NlfY',
  authDomain: 'pixel-place-823b1.firebaseapp.com',
  projectId: 'pixel-place-823b1',
  databaseURL: 'https://pixel-place-823b1-default-rtdb.firebaseio.com',
  storageBucket: 'pixel-place-823b1.firebasestorage.app',
  messagingSenderId: '78021257708',
  appId: '1:78021257708:web:19fabf7a291e1baba3f8c9',
  measurementId: 'G-QLXJJKGQW4',
};

function pick(envValue: string | undefined, fallback: string): string {
  const v = typeof envValue === 'string' ? envValue.trim() : '';
  return v || fallback;
}

export const firebaseConfig: FirebaseOptions = {
  apiKey: pick(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, PIXEL_PLACE_WEB_FALLBACK.apiKey!),
  authDomain: pick(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, PIXEL_PLACE_WEB_FALLBACK.authDomain!),
  projectId: pick(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, PIXEL_PLACE_WEB_FALLBACK.projectId!),
  databaseURL: pick(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, PIXEL_PLACE_WEB_FALLBACK.databaseURL!),
  storageBucket: pick(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    PIXEL_PLACE_WEB_FALLBACK.storageBucket!,
  ),
  messagingSenderId: pick(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    PIXEL_PLACE_WEB_FALLBACK.messagingSenderId!,
  ),
  appId: pick(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, PIXEL_PLACE_WEB_FALLBACK.appId!),
};

const measurementId = pick(
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  (PIXEL_PLACE_WEB_FALLBACK as FirebaseOptions & { measurementId?: string }).measurementId || '',
);
if (measurementId) {
  (firebaseConfig as FirebaseOptions & { measurementId?: string }).measurementId = measurementId;
}

if (!firebaseConfig.databaseURL && firebaseConfig.projectId) {
  firebaseConfig.databaseURL = `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`;
}

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.authDomain,
  );
}

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
