import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { setDocument, deleteDocument, getDocuments, COLLECTIONS } from '@/lib/firestore';
import { PublishedGame } from '@/types';

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
    
    // Clear existing games
    const existingGames = await getDocuments(COLLECTIONS.PUBLISHED_GAMES);
    for (const game of existingGames) {
      await deleteDocument(COLLECTIONS.PUBLISHED_GAMES, game.id);
    }
    
    // Add new games to Firestore
    for (const game of games) {
      const gameId = `${game.owner}_${game.ts}`;
      await setDocument(COLLECTIONS.PUBLISHED_GAMES, gameId, {
        title: game.title,
        description: game.desc || '',
        owner: game.owner,
        ts: game.ts,
        thumbnail: game.thumbnail || null,
        game_code: game.gameCode || null,
        scene_data: game.sceneData ? JSON.stringify(game.sceneData) : null,
        playable: game.playable !== false,
        multiplayer: game.multiplayer === true,
        max_players: game.maxPlayers || null,
        server_id: game.serverId || null,
        created_at: Date.now()
      });
    }
    
    return NextResponse.json({ success: true, games, count: games.length });
  } catch (error: any) {
    console.error('Error initializing published games:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize games' }, { status: 500 });
  }
}
