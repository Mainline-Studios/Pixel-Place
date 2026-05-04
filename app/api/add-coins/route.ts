export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { hashPassword } from '@/lib/auth';
import { getAdminAccounts } from '@/lib/adminAccounts';
import { requireAdmin } from '@/lib/middleware';
import { User } from '@/types';

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
    equippedAccessories: Array.isArray(doc.equipped_accessories) ? doc.equipped_accessories : (typeof doc.equipped_accessories === 'string' ? JSON.parse(doc.equipped_accessories || '[]') : []),
    ownedServers: Array.isArray(doc.owned_servers) ? doc.owned_servers : (typeof doc.owned_servers === 'string' ? JSON.parse(doc.owned_servers || '[]') : []),
    friends: Array.isArray(doc.friends) ? doc.friends : (typeof doc.friends === 'string' ? JSON.parse(doc.friends || '[]') : []),
    friendRequests: Array.isArray(doc.friend_requests) ? doc.friend_requests : (typeof doc.friend_requests === 'string' ? JSON.parse(doc.friend_requests || '[]') : []),
    sentFriendRequests: Array.isArray(doc.sent_friend_requests) ? doc.sent_friend_requests : (typeof doc.sent_friend_requests === 'string' ? JSON.parse(doc.sent_friend_requests || '[]') : [])
  };}

// API endpoint to add coins directly (for free coins, admin grants, etc.)
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { userId, coins, setAmount } = await request.json();
    const username = typeof userId === 'string' ? userId.trim() : '';
    const delta = typeof coins === 'number' ? coins : Number.NaN;
    const target = typeof setAmount === 'number' ? setAmount : Number.NaN;

    if (!username || (!Number.isFinite(delta) && !Number.isFinite(target))) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Get user from Firestore
    const existingUsers = await queryDocuments(COLLECTIONS.USERS, 'username_lower', '==', username.toLowerCase());
    let userDoc = existingUsers.length > 0 ? existingUsers[0] : null;

    if (!userDoc) {
      // User doesn't exist yet - create them (admin list from env only)
      const adminAccounts = getAdminAccounts();
      const adminAccount = adminAccounts.find(a => a.username.toLowerCase() === username.toLowerCase());
      
      if (adminAccount) {
        // Create the admin user in Firestore — never store raw password
        const initialCoins = Number.isFinite(target) ? target : delta;
        const password_hash = await hashPassword(adminAccount.password);
        const newUserData = {
          username: adminAccount.username,
          username_lower: adminAccount.username.toLowerCase(),
          password_hash,
          gender: 'N/A',
          role: 'admin',
          coins: initialCoins,
          owned_skins: ['pixel_placer'],
          equipped_skin: 'pixel_placer',
          owned_accessories: [],
          equipped_accessories: [],
          friends: [],
          created_at: Date.now(),
          updated_at: Date.now()
        };
        
        await setDocument(COLLECTIONS.USERS, adminAccount.username.toLowerCase(), newUserData);        
        return NextResponse.json({
          success: true,
          message: `Created user and set coins to ${initialCoins} for ${username}`,
          newBalance: initialCoins
        });
      }

      return NextResponse.json(
        { error: 'User not found. Please log in first to create your account.' },
        { status: 404 }
      );
    }

    // Update existing user's coin balance
    const user = userFromDoc(userDoc);
    const newCoins = Number.isFinite(target) ? target : (user.coins + delta);
    
    await setDocument(COLLECTIONS.USERS, userDoc.id, {
      coins: newCoins,
      updated_at: Date.now()
    });
    return NextResponse.json({
      success: true,
      message: Number.isFinite(target) ? `Set coins to ${target} for ${username}` : `Added ${delta} coins to ${username}`,
      newBalance: newCoins    });
  } catch (error: any) {
    console.error('Add coins error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add coins' },
      { status: 500 }
    );
  }
}
