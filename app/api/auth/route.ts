export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createOrUpdateUser, getUserFromDb } from '@/lib/auth';
import { getAdminAccounts, getHeadAdminUsernames } from '@/lib/adminAccounts';
import { isDeviceBanned, recordDevice } from '@/lib/hardwareBans';
import { COLLECTIONS, getDocument, getDocuments, setDocument } from '@/lib/firestore';
import { User } from '@/types';

const FOUNDER_LIMIT = 100;
const FOUNDER_COIN_FLOOR = 1_000_000_000;

async function getFounderRank(usernameLower: string): Promise<number | null> {
  const docs = await getDocuments(COLLECTIONS.USERS, (ref) => ref.orderBy('created_at', 'asc').limit(FOUNDER_LIMIT));
  const idx = docs.findIndex((d) => String(d.id || '').toLowerCase() === usernameLower);
  return idx === -1 ? null : idx + 1;
}

async function applyFounderRewardsAndConsumeCelebration(usernameLower: string): Promise<{ show: boolean; userPatch: Partial<User> }> {
  const doc = await getDocument(COLLECTIONS.USERS, usernameLower);
  if (!doc) return { show: false, userPatch: {} };
  const rank = await getFounderRank(usernameLower);
  const qualifies = typeof rank === 'number' && rank >= 1 && rank <= FOUNDER_LIMIT;
  const now = Date.now();
  const patch: Record<string, any> = {};
  let coins = Number(doc.coins || 0);

  if (qualifies) {
    if (doc.founder_lifetime_coins !== true) patch.founder_lifetime_coins = true;
    if (doc.founder_ordinal !== rank) patch.founder_ordinal = rank;
    if (!Number.isFinite(coins) || coins < FOUNDER_COIN_FLOOR) {
      coins = FOUNDER_COIN_FLOOR;
      patch.coins = coins;
    }
    if (doc.founder_celebration_shown_at == null && doc.founder_celebration_pending !== true) {
      patch.founder_celebration_pending = true;
    }
  }

  const shouldShow = (patch.founder_celebration_pending ?? doc.founder_celebration_pending) === true;
  if (shouldShow) {
    patch.founder_celebration_pending = false;
    patch.founder_celebration_shown_at = doc.founder_celebration_shown_at || now;
  }

  if (Object.keys(patch).length) {
    patch.updated_at = now;
    await setDocument(COLLECTIONS.USERS, usernameLower, patch);
  }

  const userPatch: Partial<User> = {
    founderLifetimeCoins: qualifies ? true : !!doc.founder_lifetime_coins,
    founderOrdinal: qualifies ? rank! : doc.founder_ordinal,
    showFounderCelebration: shouldShow,
  };
  if (patch.coins !== undefined) {
    userPatch.coins = coins;
  }
  return { show: shouldShow, userPatch };
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
            coins: 99999,
            ownedSkins: ['pixel_placer'],
            equippedSkin: 'pixel_placer',
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
      if (deviceId) {
        await recordDevice(username, deviceId, deviceLabel || 'Unknown');
      }
      const founder = await applyFounderRewardsAndConsumeCelebration(username.toLowerCase());
      return NextResponse.json({
        success: true,
        user: { ...result.user, ...founder.userPatch },
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
        password: '', // Will be hashed
        gender: gender || '',
        role: 'user',
        coins: 10,
        ownedSkins: ['pixel_placer'],
        equippedSkin: 'pixel_placer',
        ownedAccessories: [],
        equippedAccessories: [],
        ownedServers: [],
        friends: [],
        friendRequests: [],
        sentFriendRequests: [],
        isDonor: false,
        setupCompleted: false,
      };
      
      await createOrUpdateUser(newUser, password);
      
      // Login the new user
      const result = await authenticateUser(username, password);
      if (!result) {
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
      }
      if (deviceId) {
        await recordDevice(username, deviceId, deviceLabel || 'Unknown');
      }
      const founder = await applyFounderRewardsAndConsumeCelebration(username.toLowerCase());
      return NextResponse.json({
        success: true,
        user: { ...result.user, ...founder.userPatch, setupCompleted: false },
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
