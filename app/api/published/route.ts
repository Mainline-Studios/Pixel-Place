import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/middleware';
import { getDb } from '@/lib/db';
import { PublishedGame } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  TIC_TAC_TOE_PRELOADED_GAME, 
  CAPTURE_THE_FLAG_PRELOADED_GAME, 
  HIDE_AND_SEEK_PRELOADED_GAME 
} from '@/lib/preloadedGames';
const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLISHED_FILE = path.join(DATA_DIR, 'published.json');

// Read published games from JSON file (primary source)
async function readPublishedFromFile(): Promise<PublishedGame[]> {
  try {
    const data = await fs.readFile(PUBLISHED_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write published games to JSON file (primary storage)
async function writePublishedToFile(games: PublishedGame[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PUBLISHED_FILE, JSON.stringify(games, null, 2), 'utf-8');
}

// Sync to database (backup)
async function syncToDatabase(games: PublishedGame[]): Promise<void> {
  try {
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
        game.multiplayer ? 1 

// Enrich games with gameCode from preloadedGames if missing
function enrichGamesWithCode(games: PublishedGame[]): PublishedGame[] {
  const preloadedGames = {
    'Tic-Tac-Toe': TIC_TAC_TOE_PRELOADED_GAME,
    'Tic Tac Toe': TIC_TAC_TOE_PRELOADED_GAME,
    'Capture the Flag': CAPTURE_THE_FLAG_PRELOADED_GAME,
    'Hide and Seek': HIDE_AND_SEEK_PRELOADED_GAME,
  };
  
  return games.map(game => {
    const preloaded = preloadedGames[game.title as keyof typeof preloadedGames];
    if (preloaded && !game.gameCode) {
      return {
        ...game,
        gameCode: preloaded.gameCode,
        thumbnail: game.thumbnail || preloaded.thumbnail,
        multiplayer: game.multiplayer !== undefined ? game.multiplayer : preloaded.multiplayer,
        maxPlayers: game.maxPlayers || preloaded.maxPlayers,
      };
    }
    return game;
  });
}
: 0,
        game.maxPlayers || null,
        game.serverId || null
      );
    }
  } catch (e) {
    // Database sync is optional
  }
}

// Get all published games (public)
export async function GET() {
  try {
    // Read from JSON file (primary source)
    let games = await readPublishedFromFile();
    
    // If JSON is empty, try database
    if (games.length === 0) {
      const db = getDb();
      const stmt = db.prepare('SELECT * FROM published_games ORDER BY ts DESC');
      const rows = stmt.all() as any[];
      
      games = rows.map((row: any) => ({
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
    }
    
    return NextResponse.json(enrichGamesWithCode(games));
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
    
    // Write to JSON file (primary storage)
    await writePublishedToFile(games);
    
    // Sync to database (backup)
    await syncToDatabase(games);
    
    return NextResponse.json(enrichGamesWithCode(games));
  } catch (error: any) {
    console.error('Error saving published games:', error);
    return NextResponse.json({ error: error.message || 'Failed to save published games' }, { status: 500 });
  }
}
