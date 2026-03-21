'use client';

import { getAuth, Auth, GoogleAuthProvider, RecaptchaVerifier, signInWithCredential } from 'firebase/auth';
import { getOrInitFirebaseApp } from './firebaseConfig';

const app = typeof window !== 'undefined' ? getOrInitFirebaseApp() : null;

/** Null when NEXT_PUBLIC_FIREBASE_* is not set at build time. */
export const auth: Auth | null = app ? getAuth(app) : null;

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
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* at build time (.env.example).');
  }

  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
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

export { app };
