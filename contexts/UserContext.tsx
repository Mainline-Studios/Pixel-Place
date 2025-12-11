'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { initializeStorage, getUsers, saveUsers, ADMIN_ACCOUNTS_LIST, isUserBanned, getBanForUser } from '@/lib/storage';

interface UserContextType {
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
    initializeStorage();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    if (!username || !password) {
      return { success: false, message: 'Enter username and password.' };
    }

    // Check if user is banned
    const isBanned = await isUserBanned(username);
    if (isBanned) {
      const ban = await getBanForUser(username);
      return { success: false, message: 'This account has been banned. Please contact an administrator.', ban: ban || undefined };
    }

    let users = await getUsers();
    let found = users.find(x => x.username === username);

    // Auto-create admin if not found but matches admin list
    if (!found) {
      const isAdmin = ADMIN_ACCOUNTS_LIST.some(a => a.username === username && a.password === password);
      if (isAdmin) {
        found = {
          username,
          password,
          gender: 'N/A',
          role: 'admin',
          coins: 99999,
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

    if (found.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    setUser(found);
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
    const coins = role === 'admin' ? 99999 : 0; // Users start with 0 coins

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

    return { success: true, message: 'Account created! You can sign in now.' };
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




