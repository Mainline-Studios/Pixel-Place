export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getDocuments, COLLECTIONS } from '@/lib/firestore';

interface GameScore {
  id: string;
  gameId: string;
  username: string;
  power: number;
  coins: number;
  level: number;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, power, coins, level, timestamp, username } = await request.json();
    
    if (!gameId || power === undefined || coins === undefined || level === undefined) {
      return NextResponse.json(
        { error: 'gameId, power, coins, and level are required' },
        { status: 400 }
      );
    }

    const score: GameScore = {
      id: '', // Will be set by Firestore
      gameId,
      username: username || 'Anonymous',
      power,
      coins,
      level,
      timestamp: timestamp || Date.now()
    };

    // Add score to Firestore
    const scoreId = await addDocument('gym_pump_scores', score);
    
    // Keep only last 10000 scores (optional cleanup - can be done via scheduled function)
    const allScores = await getDocuments('gym_pump_scores', (ref) => ref.orderBy('timestamp', 'desc').limit(10001));
    if (allScores.length > 10000) {
      // Delete oldest scores (this could be optimized with a scheduled cleanup)
      // For now, we'll just add the new score and let a cleanup function handle old ones
    }

    return NextResponse.json({ success: true, scoreId });
  } catch (error) {
    console.error('Error saving game score:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}
