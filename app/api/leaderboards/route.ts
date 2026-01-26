import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const type = searchParams.get('type') || 'global';
    const limit = parseInt(searchParams.get('limit') || '100');

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ leaderboard: [] });
    }

    let query;
    if (gameId) {
      query = db.collection(COLLECTIONS.LEADERBOARDS)
        .where('gameId', '==', gameId)
        .where('type', '==', type)
        .orderBy('score', 'desc')
        .limit(limit);
    } else {
      query = db.collection(COLLECTIONS.LEADERBOARDS)
        .where('type', '==', type)
        .orderBy('score', 'desc')
        .limit(limit);
    }

    const snapshot = await query.get();
    const leaderboard = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ leaderboard, type, gameId: gameId || 'global' });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ leaderboard: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, gameId, score, gameMode, metadata } = await request.json();

    if (!username || !gameId || score === undefined) {
      return NextResponse.json({ error: 'Username, gameId, and score required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const now = Date.now();
    const weekStart = now - (now % (7 * 24 * 60 * 60 * 1000));
    const dayStart = now - (now % (24 * 60 * 60 * 1000));

    const leaderboardEntries = [
      { username, username_lower: username.toLowerCase(), gameId, score, gameMode: gameMode || 'default', type: 'global', timestamp: now, metadata: metadata || {} },
      { username, username_lower: username.toLowerCase(), gameId, score, gameMode: gameMode || 'default', type: 'weekly', weekStart, timestamp: now, metadata: metadata || {} },
      { username, username_lower: username.toLowerCase(), gameId, score, gameMode: gameMode || 'default', type: 'daily', dayStart, timestamp: now, metadata: metadata || {} }
    ];

    const batch = db.batch();
    leaderboardEntries.forEach(entry => {
      const docRef = db.collection(COLLECTIONS.LEADERBOARDS).doc();
      batch.set(docRef, entry);
    });
    await batch.commit();

    return NextResponse.json({ success: true, message: 'Score submitted' });
  } catch (error: any) {
    console.error('Error submitting score:', error);
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }
}
