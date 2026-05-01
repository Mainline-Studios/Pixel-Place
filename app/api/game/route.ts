export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS, getDocuments, queryDocuments, setDocument } from '@/lib/firestore';

async function ensureSequentialGameIds(): Promise<void> {
  const games = await getDocuments(COLLECTIONS.GAMES || 'games');
  const sorted = [...games].sort((a: any, b: any) => {
    const ac = Number(a.created_at || a.ts || 0);
    const bc = Number(b.created_at || b.ts || 0);
    if (ac !== bc) return ac - bc;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  await Promise.all(
    sorted.map((game: any, idx: number) => {
      const expected = idx + 1;
      const existing = Number(game.game_id || 0);
      if (Number.isFinite(existing) && existing === expected) return Promise.resolve();
      return setDocument(COLLECTIONS.GAMES || 'games', String(game.id), {
        game_id: expected,
        updated_at: Date.now(),
      });
    }),
  );
}

export async function GET(request: NextRequest) {
  try {
    await ensureSequentialGameIds();
    const url = new URL(request.url);
    const gameId = Number(url.searchParams.get('gameId') || '');
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return NextResponse.json({ error: 'Invalid gameId' }, { status: 400 });
    }
    const games = await queryDocuments(COLLECTIONS.GAMES, 'game_id', '==', gameId);
    if (!games.length) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    const game = games[0] as any;
    return NextResponse.json({
      gameId,
      id: String(game.id || ''),
      title: String(game.title || ''),
      desc: String(game.description || ''),
      owner: String(game.owner || ''),
      ts: Number(game.ts || 0) || undefined,
      createdAt: Number(game.created_at || 0) || undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load game profile' }, { status: 500 });
  }
}
