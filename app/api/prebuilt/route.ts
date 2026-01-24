import { NextRequest, NextResponse } from 'next/server';
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
  };
}

export async function GET() {
  try {
    const games = await getDocuments(COLLECTIONS.PREBUILT_GAMES, (ref) => ref.orderBy('ts', 'desc'));
    return NextResponse.json(games.map(gameFromDoc));
  } catch (error) {
    console.error('Error reading prebuilt games:', error);
    return NextResponse.json({ error: 'Failed to read prebuilt games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const games: PrebuiltGame[] = await request.json();
    
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
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error saving prebuilt games:', error);
    return NextResponse.json({ error: 'Failed to save prebuilt games' }, { status: 500 });
  }
}
