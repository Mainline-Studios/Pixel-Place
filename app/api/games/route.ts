import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { getDocuments, setDocument, deleteDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { UserMadeGame } from '@/types';

function gameFromDoc(doc: any): UserMadeGame {
  return {
    id: doc.id,
    title: doc.title,
    desc: doc.description || '',
    owner: doc.owner,
    ts: doc.ts,
    sceneData: typeof doc.scene_data === 'string' ? JSON.parse(doc.scene_data) : doc.scene_data,
    publishedBy: doc.published_by,
    gameType: doc.game_type,
    fileContent: doc.file_content,
    fileType: doc.file_type
  };
}

// Get all games (public, but can filter by owner if authenticated)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    
    let games;
    if (owner) {
      games = await queryDocuments(COLLECTIONS.GAMES || 'games', 'owner', '==', owner);
    } else {
      games = await getDocuments(COLLECTIONS.GAMES || 'games', (ref) => ref.orderBy('ts', 'desc'));
    }
    
    return NextResponse.json(games.map(gameFromDoc));
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
    const gameId = game.id || `game_${Date.now()}`;
    
    await setDocument(COLLECTIONS.GAMES || 'games', gameId, {
      id: gameId,
      title: game.title,
      description: game.desc || '',
      owner: game.owner || authResult.user.username,
      ts: game.ts || Date.now(),
      scene_data: game.sceneData || null,
      preset_messages: (game as any).presetMessages || null,
      controls: (game as any).controls || null,
      published_by: game.publishedBy || null,
      game_type: game.gameType || null,
      file_content: game.fileContent || null,
      file_type: game.fileType || null,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    
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
    
    // Check ownership
    const existingGames = await getDocuments(COLLECTIONS.GAMES || 'games');
    const existing = existingGames.find(g => g.id === game.id);
    
    if (existing && existing.owner !== authResult.user.username && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await setDocument(COLLECTIONS.GAMES || 'games', game.id, {
      title: game.title,
      description: game.desc || '',
      scene_data: game.sceneData || null,
      preset_messages: game.presetMessages || null,
      controls: game.controls || null,
      published_by: game.publishedBy || null,
      updated_at: Date.now()
    });
    
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
    
    // Check ownership
    const existingGames = await getDocuments(COLLECTIONS.GAMES || 'games');
    const existing = existingGames.find(g => g.id === gameId);
    
    if (existing && existing.owner !== authResult.user.username && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await deleteDocument(COLLECTIONS.GAMES || 'games', gameId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete game' }, { status: 500 });
  }
}
