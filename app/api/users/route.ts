import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { User } from '@/types';
import { hashPassword, verifyPassword } from '@/lib/auth';

function userFromRow(row: any): User {
  // Parse equippedAccessories - it can be an object or array, normalize to object
  let equippedAccessories: any = {};
  try {
    const parsed = JSON.parse(row.equipped_accessories || '{}');
    if (Array.isArray(parsed)) {
      // Convert array to object if needed (legacy format)
      equippedAccessories = {};
    } else if (parsed && typeof parsed === 'object') {
      equippedAccessories = parsed;
    }
  } catch {
    equippedAccessories = {};
  }
  
  return {
    username: row.username,
    password: row.password_hash, // Note: In production, never return password hashes
    gender: row.gender || '',
    role: (row.role || 'user') as 'admin' | 'user',
    coins: row.coins || 0,
    ownedSkins: JSON.parse(row.owned_skins || '[]'),
    equippedSkin: row.equipped_skin || 'starter_classic',
    ownedAccessories: JSON.parse(row.owned_accessories || '[]'),
    equippedAccessories: equippedAccessories,
    ownedServers: JSON.parse(row.owned_servers || '[]'),
    friends: JSON.parse(row.friends || '[]'),
    friendRequests: JSON.parse(row.friend_requests || '[]'),
    sentFriendRequests: JSON.parse(row.sent_friend_requests || '[]')
  };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM users').all();
    const users = rows.map(userFromRow);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error reading users:', error);
    return NextResponse.json({ error: 'Failed to read users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const newUser: User = await request.json();
    
    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(newUser.username);
    
    if (existing) {
      // Update existing user - properly merge all fields
      const existingUser = userFromRow(existing);
      const updatedUser = {
        ...existingUser,
        ...newUser,
        // Always preserve arrays - merge if provided, keep existing if not
        friends: newUser.friends !== undefined ? newUser.friends : (existingUser.friends || []),
        ownedSkins: newUser.ownedSkins !== undefined ? newUser.ownedSkins : (existingUser.ownedSkins || []),
        ownedAccessories: newUser.ownedAccessories !== undefined ? newUser.ownedAccessories : (existingUser.ownedAccessories || []),
        equippedAccessories: newUser.equippedAccessories !== undefined ? newUser.equippedAccessories : (existingUser.equippedAccessories || {}),
        sentFriendRequests: newUser.sentFriendRequests !== undefined ? newUser.sentFriendRequests : (existingUser.sentFriendRequests || []),
        friendRequests: newUser.friendRequests !== undefined ? newUser.friendRequests : (existingUser.friendRequests || []),
        ownedServers: newUser.ownedServers !== undefined ? newUser.ownedServers : (existingUser.ownedServers || []),
        // Preserve password if not being updated
        password: newUser.password || existingUser.password,
        // Preserve other important fields
        gender: newUser.gender !== undefined ? newUser.gender : existingUser.gender,
        role: newUser.role !== undefined ? newUser.role : existingUser.role,
        equippedSkin: newUser.equippedSkin !== undefined ? newUser.equippedSkin : existingUser.equippedSkin,
        coins: newUser.coins !== undefined ? newUser.coins : existingUser.coins
      };
      
      // Hash password if it's provided and not already hashed
      let passwordHash = updatedUser.password;
      if (passwordHash && !passwordHash.startsWith('$2a$') && !passwordHash.startsWith('$2b$') && !passwordHash.startsWith('$2y$')) {
        passwordHash = await hashPassword(passwordHash);
      }
      
      db.prepare(`
        UPDATE users SET
          password_hash = ?,
          gender = ?,
          role = ?,
          coins = ?,
          owned_skins = ?,
          equipped_skin = ?,
          owned_accessories = ?,
          equipped_accessories = ?,
          owned_servers = ?,
          friends = ?,
          friend_requests = ?,
          sent_friend_requests = ?,
          is_donor = ?,
          updated_at = strftime('%s', 'now')
        WHERE id = ?
      `).run(
        passwordHash,
        updatedUser.gender,
        updatedUser.role,
        updatedUser.coins,
        JSON.stringify(updatedUser.ownedSkins || []),
        updatedUser.equippedSkin || '',
        JSON.stringify(updatedUser.ownedAccessories || []),
        JSON.stringify(updatedUser.equippedAccessories || []),
        JSON.stringify(updatedUser.ownedServers || []),
        JSON.stringify(updatedUser.friends || []),
        JSON.stringify(updatedUser.friendRequests || []),
        JSON.stringify(updatedUser.sentFriendRequests || []),
        updatedUser.role === 'admin' ? 1 : 0,
        existing.id
      );
      
      return NextResponse.json(updatedUser);
    } else {
      // Create new user - hash password if not already hashed
      let passwordHash = newUser.password;
      if (passwordHash && !passwordHash.startsWith('$2a$') && !passwordHash.startsWith('$2b$') && !passwordHash.startsWith('$2y$')) {
        passwordHash = await hashPassword(passwordHash);
      }
      
      const result = db.prepare(`
        INSERT INTO users (
          username, password_hash, gender, role, coins, owned_skins, equipped_skin,
          owned_accessories, equipped_accessories, owned_servers, friends,
          friend_requests, sent_friend_requests, is_donor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newUser.username,
        passwordHash,
        newUser.gender || '',
        newUser.role || 'user',
        newUser.coins || 0,
        JSON.stringify(newUser.ownedSkins || []),
        newUser.equippedSkin || '',
        JSON.stringify(newUser.ownedAccessories || []),
        JSON.stringify(newUser.equippedAccessories || []),
        JSON.stringify(newUser.ownedServers || []),
        JSON.stringify(newUser.friends || []),
        JSON.stringify(newUser.friendRequests || []),
        JSON.stringify(newUser.sentFriendRequests || []),
        newUser.role === 'admin' ? 1 : 0
      );
      
      const createdUser = {
        ...newUser,
        friends: newUser.friends || [],
        ownedSkins: newUser.ownedSkins || [],
        ownedAccessories: newUser.ownedAccessories || []
      };
      
      return NextResponse.json(createdUser);
    }
  } catch (error: any) {
    console.error('Error creating/updating user:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const updatedUser: User = await request.json();
    
    const existing = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(updatedUser.username);
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Hash password if it's provided and not already hashed
    let passwordHash = updatedUser.password;
    if (passwordHash && !passwordHash.startsWith('$2a$') && !passwordHash.startsWith('$2b$') && !passwordHash.startsWith('$2y$')) {
      passwordHash = await hashPassword(passwordHash);
    }
    
    db.prepare(`
      UPDATE users SET
        password_hash = ?,
        gender = ?,
        role = ?,
        coins = ?,
        owned_skins = ?,
        equipped_skin = ?,
        owned_accessories = ?,
        equipped_accessories = ?,
        owned_servers = ?,
        friends = ?,
        friend_requests = ?,
        sent_friend_requests = ?,
        is_donor = ?,
        updated_at = strftime('%s', 'now')
      WHERE id = ?
    `).run(
      passwordHash,
      updatedUser.gender,
      updatedUser.role,
      updatedUser.coins,
      JSON.stringify(updatedUser.ownedSkins || []),
      updatedUser.equippedSkin || '',
      JSON.stringify(updatedUser.ownedAccessories || []),
      JSON.stringify(updatedUser.equippedAccessories || []),
      JSON.stringify(updatedUser.ownedServers || []),
      JSON.stringify(updatedUser.friends || []),
      JSON.stringify(updatedUser.friendRequests || []),
      JSON.stringify(updatedUser.sentFriendRequests || []),
      updatedUser.role === 'admin' ? 1 : 0,
      existing.id
    );
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}




