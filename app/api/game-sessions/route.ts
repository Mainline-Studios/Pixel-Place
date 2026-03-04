export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, setDocument, getDocument, queryDocuments, deleteDocument } from '@/lib/firestore';

interface GameSession {
  sessionId: string;
  gameId: string;
  hostUsername: string;
  players: string[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  startedAt?: number;
}

/**
 * GET /api/game-sessions?sessionId=xxx or ?username=xxx
 * Get game session(s)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const username = searchParams.get('username');

    if (sessionId) {
      const session = await getDocument(COLLECTIONS.GAME_SESSIONS, sessionId);
      if (session) {
        return NextResponse.json({
          sessionId: session.session_id,
          gameId: session.game_id,
          hostUsername: session.host_username,
          players: session.players || [],
          maxPlayers: session.max_players || 4,
          status: session.status || 'waiting',
          createdAt: session.created_at,
          startedAt: session.started_at
        });
      }
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (username) {
      // Get all sessions where user is a player
      const allSessions = await queryDocuments(COLLECTIONS.GAME_SESSIONS, 'status', '==', 'waiting');
      const userSessions = allSessions.filter((s: any) => 
        s.host_username === username || (s.players || []).includes(username)
      );
      return NextResponse.json({ sessions: userSessions.map(formatSession) });
    }

    // Get all active sessions
    const activeSessions = await queryDocuments(COLLECTIONS.GAME_SESSIONS, 'status', 'in', ['waiting', 'playing']);
    return NextResponse.json({ sessions: activeSessions.map(formatSession) });
  } catch (error: any) {
    console.error('Error getting game sessions:', error);
    return NextResponse.json({ error: 'Failed to get game sessions' }, { status: 500 });
  }
}

function formatSession(session: any): GameSession {
  return {
    sessionId: session.session_id || session.id,
    gameId: session.game_id,
    hostUsername: session.host_username,
    players: session.players || [],
    maxPlayers: session.max_players || 4,
    status: session.status || 'waiting',
    createdAt: session.created_at,
    startedAt: session.started_at
  };
}

/**
 * POST /api/game-sessions
 * Create or join a game session
 * Body: { action: 'create' | 'join' | 'leave', sessionId?, gameId?, hostUsername?, username? }
 */
export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, gameId, hostUsername, username } = await request.json();

    if (action === 'create') {
      if (!gameId || !hostUsername) {
        return NextResponse.json({ error: 'gameId and hostUsername required' }, { status: 400 });
      }

      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionData = {
        session_id: newSessionId,
        game_id: gameId,
        host_username: hostUsername,
        players: [hostUsername],
        max_players: 4,
        status: 'waiting',
        created_at: Date.now()
      };

      await setDocument(COLLECTIONS.GAME_SESSIONS, newSessionId, sessionData);

      // Update host's presence
      await setDocument(COLLECTIONS.PRESENCE, hostUsername.toLowerCase(), {
        username: hostUsername,
        username_lower: hostUsername.toLowerCase(),
        is_online: true,
        current_session_id: newSessionId,
        last_seen: Date.now(),
        updated_at: Date.now()
      });

      return NextResponse.json({ success: true, session: formatSession(sessionData) });
    }

    if (action === 'join') {
      if (!sessionId || !username) {
        return NextResponse.json({ error: 'sessionId and username required' }, { status: 400 });
      }

      const session = await getDocument(COLLECTIONS.GAME_SESSIONS, sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      if (session.status !== 'waiting') {
        return NextResponse.json({ error: 'Session is not accepting new players' }, { status: 400 });
      }

      const players = session.players || [];
      if (players.includes(username)) {
        return NextResponse.json({ success: true, session: formatSession(session) });
      }

      if (players.length >= (session.max_players || 4)) {
        return NextResponse.json({ error: 'Session is full' }, { status: 400 });
      }

      players.push(username);
      await setDocument(COLLECTIONS.GAME_SESSIONS, sessionId, {
        ...session,
        players: players,
        updated_at: Date.now()
      });

      // Update player's presence
      await setDocument(COLLECTIONS.PRESENCE, username.toLowerCase(), {
        username: username,
        username_lower: username.toLowerCase(),
        is_online: true,
        current_session_id: sessionId,
        last_seen: Date.now(),
        updated_at: Date.now()
      });

      return NextResponse.json({ success: true, session: formatSession({ ...session, players }) });
    }

    if (action === 'leave') {
      if (!sessionId || !username) {
        return NextResponse.json({ error: 'sessionId and username required' }, { status: 400 });
      }

      const session = await getDocument(COLLECTIONS.GAME_SESSIONS, sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const players = (session.players || []).filter((p: string) => p !== username);
      
      if (players.length === 0) {
        // Delete session if no players left
        await deleteDocument(COLLECTIONS.GAME_SESSIONS, sessionId);
      } else {
        // Update session
        await setDocument(COLLECTIONS.GAME_SESSIONS, sessionId, {
          ...session,
          players: players,
          updated_at: Date.now()
        });
      }

      // Update player's presence
      await setDocument(COLLECTIONS.PRESENCE, username.toLowerCase(), {
        username: username,
        username_lower: username.toLowerCase(),
        is_online: true,
        current_session_id: null,
        last_seen: Date.now(),
        updated_at: Date.now()
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'start') {
      if (!sessionId || !username) {
        return NextResponse.json({ error: 'sessionId and username required' }, { status: 400 });
      }

      const session = await getDocument(COLLECTIONS.GAME_SESSIONS, sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      if (session.host_username !== username) {
        return NextResponse.json({ error: 'Only host can start the game' }, { status: 403 });
      }

      await setDocument(COLLECTIONS.GAME_SESSIONS, sessionId, {
        ...session,
        status: 'playing',
        started_at: Date.now(),
        updated_at: Date.now()
      });

      return NextResponse.json({ success: true, session: formatSession({ ...session, status: 'playing', started_at: Date.now() }) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing game session:', error);
    return NextResponse.json({ error: 'Failed to manage game session' }, { status: 500 });
  }
}
