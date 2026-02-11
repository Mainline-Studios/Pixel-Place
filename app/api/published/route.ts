import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocuments, setDocument, deleteDocument, COLLECTIONS } from '@/lib/firestore';
import { PublishedGame } from '@/types';

function gameFromDoc(doc: any): PublishedGame {
  return {
    title: doc.title,
    desc: doc.description || '',
    owner: doc.owner,
    ts: doc.ts,
    thumbnail: doc.thumbnail,
    gameCode: doc.game_code || '',
    playable: doc.playable !== false,
    multiplayer: doc.multiplayer === true,
    maxPlayers: doc.max_players
=======
import { getDb } from '@/lib/db';
import { PublishedGame } from '@/types';

function gameFromRow(row: any): PublishedGame {
  return {
    title: row.title,
    desc: row.description || '',
    owner: row.owner,
    ts: row.ts,
    thumbnail: row.thumbnail,
    gameCode: row.game_code,
    playable: row.playable === 1,
    multiplayer: row.multiplayer === 1,
    maxPlayers: row.max_players
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  };
}

export async function GET() {
  try {
<<<<<<< HEAD
    const games = await getDocuments(COLLECTIONS.PUBLISHED_GAMES, (ref) => ref.orderBy('ts', 'desc'));
    return NextResponse.json(games.map(gameFromDoc));
=======
    const db = getDb();
    const rows = db.prepare('SELECT * FROM published_games ORDER BY ts DESC').all();
    const games = rows.map(gameFromRow);
    
    // Also include built-in games
    try {
      const { BUILTIN_GAMES } = await import('@/lib/builtinGames');
      const builtinMap = new Map(BUILTIN_GAMES.map(g => [g.gameCode || g.title, g]));
      
      // Remove built-in games that are already in the database
      games.forEach(g => {
        const key = g.gameCode || g.title;
        if (builtinMap.has(key)) {
          builtinMap.delete(key);
        }
      });
      
      // Add remaining built-in games
      const newBuiltin = Array.from(builtinMap.values());
      games.push(...newBuiltin);
    } catch (error) {
      console.error('Error loading built-in games:', error);
    }
    
    // Sort by timestamp (newest first)
    games.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    
    return NextResponse.json(games);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  } catch (error) {
    console.error('Error reading published games:', error);
    return NextResponse.json({ error: 'Failed to read published games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const games: PublishedGame[] = await request.json();
    
<<<<<<< HEAD
    // Get all existing games and delete them
    const existingGames = await getDocuments(COLLECTIONS.PUBLISHED_GAMES);
    for (const game of existingGames) {
      await deleteDocument(COLLECTIONS.PUBLISHED_GAMES, game.id);
    }
    
    // Add new games
    for (const game of games) {
      const gameId = `${game.owner}_${game.ts}`;
      await setDocument(COLLECTIONS.PUBLISHED_GAMES, gameId, {
        title: game.title,
        description: game.desc || '',
        owner: game.owner,
        ts: game.ts,
        thumbnail: game.thumbnail,
        game_code: game.gameCode || '',
        playable: game.playable !== false,
        multiplayer: game.multiplayer === true,
        max_players: game.maxPlayers,
        created_at: Date.now()
      });
    }
    
=======
    // Clear existing games and insert new ones
    db.prepare('DELETE FROM published_games').run();
    
    const insert = db.prepare(`
      INSERT INTO published_games (
        title, description, owner, ts, thumbnail, game_code, playable, multiplayer, max_players
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((games: PublishedGame[]) => {
      for (const game of games) {
        insert.run(
          game.title,
          game.desc || '',
          game.owner,
          game.ts,
          game.thumbnail,
          game.gameCode || '',
          game.playable ? 1 : 0,
          game.multiplayer ? 1 : 0,
          game.maxPlayers
        );
      }
    });
    
    insertMany(games);
    
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error saving published games:', error);
    return NextResponse.json({ error: 'Failed to save published games' }, { status: 500 });
  }
}
