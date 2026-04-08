export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, setDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { requireAuth } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { User } from '@/types';

/** Normalize equipped_accessories from Firestore (can be object or array). */
function normalizeEquippedAccessories(val: unknown): string[] | Record<string, string> {
  if (val == null) return {};
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return val as Record<string, string>;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? parsed : {});
    } catch { return {}; }
  }
  return {};
}

/** Never expose password/hash to client. */
function userFromDoc(doc: any): User {
  return {
    username: doc.username || doc.id,
    password: '',
    gender: doc.gender || '',
    role: (doc.role || 'user') as 'admin' | 'user' | 'head_admin',
    coins: doc.coins || 0,
    ownedSkins: Array.isArray(doc.owned_skins) ? doc.owned_skins : (typeof doc.owned_skins === 'string' ? JSON.parse(doc.owned_skins || '[]') : []),
    equippedSkin: doc.equipped_skin || '',
    ownedAccessories: Array.isArray(doc.owned_accessories) ? doc.owned_accessories : (typeof doc.owned_accessories === 'string' ? JSON.parse(doc.owned_accessories || '[]') : []),
    equippedAccessories: normalizeEquippedAccessories(doc.equipped_accessories),
    ownedServers: Array.isArray(doc.owned_servers) ? doc.owned_servers : (typeof doc.owned_servers === 'string' ? JSON.parse(doc.owned_servers || '[]') : []),
    friends: Array.isArray(doc.friends) ? doc.friends : (typeof doc.friends === 'string' ? JSON.parse(doc.friends || '[]') : []),
    friendRequests: Array.isArray(doc.friend_requests) ? doc.friend_requests : (typeof doc.friend_requests === 'string' ? JSON.parse(doc.friend_requests || '[]') : []),
    sentFriendRequests: Array.isArray(doc.sent_friend_requests) ? doc.sent_friend_requests : (typeof doc.sent_friend_requests === 'string' ? JSON.parse(doc.sent_friend_requests || '[]') : []),
  };
}

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  try {
    const users = await getDocuments(COLLECTIONS.USERS);
    return NextResponse.json(users.map(userFromDoc));
  } catch (error) {
    console.error('Error reading users:', error);
    return NextResponse.json({ error: 'Failed to read users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  try {
    const newUser: User = await request.json();
    const targetLower = (newUser.username || '').toLowerCase();
    const callerIsAdmin = authResult.user.role === 'admin' || authResult.user.role === 'head_admin';
    const selfOnly = targetLower === authResult.user.username.toLowerCase();
    if (!selfOnly && !callerIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Check if user exists (case-insensitive)
    const existingUsers = await queryDocuments(COLLECTIONS.USERS, 'username_lower', '==', newUser.username.toLowerCase());
    const existing = existingUsers.length > 0 ? existingUsers[0] : null;
    
    if (existing) {
      // Update existing user — never store raw password; hash only when new password provided
      const existingUser = userFromDoc(existing);
      const updatedUser = {
        ...existingUser,
        ...newUser,
        friends: newUser.friends !== undefined ? newUser.friends : existingUser.friends,
        ownedSkins: newUser.ownedSkins !== undefined ? newUser.ownedSkins : existingUser.ownedSkins,
        ownedAccessories: newUser.ownedAccessories !== undefined ? newUser.ownedAccessories : existingUser.ownedAccessories,
        sentFriendRequests: newUser.sentFriendRequests !== undefined ? newUser.sentFriendRequests : existingUser.sentFriendRequests
      };
      if (!callerIsAdmin) {
        updatedUser.role = existingUser.role;
        updatedUser.coins = existingUser.coins;
      }
      const newPasswordPlain = typeof newUser.password === 'string' && newUser.password.length > 0 ? newUser.password : null;
      const password_hash = newPasswordPlain ? await hashPassword(newPasswordPlain) : (existing.password_hash || existing.password || '');
      
      await setDocument(COLLECTIONS.USERS, existing.id, {
        username: updatedUser.username,
        username_lower: updatedUser.username.toLowerCase(),
        password_hash,
        gender: updatedUser.gender,
        role: updatedUser.role,
        coins: updatedUser.coins,
        owned_skins: updatedUser.ownedSkins || [],
        equipped_skin: updatedUser.equippedSkin || '',
        owned_accessories: updatedUser.ownedAccessories || [],
        equipped_accessories: updatedUser.equippedAccessories || [],
        owned_servers: updatedUser.ownedServers || [],
        friends: updatedUser.friends || [],
        friend_requests: updatedUser.friendRequests || [],
        sent_friend_requests: updatedUser.sentFriendRequests || [],
        is_donor: updatedUser.role === 'admin' ? 1 : 0,
        updated_at: Date.now()
      });
      
      const outUser = { ...updatedUser, password: '' };
      return NextResponse.json(outUser);
    } else {
      // Create new user — always hash password
      if (!newUser.password || String(newUser.password).length < 6) {
        return NextResponse.json({ error: 'Password required (min 6 characters)' }, { status: 400 });
      }
      const password_hash = await hashPassword(newUser.password);
      const userData = {
        username: newUser.username,
        username_lower: newUser.username.toLowerCase(),
        password_hash,
        gender: newUser.gender || '',
        role: callerIsAdmin ? (newUser.role || 'user') : 'user',
        coins: callerIsAdmin ? (newUser.coins || 0) : 0,
        owned_skins: newUser.ownedSkins || [],
        equipped_skin: newUser.equippedSkin || '',
        owned_accessories: newUser.ownedAccessories || [],
        equipped_accessories: newUser.equippedAccessories || [],
        owned_servers: newUser.ownedServers || [],
        friends: newUser.friends || [],
        friend_requests: newUser.friendRequests || [],
        sent_friend_requests: newUser.sentFriendRequests || [],
        is_donor: (newUser.role === 'admin' || newUser.role === 'head_admin') ? 1 : 0,
        created_at: Date.now(),
        updated_at: Date.now()
      };
      
      await setDocument(COLLECTIONS.USERS, newUser.username.toLowerCase(), userData);      
      const createdUser = {
        ...newUser,
        password: '',
        friends: newUser.friends || [],
        ownedSkins: newUser.ownedSkins || [],
        ownedAccessories: newUser.ownedAccessories || []
      };
      
      return NextResponse.json(createdUser);
    }
  } catch (error: any) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  try {
    const updatedUser: User = await request.json();
    const targetLower = (updatedUser.username || '').toLowerCase();
    const callerIsAdmin = authResult.user.role === 'admin' || authResult.user.role === 'head_admin';
    const selfOnly = targetLower === authResult.user.username.toLowerCase();
    if (!selfOnly && !callerIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const existingUsers = await queryDocuments(COLLECTIONS.USERS, 'username_lower', '==', updatedUser.username.toLowerCase());
    if (existingUsers.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const existing = existingUsers[0];
    const existingUser = userFromDoc(existing);
    if (!callerIsAdmin) {
      updatedUser.role = existingUser.role;
      updatedUser.coins = existingUser.coins;
    }
    const newPasswordPlain = typeof updatedUser.password === 'string' && updatedUser.password.length > 0 ? updatedUser.password : null;
    const password_hash = newPasswordPlain ? await hashPassword(newPasswordPlain) : (existing.password_hash || existing.password || '');
    
    await setDocument(COLLECTIONS.USERS, existing.id, {
      username: updatedUser.username,
      username_lower: updatedUser.username.toLowerCase(),
      password_hash,
      gender: updatedUser.gender,
      role: updatedUser.role,
      coins: updatedUser.coins,
      owned_skins: updatedUser.ownedSkins || [],
      equipped_skin: updatedUser.equippedSkin || '',
      owned_accessories: updatedUser.ownedAccessories || [],
      equipped_accessories: updatedUser.equippedAccessories || [],
      owned_servers: updatedUser.ownedServers || [],
      friends: updatedUser.friends || [],
      friend_requests: updatedUser.friendRequests || [],
      sent_friend_requests: updatedUser.sentFriendRequests || [],
      is_donor: (updatedUser.role === 'admin' || updatedUser.role === 'head_admin') ? 1 : 0,
      updated_at: Date.now()
    });
    const outUser = { ...updatedUser, password: '' };
    return NextResponse.json(outUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}




