'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Ban } from '@/types';
import { initializeStorage, getUsers, saveUsers, ADMIN_ACCOUNTS_LIST, isUserBanned, getBanForUser, checkDeviceBanStatus } from '@/lib/storage';
import { subscribeToUser } from '@/lib/firestoreClient';
import { apiUrl } from '@/lib/apiBaseUrl';
import { containsEmoji } from '@/lib/utils';
import {
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  decodeJwtUsernameFromToken,
  hasUsableAuthToken,
} from '@/lib/api';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import LoadingScreenWithGame from '@/components/LoadingScreenWithGame';
import AccountSetupWizard from '@/components/AccountSetupWizard';
import { hydratePreferencesFromUser, needsAccountSetup } from '@/lib/accountSetup';
import { usePathname } from 'next/navigation';
import { verifyLoginCode } from '@/lib/loginApi';

export type LoginResult = {
  success: boolean;
  message: string;
  ban?: any;
  deviceBanned?: boolean;
  requiresLoginCode?: boolean;
  challengeToken?: string;
  maskedEmail?: string;
};

export interface BannedSession {
  username: string;
  ban: Ban;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<LoginResult>;
  completeLoginWithCode: (challengeToken: string, code: string) => Promise<LoginResult>;
  loginWithGoogle: (googleUser: User, apiToken?: string) => Promise<void>;
  createAccount: (username: string, password: string, gender: string) => Promise<{ success: boolean; message: string; ban?: any; deviceBanned?: boolean }>;
  updateUser: (updates: Partial<User>) => void;
  gettingReady: boolean;
  userAcceptedReady: boolean;
  setUserAcceptedReady: (v: boolean) => void;
  bannedSession: BannedSession | null;
  clearBannedSession: () => void;
  deviceBannedSession: BannedSession | null;
  clearDeviceBannedSession: () => void;
  isRestoring: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bypassReadySplash =
    pathname === '/signoutall' ||
    pathname?.startsWith('/signoutall/') ||
    pathname === '/verify' ||
    pathname?.startsWith('/verify/');
  // Restore user from sessionStorage on mount
  const getInitialUser = async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null;
    try {
      let savedUsername = sessionStorage.getItem('pixelPlaceLoggedInUser');
      if (!savedUsername) {
        const t = getAuthToken();
        const fromJwt = t ? decodeJwtUsernameFromToken(t) : null;
        if (fromJwt) savedUsername = fromJwt;
      }
      if (savedUsername) {
        const users = await getUsers();
        const found = users.find(u => u.username === savedUsername);
        if (found) {
          // Ensure arrays and equipped state exist so avatar/clothes persist after reload
          if (!found.ownedSkins) found.ownedSkins = ['pixel_placer'];
          if (!found.ownedAccessories) found.ownedAccessories = [];
          if (!found.equippedAccessories) found.equippedAccessories = {};
          if (!found.ownedFaces) found.ownedFaces = [];
          if (!found.equippedSkin && found.ownedSkins.length) found.equippedSkin = found.ownedSkins[0];
          if (!found.equippedSkin) found.equippedSkin = 'pixel_placer';

          if (!hasUsableAuthToken()) {
            sessionStorage.removeItem('pixelPlaceLoggedInUser');
            removeAuthToken();
            return null;
          }
          
          // Special coins for 6767kid - massive amount
          if (found.username === '6767kid') {
            // 2e268 × 2e203 = 4e471 coins (4 followed by 471 zeros)
            found.coins = 4e471;
            // Update in storage
            const userIndex = users.findIndex(u => u.username === '6767kid');
            if (userIndex !== -1) {
              users[userIndex].coins = 4e471;
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
  const [gettingReady, setGettingReady] = useState(false);
  const [userAcceptedReady, setUserAcceptedReady] = useState(false);
  const [accountSetupOpen, setAccountSetupOpen] = useState(false);
  const [bannedSession, setBannedSession] = useState<BannedSession | null>(null);
  const [deviceBannedSession, setDeviceBannedSession] = useState<BannedSession | null>(null);
  const firstSyncDone = useRef(false);
  const readyStartTime = useRef<number>(0);

  const MIN_READY_WAIT_MS = 6000;  // show loading at least 6 seconds so Firebase/API can load
  const MAX_READY_WAIT_MS = 12000;  // stop waiting after 12 seconds at most

  useEffect(() => {
    if (!user) {
      setAccountSetupOpen(false);
      return;
    }
    if (needsAccountSetup(user)) {
      setAccountSetupOpen(true);
      setUserAcceptedReady(true);
    } else {
      setAccountSetupOpen(false);
      hydratePreferencesFromUser(user);
    }
  }, [user?.username, user?.setupCompleted]);

  useEffect(() => {
    initializeStorage();
    getInitialUser().then(async (restoredUser) => {
      if (restoredUser) {
        const banned = await isUserBanned(restoredUser.username);
        if (banned) {
          const rawBan = await getBanForUser(restoredUser.username);
          if (rawBan) {
            const ban: Ban = {
              username: rawBan.username,
              reason: rawBan.reason ?? '',
              bannedBy: (rawBan as any).bannedBy ?? (rawBan as any).banned_by ?? '',
              timestamp: (rawBan as any).timestamp ?? (rawBan as any).banned_at ?? Date.now(),
              permanent: rawBan.permanent ?? true,
              expiresAt: rawBan.expiresAt,
            };
            setBannedSession({ username: restoredUser.username, ban });
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('pixelPlaceLoggedInUser');
              removeAuthToken();
            }
          } else {
            setUser(restoredUser);
            firstSyncDone.current = false;
            readyStartTime.current = Date.now();
            setGettingReady(true);
          }
        } else {
          setUser(restoredUser);
          firstSyncDone.current = false;
          readyStartTime.current = Date.now();
          setGettingReady(true);
        }
      } else {
        // No saved user — check if device is banned so we show ban screen on open instead of login
        const deviceCheck = await checkDeviceBanStatus();
        if (deviceCheck.banned && deviceCheck.ban) {
          setDeviceBannedSession({ username: 'This device', ban: deviceCheck.ban });
        }
      }
      setIsRestoring(false);
    }).catch(() => {
      setIsRestoring(false);
    });
  }, []);

  // Persist user to sessionStorage and clear token on logout; reset ready screen when logging out
  useEffect(() => {
    if (!user) {
      setUserAcceptedReady(false);
      firstSyncDone.current = false;
    }
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
          removeAuthToken();
        } catch (error) {
          console.error('Error clearing user session:', error);
        }
      }
    }
  }, [user]);

  // Real-time Firestore sync: when admin changes role/coins/etc in Firestore, user sees it instantly
  useEffect(() => {
    if (!user?.username) return;
    let minWaitTimer: ReturnType<typeof setTimeout> | null = null;

    const tryFinishReady = () => {
      if (!firstSyncDone.current) {
        firstSyncDone.current = true;
        setGettingReady(false);
      }
    };

    const unsub = subscribeToUser(user.username, (firestoreUser) => {
      if (!firstSyncDone.current) {
        const elapsed = Date.now() - readyStartTime.current;
        if (elapsed >= MIN_READY_WAIT_MS) {
          tryFinishReady();
        } else {
          minWaitTimer = setTimeout(tryFinishReady, MIN_READY_WAIT_MS - elapsed);
        }
      }
      if (firestoreUser) {
        setUser((prev) => {
          if (!prev) return firestoreUser;
          const eqAcc = firestoreUser.equippedAccessories;
          const hasEquippedAcc = eqAcc && (Array.isArray(eqAcc) ? eqAcc.length > 0 : Object.keys(eqAcc as object).length > 0);
          return {
            ...firestoreUser,
            ownedSkins: firestoreUser.ownedSkins?.length ? firestoreUser.ownedSkins : prev.ownedSkins,
            ownedAccessories: firestoreUser.ownedAccessories?.length ? firestoreUser.ownedAccessories : prev.ownedAccessories,
            equippedSkin: firestoreUser.equippedSkin || prev.equippedSkin,
            equippedAccessories: hasEquippedAcc ? eqAcc : (prev.equippedAccessories ?? {}),
            equippedFace: firestoreUser.equippedFace || prev.equippedFace,
          };
        });
      }
    });

    const maxTimer = setTimeout(() => {
      if (minWaitTimer) clearTimeout(minWaitTimer);
      tryFinishReady();
    }, MAX_READY_WAIT_MS);

    return () => {
      unsub();
      if (minWaitTimer) clearTimeout(minWaitTimer);
      clearTimeout(maxTimer);
    };
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

  const establishSession = (u: User, token: string) => {
    setAuthToken(token);
    if (!u.ownedSkins) u.ownedSkins = ['pixel_placer'];
    if (!u.ownedAccessories) u.ownedAccessories = [];
    if (!u.equippedAccessories) u.equippedAccessories = {};
    if (!u.ownedFaces) u.ownedFaces = [];
    if (u.setupCompleted !== false) u.setupCompleted = true;
    firstSyncDone.current = false;
    readyStartTime.current = Date.now();
    setGettingReady(true);
    setUser(u);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pixelPlaceLoggedInUser', u.username);
      sessionStorage.removeItem('pixelPlaceOffline');
      if (u.emailVerified !== true) {
        sessionStorage.setItem('pixelplace_show_verify_prompt', '1');
      }
    }
  };

  const login = async (username: string, password: string): Promise<LoginResult> => {
    if (!username || !password) {
      return { success: false, message: 'Enter username and password.' };
    }

    try {
      const fingerprint = typeof getDeviceFingerprint === 'function'
        ? getDeviceFingerprint()
        : { deviceId: '', label: '' };
      const authRes = await fetch(apiUrl('/api/auth/firestore-login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          deviceId: fingerprint.deviceId || undefined,
          deviceLabel: fingerprint.label || undefined,
        }),
      });

      const authData = await authRes.json().catch(() => ({}));
      if (authRes.ok && authData.success && authData.requiresLoginCode && authData.challengeToken) {
        return {
          success: true,
          message: '',
          requiresLoginCode: true,
          challengeToken: String(authData.challengeToken),
          maskedEmail: String(authData.maskedEmail || 'your email'),
        };
      }
      if (authRes.ok && authData.success && authData.token && authData.user) {
        const u = authData.user as User;
        establishSession(u, authData.token);
        return { success: true, message: '' };
      }
      if (authRes.status === 401) {
        if (authData.deviceBanned && authData.ban) {
          return { success: false, message: authData.error || 'This device is banned.', ban: authData.ban, deviceBanned: true };
        }
        return { success: false, message: authData.error || 'Invalid credentials.', ban: authData.ban };
      }
      return { success: false, message: authData?.error || 'Could not sign in. Try again.' };
    } catch (_e) {
      return { success: false, message: 'Could not reach server. Try again when online.' };
    }
    return { success: false, message: 'Could not sign in.' };
  };

