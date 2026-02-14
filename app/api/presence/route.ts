import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, setDocument, getDocument, queryDocuments } from '@/lib/firestore';

/**
 * GET /api/presence?username=xxx
 * Get online status for a user or all users
 */
export async function GET(request: NextRequest) {
  // #region agent log
  const logData = { location: 'app/api/presence/route.ts:8', timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' };
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const all = searchParams.get('all') === 'true';
    // #endregion

    if (all) {
      // Get all online users
      try {
        const onlineUsers = await queryDocuments(COLLECTIONS.PRESENCE, 'is_online', '==', true);
        return NextResponse.json({ online: onlineUsers.map((u: any) => u.username) });
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...logData,message:'Error querying online users',data:{error:error?.message}})}).catch(()=>{});
        // #endregion
        // Return empty array if Firestore fails
        return NextResponse.json({ online: [] });
      }
    }

    if (username) {
      try {
        const presence = await getDocument(COLLECTIONS.PRESENCE, username.toLowerCase());
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...logData,message:'Got presence for user',data:{username,hasPresence:!!presence}})}).catch(()=>{});
        // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...logData,message:'Error getting presence for user',data:{error:error?.message,username}})}).catch(()=>{});
        // #endregion
        // Return offline status if Firestore fails
        return NextResponse.json({ username, isOnline: false, lastSeen: null });
      }
    }

    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...logData,message:'Error in GET /api/presence',data:{error:error?.message,stack:error?.stack}})}).catch(()=>{});
    // #endregion
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
  // #region agent log
  const logData = { location: 'app/api/presence/route.ts:52', timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' };
  try {
    const { username, isOnline, currentSessionId } = await request.json();
    // #endregion

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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...logData,message:'Firestore error in POST /api/presence',data:{error:firestoreError?.message,username}})}).catch(()=>{});
      // #endregion
      console.error('Error updating presence in Firestore:', firestoreError);
      // Return success even if Firestore fails - app should continue working
      return NextResponse.json({ success: true, presence: presenceData, warning: 'Firestore unavailable' });
    }
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...logData,message:'Error in POST /api/presence',data:{error:error?.message,stack:error?.stack}})}).catch(()=>{});
    // #endregion
    console.error('Error updating presence:', error);
    // Return success with warning instead of 500 error
    return NextResponse.json({ success: false, error: 'Failed to update presence', warning: 'Service temporarily unavailable' }, { status: 200 });
  }
}
