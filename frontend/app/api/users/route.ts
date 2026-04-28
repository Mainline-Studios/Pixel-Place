import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, setDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { User } from '@/types';
import {
  getAllUsersFromSqlite,
  mergeUserLists,
  upsertUserToSqlite,
} from '@/lib/sqliteUserStore';

function parseMaybeJsonArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function parseEquippedAccessories(value: unknown): string[] | Record<string, string> {
  if (Array.isArray(value)) return value as string[];
  if (value && typeof value === 'object') return value as Record<string, string>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return parsed as Record<string, string>;
    } catch { /* ignore */ }
  }
  return [];
}

function userFromDoc(doc: any): User {
  return {
    username: doc.username || doc.id,
    password: doc.password_hash || doc.password || '',
    gender: doc.gender || '',
    role: (doc.role || 'user') as User['role'],
    coins: doc.coins || 0,
    safetyPoints: typeof doc.safety_points === 'number' ? doc.safety_points : undefined,
    ownedSkins: parseMaybeJsonArray<string>(doc.owned_skins, []),
    equippedSkin: doc.equipped_skin || '',
    ownedFaces: parseMaybeJsonArray<string>(doc.owned_faces, []),
    equippedFace: doc.equipped_face || undefined,
    ownedAccessories: parseMaybeJsonArray<string>(doc.owned_accessories, []),
    equippedAccessories: parseEquippedAccessories(doc.equipped_accessories),
    ownedServers: parseMaybeJsonArray<string>(doc.owned_servers, []),
    friends: parseMaybeJsonArray<string>(doc.friends, []),
    friendRequests: parseMaybeJsonArray(doc.friend_requests, []),
    sentFriendRequests: parseMaybeJsonArray<string>(doc.sent_friend_requests, []),
    locale: typeof doc.locale === 'string' ? doc.locale : undefined,
    shadowBanned: doc.shadow_banned === true,
    chatMutedUntil: typeof doc.chat_muted_until === 'number' ? doc.chat_muted_until : undefined,
    chatViolationScore:
      typeof doc.chat_violation_score === 'number' ? doc.chat_violation_score : undefined,
    lastIpHash: typeof doc.last_ip_hash === 'string' ? doc.last_ip_hash : undefined
  };
}

