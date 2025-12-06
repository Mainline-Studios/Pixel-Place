// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined") {
  // Only initialize on client side
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Analytics only works in browser
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
  
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Server-side: create minimal app instance
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

export { app, analytics, auth, db };

