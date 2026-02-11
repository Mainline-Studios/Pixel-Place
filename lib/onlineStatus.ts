'use client';

import { useEffect, useState, useCallback } from 'react';
import { getFirestore, onSnapshot, doc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import { apiUrl } from './apiBaseUrl';

// Initialize Firebase app if not already initialized (client-side only)
let app: FirebaseApp | undefined = undefined;
let db: Firestore | null = null;

// Initialize Firebase safely - never throw errors
function initializeFirebase() {
  if (typeof window === 'undefined') return;
  
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Initialize Firestore if app is available
    if (app) {
      try {
        db = getFirestore(app);
      } catch (firestoreError) {
        console.warn('Firestore initialization failed, continuing without it:', firestoreError);
        db = null;
      }
    }
  } catch (error) {
    console.warn('Firebase initialization failed, continuing without it:', error);
    app = undefined;
    db = null;
  }
}

// Initialize immediately on module load (client-side only)
if (typeof window !== 'undefined') {
  initializeFirebase();
}

/**
 * Check if Firebase is connected and working
 * Tests by making a simple API call to verify backend connectivity
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    // Ensure Firebase is initialized
    if (!app || !db) {
      initializeFirebase();
      if (!app || !db) {
        return false;
      }
    }
    
    // Test connectivity by making a simple API call
    // Use a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    try {
      const response = await fetch('/api/presence?username=_connection_test', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      // If we get any response (even 400/404), the API is reachable
      // Only 500+ errors indicate server/Firebase issues
      return response.status < 500;
    } catch (error: any) {
      clearTimeout(timeoutId);
      // Network errors or timeouts mean we're offline
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return false;
      }
      // Other errors might mean the API is working but returned an error
      // We'll be conservative and assume offline
      return false;
    }
  } catch (error) {
    return false;
  }
}

export interface OnlineStatus {
  username: string;
  isOnline: boolean;
  lastSeen: number;
  currentGameId?: string;
}

/**
 * Hook to track online status for the current user
 */
export function useOnlineStatus(username: string | null) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!username || typeof window === 'undefined') {
      setIsOnline(false);
      return;
    }
    
    // Ensure Firebase is initialized
    try {
      if (!app || !db) {
        initializeFirebase();
      }
      if (!app || !db) {
        setIsOnline(false);
        return;
      }
    } catch (error) {
      console.warn('Firebase not available:', error);
      setIsOnline(false);
      return;
    }

    // Set user as online when component mounts
    let presenceRef: any = null;
    try {
      if (!db) {
        setIsOnline(false);
        return;
      }
      presenceRef = doc(db, 'presence', username.toLowerCase());
      setDoc(presenceRef, {
        username,
        is_online: true,
        last_seen: serverTimestamp(),
        updated_at: serverTimestamp(),
      }, { merge: true }).catch((error) => {
        console.warn('Error setting online status:', error);
      });
    } catch (error) {
      console.warn('Error setting up online status:', error);
      setIsOnline(false);
      return;
    }

    // Set up heartbeat to keep user online
    const heartbeatInterval = setInterval(() => {
      if (db && presenceRef) {
        setDoc(presenceRef, {
          is_online: true,
          last_seen: serverTimestamp(),
          updated_at: serverTimestamp(),
        }, { merge: true }).catch((error) => {
          console.warn('Error updating heartbeat:', error);
        });
      }
    }, 30000); // Every 30 seconds

    // Set user as offline when component unmounts
    const handleBeforeUnload = () => {
      if (db && presenceRef) {
        setDoc(presenceRef, {
          is_online: false,
          last_seen: serverTimestamp(),
          updated_at: serverTimestamp(),
        }, { merge: true }).catch(() => {
          // Ignore errors on page unload
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    setIsOnline(true);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Set offline on cleanup
      if (db && presenceRef) {
        setDoc(presenceRef, {
          is_online: false,
          last_seen: serverTimestamp(),
          updated_at: serverTimestamp(),
        }, { merge: true }).catch((error) => {
          console.warn('Error setting offline status:', error);
        });
      }
    };
  }, [username]);

  return isOnline;
}

