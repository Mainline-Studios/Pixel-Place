export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestoreInstance, COLLECTIONS, setDocument, queryDocuments, getDocuments } from '@/lib/firestore';
import { User } from '@/types';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount),
      projectId: 'pixel-place-823b1'
    });
  } else {
    initializeApp({
      projectId: 'pixel-place-823b1'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Verify the ID token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email || '';
    const displayName = decodedToken.name || email.split('@')[0] || 'GoogleUser';
    const photoURL = decodedToken.picture || '';

    // Check if user already exists in Firestore by firebase_uid
    let existingUsers = await queryDocuments(COLLECTIONS.USERS, 'firebase_uid', '==', firebaseUid);
    if (existingUsers.length === 0 && email) {
      // Try to find by email - get all users and filter
      const allUsers = await getDocuments(COLLECTIONS.USERS);
      existingUsers = allUsers.filter((doc: any) => doc.email === email);
    }
    
    let user: User;

    if (existingUsers.length > 0) {
      // User exists - return existing user
      const existing = existingUsers[0];
      user = {
        username: existing.username,
        password: '', // No password for Google users
        gender: existing.gender || '',
        role: (existing.role || 'user') as 'admin' | 'user' | 'head_admin',
        coins: existing.coins || 0,
        ownedSkins: Array.isArray(existing.owned_skins) ? existing.owned_skins : [],
        equippedSkin: existing.equipped_skin || 'pixel_placer',
        ownedAccessories: Array.isArray(existing.owned_accessories) ? existing.owned_accessories : [],
        equippedAccessories: existing.equipped_accessories || {},
        ownedServers: Array.isArray(existing.owned_servers) ? existing.owned_servers : [],
        friends: Array.isArray(existing.friends) ? existing.friends : [],
        friendRequests: Array.isArray(existing.friend_requests) ? existing.friend_requests : [],
        sentFriendRequests: Array.isArray(existing.sent_friend_requests) ? existing.sent_friend_requests : [],
        firebaseUid: firebaseUid,
        email: email,
        photoURL: photoURL
      };
    } else {
      // New user - create account
      // Generate username from email or display name
      let username = displayName.replace(/[^a-zA-Z0-9]/g, '');
      if (!username || username.length < 3) {
        username = 'GoogleUser' + Math.random().toString(36).substr(2, 7);
      }

      // Check if username is taken, if so append numbers
      let finalUsername = username;
      let counter = 1;
      const allUsers = await queryDocuments(COLLECTIONS.USERS, 'username_lower', '==', finalUsername.toLowerCase());
      while (allUsers.length > 0) {
        finalUsername = username + counter;
        const checkUsers = await queryDocuments(COLLECTIONS.USERS, 'username_lower', '==', finalUsername.toLowerCase());
        if (checkUsers.length === 0) break;
        counter++;
      }

      user = {
        username: finalUsername,
        password: '', // No password for Google users
        gender: '',
        role: 'user',
        coins: 10,
        ownedSkins: ['pixel_placer'],
        equippedSkin: 'pixel_placer',
        ownedAccessories: [],
        equippedAccessories: {},
        ownedServers: [],
        friends: [],
        friendRequests: [],
        sentFriendRequests: [],
        firebaseUid: firebaseUid,
        email: email,
        photoURL: photoURL
      };

      // Save to Firestore
      await setDocument(COLLECTIONS.USERS, finalUsername.toLowerCase(), {
        username: finalUsername,
        username_lower: finalUsername.toLowerCase(),
        password_hash: '', // No password for Google users
        gender: '',
        role: 'user',
        coins: 10,
        owned_skins: ['pixel_placer'],
        equipped_skin: 'pixel_placer',
        owned_accessories: [],
        equipped_accessories: {},
        owned_servers: [],
        friends: [],
        friend_requests: [],
        sent_friend_requests: [],
        firebase_uid: firebaseUid,
        email: email,
        photo_url: photoURL,
        is_donor: 0,
        created_at: Date.now(),
        updated_at: Date.now()
      });
    }

    return NextResponse.json({
      success: true,
      user: user
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Google authentication failed' },
      { status: 500 }
    );
  }
}
