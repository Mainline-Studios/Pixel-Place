import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { createOrUpdateUser, getUserFromDb, getUserByIdFromDb } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { User } from '@/types';

// Get all users (admin only)
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  if (authResult.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users');
    const rows = stmt.all() as any[];
    
    const users = rows.map(row => ({
      username: row.username,
      password: '', // Never return passwords
      gender: row.gender || '',
      role: row.role || 'user',
      coins: row.coins || 0,
      ownedSkins: JSON.parse(row.owned_skins || '[]'),
      equippedSkin: row.equipped_skin || '',
      ownedAccessories: JSON.parse(row.owned_accessories || '[]'),
      equippedAccessories: JSON.parse(row.equipped_accessories || '[]'),
      ownedServers: JSON.parse(row.owned_servers || '[]'),
      friends: JSON.parse(row.friends || '[]'),
      friendRequests: JSON.parse(row.friend_requests || '[]'),
      sentFriendRequests: JSON.parse(row.sent_friend_requests || '[]'),
      isDonor: row.is_donor === 1,
    }));
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error reading users:', error);
    return NextResponse.json({ error: 'Failed to read users' }, { status: 500 });
  }
}

// Create or update user (requires auth)
export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  try {
    const userData: User = await request.json();
    
    // Users can only update themselves unless admin
    if (authResult.user.username !== userData.username && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await createOrUpdateUser(userData);
    const user = getUserFromDb(userData.username);
    
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: error.message || 'Failed to create/update user' }, { status: 500 });
  }
}

// Update user (requires auth)
export async function PUT(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  try {
    const updatedUser: User = await request.json();
    
    // Users can only update themselves unless admin
    if (authResult.user.username !== updatedUser.username && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await createOrUpdateUser(updatedUser);
    const user = getUserFromDb(updatedUser.username);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}
