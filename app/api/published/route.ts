import { NextRequest, NextResponse } from 'next/server';
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
    maxPlayers: doc.max_players  };
}

export async function GET() {
  try {
    const games = await getDocuments(COLLECTIONS.PUBLISHED_GAMES, (ref) => ref.orderBy('ts', 'desc'));
    return NextResponse.json(games.map(gameFromDoc));  } catch (error) {
    console.error('Error reading published games:', error);
    return NextResponse.json({ error: 'Failed to read published games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const games: PublishedGame[] = await request.json();
    
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
        return NextResponse.json(games);
  } catch (error) {
    console.error('Error saving published games:', error);
    return NextResponse.json({ error: 'Failed to save published games' }, { status: 500 });
  }
}
