import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, deleteDocument, COLLECTIONS } from '@/lib/firestore';

// Current admin accounts (must match lib/storage.ts)
const ADMIN_ACCOUNTS_LIST = [
  { username: "admin", password: "extra" },
  { username: "TicTAK", password: "Thomas" },
  { username: "IDon'tKnow", password: "Titan" },
  { username: "Administrator1237", password: "32r7b75c6bjn32k5 5buvi23u5bv3y26u" },
  { username: "Billibob", password: "Luca" },
  { username: "Daniello1", password: "Daniel" },
  { username: "FunBoy", password: "Simon" },
  { username: "BelloBoy1", password: "Zac" },
  { username: "Bob", password: "Henry" },
  { username: "Mr.Noob", password: "Tyson" },
  { username: "BDawgsAwesome1", password: "20Minecraft15" }
];

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

    // Get all users from Firestore
    const users = await getDocuments(COLLECTIONS.USERS);

    let removedCount = 0;

    // Delete old admin accounts that are not in the current admin list
    for (const user of users) {
      const usernameLower = user.username?.toLowerCase() || user.id?.toLowerCase();

      // Skip if it's a current admin
      if (currentAdminUsernames.has(usernameLower)) {
        continue;
      }

      // Remove if it's an old admin account
      if (OLD_ADMIN_ACCOUNTS.some(old => old.toLowerCase() === usernameLower)) {
        await deleteDocument(COLLECTIONS.USERS, user.id);
        removedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} old admin account(s)`,
      removedCount,
      totalUsers: users.length - removedCount
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup old admin accounts' },
      { status: 500 }
    );
  }
}