  const completeLoginWithCode = async (challengeToken: string, code: string): Promise<LoginResult> => {
    if (!challengeToken || !code.trim()) {
      return { success: false, message: 'Enter the login code from your email.' };
    }
    try {
      const { res, data } = await verifyLoginCode(challengeToken, code);
      if (!res.ok || !data?.success || !data?.token || !data?.user) {
        return { success: false, message: data?.error || 'Invalid or expired login code.' };
      }
      const u = data.user as User;
      establishSession(u, data.token);
      return { success: true, message: '' };
    } catch {
      return { success: false, message: 'Could not verify login code. Try again.' };
    }
  };

  const loginWithGoogle = async (googleUser: User, apiToken?: string): Promise<void> => {
    if (apiToken) {
      establishSession(googleUser, apiToken);
      return;
    }
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
    if (!googleUser.ownedSkins) googleUser.ownedSkins = ['pixel_placer'];
    if (!googleUser.ownedAccessories) googleUser.ownedAccessories = [];
    if (!googleUser.equippedAccessories) googleUser.equippedAccessories = {};

    if (googleUser.setupCompleted !== false) googleUser.setupCompleted = true;
    setUser(googleUser);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pixelPlaceLoggedInUser', googleUser.username);
        sessionStorage.removeItem('pixelPlaceOffline');
        if (googleUser.emailVerified !== true) {
          sessionStorage.setItem('pixelplace_show_verify_prompt', '1');
        }
      } catch (error) {
        console.error('Error saving user session:', error);
      }
    }
    firstSyncDone.current = false;
    readyStartTime.current = Date.now();
    setGettingReady(true);
  };

  const createAccount = async (username: string, password: string, gender: string): Promise<{ success: boolean; message: string }> => {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    // When online: register via backend and get token
    try {
      const fingerprint = typeof getDeviceFingerprint === 'function'
        ? getDeviceFingerprint()
        : { deviceId: '', label: '' };
      const regRes = await fetch(apiUrl('/api/auth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          action: 'register',
          gender,
          deviceId: fingerprint.deviceId || undefined,
          deviceLabel: fingerprint.label || undefined,
        }),
      });
      const regData = await regRes.json().catch(() => ({}));
      if (regRes.ok && regData.success && regData.token && regData.user) {
        setAuthToken(regData.token);
        const u = regData.user as User;
        if (!u.ownedSkins) u.ownedSkins = ['pixel_placer'];
        if (!u.ownedAccessories) u.ownedAccessories = [];
        if (!u.equippedAccessories) u.equippedAccessories = {};
        firstSyncDone.current = false;
        readyStartTime.current = Date.now();
        setGettingReady(true);
        if (!u.ownedFaces) u.ownedFaces = [];
        u.setupCompleted = false;
        setUser(u);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pixelPlaceLoggedInUser', u.username);
          sessionStorage.removeItem('pixelPlaceOffline');
        }
        return { success: true, message: 'Account created.' };
      }
      if (regRes.status === 400) {
        if (regData.deviceBanned && regData.ban) {
          return { success: false, message: regData.error || 'This device is banned.', ban: regData.ban, deviceBanned: true };
        }
        return { success: false, message: regData.error || 'Registration failed.' };
      }
    } catch (_e) {
      // Backend unreachable — fall back to offline flow below
    }

    let users: User[] = [];
    try {
      users = await getUsers();
    } catch {
      return { success: false, message: 'Could not reach server. Try again when online.' };
    }

    // Check if username is banned (Firebase only)
    try {
      const isBanned = await isUserBanned(username);
      if (isBanned) {
        return { success: false, message: 'This username is banned and cannot be used.' };
      }
    } catch {
      return { success: false, message: 'Could not verify ban status. Try again when online.' };
    }
    if (users.find(x => x.username === username)) {
      return { success: false, message: 'Username already exists.' };
    }

    const isAdmin = ADMIN_ACCOUNTS_LIST.some(a => a.username === username && a.password === password);
    const isHeadAdmin = isAdmin && (await import('@/lib/storage')).HEAD_ADMIN_USERNAMES.includes(username);
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
      ownedSkins: ['pixel_placer'],
      equippedSkin: 'pixel_placer',
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
        }).catch(() => {}); // Silently fail if backend unavailable
      } catch (error) {
        console.warn('Failed to sync safety points:', error);
      }
    }

    const users = await getUsers();
    const index = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
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
    <UserContext.Provider value={{ user, setUser, login, completeLoginWithCode, loginWithGoogle, createAccount, updateUser, gettingReady, userAcceptedReady, setUserAcceptedReady, bannedSession, clearBannedSession: () => setBannedSession(null), deviceBannedSession, clearDeviceBannedSession: () => setDeviceBannedSession(null), isRestoring }}>
      {children}
      {user && accountSetupOpen ? (
        <AccountSetupWizard
          onFinished={() => {
            setAccountSetupOpen(false);
            setUserAcceptedReady(false);
            readyStartTime.current = Date.now();
            setGettingReady(true);
          }}
        />
      ) : null}
      {user && !accountSetupOpen && !userAcceptedReady && !bypassReadySplash ? (
        <LoadingScreenWithGame gettingReady={gettingReady} onGoToApp={() => setUserAcceptedReady(true)} />
      ) : null}
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




