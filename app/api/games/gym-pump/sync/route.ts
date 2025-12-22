import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const GAME_PROGRESS_FILE = path.join(DATA_DIR, 'gym-pump-progress.json');

interface GameProgress {
  username: string;
  gameId: string;
  power: number;
  coins: number;
  level: number;
  lastSynced: number;
}

async function readProgress(): Promise<GameProgress[]> {
  try {
    const data = await fs.readFile(GAME_PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeProgress(progress: GameProgress[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(GAME_PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
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

    const allProgress = await readProgress();
    const existingIndex = allProgress.findIndex(
      p => p.username === username && p.gameId === gameId
    );

    if (existingIndex !== -1) {
      // Update existing progress (keep highest values)
      const existing = allProgress[existingIndex];
      allProgress[existingIndex] = {
        ...progress,
        power: Math.max(existing.power, progress.power),
        coins: Math.max(existing.coins, progress.coins),
        level: Math.max(existing.level, progress.level)
      };
    } else {
      allProgress.push(progress);
    }
    
    await writeProgress(allProgress);

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

    const allProgress = await readProgress();
    const progress = allProgress.find(
      p => p.username === username && p.gameId === gameId
    );

    if (!progress) {
      return NextResponse.json({
        power: 0,
        coins: 0,
        level: 1
      });
    }

    return NextResponse.json({
      power: progress.power,
      coins: progress.coins,
      level: progress.level
    });
  } catch (error) {
    console.error('Error fetching game progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

