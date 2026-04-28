'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Ban } from '@/types';
import {
  initializeStorage,
  getUsers,
  saveUsers,
  ADMIN_ACCOUNTS_LIST,
  isUserBanned,
  getBanForUser,
  getBannedUsersSync,
  isPrimaryOpsAdmin,
  isListedHeadAdmin,
  isListedAdminAccount,
  findAdminAccountByUsername,
  adminUsernameKey,
} from '@/lib/storage';
import { subscribeToUser } from '@/lib/firestoreClient';
import { apiUrl } from '@/lib/apiBaseUrl';
import { containsEmoji } from '@/lib/utils';
import { getBackendBaseUrl, backendV1Url } from '@/lib/backendV1';
import { clearBackendToken, getBackendToken, setBackendToken } from '@/lib/backendSession';
import { fetchBackendMe, mapBackendUserToAppUser } from '@/lib/backendUser';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; ban?: any }>;
  loginWithGoogle: (googleUser: User) => Promise<void>;
  createAccount: (
    username: string,
    password: string,
    gender: string,
    email?: string
  ) => Promise<{ success: boolean; message: string }>;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Restore user from sessionStorage on mount
  const getInitialUser = async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null;
    try {
      if (getBackendBaseUrl()) {
        try {
          const raw = getBackendToken();
          if (raw) {
            const payload = await fetchBackendMe(raw);
            if (payload) {
              const u = mapBackendUserToAppUser(payload);
              sessionStorage.setItem('pixelPlaceLoggedInUser', u.username);
              return u;
            }
          }
        } catch {
          clearBackendToken();
        }
      }

      const savedUsername = sessionStorage.getItem('pixelPlaceLoggedInUser');
      if (savedUsername) {
        const users = await getUsers();
        const found = users.find(u => u.username === savedUsername);
        if (found) {
          // Ensure arrays exist
          if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
          if (!found.ownedAccessories) found.ownedAccessories = [];
          if (!found.equippedAccessories) found.equippedAccessories = {};
          if (!found.ownedFaces) found.ownedFaces = [];

          // God-mode balances for primary ops account (infinite coins + safety points) + ensure admin role
          if (isPrimaryOpsAdmin(found.username)) {
            const GOD_COINS = Number.MAX_SAFE_INTEGER;
            const GOD_SP = Number.MAX_SAFE_INTEGER;
            found.coins = GOD_COINS;
            found.safetyPoints = GOD_SP;
            if (isListedHeadAdmin(found.username)) {
              found.role = 'head_admin';
            } else if (isListedAdminAccount(found.username)) {
              found.role = 'admin';
            }
            const userIndex = users.findIndex((u) => isPrimaryOpsAdmin(u.username));
            if (userIndex !== -1) {
              users[userIndex].coins = GOD_COINS;
              users[userIndex].safetyPoints = GOD_SP;
              users[userIndex].role = found.role;
              await saveUsers(users);
            }
          }

          // Special coins for daniello1 - massive amount
          if (found.username.toLowerCase() === 'daniello1') {
            // Massive coin amount for daniello1
            found.coins = 5.534e200; // Very large number in scientific notation
            // Update in storage
            const userIndex = users.findIndex(u => u.username.toLowerCase() === 'daniello1');
            if (userIndex !== -1) {
              users[userIndex].coins = 5.534e200;
              await saveUsers(users);
            }
          }

          return found;
        }
      }
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
      if (restoredUser) {
        setUser(restoredUser);
      }
      setIsRestoring(false);
    }).catch(() => {
      setIsRestoring(false);
    });
  }, []);

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
    if (!user?.username || user.authBackend === 'postgres') return;
    const unsub = subscribeToUser(user.username, (firestoreUser) => {
      if (firestoreUser) {
        setUser((prev) => {
          if (!prev) return firestoreUser;
          const fsSkins = firestoreUser.ownedSkins?.length ? firestoreUser.ownedSkins : prev.ownedSkins;
          const fsAcc = firestoreUser.ownedAccessories?.length ? firestoreUser.ownedAccessories : prev.ownedAccessories;
          const fsFaces = firestoreUser.ownedFaces?.length ? firestoreUser.ownedFaces : prev.ownedFaces;
          const fsEqAcc = firestoreUser.equippedAccessories
            ? firestoreUser.equippedAccessories
            : prev.equippedAccessories;
          const fsFace = firestoreUser.equippedFace !== undefined && firestoreUser.equippedFace !== ''
            ? firestoreUser.equippedFace
            : prev.equippedFace;
          const fsSp =
            typeof firestoreUser.safetyPoints === 'number'
              ? firestoreUser.safetyPoints
              : prev.safetyPoints;
          const fsLocale =
            firestoreUser.locale !== undefined && firestoreUser.locale !== ''
              ? firestoreUser.locale
              : prev.locale;
          return {
            ...firestoreUser,
            ownedSkins: fsSkins,
            ownedAccessories: fsAcc,
            ownedFaces: fsFaces,
            equippedAccessories: fsEqAcc,
            equippedFace: fsFace,
            safetyPoints: fsSp,
            locale: fsLocale
          };
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
        const data = await response.json();
        if (cancelled || typeof data?.safetyPoints !== 'number') return;
        setUser((prev) => {
          if (!prev) return prev;
          if (prev.safetyPoints === data.safetyPoints) return prev;
          return { ...prev, safetyPoints: data.safetyPoints };
        });
      } catch (error) {
        console.warn('Failed to sync safety points:', error);
      }
    };

    syncSafetyPoints();
    const interval = setInterval(syncSafetyPoints, 60000);
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

    clearBackendToken();

    const apiBase = getBackendBaseUrl();
    if (apiBase) {
      try {
        const res = await fetch(backendV1Url('/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.data?.accessToken) {
          const token = json.data.accessToken as string;
          setBackendToken(token);
          const payload = await fetchBackendMe(token);
          if (payload) {
            const mapped = mapBackendUserToAppUser(payload);
            setUser(mapped);
            if (typeof window !== 'undefined') {
              try {
                sessionStorage.setItem('pixelPlaceLoggedInUser', mapped.username);
                sessionStorage.removeItem('pixelPlaceOffline');
              } catch {
                /* ignore */
              }
            }
            return { success: true, message: '' };
          }
        }
      } catch {
        /* fall through to legacy auth */
      }
      clearBackendToken();
    }

    let isOffline = false;
    let users: User[] = [];
    let found: User | undefined;

    try {
      // Try to get users from API (Firebase)
      users = await getUsers();
    } catch (error) {
      // Fallback to localStorage if API fails
      isOffline = true;
      users = getUsersLocal();
      console.log('Using offline mode - localStorage');
    }

    // Check if user is banned (try online first, then offline fallback)
    try {
      const isBanned = await isUserBanned(username);
      if (isBanned) {
        const ban = await getBanForUser(username);
        if (ban) {
          return { success: false, message: 'This account has been banned. Please contact an administrator.', ban };
        }
      }
    } catch (error) {
      // If online ban check fails, try offline fallback
      if (!isOffline) {
        try {
          const localBans = getBannedUsersSync();
          const now = Date.now();
          const localBan = localBans.find((b: Ban) => {
            if (b.username.toLowerCase() !== username.toLowerCase()) return false;
            if (b.permanent) return true;
            if (b.expiresAt && b.expiresAt > now) return true;
            return false;
          });
          if (localBan) {
            return { success: false, message: 'This account has been banned. Please contact an administrator.', ban: localBan };
          }
        } catch {
          // If offline check also fails, continue anyway (don't block login)
        }
      }
    }

    found =
      users.find((x) => x.username === username) ||
      users.find((x) => adminUsernameKey(x.username) === adminUsernameKey(username));

    // Auto-create admin if not found but matches admin list
    if (!found) {
      const bootstrap = ADMIN_ACCOUNTS_LIST.find(
        (a) => adminUsernameKey(a.username) === adminUsernameKey(username) && a.password === password
      );
      if (bootstrap) {
        // Special coins for primary ops account — massive amount
        // Special coins for daniello1 - massive amount
        let coins = 99999;
        let safetyPoints = 0;
        if (isPrimaryOpsAdmin(username)) {
          coins = Number.MAX_SAFE_INTEGER;
          safetyPoints = Number.MAX_SAFE_INTEGER;
        } else if (username.toLowerCase() === 'daniello1') {
          coins = 5.534e200;
        }
        const isHeadAdmin = isListedHeadAdmin(username);
        found = {
          username,
          password,
          gender: 'N/A',
          role: isHeadAdmin ? 'head_admin' : 'admin',
          coins,
          safetyPoints,
          ownedSkins: ['starter_classic'],
          equippedSkin: 'starter_classic',
          isDonor: false,
          ownedAccessories: [],
          equippedAccessories: {},
          ownedFaces: []
        };
        users.push(found);
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
      }
    }

    if (!found) {
      return { success: false, message: 'Account not found. Please create one first.' };
    }

    // Accept password from code (admin list) or from stored data
    const adminEntry = findAdminAccountByUsername(found!.username);
    const validViaCode = adminEntry && adminEntry.password === password;
    const validViaStored = found.password === password;
    if (!validViaCode && !validViaStored) {
      return { success: false, message: 'Incorrect password.' };
    }

    // Ensure ownedSkins and ownedAccessories arrays exist
    if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
    if (!found.ownedAccessories) found.ownedAccessories = [];
    if (!found.equippedAccessories) found.equippedAccessories = {};

    // Special coins for primary ops account - massive amount
    if (isPrimaryOpsAdmin(found.username)) {
      found.coins = Number.MAX_SAFE_INTEGER;
      found.safetyPoints = Number.MAX_SAFE_INTEGER;
      if (isListedHeadAdmin(found.username)) {
        found.role = 'head_admin';
      } else {
        found.role = 'admin';
      }
      const userIndex = users.findIndex((u) => isPrimaryOpsAdmin(u.username));
      if (userIndex !== -1) {
        users[userIndex].coins = Number.MAX_SAFE_INTEGER;
        users[userIndex].safetyPoints = Number.MAX_SAFE_INTEGER;
        users[userIndex].role = found.role;
        if (isOffline) {
          saveUsersLocal(users);
        } else {
          try {
            await saveUsers(users);
          } catch {
            saveUsersLocal(users);
            isOffline = true;
          }
        }
      }
    }

    // Special coins for daniello1 - massive amount
    if (found.username.toLowerCase() === 'daniello1') {
      // Massive coin amount for daniello1
      found.coins = 5.534e200;
      // Update in storage
      const userIndex = users.findIndex(u => u.username.toLowerCase() === 'daniello1');
      if (userIndex !== -1) {
        users[userIndex].coins = 5.534e200;
        if (isOffline) {
          saveUsersLocal(users);
        } else {
          try {
            await saveUsers(users);
          } catch {
            saveUsersLocal(users);
            isOffline = true;
          }
        }
      }
    }

    // Sync safety points from backend
    if (!isOffline) {
      try {
        const safetyResponse = await fetch(apiUrl(`/api/safety?username=${found.username}`));
        if (safetyResponse.ok) {
          const safetyData = await safetyResponse.json();
          found.safetyPoints = safetyData.safetyPoints || 0;
        }
      } catch (error) {
        console.warn('Failed to fetch safety points:', error);
      }
    }

    // Upgrade role from code: head_admin or admin if in lists
    if (isListedHeadAdmin(found.username)) {
      found.role = 'head_admin';
    } else if (isListedAdminAccount(found.username)) {
      found.role = 'admin';
    }
    // Persist role upgrade to backend so it sticks
    const idx = users.findIndex((u) => adminUsernameKey(u.username) === adminUsernameKey(found.username));
    if (idx >= 0 && users[idx].role !== found.role) {
      users[idx].role = found.role;
      if (!isOffline) {
        try { await saveUsers(users); } catch { /* ignore */ }
      } else {
        saveUsersLocal(users);
      }
    }

    setUser(found);
    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pixelPlaceLoggedInUser', found.username);
        // Mark as offline in sessionStorage
        if (isOffline) {
          sessionStorage.setItem('pixelPlaceOffline', 'true');
        } else {
          sessionStorage.removeItem('pixelPlaceOffline');
        }
      } catch (error) {
        console.error('Error saving user session:', error);
      }
    }
    return { success: true, message: isOffline ? 'Signed in offline. Data stored locally.' : '', offline: isOffline };
  };

  const loginWithGoogle = async (googleUser: User): Promise<void> => {
    clearBackendToken();
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

  const createAccount = async (
    username: string,
    password: string,
    gender: string,
    email?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const apiBase = getBackendBaseUrl();
    if (apiBase) {
      try {
        const body: Record<string, string> = { username, password, gender: gender || '' };
        if (email?.trim()) body.email = email.trim();
        const res = await fetch(backendV1Url('/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.data?.accessToken) {
          const token = json.data.accessToken as string;
          setBackendToken(token);
          const payload = await fetchBackendMe(token);
          if (payload) {
            const mapped = mapBackendUserToAppUser(payload);
            setUser(mapped);
            if (typeof window !== 'undefined') {
              try {
                sessionStorage.setItem('pixelPlaceLoggedInUser', mapped.username);
                sessionStorage.removeItem('pixelPlaceOffline');
              } catch {
                /* ignore */
              }
            }
            return { success: true, message: 'Account created.' };
          }
        }
        const msg =
          json?.error?.message ||
          json?.message ||
          (res.status === 409 ? 'Username or email already taken.' : 'Could not create account on database.');
        return { success: false, message: typeof msg === 'string' ? msg : 'Registration failed.' };
      } catch {
        return { success: false, message: 'Could not reach account server.' };
      }
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
            if (b.username.toLowerCase() !== username.toLowerCase()) return false;
            if (b.permanent) return true;
            if (b.expiresAt && b.expiresAt > now) return true;
            return false;
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

    const bootstrap = ADMIN_ACCOUNTS_LIST.find(
      (a) => adminUsernameKey(a.username) === adminUsernameKey(username) && a.password === password
    );
    const isAdmin = !!bootstrap;
    const isHeadAdmin = isAdmin && isListedHeadAdmin(username);
    const role = isHeadAdmin ? 'head_admin' : isAdmin ? 'admin' : 'user';

    // Check for emojis in username - only allow for admins
    if (containsEmoji(username) && role !== 'admin' && role !== 'head_admin') {
      return { success: false, message: 'Emojis are only allowed in usernames for admin accounts.' };
    }

    // Check for emojis in password - only allow for admins
    if (containsEmoji(password) && role !== 'admin' && role !== 'head_admin') {
      return { success: false, message: 'Emojis are only allowed in passwords for admin accounts.' };
    }
    // Special coins for admins and head_admins
    let coins = (role === 'admin' || role === 'head_admin') ? 99999 : 10;
    let safetyPointsInit = 0;
    if (isPrimaryOpsAdmin(username)) {
      coins = Number.MAX_SAFE_INTEGER;
      safetyPointsInit = Number.MAX_SAFE_INTEGER;
    } else if (username.toLowerCase() === 'daniello1') {
      coins = 5.534e200;
    }

    let storedLocale: string | undefined;
    if (typeof window !== 'undefined') {
      try {
        storedLocale = localStorage.getItem('pixelplace_locale') ?? undefined;
      } catch {
        /* ignore */
      }
    }

    const newUser: User = {
      username,
      password,
      gender: gender || 'N/A', // Gender is optional, default to 'N/A'
      role,
      coins,
      safetyPoints: safetyPointsInit,
      ownedSkins: ['starter_classic'],
      equippedSkin: 'starter_classic',
      isDonor: false,
      ownedAccessories: [],
      equippedAccessories: {},
      ownedFaces: [],
      ...(storedLocale ? { locale: storedLocale } : {})
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

    let mergedUpdates = { ...updates };
    if (isPrimaryOpsAdmin(user.username)) {
      mergedUpdates.coins = Number.MAX_SAFE_INTEGER;
      mergedUpdates.safetyPoints = Number.MAX_SAFE_INTEGER;
      mergedUpdates.role = isListedHeadAdmin(user.username) ? 'head_admin' : 'admin';
    }

    // Update local state immediately for responsive UI
    const updatedUser = { ...user, ...mergedUpdates };
    setUser(updatedUser);

    // Sync safety points to backend if updated
    if (mergedUpdates.safetyPoints !== undefined) {
      try {
        await fetch(apiUrl('/api/safety'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            action: 'updateSafetyPoints',
            safetyPoints: mergedUpdates.safetyPoints
          })
        }).catch(() => { }); // Silently fail if backend unavailable
      } catch (error) {
        console.warn('Failed to sync safety points:', error);
      }
    }

    const users = await getUsers();
    const index = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    if (index === -1) {
      const existingUser = user;
      const row: User = {
        ...existingUser,
        ...mergedUpdates,
        friends: mergedUpdates.friends !== undefined ? mergedUpdates.friends : existingUser.friends || [],
        ownedSkins: mergedUpdates.ownedSkins !== undefined ? mergedUpdates.ownedSkins : existingUser.ownedSkins || [],
        ownedAccessories:
          mergedUpdates.ownedAccessories !== undefined
            ? mergedUpdates.ownedAccessories
            : existingUser.ownedAccessories || [],
        ownedFaces: mergedUpdates.ownedFaces !== undefined ? mergedUpdates.ownedFaces : existingUser.ownedFaces || [],
        equippedFace: mergedUpdates.equippedFace !== undefined ? mergedUpdates.equippedFace : existingUser.equippedFace,
        safetyPoints:
          mergedUpdates.safetyPoints !== undefined ? mergedUpdates.safetyPoints : existingUser.safetyPoints,
        coins: mergedUpdates.coins !== undefined ? mergedUpdates.coins : existingUser.coins,
        role: mergedUpdates.role !== undefined ? mergedUpdates.role : existingUser.role,
        locale: mergedUpdates.locale !== undefined ? mergedUpdates.locale : existingUser.locale,
      };
      try {
        await fetch(apiUrl('/api/users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        });
      } catch (error) {
        console.error('Error saving user to API:', error);
      }
      return;
    } else {
      // Merge updates to preserve existing data like friends, ownedSkins, ownedAccessories
      const existingUser = users[index];
      users[index] = {
        ...existingUser,
        ...mergedUpdates,
        // Preserve friends array if not being updated
        friends: mergedUpdates.friends !== undefined ? mergedUpdates.friends : existingUser.friends || [],
        // Preserve ownedSkins if not being updated
        ownedSkins: mergedUpdates.ownedSkins !== undefined ? mergedUpdates.ownedSkins : existingUser.ownedSkins || [],
        // Preserve ownedAccessories if not being updated
        ownedAccessories: mergedUpdates.ownedAccessories !== undefined ? mergedUpdates.ownedAccessories : existingUser.ownedAccessories || [],
        // Preserve ownedFaces if not being updated
        ownedFaces: mergedUpdates.ownedFaces !== undefined ? mergedUpdates.ownedFaces : existingUser.ownedFaces || [],
        // Preserve equippedFace if not being updated
        equippedFace: mergedUpdates.equippedFace !== undefined ? mergedUpdates.equippedFace : existingUser.equippedFace,
        safetyPoints:
          mergedUpdates.safetyPoints !== undefined
            ? mergedUpdates.safetyPoints
            : existingUser.safetyPoints,
        coins: mergedUpdates.coins !== undefined ? mergedUpdates.coins : existingUser.coins,
        role: mergedUpdates.role !== undefined ? mergedUpdates.role : existingUser.role,
        locale: mergedUpdates.locale !== undefined ? mergedUpdates.locale : existingUser.locale
      };
      await saveUsers(users);

      // Also update via API PUT to ensure persistence
      try {
        await fetch(apiUrl('/api/users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(users[index])
        });
      } catch (error) {
        console.error('Error saving user to API:', error);
      }
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




