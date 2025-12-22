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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') || 'gym-pump';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const scores = await readScores();
    
    // Filter by gameId and get best scores per player
    const gameScores = scores.filter(s => s.gameId === gameId);
    
    // Get best score per player (highest power)
    const playerBestScores = new Map<string, GameScore>();
    gameScores.forEach(score => {
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

