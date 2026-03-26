export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, setDocument } from '@/lib/firestore';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ activities: [] });
    }

    let query = db.collection(COLLECTIONS.ACTIVITY_FEED)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (username) {
      const auth = requireAuth(request);
      if (auth.error) return auth.error;
      const isAdmin = auth.user.role === 'admin' || auth.user.role === 'head_admin';
      if (!isAdmin && username.toLowerCase() !== auth.user.username.toLowerCase()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      query = query.where('username', '==', username);
    }

    const snapshot = await query.get();
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json({ activities: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, type, gameId, message, metadata } = await request.json();

    if (!username || !type) {
      return NextResponse.json({ error: 'Username and type required' }, { status: 400 });
    }

    const auth = requireAuth(request);
    if (auth.error) return auth.error;
    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'head_admin';
    if (!isAdmin && username.toLowerCase() !== auth.user.username.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const activity = {
      username,
      username_lower: username.toLowerCase(),
      type, // 'game_played', 'achievement_unlocked', 'friend_added', 'game_created', etc.
      gameId: gameId || null,
      message: message || '',
      metadata: metadata || {},
      timestamp: Date.now()
    };

    const docRef = db.collection(COLLECTIONS.ACTIVITY_FEED).doc();
    await setDocument(COLLECTIONS.ACTIVITY_FEED, docRef.id, activity);

    return NextResponse.json({ success: true, activity });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
