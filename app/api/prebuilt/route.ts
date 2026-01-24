import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { PrebuiltGame } from '@/types';

function gameFromRow(row: any): PrebuiltGame {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    owner: row.owner,
    ts: row.ts,
    sceneData: row.scene_data ? JSON.parse(row.scene_data) : undefined
  };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM prebuilt_games ORDER BY ts DESC').all();
    const games = rows.map(gameFromRow);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error reading prebuilt games:', error);
    return NextResponse.json({ error: 'Failed to read prebuilt games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const games: PrebuiltGame[] = await request.json();
    
    // Clear existing and insert new ones
    db.prepare('DELETE FROM prebuilt_games').run();
    
    const insert = db.prepare(`
      INSERT INTO prebuilt_games (id, title, description, owner, ts, scene_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((games: PrebuiltGame[]) => {
      for (const game of games) {
        insert.run(
          game.id,
          game.title,
          game.description || '',
          game.owner,
          game.ts,
          game.sceneData ? JSON.stringify(game.sceneData) : null
        );
      }
    });
    
    insertMany(games);
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error saving prebuilt games:', error);
    return NextResponse.json({ error: 'Failed to save prebuilt games' }, { status: 500 });
  }
}
