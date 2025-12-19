import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createOrUpdateUser, getUserFromDb } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { User } from '@/types';

// Login endpoint
export async function POST(request: NextRequest) {
  try {
    const { username, password, action } = await request.json();
    
    if (action === 'login') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }
      
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
