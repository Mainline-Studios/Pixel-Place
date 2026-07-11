export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createOrUpdateUser, getUserFromDb } from '@/lib/auth';
import { getAdminAccounts, getHeadAdminUsernames } from '@/lib/adminAccounts';
import { isDeviceBanned, recordDevice } from '@/lib/hardwareBans';
import { COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';
import { User } from '@/types';

const UNIVERSAL_COIN_GRANT = 10_000_000_000;
const UNIVERSAL_COIN_GRANT_FLAG = 'universal_coin_grant_v1';

async function applyUniversalCoinGrant(usernameLower: string): Promise<Partial<User>> {
  const doc = await getDocument(COLLECTIONS.USERS, usernameLower);
  if (!doc) return { coins: UNIVERSAL_COIN_GRANT, emailVerified: true };
  const patch: Record<string, unknown> = {
    coins: UNIVERSAL_COIN_GRANT,
    [UNIVERSAL_COIN_GRANT_FLAG]: true,
    founder_lifetime_coins: false,
    founder_celebration_pending: false,
    founder_ordinal: null,
    updated_at: Date.now(),
  };
  await setDocument(COLLECTIONS.USERS, usernameLower, patch);
  return {
    coins: UNIVERSAL_COIN_GRANT,
    founderLifetimeCoins: false,
    founderOrdinal: undefined,
    showFounderCelebration: false,
    emailVerified: true,
  };
}

// Login / Register — parse body once (AuthN)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password, action, gender, role, coins, deviceId, deviceLabel } = body as {
      username?: string; password?: string; action?: string;
      gender?: string; role?: string; coins?: number;
      deviceId?: string; deviceLabel?: string;
    };

    if (action === 'login') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }
      if (deviceId && (await isDeviceBanned(deviceId))) {
        return NextResponse.json(
          { error: 'This device is banned. You cannot sign in.' },
          { status: 401 }
        );
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
            coins: UNIVERSAL_COIN_GRANT,
            ownedSkins: ['pixel_placer'],
            equippedSkin: 'pixel_placer',
            ownedAccessories: [],
            equippedAccessories: [],
            ownedServers: [],
            friends: [],
            friendRequests: [],
            sentFriendRequests: [],
            isDonor: false,
            emailVerified: true,
          };
          await createOrUpdateUser(adminUser, password);
        }
      }
      
      // Authenticate using Firebase
      const result = await authenticateUser(username, password);
      if (!result) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      if (deviceId) {
        await recordDevice(username, deviceId, deviceLabel || 'Unknown');
      }
      const grant = await applyUniversalCoinGrant(username.toLowerCase());
      return NextResponse.json({
        success: true,
        user: { ...result.user, ...grant, emailVerified: true },
        token: result.token,
        emailVerified: true,
      });
    }
    
    if (action === 'register') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }
      if (String(password).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      if (deviceId && (await isDeviceBanned(deviceId))) {
        return NextResponse.json(
          { error: 'This device is banned. You cannot create new accounts from this device.' },
          { status: 400 }
        );
      }
      
      // Check if user exists
      const existing = await getUserFromDb(username);
      if (existing) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }

      // Create new user (AuthZ: never trust client for role — new signups are always 'user')
      const newUser: User = {
        username,
        password: '',
        gender: gender || '',
        role: 'user',
        coins: UNIVERSAL_COIN_GRANT,
        ownedSkins: ['pixel_placer'],
        equippedSkin: 'pixel_placer',
        ownedAccessories: [],
        equippedAccessories: [],
        ownedServers: [],
        friends: [],
        friendRequests: [],
        sentFriendRequests: [],
        isDonor: false,
        emailVerified: true,
        setupCompleted: false,
      };
      await createOrUpdateUser(newUser, password);
      const result = await authenticateUser(username, password);
      if (!result) {
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
      }
      if (deviceId) {
        await recordDevice(username, deviceId, deviceLabel || 'Unknown');
      }
      const grant = await applyUniversalCoinGrant(username.toLowerCase());
      return NextResponse.json({
        success: true,
        user: { ...result.user, ...grant, emailVerified: true, setupCompleted: false },
        token: result.token,
        emailVerified: true,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
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

    return NextResponse.json({ success: true, user: { ...user, emailVerified: true } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Token verification failed' }, { status: 500 });
  }
}
