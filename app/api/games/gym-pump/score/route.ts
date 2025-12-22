import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const GAME_SCORES_FILE = path.join(DATA_DIR, 'gym-pump-scores.json');

interface GameScore {
  id: string;
  gameId: string;
  username: string;
  power: number;
  coins: number;
  level: number;
  timestamp: number;
}

async function readScores(): Promise<GameScore[]> {
  try {
    const data = await fs.readFile(GAME_SCORES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeScores(scores: GameScore[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(GAME_SCORES_FILE, JSON.stringify(scores, null, 2), 'utf-8');
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

    const scoreId = `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const score: GameScore = {
      id: scoreId,
      gameId,
      username: username || 'Anonymous',
      power,
      coins,
      level,
      timestamp: timestamp || Date.now()
    };

    const scores = await readScores();
    scores.push(score);
    
    // Keep only last 10000 scores
    if (scores.length > 10000) {
      scores.splice(0, scores.length - 10000);
    }
    
    await writeScores(scores);

    return NextResponse.json({ success: true, scoreId });
  } catch (error) {
    console.error('Error saving game score:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}

