import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createOrUpdateUser, getUserFromDb } from '@/lib/auth';
import { getAdminAccounts, getHeadAdminUsernames } from '@/lib/adminAccounts';
import { User } from '@/types';

// Login / Register — parse body once (AuthN)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password, action, gender, role, coins } = body as {
      username?: string; password?: string; action?: string;
      gender?: string; role?: string; coins?: number;
    };

    if (action === 'login') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }
      
      // Check if this is an admin account that needs to be created (server-only from env)
      const adminAccounts = getAdminAccounts();
      const headAdmins = getHeadAdminUsernames();
      const isAdmin = adminAccounts.some(a => a.username === username && a.password === password);
      const isHeadAdmin = isAdmin && headAdmins.includes(username);
      
      if (isAdmin) {
        const existing = await getUserFromDb(username);
        if (!existing) {
          // Auto-create admin account
          const adminUser: User = {
            username,
            password: '',
            gender: 'N/A',
            role: isHeadAdmin ? 'head_admin' : 'admin',
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
      
      // Authenticate using Firebase
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
      if (String(password).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      
      // Check if user exists
      const existing = await getUserFromDb(username);
      if (existing) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }

      // Create new user (AuthZ: never trust client for role — new signups are always 'user')
      const newUser: User = {
        username,
        password: '', // Will be hashed
        gender: gender || '',
        role: 'user',
        coins: 10,
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
    const { verifyToken, getUserFromDb } = await import('@/lib/auth');
    const authUser = verifyToken(token);

    if (!authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await getUserFromDb(authUser.username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Token verification failed' }, { status: 500 });
  }
}
