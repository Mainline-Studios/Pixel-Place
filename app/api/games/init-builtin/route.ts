import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const results = [];
    
    // Import BUILTIN_GAMES dynamically to avoid build-time issues
    const { BUILTIN_GAMES } = await import('@/lib/builtinGames');
    
    for (const game of BUILTIN_GAMES) {
      try {
        // Check if game already exists
        const existing = db.prepare('SELECT * FROM published_games WHERE game_code = ?').get(game.gameCode);
        
        if (existing) {
          // Update existing game
          db.prepare(`
            UPDATE published_games SET
              title = ?,
              description = ?,
              owner = ?,
              ts = ?,
              playable = ?,
              updated_at = strftime('%s', 'now')
            WHERE game_code = ?
          `).run(
            game.title,
            game.desc || '',
            game.owner,
            game.ts,
            game.playable ? 1 : 0,
            game.gameCode
          );
          results.push({ title: game.title, action: 'updated' });
        } else {
          // Create new game
          db.prepare(`
            INSERT INTO published_games (
              title, description, owner, ts, thumbnail, game_code, scene_data, playable, multiplayer, max_players
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            game.title,
            game.desc || '',
            game.owner,
            game.ts,
            game.thumbnail || null,
            game.gameCode,
            null,
            game.playable ? 1 : 0,
            game.multiplayer ? 1 : 0,
            game.maxPlayers || null
          );
          results.push({ title: game.title, action: 'created' });
        }
      } catch (error: any) {
        results.push({ 
          title: game.title, 
          action: 'error', 
          error: error.message 
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Processed ${BUILTIN_GAMES.length} built-in games`,
      results 
    });
  } catch (error: any) {
    console.error('Error initializing built-in games:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
