import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
// These games are not currently exported - commented out for now
// import { TIC_TAC_TOE_PRELOADED_GAME, CAPTURE_THE_FLAG_PRELOADED_GAME, HIDE_AND_SEEK_PRELOADED_GAME } from '@/lib/preloadedGames';
import { PublishedGame } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLISHED_FILE = path.join(DATA_DIR, 'published.json');

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult.error) return authResult.error;
  
  try {
    // Preloaded games temporarily disabled - add them back when exported
    const games: PublishedGame[] = [
      // {
      //   ...TIC_TAC_TOE_PRELOADED_GAME,
      //   multiplayer: true,
      //   maxPlayers: 2,
      // },
      // {
      //   ...CAPTURE_THE_FLAG_PRELOADED_GAME,
      //   multiplayer: true,
      //   maxPlayers: 16,
      // },
      // HIDE_AND_SEEK_PRELOADED_GAME,
    ];
    
    // Write to JSON file
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(PUBLISHED_FILE, JSON.stringify(games, null, 2), 'utf-8');
    
    // Sync to database
    const { getDb } = await import('@/lib/db');
    const db = getDb();
    db.prepare('DELETE FROM published_games').run();
    
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
    
    return NextResponse.json({ success: true, games, count: games.length });
  } catch (error: any) {
    console.error('Error initializing published games:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize games' }, { status: 500 });
  }
}
