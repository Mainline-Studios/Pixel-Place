import { NextRequest, NextResponse } from 'next/server';

// In-memory store for active game sessions
// In production, use Redis or a database
const gameSessions = new Map<string, {
  id: string;
  gameId: string;
  gameTitle: string;
  host: string;
  players: Array<{
    id: string;
    username: string;
    socketId?: string;
  }>;
  maxPlayers: number;
  createdAt: number;
  isActive: boolean;
}>();

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a valid object' }, { status: 400 });
    }
    const { action, gameId, gameTitle, username, sessionId, maxPlayers = 10 } = body;
    
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (action === 'create') {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const session = {
        id: sessionId,
        gameId,
        gameTitle: gameTitle || 'Untitled Game',
        host: username,
        players: [{
          id: username,
          username,
        }],
        maxPlayers,
        createdAt: Date.now(),
        isActive: true,
      };

      gameSessions.set(sessionId, session);
      return NextResponse.json({ success: true, session });
    }

    if (action === 'join') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
      }

      const session = gameSessions.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      if (session.players.length >= session.maxPlayers) {
        return NextResponse.json({ error: 'Session is full' }, { status: 400 });
      }

      if (session.players.find(p => p.username === username)) {
        return NextResponse.json({ error: 'Already in session' }, { status: 400 });
      }

      session.players.push({
        id: username,
        username,
      });

      return NextResponse.json({ success: true, session });
    }

    if (action === 'leave') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
      }

      const session = gameSessions.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      session.players = session.players.filter(p => p.username !== username);

      // Clean up empty sessions
      if (session.players.length === 0) {
        gameSessions.delete(sessionId);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const session = gameSessions.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, session });
    }

    if (gameId) {
      const sessions = Array.from(gameSessions.values())
        .filter(s => s.gameId === gameId && s.isActive)
        .map(s => ({
          id: s.id,
          gameId: s.gameId,
          gameTitle: s.gameTitle,
          host: s.host,
          playerCount: s.players.length,
          maxPlayers: s.maxPlayers,
          createdAt: s.createdAt,
        }));
      return NextResponse.json({ success: true, sessions });
    }

    // Return all active sessions
    const sessions = Array.from(gameSessions.values())
      .filter(s => s.isActive)
      .map(s => ({
        id: s.id,
        gameId: s.gameId,
        gameTitle: s.gameTitle,
        host: s.host,
        playerCount: s.players.length,
        maxPlayers: s.maxPlayers,
        createdAt: s.createdAt,
      }));

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
