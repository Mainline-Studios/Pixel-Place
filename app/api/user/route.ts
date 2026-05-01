export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS, queryDocuments } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('userId') || '');
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }
    const users = await queryDocuments(COLLECTIONS.USERS, 'user_id', '==', id);
    if (!users.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const d = users[0];
    const username = String(d.username || d.id || '');
    const madeGameDocs = await queryDocuments(COLLECTIONS.GAMES, 'owner', '==', username);
    const madeGames = madeGameDocs
      .map((g: any) => ({
        id: String(g.id || ''),
        title: String(g.title || ''),
        ts: Number(g.ts || 0),
      }))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 24);
    return NextResponse.json({
      userId: id,
      username,
      gender: d.gender || '',
      role: d.role || 'user',
      equippedSkin: d.equipped_skin || '',
      equippedFace: d.equipped_face || '',
      coins: Number(d.coins || 0),
      favoriteGameIds: Array.isArray(d.favorite_game_ids) ? d.favorite_game_ids : [],
      madeGames,
      founderOrdinal: typeof d.founder_ordinal === 'number' ? d.founder_ordinal : undefined,
      isDonor: d.is_donor === 1 || d.is_donor === true,
      createdAt: Number(d.created_at || 0) || undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load user profile' }, { status: 500 });
  }
}
