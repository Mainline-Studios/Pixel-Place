'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Ban } from '@/types';
import { initializeStorage, getUsers, saveUsers, ADMIN_ACCOUNTS_LIST, isUserBanned, getBanForUser, getBannedUsersSync } from '@/lib/storage';
import { subscribeToUser } from '@/lib/firestoreClient';
import { apiUrl } from '@/lib/apiBaseUrl'; import { containsEmoji } from '@/lib/utils';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; ban?: any }>;
  loginWithGoogle: (googleUser: User) => Promise<void>;
  createAccount: (username: string, password: string, gender: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const getInitialUser = async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const savedUsername = sessionStorage.getItem('pixelPlaceLoggedInUser');
      if (!savedUsername) return null;

      // Fast path: use cached users so restore is instant (~0ms)
      const localUsers = getUsersLocal();
      let found = localUsers.find(u => (u.username || '').toLowerCase() === (savedUsername || '').toLowerCase());
      if (found) {
        found = { ...found };
        if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
        if (!found.ownedAccessories) found.ownedAccessories = [];
        if (!found.equippedAccessories) found.equippedAccessories = {};
        if (!found.ownedFaces) found.ownedFaces = [];
        if (typeof found.safetyPoints !== 'number') found.safetyPoints = 0;

        if (found.username === '6767kid') {
          found.coins = 4e471;
          if ((found.safetyPoints || 0) < 20000) found.safetyPoints = 20000;
        }
        if (found.username && (found.username || '').toLowerCase() === 'daniello1') {
          found.coins = 5.534e200;
        }

        // Background: refresh from API and safety (don't block)
        getUsers().then(users => {
          const fresh = users.find(u => (u.username || '').toLowerCase() === (savedUsername || '').toLowerCase());
          if (fresh) setUser(prev => prev ? { ...prev, ...fresh, safetyPoints: prev.safetyPoints ?? fresh.safetyPoints ?? 0 } : null);
        }).catch(() => {});
        fetch(apiUrl(`/api/safety?username=${encodeURIComponent(found.username)}`))
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data && typeof data.safetyPoints === 'number') setUser(prev => prev ? { ...prev, safetyPoints: data.safetyPoints } : null);
          })
          .catch(() => {});
        if (found.username === '6767kid' && (found.safetyPoints || 0) < 20000) {
          fetch(apiUrl('/api/safety'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: '6767kid', action: 'updateSafetyPoints', safetyPoints: 20000 })
          }).catch(() => {});
        }

        return found;
      }

      // No cache: wait for API with short timeout (max ~500ms)
      const users = await Promise.race([
        getUsers(),
        new Promise<User[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
      ]).catch(() => getUsersLocal());

      found = users.find(u => (u.username || '').toLowerCase() === (savedUsername || '').toLowerCase());
      if (!found) return null;

      found = { ...found };
      if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
      if (!found.ownedAccessories) found.ownedAccessories = [];
      if (!found.equippedAccessories) found.equippedAccessories = {};
      if (!found.ownedFaces) found.ownedFaces = [];
      if (typeof found.safetyPoints !== 'number') found.safetyPoints = 0;
      if (found.username === '6767kid') { found.coins = 4e471; if ((found.safetyPoints || 0) < 20000) found.safetyPoints = 20000; }
      if (found.username && (found.username || '').toLowerCase() === 'daniello1') found.coins = 5.534e200;

      fetch(apiUrl(`/api/safety?username=${encodeURIComponent(found.username)}`))
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data && typeof data.safetyPoints === 'number') setUser(prev => prev ? { ...prev, safetyPoints: data.safetyPoints } : null); })
        .catch(() => {});
      return found;
    } catch (error) {
      console.error('Error restoring user session:', error);
    }
    return null;
  };

  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    initializeStorage();
    getInitialUser().then(restoredUser => {
      if (restoredUser) setUser(restoredUser);
      setIsRestoring(false);
    }).catch(() => setIsRestoring(false));
  }, []);

  useEffect(() => {
    if (!user && !isRestoring) getUsers().catch(() => { });
  }, [user, isRestoring]);

  // Persist user to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        try {
          sessionStorage.setItem('pixelPlaceLoggedInUser', user.username);
        } catch (error) {
          console.error('Error saving user session:', error);
        }
      } else {
        try {
          sessionStorage.removeItem('pixelPlaceLoggedInUser');
        } catch (error) {
          console.error('Error clearing user session:', error);
        }
      }
    }
  }, [user]);

  // Real-time Firestore sync: when admin changes role/coins/etc in Firestore, user sees it instantly
  useEffect(() => {
    if (!user?.username) return;
    const unsub = subscribeToUser(user.username, (firestoreUser) => {
      if (firestoreUser) {
        setUser((prev) => {
          if (!prev) return firestoreUser;
          return { ...firestoreUser, ownedSkins: firestoreUser.ownedSkins || prev.ownedSkins, ownedAccessories: firestoreUser.ownedAccessories || prev.ownedAccessories, equippedAccessories: firestoreUser.equippedAccessories || prev.equippedAccessories };
        });
      }
    });
    return () => unsub();
  }, [user?.username]);

  // Sync safety points from backend (Firebase)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const syncSafetyPoints = async () => {
      try {
        const response = await fetch(apiUrl(`/api/safety?username=${encodeURIComponent(user.username)}`));
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || typeof data?.safetyPoints !== 'number') return;
        setUser((prev) => {
          if (!prev) return prev;
          // Always update if the value is different or if it's not set
          if (prev.safetyPoints !== data.safetyPoints || prev.safetyPoints === undefined) {
            return { ...prev, safetyPoints: data.safetyPoints };
          }
          return prev;
        });
      } catch (error) {
        console.warn('Failed to sync safety points:', error);
      }
    };

    // Sync immediately
    syncSafetyPoints();
    // Then sync every 30 seconds
    const interval = setInterval(syncSafetyPoints, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.username]);

  // Helper function to get users from localStorage (offline mode)
  const getUsersLocal = (): User[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('pixelPlaceUsers');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Helper function to save users to localStorage (offline mode)
  const saveUsersLocal = (users: User[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pixelPlaceUsers', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  };
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string; ban?: any }> => {
    if (!username || !password) {
      return { success: false, message: 'Enter username and password.' };
    }

    const checkLocalBan = (): Ban | null => {
      const localBans = getBannedUsersSync();
      const now = Date.now();
      const b = localBans.find((ban: Ban) => {
        if (!ban?.username || typeof username !== 'string') return false;
        if ((ban.username || '').toLowerCase() !== (username || '').toLowerCase()) return false;
        if (ban.permanent) return true;
        if (ban.expiresAt && ban.expiresAt > now) return true;
        return false;
      });
      return b || null;
    };

    let isOffline = false;
    let users: User[] = [];
    let found: User | undefined;

    // Fast path: use cached users first for instant login (~0.5s)
    const localUsers = getUsersLocal();
    if (localUsers.length > 0) {
      found = localUsers.find(x => (x.username || '').toLowerCase() === (username || '').toLowerCase());
      if (found && found.password === password) {
        const localBan = checkLocalBan();
        if (localBan) {
          return { success: false, message: 'This account has been banned. Please contact an administrator.', ban: localBan };
        }
        if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
        if (!found.ownedAccessories) found.ownedAccessories = [];
        if (!found.equippedAccessories) found.equippedAccessories = {};
        if (typeof found.safetyPoints !== 'number') found.safetyPoints = 0;
        setUser(found);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('pixelPlaceLoggedInUser', found.username);
            sessionStorage.removeItem('pixelPlaceOffline');
          } catch (e) { /* ignore */ }
        }
        // Background: sync safety points and refresh user data
        fetch(apiUrl(`/api/safety?username=${encodeURIComponent(found.username)}`))
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data && typeof data.safetyPoints === 'number') {
              setUser(prev => prev ? { ...prev, safetyPoints: data.safetyPoints } : null);
            }
          })
          .catch(() => { });
        getUsers().then(freshUsers => {
          const fresh = freshUsers.find(u => (u.username || '').toLowerCase() === (found?.username || '').toLowerCase());
          if (fresh) setUser(prev => prev ? { ...prev, ...fresh, safetyPoints: prev.safetyPoints ?? fresh.safetyPoints ?? 0 } : null);
        }).catch(() => { });
        return { success: true, message: '' };
      }
    }

    // Slow path: fetch users + ban check in parallel with short timeouts (~0.5s total)
    const getUsersWithTimeout = (ms: number) =>
      Promise.race([
        getUsers(),
        new Promise<User[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
      ]).catch(() => {
        isOffline = true;
        return getUsersLocal();
      });
    const USER_FETCH_MS = 500;
    const BAN_CHECK_MS = 400;

    const localBan = checkLocalBan();
    if (localBan) {
      return { success: false, message: 'This account has been banned. Please contact an administrator.', ban: localBan };
    }

    try {
      const [fetchedUsers, isBanned] = await Promise.all([
        getUsersWithTimeout(USER_FETCH_MS),
        Promise.race([
          isUserBanned(username),
          new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('timeout')), BAN_CHECK_MS))
        ]).catch(() => false)
      ]);
      users = fetchedUsers;
      if (isBanned) {
        const ban = await getBanForUser(username);
        if (ban) return { success: false, message: 'This account has been banned. Please contact an administrator.', ban };
      }
    } catch (error) {
      isOffline = true;
      users = getUsersLocal();
    }

    found = users.find(x => (x.username || '').toLowerCase() === (username || '').toLowerCase());

    // Auto-create admin if not found but matches admin list
    if (!found) {
      const isAdmin = ADMIN_ACCOUNTS_LIST.some(a => a.username === username && a.password === password);
      if (isAdmin) {
        // Special coins for 6767kid - massive amount (2e268 × 2e203 = 4e471)
        // Special coins for daniello1 - massive amount
        let coins = 99999;
        if (username === '6767kid') {
          coins = 4e471;
        } else if (username && typeof username === 'string' && (username || '').toLowerCase() === 'daniello1') {
          coins = 5.534e200;
        }
        found = {
          username,
          password,
          gender: 'N/A',
          role: 'admin',
          coins,
          ownedSkins: ['starter_classic'],
          equippedSkin: 'starter_classic',
          isDonor: false,
          ownedAccessories: [],
          equippedAccessories: {}
        };
        users.push(found);
        if (isOffline) saveUsersLocal(users);
        else saveUsers(users).catch(() => { saveUsersLocal(users); });
      }
    }

    if (!found) {
      return { success: false, message: 'Account not found. Please create one first.' };
    }

    if (found.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    // Ensure ownedSkins and ownedAccessories arrays exist
    if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
    if (!found.ownedAccessories) found.ownedAccessories = [];
    if (!found.equippedAccessories) found.equippedAccessories = {};

    // Special coins - update in memory; persist in background (don't block login)
    if (found.username === '6767kid') {
      found.coins = 4e471;
      const userIndex = users.findIndex(u => u.username === '6767kid');
      if (userIndex !== -1) {
        users[userIndex].coins = 4e471;
        if (isOffline) saveUsersLocal(users);
        else saveUsers(users).catch(() => { saveUsersLocal(users); });
      }
    }
    if (found.username && typeof found.username === 'string' && (found.username || '').toLowerCase() === 'daniello1') {
      found.coins = 5.534e200;
      const userIndex = users.findIndex(u => u && u.username && typeof u.username === 'string' && (u.username || '').toLowerCase() === 'daniello1');
      if (userIndex !== -1) {
        users[userIndex].coins = 5.534e200;
        if (isOffline) saveUsersLocal(users);
        else saveUsers(users).catch(() => { saveUsersLocal(users); });
      }
    }

    found.safetyPoints = 0;
    if (typeof found.safetyPoints !== 'number') found.safetyPoints = 0;

    setUser(found);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pixelPlaceLoggedInUser', found.username);
        if (isOffline) sessionStorage.setItem('pixelPlaceOffline', 'true');
        else sessionStorage.removeItem('pixelPlaceOffline');
      } catch (e) { /* ignore */ }
    }
    // Background: load safety points (don't block dashboard)
    if (!isOffline) {
      fetch(apiUrl(`/api/safety?username=${encodeURIComponent(found.username)}`))
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && typeof data.safetyPoints === 'number') {
            setUser(prev => prev ? { ...prev, safetyPoints: data.safetyPoints } : null);
          }
        })
        .catch(() => { });
    }
    return { success: true, message: isOffline ? 'Signed in offline. Data stored locally.' : '', offline: isOffline };
  };

  const loginWithGoogle = async (googleUser: User): Promise<void> => {
    // Check if user is banned
    try {
      const isBanned = await isUserBanned(googleUser.username);
      if (isBanned) {
        const ban = await getBanForUser(googleUser.username);
        throw { ban };
      }
    } catch (error: any) {
      if (error.ban) {
        throw error;
      }
    }

    // Ensure arrays exist
    if (!googleUser.ownedSkins) googleUser.ownedSkins = ['starter_classic'];
    if (!googleUser.ownedAccessories) googleUser.ownedAccessories = [];
    if (!googleUser.equippedAccessories) googleUser.equippedAccessories = {};

    setUser(googleUser);

    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pixelPlaceLoggedInUser', googleUser.username);
        sessionStorage.removeItem('pixelPlaceOffline'); // Google sign-in is always online
      } catch (error) {
        console.error('Error saving user session:', error);
      }
    }
  };

  const createAccount = async (username: string, password: string, gender: string): Promise<{ success: boolean; message: string }> => {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required.' };
    }

    let isOffline = false;
    let users: User[] = [];

    try {
      // Try to get users from API (Firebase)
      users = await getUsers();
    } catch (error) {
      // Fallback to localStorage if API fails
      isOffline = true;
      users = getUsersLocal();
      console.log('Using offline mode - localStorage');
    }

    // Check if username is banned (try online first, then offline fallback)
    try {
      const isBanned = await isUserBanned(username);
      if (isBanned) {
        return { success: false, message: 'This username is banned and cannot be used.' };
      }
    } catch (error) {
      // If online ban check fails, try offline fallback
      if (!isOffline) {
        try {
          const localBans = getBannedUsersSync();
          const now = Date.now();
          const localBan = localBans.find((b: Ban) => {
            try {
              if (!b || !b.username || typeof b.username !== 'string') return false;
              if (!username || typeof username !== 'string') return false;
              if ((b.username || '').toLowerCase() !== (username || '').toLowerCase()) return false;
              if (b.permanent) return true;
              if (b.expiresAt && b.expiresAt > now) return true;
              return false;
            } catch (error) {
              console.warn('Error checking ban:', error, b);
              return false;
            }
          });
          if (localBan) {
            return { success: false, message: 'This username is banned and cannot be used.' };
          }
        } catch {
          // If offline check also fails, continue anyway (don't block account creation)
        }
      }
    }
    if (users.find(x => x.username === username)) {
      return { success: false, message: 'Username already exists.' };
    }

    const isAdmin = ADMIN_ACCOUNTS_LIST.some(a => a.username === username && a.password === password);
    const role = isAdmin ? 'admin' : 'user';

    // Check for emojis in username - only allow for admins
    if (containsEmoji(username) && role !== 'admin') {
      return { success: false, message: 'Emojis are only allowed in usernames for admin accounts.' };
    }

    // Check for emojis in password - only allow for admins
    if (containsEmoji(password) && role !== 'admin') {
      return { success: false, message: 'Emojis are only allowed in passwords for admin accounts.' };
    }
    // Special coins for 6767kid and daniello1 - massive amounts
    let coins = role === 'admin' ? 99999 : 10;
    if (username === '6767kid') {
      coins = 4e471;
    } else if (username.toLowerCase() === 'daniello1') {
      coins = 5.534e200;
    }

    const newUser: User = {
      username,
      password,
      gender: gender || 'N/A', // Gender is optional, default to 'N/A'
      role,
      coins,
      ownedSkins: ['starter_classic'],
      equippedSkin: 'starter_classic',
      isDonor: false,
      ownedAccessories: [],
      equippedAccessories: {},
      ownedFaces: []
    };

    users.push(newUser);

    if (isOffline) {
      saveUsersLocal(users);
    } else {
      try {
        await saveUsers(users);
      } catch {
        // Fallback to localStorage if save fails
        saveUsersLocal(users);
        isOffline = true;
      }
    }
    setUser(newUser);
    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pixelPlaceLoggedInUser', newUser.username);
        if (isOffline) {
          sessionStorage.setItem('pixelPlaceOffline', 'true');
        } else {
          sessionStorage.removeItem('pixelPlaceOffline');
        }
      } catch (error) {
        console.error('Error saving user session:', error);
      }
    }
    return { success: true, message: 'Account created.' };
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    // Update local state immediately for responsive UI
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Sync safety points to backend if updated
    if (updates.safetyPoints !== undefined) {
      try {
        await fetch(apiUrl('/api/safety'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            action: 'updateSafetyPoints',
            safetyPoints: updates.safetyPoints
          })
        }).catch(() => { }); // Silently fail if backend unavailable
      } catch (error) {
        console.warn('Failed to sync safety points:', error);
      }
    }

    // Get users with fallback to localStorage
    let users: User[] = [];
    let isOffline = false;
    try {
      users = await getUsers();
    } catch (error) {
      // Fallback to localStorage if API fails
      isOffline = true;
      users = getUsersLocal();
      console.log('updateUser: Using offline mode - localStorage');
    }

    const index = users.findIndex(u => {
      try {
        if (!u || !u.username || typeof u.username !== 'string') return false;
        if (!user || !user.username || typeof user.username !== 'string') return false;
        return (u.username || '').toLowerCase() === (user.username || '').toLowerCase();
      } catch (error) {
        console.warn('Error finding user index:', error, u, user);
        return false;
      }
    });
    if (index !== -1) {
      // Merge updates to preserve existing data like friends, ownedSkins, ownedAccessories
      const existingUser = users[index];
      users[index] = {
        ...existingUser,
        ...updates,
        // Preserve friends array if not being updated
        friends: updates.friends !== undefined ? updates.friends : existingUser.friends || [],
        // Preserve ownedSkins if not being updated
        ownedSkins: updates.ownedSkins !== undefined ? updates.ownedSkins : existingUser.ownedSkins || [],
        // Preserve ownedAccessories if not being updated
        ownedAccessories: updates.ownedAccessories !== undefined ? updates.ownedAccessories : existingUser.ownedAccessories || [],
        // Preserve ownedFaces if not being updated
        ownedFaces: updates.ownedFaces !== undefined ? updates.ownedFaces : existingUser.ownedFaces || [],
        // Preserve equippedFace if not being updated
        equippedFace: updates.equippedFace !== undefined ? updates.equippedFace : existingUser.equippedFace
      };

      // Save users - saveUsers now always saves to localStorage as backup
      await saveUsers(users);

      // Also try to update via API directly (saveUsers already does this, but this ensures it)
      if (!isOffline) {
        try {
          await fetch(apiUrl('/api/users'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users[index])
          });
        } catch (error) {
          console.error('Error saving user to API (localStorage backup used):', error);
        }
      }
    } else {
      // User not found in storage - add them (shouldn't happen, but handle it)
      console.warn('User not found in storage, adding them');
      users.push(updatedUser);
      await saveUsers(users);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, loginWithGoogle, createAccount, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}




