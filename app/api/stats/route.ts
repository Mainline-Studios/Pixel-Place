export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const gameId = searchParams.get('gameId');

    if (username) {
      const userStats = await getDocument(COLLECTIONS.USER_STATS, username.toLowerCase());
      return NextResponse.json({
        username,
        stats: userStats || {
          gamesPlayed: 0,
          totalPlayTime: 0,
          gamesWon: 0,
          gamesLost: 0,
          totalScore: 0,
          favoriteGame: null,
          lastPlayed: null,
          achievements: 0,
          level: 1,
          xp: 0
        }
      });
    }

    if (gameId) {
      const gameStats = await getDocument(COLLECTIONS.GAME_STATS, gameId);
      return NextResponse.json({
        gameId,
        stats: gameStats || {
          totalPlays: 0,
          uniquePlayers: 0,
          averageScore: 0,
          highestScore: 0,
          totalPlayTime: 0
        }
      });
    }

    const globalStats = await getDocument(COLLECTIONS.GLOBAL_STATS, 'main');
    return NextResponse.json({
      stats: globalStats || {
        totalUsers: 0,
        totalGames: 0,
        totalPlays: 0,
        activePlayers: 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, gameId, stats } = await request.json();

    if (!stats) {
      return NextResponse.json({ error: 'Stats object required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    if (username) {
      const userStatsRef = db.collection(COLLECTIONS.USER_STATS).doc(username.toLowerCase());
      const currentStats = await userStatsRef.get();
      const currentData = currentStats.exists ? currentStats.data() : {};

      await setDocument(COLLECTIONS.USER_STATS, username.toLowerCase(), {
        ...currentData,
        ...stats,
        username,
        username_lower: username.toLowerCase(),
        lastUpdated: Date.now()
      });
    } else if (gameId) {
      await setDocument(COLLECTIONS.GAME_STATS, gameId, {
        gameId,
        ...stats,
        lastUpdated: Date.now()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating stats:', error);
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
}
