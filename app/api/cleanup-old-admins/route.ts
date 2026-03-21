export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, deleteDocument, COLLECTIONS } from '@/lib/firestore';
import { getAdminAccounts } from '@/lib/adminAccounts';
import { denyUnlessAdminSetupSecret } from '@/lib/serverSetupSecret';

// Old admin accounts that should be removed (usernames no longer in env admin list)
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
  const denied = denyUnlessAdminSetupSecret(request);
  if (denied) return denied;

  try {
    const adminAccounts = getAdminAccounts();
    const currentAdminUsernames = new Set(adminAccounts.map(a => a.username.toLowerCase()));

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
