export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, setDocument, getDocument, queryDocuments } from '@/lib/firestore';

/**
 * GET /api/presence?username=xxx
 * Get online status for a user or all users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const all = searchParams.get('all') === 'true';

    if (all) {
      // Get all online users
      try {
        const onlineUsers = await queryDocuments(COLLECTIONS.PRESENCE, 'is_online', '==', true);
        return NextResponse.json({ online: onlineUsers.map((u: any) => u.username) });
      } catch (error: any) {
        // Return empty array if Firestore fails
        return NextResponse.json({ online: [] });
      }
    }

    if (username) {
      try {
        const presence = await getDocument(COLLECTIONS.PRESENCE, username.toLowerCase());
        if (presence) {
          return NextResponse.json({
            username: presence.username,
            isOnline: presence.is_online === true,
            lastSeen: presence.last_seen || Date.now(),
            currentSessionId: presence.current_session_id || null
          });
        }
        return NextResponse.json({ username, isOnline: false, lastSeen: null });
      } catch (error: any) {
        // Return offline status if Firestore fails
        return NextResponse.json({ username, isOnline: false, lastSeen: null });
      }
    }

    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  } catch (error: any) {
    console.error('Error getting presence:', error);
    // Return a safe response instead of 500 error
    return NextResponse.json({ error: 'Failed to get presence', online: [] }, { status: 200 });
  }
}

/**
 * POST /api/presence
 * Update online status
 * Body: { username, isOnline, currentSessionId? }
 */
export async function POST(request: NextRequest) {
  try {
    const { username, isOnline, currentSessionId } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const presenceData: any = {
      username: username,
      username_lower: username.toLowerCase(),
      is_online: isOnline === true,
      last_seen: Date.now(),
      updated_at: Date.now()
    };

    if (currentSessionId) {
      presenceData.current_session_id = currentSessionId;
    } else {
      presenceData.current_session_id = null;
    }

    try {
      await setDocument(COLLECTIONS.PRESENCE, username.toLowerCase(), presenceData);

      // Also update user document with online status
      const userDoc = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
      if (userDoc) {
        await setDocument(COLLECTIONS.USERS, username.toLowerCase(), {
          ...userDoc,
          is_online: isOnline === true,
          last_seen: Date.now(),
          current_session_id: currentSessionId || null,
          updated_at: Date.now()
        });
      }

      return NextResponse.json({ success: true, presence: presenceData });
    } catch (firestoreError: any) {
      console.error('Error updating presence in Firestore:', firestoreError);
      // Return success even if Firestore fails - app should continue working
      return NextResponse.json({ success: true, presence: presenceData, warning: 'Firestore unavailable' });
    }
  } catch (error: any) {
    console.error('Error updating presence:', error);
    // Return success with warning instead of 500 error
    return NextResponse.json({ success: false, error: 'Failed to update presence', warning: 'Service temporarily unavailable' }, { status: 200 });
  }
}
