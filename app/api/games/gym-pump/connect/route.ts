import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const GAME_SESSIONS_FILE = path.join(DATA_DIR, 'gym-pump-sessions.json');

interface GameSession {
  sessionId: string;
  gameId: string;
  username: string;
  timestamp: number;
}

async function readSessions(): Promise<GameSession[]> {
  try {
    const data = await fs.readFile(GAME_SESSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeSessions(sessions: GameSession[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(GAME_SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
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

    // Create a new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: GameSession = {
      sessionId,
      gameId,
      username,
      timestamp: Date.now()
    };

    const sessions = await readSessions();
    sessions.push(session);
    
    // Keep only last 1000 sessions
    if (sessions.length > 1000) {
      sessions.splice(0, sessions.length - 1000);
    }
    
    await writeSessions(sessions);

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json(
      { error: 'Failed to connect to game' },
      { status: 500 }
    );
  }
}

