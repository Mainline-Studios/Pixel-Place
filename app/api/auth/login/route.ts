export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Username and password are required.' 
      }, { status: 400 });
    }
    
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username) as any;
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Account not found. Please create one first.' 
      }, { status: 404 });
    }
    
    // Verify password
    // Handle special characters in password - ensure it's passed correctly
    const passwordToVerify = String(password).trim();
    const isValid = await verifyPassword(passwordToVerify, user.password_hash);
    
    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        message: 'Incorrect password.' 
      }, { status: 401 });
    }
    
    // Return user data (without password hash) - ensure all arrays are properly parsed
    const ownedSkins = JSON.parse(user.owned_skins || '[]');
    const ownedAccessories = JSON.parse(user.owned_accessories || '[]');
    const equippedAccessories = JSON.parse(user.equipped_accessories || '[]');
    const friends = JSON.parse(user.friends || '[]');
    const friendRequests = JSON.parse(user.friend_requests || '[]');
    const sentFriendRequests = JSON.parse(user.sent_friend_requests || '[]');
    const ownedServers = JSON.parse(user.owned_servers || '[]');
    
    // Ensure equippedSkin defaults to pixel_placer if empty and user has no skins
    let equippedSkin = user.equipped_skin || '';
    if (!equippedSkin && ownedSkins.length === 0) {
      equippedSkin = 'pixel_placer';
      ownedSkins.push('pixel_placer');
    } else if (!equippedSkin && ownedSkins.length > 0) {
      equippedSkin = ownedSkins[0];
    }
    
    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        password: '', // Don't return password
        gender: user.gender || '',
        role: user.role || 'user',
        coins: user.coins || 0,
        ownedSkins: Array.isArray(ownedSkins) ? ownedSkins : [],
        equippedSkin: equippedSkin,
        ownedAccessories: Array.isArray(ownedAccessories) ? ownedAccessories : [],
        equippedAccessories: (equippedAccessories && typeof equippedAccessories === 'object') ? equippedAccessories : {},
        ownedServers: Array.isArray(ownedServers) ? ownedServers : [],
        friends: Array.isArray(friends) ? friends : [],
        friendRequests: Array.isArray(friendRequests) ? friendRequests : [],
        sentFriendRequests: Array.isArray(sentFriendRequests) ? sentFriendRequests : []
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error during login.' 
    }, { status: 500 });
  }
}