export async function GET() {
  try {
    const cloudDocs = await getDocuments(COLLECTIONS.USERS);
    const fromCloud = cloudDocs.map(userFromDoc);
    const fromSqlite = getAllUsersFromSqlite();
    // SQLite is the reliable local store when Firebase Admin is not configured; cloud overwrites on conflicts.
    const merged = mergeUserLists(fromSqlite, fromCloud);
    return NextResponse.json(merged);
  } catch (error) {
    console.error('Error reading users:', error);
    try {
      return NextResponse.json(getAllUsersFromSqlite());
    } catch {
      return NextResponse.json({ error: 'Failed to read users' }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const newUser: User = await request.json();

    // Check if user exists (case-insensitive)
    const existingUsers = await queryDocuments(COLLECTIONS.USERS, 'username_lower', '==', newUser.username.toLowerCase());
    const existing = existingUsers.length > 0 ? existingUsers[0] : null;

    if (existing) {
      // Update existing user
      const existingUser = userFromDoc(existing);
      const updatedUser = {
        ...existingUser,
        ...newUser,
        friends: newUser.friends !== undefined ? newUser.friends : existingUser.friends,
        ownedSkins: newUser.ownedSkins !== undefined ? newUser.ownedSkins : existingUser.ownedSkins,
        ownedFaces: newUser.ownedFaces !== undefined ? newUser.ownedFaces : existingUser.ownedFaces,
        equippedFace: newUser.equippedFace !== undefined ? newUser.equippedFace : existingUser.equippedFace,
        ownedAccessories: newUser.ownedAccessories !== undefined ? newUser.ownedAccessories : existingUser.ownedAccessories,
        equippedAccessories: newUser.equippedAccessories !== undefined ? newUser.equippedAccessories : existingUser.equippedAccessories,
        safetyPoints: newUser.safetyPoints !== undefined ? newUser.safetyPoints : existingUser.safetyPoints,
        sentFriendRequests: newUser.sentFriendRequests !== undefined ? newUser.sentFriendRequests : existingUser.sentFriendRequests,
        locale: newUser.locale !== undefined ? newUser.locale : existingUser.locale
      };

      await setDocument(COLLECTIONS.USERS, existing.id, {
        username: updatedUser.username,
        username_lower: updatedUser.username.toLowerCase(),
        password_hash: updatedUser.password,
        gender: updatedUser.gender,
        role: updatedUser.role,
        coins: updatedUser.coins,
        safety_points: updatedUser.safetyPoints ?? 0,
        owned_skins: updatedUser.ownedSkins || [],
        equipped_skin: updatedUser.equippedSkin || '',
        owned_faces: updatedUser.ownedFaces || [],
        equipped_face: updatedUser.equippedFace || '',
        owned_accessories: updatedUser.ownedAccessories || [],
        equipped_accessories: updatedUser.equippedAccessories || [],
        owned_servers: updatedUser.ownedServers || [],
        friends: updatedUser.friends || [],
        friend_requests: updatedUser.friendRequests || [],
        sent_friend_requests: updatedUser.sentFriendRequests || [],
        is_donor: (updatedUser.role === 'admin' || updatedUser.role === 'head_admin') ? 1 : 0,
        locale: updatedUser.locale || '',
        updated_at: Date.now()
      });

      try {
        await upsertUserToSqlite(updatedUser);
      } catch (e) {
        console.error('SQLite upsert (update user):', e);
      }

      return NextResponse.json(updatedUser);
    } else {
      // Create new user
      const userData = {
        username: newUser.username,
        username_lower: newUser.username.toLowerCase(),
        password_hash: newUser.password,
        gender: newUser.gender || '',
        role: newUser.role || 'user',
        coins: newUser.coins || 0,
        safety_points: newUser.safetyPoints ?? 0,
        owned_skins: newUser.ownedSkins || [],
        equipped_skin: newUser.equippedSkin || '',
        owned_faces: newUser.ownedFaces || [],
        equipped_face: newUser.equippedFace || '',
        owned_accessories: newUser.ownedAccessories || [],
        equipped_accessories: newUser.equippedAccessories || [],
        owned_servers: newUser.ownedServers || [],
        friends: newUser.friends || [],
        friend_requests: newUser.friendRequests || [],
        sent_friend_requests: newUser.sentFriendRequests || [],
        is_donor: (newUser.role === 'admin' || newUser.role === 'head_admin') ? 1 : 0,
        locale: newUser.locale || '',
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await setDocument(COLLECTIONS.USERS, newUser.username.toLowerCase(), userData);
      const createdUser = {
        ...newUser,
        friends: newUser.friends || [],
        ownedSkins: newUser.ownedSkins || [],
        ownedAccessories: newUser.ownedAccessories || []
      };

      try {
        await upsertUserToSqlite(createdUser);
      } catch (e) {
        console.error('SQLite upsert (create user):', e);
      }

      return NextResponse.json(createdUser);
    }
  } catch (error: any) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedUser: User = await request.json();

    const existingUsers = await queryDocuments(COLLECTIONS.USERS, 'username_lower', '==', updatedUser.username.toLowerCase());
    if (existingUsers.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = existingUsers[0];
    const existingUser = userFromDoc(existing);
    const merged: User = {
      ...existingUser,
      ...updatedUser,
      friends: updatedUser.friends !== undefined ? updatedUser.friends : existingUser.friends,
      ownedSkins: updatedUser.ownedSkins !== undefined ? updatedUser.ownedSkins : existingUser.ownedSkins,
      ownedFaces: updatedUser.ownedFaces !== undefined ? updatedUser.ownedFaces : existingUser.ownedFaces,
      equippedFace: updatedUser.equippedFace !== undefined ? updatedUser.equippedFace : existingUser.equippedFace,
      ownedAccessories: updatedUser.ownedAccessories !== undefined ? updatedUser.ownedAccessories : existingUser.ownedAccessories,
      equippedAccessories: updatedUser.equippedAccessories !== undefined ? updatedUser.equippedAccessories : existingUser.equippedAccessories,
      safetyPoints: updatedUser.safetyPoints !== undefined ? updatedUser.safetyPoints : existingUser.safetyPoints,
      sentFriendRequests: updatedUser.sentFriendRequests !== undefined ? updatedUser.sentFriendRequests : existingUser.sentFriendRequests,
      locale: updatedUser.locale !== undefined ? updatedUser.locale : existingUser.locale
    };

    await setDocument(COLLECTIONS.USERS, existing.id, {
      username: merged.username,
      username_lower: merged.username.toLowerCase(),
      password_hash: merged.password,
      gender: merged.gender,
      role: merged.role,
      coins: merged.coins,
      safety_points: merged.safetyPoints ?? 0,
      owned_skins: merged.ownedSkins || [],
      equipped_skin: merged.equippedSkin || '',
      owned_faces: merged.ownedFaces || [],
      equipped_face: merged.equippedFace || '',
      owned_accessories: merged.ownedAccessories || [],
      equipped_accessories: merged.equippedAccessories || [],
      owned_servers: merged.ownedServers || [],
      friends: merged.friends || [],
      friend_requests: merged.friendRequests || [],
      sent_friend_requests: merged.sentFriendRequests || [],
      is_donor: (merged.role === 'admin' || merged.role === 'head_admin') ? 1 : 0,
      locale: merged.locale || '',
      updated_at: Date.now()
    });
    try {
      await upsertUserToSqlite(merged);
    } catch (e) {
      console.error('SQLite upsert (PUT user):', e);
    }
    return NextResponse.json(merged);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}




