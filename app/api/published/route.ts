import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/middleware';
import { getDb } from '@/lib/db';
import { PublishedGame } from '@/types';

// Get all published games (public)
export async function GET() {
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM published_games ORDER BY ts DESC');
    const rows = stmt.all() as any[];
    
    const games: PublishedGame[] = rows.map((row: any) => ({
      title: row.title,
      desc: row.description || '',
      owner: row.owner,
      ts: row.ts,
      thumbnail: row.thumbnail || undefined,
      gameCode: row.game_code || undefined,
      sceneData: row.scene_data ? JSON.parse(row.scene_data) : undefined,
      playable: row.playable === 1,
      multiplayer: row.multiplayer === 1,
      maxPlayers: row.max_players || undefined,
      serverId: row.server_id || undefined,
    }));
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error reading published games:', error);
    return NextResponse.json({ error: 'Failed to read published games' }, { status: 500 });
  }
}

// Save published games (admin only)
export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult.error) return authResult.error;
  
  try {
    const games: PublishedGame[] = await request.json();
    const db = getDb();
    
    // Clear existing games
    db.prepare('DELETE FROM published_games').run();
    
    // Insert new games
    const stmt = db.prepare(`
      INSERT INTO published_games (title, description, owner, ts, thumbnail, game_code, scene_data, playable, multiplayer, max_players, server_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const game of games) {
      stmt.run(
        game.title,
        game.desc || '',
        game.owner,
        game.ts,
        game.thumbnail || null,
        game.gameCode || null,
        game.sceneData ? JSON.stringify(game.sceneData) : null,
        game.playable ? 1 : 0,
        game.multiplayer ? 1 : 0,
        game.maxPlayers || null,
        game.serverId || null
      );
    }
    
    return NextResponse.json(games);
  } catch (error: any) {
    console.error('Error saving published games:', error);
    return NextResponse.json({ error: error.message || 'Failed to save published games' }, { status: 500 });
  }
}
