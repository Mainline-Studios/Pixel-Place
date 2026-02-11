import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocuments, deleteDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
=======
import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/types';
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

// Current admin accounts (must match lib/storage.ts)
const ADMIN_ACCOUNTS_LIST = [
  { username: "admin", password: "extra" },
  { username: "TicTAK", password: "Thomas" },
  { username: "IDon'tKnow", password: "Titan" },
  { username: "6767kid", password: "67676767" },
  { username: "Billibob", password: "Luca" },
  { username: "Daniello1", password: "Daniel" },
  { username: "FunBoy", password: "Simon" },
  { username: "BelloBoy1", password: "Zac" },
  { username: "Bob", password: "Henry" },
  { username: "Mr.Noob", password: "Tyson" },
  { username: "BDawgsAwesome1", password: "20Minecraft15" }
];

<<<<<<< HEAD
=======
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
// Old admin accounts that should be removed (not in current ADMIN_ACCOUNTS_LIST)
const OLD_ADMIN_ACCOUNTS = [
  'number 9',
  'number5',
  'the goat',
  'usernotfound',
  'yoUr 8',
  'admin2',
  '345',
  '67'
];

export async function POST(request: NextRequest) {
  try {
    // Get current admin usernames (case-insensitive)
    const currentAdminUsernames = new Set(
      ADMIN_ACCOUNTS_LIST.map(a => a.username.toLowerCase())
    );

<<<<<<< HEAD
    // Get all users from Firestore
    const users = await getDocuments(COLLECTIONS.USERS);
    
    let removedCount = 0;
    
    // Delete old admin accounts that are not in the current admin list
    for (const user of users) {
      const usernameLower = user.username?.toLowerCase() || user.id?.toLowerCase();
      
      // Skip if it's a current admin
      if (currentAdminUsernames.has(usernameLower)) {
        continue;
=======
    // Read all users
    const users = await readUsers();
    
    // Filter out old admin accounts that are not in the current admin list
    const cleanedUsers = users.filter(user => {
      const usernameLower = user.username.toLowerCase();
      
      // Keep if it's a current admin
      if (currentAdminUsernames.has(usernameLower)) {
        return true;
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
      }
      
      // Remove if it's an old admin account
      if (OLD_ADMIN_ACCOUNTS.some(old => old.toLowerCase() === usernameLower)) {
<<<<<<< HEAD
        await deleteDocument(COLLECTIONS.USERS, user.id);
        removedCount++;
      }
    }
=======
        return false;
      }
      
      // Keep all other users
      return true;
    });

    // Write cleaned users back
    await writeUsers(cleanedUsers);

    const removedCount = users.length - cleanedUsers.length;
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} old admin account(s)`,
      removedCount,
<<<<<<< HEAD
      totalUsers: users.length - removedCount
=======
      totalUsers: cleanedUsers.length
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup old admin accounts' },
      { status: 500 }
    );
  }
}
<<<<<<< HEAD
=======

>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