/**
 * Hook to get online status for a specific user
 */
export function useUserOnlineStatus(username: string | null): OnlineStatus | null {
  const [status, setStatus] = useState<OnlineStatus | null>(null);

  useEffect(() => {
    if (!username || typeof window === 'undefined') {
      setStatus(null);
      return;
    }

    // Ensure Firebase is initialized
    if (!app || !db) {
      initializeFirebase();
      if (!app || !db) {
        setStatus({ username, isOnline: false, lastSeen: 0 });
        return;
      }
    }

    let unsubscribe: (() => void) | null = null;
    try {
      const presenceRef = doc(db, 'presence', username.toLowerCase());
      unsubscribe = onSnapshot(presenceRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setStatus({
            username: data.username || username,
            isOnline: data.is_online === true,
            lastSeen: data.last_seen?.toMillis?.() || Date.now(),
            currentGameId: data.current_session_id || undefined,
          });
        } else {
          setStatus({
            username,
            isOnline: false,
            lastSeen: 0,
          });
        }
      }, (error) => {
        console.warn('Error listening to presence:', error);
        setStatus({
          username,
          isOnline: false,
          lastSeen: 0,
        });
      });
    } catch (error) {
      console.warn('Error setting up presence listener:', error);
      setStatus({
        username,
        isOnline: false,
        lastSeen: 0,
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [username]);

  return status;
}

/**
 * Hook to get online status for multiple users (friends list)
 */
export function useFriendsOnlineStatus(usernames: string[]): Record<string, OnlineStatus> {
  const [statuses, setStatuses] = useState<Record<string, OnlineStatus>>({});

  useEffect(() => {
    if (usernames.length === 0 || typeof window === 'undefined') {
      setStatuses({});
      return;
    }

    // Ensure Firebase is initialized
    if (!app || !db) {
      initializeFirebase();
      if (!app || !db) {
        // Set all users as offline if Firebase not available
        const offlineStatuses: Record<string, OnlineStatus> = {};
        usernames.forEach(username => {
          offlineStatuses[username] = { username, isOnline: false, lastSeen: 0 };
        });
        setStatuses(offlineStatuses);
        return;
      }
    }

    const unsubscribes: (() => void)[] = [];
    
    usernames.forEach((username) => {
      try {
        const presenceRef = doc(db, 'presence', username.toLowerCase());
        const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
          setStatuses((prev) => {
            const newStatuses = { ...prev };
            if (snapshot.exists()) {
              const data = snapshot.data();
              newStatuses[username] = {
                username: data.username || username,
                isOnline: data.is_online === true,
                lastSeen: data.last_seen?.toMillis?.() || Date.now(),
                currentGameId: data.current_session_id || undefined,
              };
            } else {
              newStatuses[username] = {
                username,
                isOnline: false,
                lastSeen: 0,
              };
            }
            return newStatuses;
          });
        }, (error) => {
          console.warn(`Error listening to presence for ${username}:`, error);
          setStatuses((prev) => ({
            ...prev,
            [username]: {
              username,
              isOnline: false,
              lastSeen: 0,
            },
          }));
        });
        unsubscribes.push(unsubscribe);
      } catch (userError) {
        console.warn(`Error setting up listener for ${username}:`, userError);
        setStatuses((prev) => ({
          ...prev,
          [username]: {
            username,
            isOnline: false,
            lastSeen: 0,
          },
        }));
      }
    });

    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    };
  }, [usernames.join(',')]);

  return statuses;
}

/**
 * Update user's current game session
 */
export async function updateCurrentGame(username: string, gameId: string | null) {
  if (!db || !username || typeof window === 'undefined') return;

  try {
    const presenceRef = doc(db, 'presence', username.toLowerCase());
    await setDoc(presenceRef, {
      current_session_id: gameId,
      updated_at: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating current game:', error);
  }
}
