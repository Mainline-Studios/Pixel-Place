import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';

interface GameProgress {
  username: string;
  gameId: string;
  power: number;
  coins: number;
  level: number;
  lastSynced: number;
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, power, coins, level, username } = await request.json();
    
    if (!gameId || !username || power === undefined || coins === undefined || level === undefined) {
      return NextResponse.json(
        { error: 'gameId, username, power, coins, and level are required' },
        { status: 400 }
      );
    }

    const progress: GameProgress = {
      username,
      gameId,
      power,
      coins,
      level,
      lastSynced: Date.now()
    };

    // Get existing progress from Firestore
    const progressId = `${username}_${gameId}`;
    const existing = await getDocument('gym_pump_progress', progressId);

    if (existing) {
      // Update existing progress (keep highest values)
      await setDocument('gym_pump_progress', progressId, {
        ...progress,
        power: Math.max(existing.power || 0, progress.power),
        coins: Math.max(existing.coins || 0, progress.coins),
        level: Math.max(existing.level || 1, progress.level),
        lastSynced: Date.now()
      });
    } else {
      // Create new progress
      await setDocument('gym_pump_progress', progressId, progress);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing game progress:', error);
    return NextResponse.json(
      { error: 'Failed to sync progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') || 'gym-pump';
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'username is required' },
        { status: 400 }
      );
    }

    const progressId = `${username}_${gameId}`;
    const progress = await getDocument('gym_pump_progress', progressId);

    if (!progress) {
      return NextResponse.json({
        power: 0,
        coins: 0,
        level: 1
      });
    }

    return NextResponse.json({
      power: progress.power || 0,
      coins: progress.coins || 0,
      level: progress.level || 1
    });
  } catch (error) {
    console.error('Error fetching game progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
