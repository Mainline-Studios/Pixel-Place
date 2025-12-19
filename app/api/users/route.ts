import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { createOrUpdateUser, getUserFromDb, getUserByIdFromDb } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { User } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Read users from JSON file (primary source)
async function readUsersFromFile(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty array
    return [];
  }
}

// Write users to JSON file (primary storage)
async function writeUsersToFile(users: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// Sync to database (backup)
async function syncToDatabase(users: User[]): Promise<void> {
  try {
    const db = getDb();
    for (const user of users) {
      try {
        await createOrUpdateUser(user, user.password || undefined);
      } catch (e) {
        // Skip if password missing or other error
      }
    }
  } catch (e) {
    // Database sync is optional
  }
}

// Get all users (admin only)
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  if (authResult.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    // Read from JSON file (primary source)
    let users = await readUsersFromFile();
    
    // If JSON is empty, try database
    if (users.length === 0) {
      const db = getDb();
      const stmt = db.prepare('SELECT * FROM users');
      const rows = stmt.all() as any[];
      
      users = rows.map(row => ({
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
    }
    
    // Sanitize passwords
    users.forEach(u => { u.password = ''; });
    
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
    
    // Read existing users from JSON
    const users = await readUsersFromFile();
    
    // Find and update or add user
    const index = users.findIndex(u => u.username.toLowerCase() === userData.username.toLowerCase());
    if (index !== -1) {
      users[index] = userData;
    } else {
      users.push(userData);
    }
    
    // Write to JSON file (primary storage)
    await writeUsersToFile(users);
    
    // Sync to database (backup)
    await syncToDatabase(users);
    
    // Return user without password
    const returnUser = { ...userData, password: '' };
    return NextResponse.json(returnUser);
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
    
    // Read existing users from JSON
    const users = await readUsersFromFile();
    
    const index = users.findIndex(u => u.username.toLowerCase() === updatedUser.username.toLowerCase());
    if (index === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    users[index] = updatedUser;
    
    // Write to JSON file (primary storage)
    await writeUsersToFile(users);
    
    // Sync to database (backup)
    await syncToDatabase(users);
    
    // Return user without password
    const returnUser = { ...updatedUser, password: '' };
    return NextResponse.json(returnUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}
