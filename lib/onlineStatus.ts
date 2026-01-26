'use client';

import { useEffect, useState, useCallback } from 'react';
import { getFirestore, onSnapshot, doc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase app if not already initialized
let app: FirebaseApp;
if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

const db: Firestore | null = typeof window !== 'undefined' && app ? getFirestore(app) : null;

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
    if (!username || !db || typeof window === 'undefined') return;

    // Set user as online when component mounts
    const presenceRef = doc(db, 'presence', username.toLowerCase());
    setDoc(presenceRef, {
      username,
      is_online: true,
      last_seen: serverTimestamp(),
      updated_at: serverTimestamp(),
    }, { merge: true }).catch((error) => {
      console.error('Error setting online status:', error);
    });

    // Set up heartbeat to keep user online
    const heartbeatInterval = setInterval(() => {
      if (db) {
        setDoc(presenceRef, {
          is_online: true,
          last_seen: serverTimestamp(),
          updated_at: serverTimestamp(),
        }, { merge: true }).catch((error) => {
          console.error('Error updating heartbeat:', error);
        });
      }
    }, 30000); // Every 30 seconds

    // Set user as offline when component unmounts
    const handleBeforeUnload = () => {
      if (db) {
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
      if (db) {
        setDoc(presenceRef, {
          is_online: false,
          last_seen: serverTimestamp(),
          updated_at: serverTimestamp(),
        }, { merge: true }).catch((error) => {
          console.error('Error setting offline status:', error);
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
    if (!username || !db || typeof window === 'undefined') {
      setStatus(null);
      return;
    }

    const presenceRef = doc(db, 'presence', username.toLowerCase());
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
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
      console.error('Error listening to presence:', error);
      setStatus({
        username,
        isOnline: false,
        lastSeen: 0,
      });
    });

    return () => unsubscribe();
  }, [username]);

  return status;
}

/**
 * Hook to get online status for multiple users (friends list)
 */
export function useFriendsOnlineStatus(usernames: string[]): Record<string, OnlineStatus> {
  const [statuses, setStatuses] = useState<Record<string, OnlineStatus>>({});

  useEffect(() => {
    if (!db || usernames.length === 0 || typeof window === 'undefined') {
      setStatuses({});
      return;
    }

    const unsubscribes: (() => void)[] = [];

    usernames.forEach((username) => {
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
        console.error(`Error listening to presence for ${username}:`, error);
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
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
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
