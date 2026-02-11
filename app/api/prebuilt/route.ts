import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocuments, setDocument, deleteDocument, COLLECTIONS } from '@/lib/firestore';
import { PrebuiltGame } from '@/types';

function gameFromDoc(doc: any): PrebuiltGame {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description || '',
    owner: doc.owner,
    ts: doc.ts,
    sceneData: typeof doc.scene_data === 'string' ? JSON.parse(doc.scene_data) : doc.scene_data
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  };
}

export async function GET() {
  try {
<<<<<<< HEAD
    const games = await getDocuments(COLLECTIONS.PREBUILT_GAMES, (ref) => ref.orderBy('ts', 'desc'));
    return NextResponse.json(games.map(gameFromDoc));
=======
    const db = getDb();
    const rows = db.prepare('SELECT * FROM prebuilt_games ORDER BY ts DESC').all();
    const games = rows.map(gameFromRow);
    return NextResponse.json(games);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  } catch (error) {
    console.error('Error reading prebuilt games:', error);
    return NextResponse.json({ error: 'Failed to read prebuilt games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const games: PrebuiltGame[] = await request.json();
    
<<<<<<< HEAD
    // Get all existing games and delete them
    const existingGames = await getDocuments(COLLECTIONS.PREBUILT_GAMES);
    for (const game of existingGames) {
      await deleteDocument(COLLECTIONS.PREBUILT_GAMES, game.id);
    }
    
    // Add new games
    for (const game of games) {
      await setDocument(COLLECTIONS.PREBUILT_GAMES, game.id, {
        id: game.id,
        title: game.title,
        description: game.description || '',
        owner: game.owner,
        ts: game.ts,
        scene_data: game.sceneData ? JSON.stringify(game.sceneData) : null,
        created_at: Date.now()
      });
    }
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error saving prebuilt games:', error);
    return NextResponse.json({ error: 'Failed to save prebuilt games' }, { status: 500 });
  }
}
