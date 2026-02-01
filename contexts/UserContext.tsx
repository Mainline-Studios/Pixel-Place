'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { initializeStorage, getUsers, saveUsers, ADMIN_ACCOUNTS_LIST, isUserBanned, getBanForUser } from '@/lib/storage';
import { containsEmoji } from '@/lib/utils';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; ban?: any }>;
  createAccount: (username: string, password: string, gender: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:20',message:'UserProvider render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  }, []);
  // #endregion

  // Restore user from sessionStorage on mount
  const getInitialUser = async (): Promise<User | null> => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:24',message:'getInitialUser called',data:{isWindow:typeof window !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    if (typeof window === 'undefined') return null;
    try {
      const savedUsername = sessionStorage.getItem('pixelPlaceLoggedInUser');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:28',message:'Checking sessionStorage',data:{savedUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      if (savedUsername) {
        const users = await getUsers();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:31',message:'Got users from storage',data:{userCount:users.length,foundUser:!!users.find(u => u.username === savedUsername)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        const found = users.find(u => u.username === savedUsername);
        if (found) {
          // Ensure arrays exist
          if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
          if (!found.ownedAccessories) found.ownedAccessories = [];
          if (!found.equippedAccessories) found.equippedAccessories = {};
          
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

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:72',message:'UserProvider useEffect started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    initializeStorage();
    // Restore user session on mount
    getInitialUser().then(restoredUser => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:76',message:'getInitialUser resolved',data:{hasRestoredUser:!!restoredUser,username:restoredUser?.username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      if (restoredUser) {
        setUser(restoredUser);
      }
      setIsRestoring(false);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:81',message:'Setting isRestoring to false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
    }).catch((error) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:84',message:'getInitialUser error',data:{error:error?.message || String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
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

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string; ban?: any }> => {
    if (!username || !password) {
      return { success: false, message: 'Enter username and password.' };
    }

    // Check if user is banned
    const isBanned = await isUserBanned(username);
    if (isBanned) {
      const ban = await getBanForUser(username);
      return { success: false, message: 'This account has been banned. Please contact an administrator.', ban: ban || undefined };
    }

    // Try to login via API first (for hashed passwords)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        // Successful login
        const found = data.user as User;
        
        // Ensure arrays exist
        if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
        if (!found.ownedAccessories) found.ownedAccessories = [];
        if (!found.equippedAccessories) found.equippedAccessories = {};
        
        // Special coins for 6767kid - massive amount
        if (found.username === '6767kid') {
          found.coins = 4e471;
        } else if (found.username.toLowerCase() === 'daniello1') {
          found.coins = 5.534e200;
        }
        
        setUser(found);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('pixelPlaceLoggedInUser', found.username);
          } catch (error) {
            console.error('Error saving user session:', error);
          }
        }
        return { success: true, message: '' };
      } else if (response.status === 401 || response.status === 404) {
        // Password incorrect or user not found - return the error message
        return { success: false, message: data.message || 'Incorrect password.' };
      } else if (response.status >= 400) {
        // Other API errors - return error message
        return { success: false, message: data.message || 'Login failed. Please try again.' };
      }
    } catch (apiError) {
      console.error('API login error, falling back to local:', apiError);
      // Continue to fallback only if it's a network error, not an auth error
    }
    
    // Fallback to local storage for legacy accounts
    let users = await getUsers();
    let found = users.find(x => x.username === username);

    // Auto-create admin if not found but matches admin list
    if (!found) {
      const isAdmin = ADMIN_ACCOUNTS_LIST.some(a => a.username === username && a.password === password);
      if (isAdmin) {
        // Special coins for 6767kid - massive amount (2e268 × 2e203 = 4e471)
        // Special coins for daniello1 - massive amount
        let coins = 99999;
        if (username === '6767kid') {
          coins = 4e471;
        } else if (username.toLowerCase() === 'daniello1') {
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
        await saveUsers(users);
      }
    }

    if (!found) {
      return { success: false, message: 'Account not found. Please create one first.' };
    }

    // For legacy accounts with plain text passwords
    if (found.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    // Ensure ownedSkins and ownedAccessories arrays exist
    if (!found.ownedSkins) found.ownedSkins = ['starter_classic'];
    if (!found.ownedAccessories) found.ownedAccessories = [];
    if (!found.equippedAccessories) found.equippedAccessories = {};

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
      found.coins = 5.534e200;
      // Update in storage
      const userIndex = users.findIndex(u => u.username.toLowerCase() === 'daniello1');
      if (userIndex !== -1) {
        users[userIndex].coins = 5.534e200;
        await saveUsers(users);
      }
    }

    setUser(found);
    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pixelPlaceLoggedInUser', found.username);
      } catch (error) {
        console.error('Error saving user session:', error);
      }
    }
    return { success: true, message: '' };
  };

  const createAccount = async (username: string, password: string, gender: string): Promise<{ success: boolean; message: string }> => {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required.' };
    }

    // Check if username is banned
    const isBanned = await isUserBanned(username);
    if (isBanned) {
      return { success: false, message: 'This username is banned and cannot be used.' };
    }

    const users = await getUsers();
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
    let coins = role === 'admin' ? 99999 : 0;
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
      equippedAccessories: {}
    };

    users.push(newUser);
    await saveUsers(users);
    setUser(newUser);
    // Persist to sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pixelPlaceLoggedInUser', newUser.username);
      } catch (error) {
        console.error('Error saving user session:', error);
      }
    }

    return { success: true, message: 'Account created! You can sign in now.' };
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    // Update local state immediately for responsive UI
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    // Fetch fresh user data from API to ensure we have the latest
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const allUsers = await response.json();
        const index = allUsers.findIndex((u: User) => u.username.toLowerCase() === user.username.toLowerCase());
        
        if (index !== -1) {
          // Merge updates with existing data, preserving all fields
          const existingUser = allUsers[index];
          const mergedUser: User = {
            ...existingUser,
            ...updates,
            // Always preserve these arrays - merge if updating, keep existing if not
            friends: updates.friends !== undefined ? updates.friends : (existingUser.friends || []),
            ownedSkins: updates.ownedSkins !== undefined ? updates.ownedSkins : (existingUser.ownedSkins || []),
            ownedAccessories: updates.ownedAccessories !== undefined ? updates.ownedAccessories : (existingUser.ownedAccessories || []),
            equippedAccessories: updates.equippedAccessories !== undefined ? updates.equippedAccessories : (existingUser.equippedAccessories || {}),
            sentFriendRequests: updates.sentFriendRequests !== undefined ? updates.sentFriendRequests : (existingUser.sentFriendRequests || []),
            friendRequests: updates.friendRequests !== undefined ? updates.friendRequests : (existingUser.friendRequests || []),
            ownedServers: updates.ownedServers !== undefined ? updates.ownedServers : (existingUser.ownedServers || []),
            // Preserve password - don't overwrite it
            password: existingUser.password || user.password,
            // Preserve other fields
            gender: updates.gender !== undefined ? updates.gender : (existingUser.gender || user.gender),
            role: updates.role !== undefined ? updates.role : (existingUser.role || user.role),
            equippedSkin: updates.equippedSkin !== undefined ? updates.equippedSkin : (existingUser.equippedSkin || user.equippedSkin),
            coins: updates.coins !== undefined ? updates.coins : (existingUser.coins !== undefined ? existingUser.coins : user.coins)
          };
          
          // Save to API - this will update the database
          const saveResponse = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedUser)
          });
          
          if (saveResponse.ok) {
            // Update local state with the saved data to ensure consistency
            const savedUser = await saveResponse.json();
            setUser({ ...updatedUser, ...savedUser });
          } else {
            console.error('Failed to save user:', await saveResponse.text());
          }
        } else {
          // User not found in API, save directly
          const mergedUser: User = {
            ...user,
            ...updates,
            password: user.password
          };
          
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedUser)
          });
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      // Fallback: try to save directly
      try {
        const mergedUser: User = {
          ...user,
          ...updates,
          password: user.password
        };
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedUser)
        });
      } catch (fallbackError) {
        console.error('Fallback save also failed:', fallbackError);
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, createAccount, updateUser }}>
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




