import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { getDb } from '@/lib/db';
import { UserMadeGame } from '@/types';

// Get all games (public, but can filter by owner if authenticated)
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    
    let stmt;
    let rows: any[];
    if (owner) {
      stmt = db.prepare('SELECT * FROM games WHERE owner = ? ORDER BY ts DESC');
      rows = stmt.all(owner) as any[];
    } else {
      stmt = db.prepare('SELECT * FROM games ORDER BY ts DESC');
      rows = stmt.all() as any[];
    }
    
    const games: UserMadeGame[] = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      desc: row.description || '',
      owner: row.owner,
      ts: row.ts,
      sceneData: row.scene_data ? JSON.parse(row.scene_data) : undefined,
      presetMessages: row.preset_messages ? JSON.parse(row.preset_messages) : undefined,
      controls: row.controls ? JSON.parse(row.controls) : undefined,
      publishedBy: row.published_by,
    }));
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error reading games:', error);
    return NextResponse.json({ error: 'Failed to read games' }, { status: 500 });
  }
}

// Save a game (requires auth)
export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  try {
    const game: UserMadeGame = await request.json();
    const db = getDb();
    
    const gameId = game.id || `game_${Date.now()}`;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO games (id, title, description, owner, ts, scene_data, preset_messages, controls, published_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `);
    
    stmt.run(
      gameId,
      game.title,
      game.desc || '',
      game.owner || authResult.user.username,
      game.ts || Date.now(),
      game.sceneData ? JSON.stringify(game.sceneData) : null,
      game.presetMessages ? JSON.stringify(game.presetMessages) : null,
      game.controls ? JSON.stringify(game.controls) : null,
      game.publishedBy || null
    );
    
    const gameToSave: UserMadeGame = {
      ...game,
      id: gameId,
      ts: game.ts || Date.now(),
    };
    
    return NextResponse.json({ success: true, game: gameToSave });
  } catch (error: any) {
    console.error('Error saving game:', error);
    return NextResponse.json({ error: error.message || 'Failed to save game' }, { status: 500 });
  }
}

// Update a game (requires auth)
export async function PUT(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  try {
    const game: UserMadeGame = await request.json();
    
    if (!game.id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    const db = getDb();
    
    // Check ownership
    const checkStmt = db.prepare('SELECT owner FROM games WHERE id = ?');
    const existing = checkStmt.get(game.id) as any;
    
    if (existing && existing.owner !== authResult.user.username && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const stmt = db.prepare(`
      UPDATE games SET
        title = ?,
        description = ?,
        scene_data = ?,
        preset_messages = ?,
        controls = ?,
        published_by = ?,
        updated_at = strftime('%s', 'now')
      WHERE id = ?
    `);
    
    stmt.run(
      game.title,
      game.desc || '',
      game.sceneData ? JSON.stringify(game.sceneData) : null,
      game.presetMessages ? JSON.stringify(game.presetMessages) : null,
      game.controls ? JSON.stringify(game.controls) : null,
      game.publishedBy || null,
      game.id
    );
    
    return NextResponse.json({ success: true, game });
  } catch (error: any) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: error.message || 'Failed to update game' }, { status: 500 });
  }
}

// Delete a game (requires auth)
export async function DELETE(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('id');
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    const db = getDb();
    
    // Check ownership
    const checkStmt = db.prepare('SELECT owner FROM games WHERE id = ?');
    const existing = checkStmt.get(gameId) as any;
    
    if (existing && existing.owner !== authResult.user.username && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const stmt = db.prepare('DELETE FROM games WHERE id = ?');
    stmt.run(gameId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete game' }, { status: 500 });
  }
}
