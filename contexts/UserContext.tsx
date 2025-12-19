'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { initializeStorage, getUsers, saveUsers, ADMIN_ACCOUNTS_LIST, isUserBanned, getBanForUser, findUser } from '@/lib/storage';

interface UserContextType {
  logout: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; ban?: any }>;
  createAccount: (username: string, password: string, gender: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      initializeStorage();
    } catch (e) {
      console.error('Error initializing storage:', e);
    }
  }, []);

  // Auto-login on mount if token is saved
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (typeof window === 'undefined' || user) return;
      
      const token = localStorage.getItem('pixelPlaceAuthToken');
      const savedUsername = localStorage.getItem('pixelPlaceSavedUsername');
      
      if (token && savedUsername) {
        try {
          // Verify token
          const response = await fetch('/api/auth', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          });

          const data = await response.json();

          if (response.ok && data.success && data.user) {
            setUser(data.user);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('pixelPlaceAuthToken');
            localStorage.removeItem('pixelPlaceSavedUsername');
          }
        } catch (error) {
          // Clear token on error
          localStorage.removeItem('pixelPlaceAuthToken');
          localStorage.removeItem('pixelPlaceSavedUsername');
        }
      }
    };

    attemptAutoLogin();
  }, []); // Only run once on mount

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string; ban?: any }> => {
    if (!username || !password) {
      return { success: false, message: 'Enter username and password.' };
    }

    try {
      // Check if user is banned (still check from storage for now)
      const isBanned = await isUserBanned(username);
      if (isBanned) {
        const ban = await getBanForUser(username);
        return { success: false, message: 'This account has been banned. Please contact an administrator.', ban: ban || undefined };
      }

      // Use new JWT authentication API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, action: 'login' }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, message: data.error || 'Login failed' };
      }

      // Save token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem('pixelPlaceAuthToken', data.token);
        localStorage.setItem('pixelPlaceSavedUsername', username);
      }

      setUser(data.user);
      return { success: true, message: '' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const createAccount = async (username: string, password: string, gender: string): Promise<{ success: boolean; message: string }> => {
    if (!username || !password) {
      return { success: false, message: 'Username and password are required.' };
    }

    try {
      // Check if username is banned
      const isBanned = await isUserBanned(username);
      if (isBanned) {
        return { success: false, message: 'This username is banned and cannot be used.' };
      }

      // Check if admin account
      const isAdmin = ADMIN_ACCOUNTS_LIST.some(a => a.username === username && a.password === password);
      const role = isAdmin ? 'admin' : 'user';
      const coins = role === 'admin' ? 99999 : 0;

      // Use new JWT registration API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password, 
          action: 'register',
          gender: gender || 'N/A',
          role,
          coins,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, message: data.error || 'Registration failed' };
      }

      // Save token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem('pixelPlaceAuthToken', data.token);
        localStorage.setItem('pixelPlaceSavedUsername', username);
      }

      setUser(data.user);
      return { success: true, message: 'Account created! You are now signed in.' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    const users = await getUsers();
    const index = users.findIndex(u => u.username === user.username);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await saveUsers(users);
    }
  };

  const logout = () => {
    setUser(null);
    // Clear saved credentials and token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pixelPlaceAuthToken');
      localStorage.removeItem('pixelPlaceSavedUsername');
      localStorage.removeItem('pixelPlaceSavedPassword');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, createAccount, updateUser, logout }}>
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




