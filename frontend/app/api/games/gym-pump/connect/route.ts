import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getDocuments, COLLECTIONS } from '@/lib/firestore';

interface GameSession {
  sessionId: string;
  gameId: string;
  username: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, username } = await request.json();
    
    if (!gameId || !username) {
      return NextResponse.json(
        { error: 'gameId and username are required' },
        { status: 400 }
      );
    }

    // Create a new session in Firestore
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: GameSession = {
      sessionId,
      gameId,
      username,
      timestamp: Date.now()
    };

    await addDocument('gym_pump_sessions', session);
    
    // Keep only last 1000 sessions (optional cleanup)
    const allSessions = await getDocuments('gym_pump_sessions', (ref) => ref.orderBy('timestamp', 'desc').limit(1001));
    if (allSessions.length > 1000) {
      // Delete oldest sessions (could be optimized with scheduled cleanup)
    }

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json(
      { error: 'Failed to connect to game' },
      { status: 500 }
    );
  }
}
