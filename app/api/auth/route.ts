import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { authenticateUser, createOrUpdateUser, getUserFromDb } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { User } from '@/types';

// Login endpoint

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function readUsersFromFile(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function findUserInFile(username: string): Promise<User | null> {
  const users = await readUsersFromFile();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, action } = await request.json();
    
    if (action === 'login') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }
      
      // Check JSON file first, then database
      let userFromFile = await findUserInFile(username);
      
      // Check if this is an admin account that needs to be created
      const { ADMIN_ACCOUNTS_LIST } = await import('@/lib/storage');
      const isAdmin = ADMIN_ACCOUNTS_LIST.some(a => a.username === username && a.password === password);
      
      if (isAdmin) {
        const existing = userFromFile || getUserFromDb(username);
        if (!existing) {
          // Auto-create admin account
          const adminUser: User = {
            username,
            password: '',
            gender: 'N/A',
            role: 'admin',
            coins: 99999,
            ownedSkins: ['starter_classic'],
            equippedSkin: 'starter_classic',
            ownedAccessories: [],
            equippedAccessories: [],
            ownedServers: [],
            friends: [],
            friendRequests: [],
            sentFriendRequests: [],
            isDonor: false,
          };
          await createOrUpdateUser(adminUser, password);
        }
      }
      
      // Check JSON file first
      if (userFromFile) {
        // Verify password from JSON file
        if (userFromFile.password === password) {
          // Password matches, create token
          const { generateToken } = await import('@/lib/auth');
          const authUser = {
            id: 0,
            username: userFromFile.username,
            role: userFromFile.role,
            coins: userFromFile.coins,
            equippedSkin: userFromFile.equippedSkin,
            ownedSkins: userFromFile.ownedSkins,
            ownedAccessories: userFromFile.ownedAccessories || [],
            equippedAccessories: userFromFile.equippedAccessories || [],
            ownedServers: userFromFile.ownedServers || [],
            friends: userFromFile.friends || [],
            isDonor: userFromFile.isDonor || false,
          };
          const token = generateToken(authUser);
          return NextResponse.json({
            success: true,
            user: { ...userFromFile, password: '' },
            token: token,
          });
        }
      }
      
      // Fallback to database authentication
      const result = await authenticateUser(username, password);
      if (!result) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      
      return NextResponse.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    }
    
    if (action === 'register') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }
      
      // Check if user exists
      const existing = getUserFromDb(username);
      if (existing) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
      
      const { gender, role, coins } = await request.json();
      
      // Create new user
      const newUser: User = {
        username,
        password: '', // Will be hashed
        gender: gender || '',
        role: role || 'user',
        coins: coins !== undefined ? coins : (role === 'admin' ? 99999 : 0),
        ownedSkins: ['starter_classic'],
        equippedSkin: 'starter_classic',
        ownedAccessories: [],
        equippedAccessories: [],
        ownedServers: [],
        friends: [],
        friendRequests: [],
        sentFriendRequests: [],
        isDonor: false,
      };
      
      await createOrUpdateUser(newUser, password);
      
      // Login the new user
      const result = await authenticateUser(username, password);
      if (!result) {
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}

// Verify token endpoint
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const { verifyToken, getUserByIdFromDb } = await import('@/lib/auth');
    const authUser = verifyToken(token);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const user = getUserByIdFromDb(authUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Token verification failed' }, { status: 500 });
  }
}
