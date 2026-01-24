import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, getFirestoreInstance } from '@/lib/firestore';

interface GameScore {
  id: string;
  gameId: string;
  username: string;
  power: number;
  coins: number;
  level: number;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') || 'gym-pump';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const db = getFirestoreInstance();
    const scoresSnapshot = await db.collection('gym_pump_scores')
      .where('gameId', '==', gameId)
      .orderBy('power', 'desc')
      .get();
    
    const scores = scoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameScore));
    
    // Get best score per player (highest power)
    const playerBestScores = new Map<string, GameScore>();
    scores.forEach(score => {
      const existing = playerBestScores.get(score.username);
      if (!existing || score.power > existing.power) {
        playerBestScores.set(score.username, score);
      }
    });

    // Convert to array and sort by power (descending)
    const leaderboard = Array.from(playerBestScores.values())
      .sort((a, b) => b.power - a.power)
      .slice(0, limit)
      .map((score, index) => ({
        rank: index + 1,
        player: score.username,
        power: score.power,
        coins: score.coins,
        level: score.level
      }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
