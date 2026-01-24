import { NextRequest, NextResponse } from 'next/server';
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
  };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM published_games ORDER BY ts DESC').all();
    const games = rows.map(gameFromRow);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error reading published games:', error);
    return NextResponse.json({ error: 'Failed to read published games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const games: PublishedGame[] = await request.json();
    
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
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error saving published games:', error);
    return NextResponse.json({ error: 'Failed to save published games' }, { status: 500 });
  }
}
