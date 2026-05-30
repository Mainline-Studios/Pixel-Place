'use client';

import { getAuth, Auth, GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { getOrInitFirebaseApp, isFirebaseClientConfigured } from './firebaseConfig';

/** Null when NEXT_PUBLIC_FIREBASE_* was not set at `npm run build` time. */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  const app = getOrInitFirebaseApp();
  return app ? getAuth(app) : null;
}

/** @deprecated prefer getFirebaseAuth() */
export const auth: Auth | null = typeof window !== 'undefined' ? getFirebaseAuth() : null;

export { isFirebaseClientConfigured };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize reCAPTCHA verifier
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function getRecaptchaVerifier(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be initialized in the browser');
  }
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* at build time (.env.example).');
  }

  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will allow sign-in
      },
      'expired-callback': () => {
        // Response expired - ask user to solve reCAPTCHA again
        console.warn('reCAPTCHA expired');
      }
    });
  }

  return recaptchaVerifier;
}

export function clearRecaptchaVerifier() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}

export { getOrInitFirebaseApp as app } from './firebaseConfig';
