import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';
import { DraftGame } from '@/types';

function draftFromDoc(doc: any): DraftGame {
  return {
    title: doc.title || '',
    desc: doc.desc || '',
    owner: doc.owner || '',
    gameCode: doc.game_code || '',
    thumbnail: doc.thumbnail
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'default';

    const doc = await getDocument(COLLECTIONS.DRAFTS, username);
    if (doc) {
      return NextResponse.json(draftFromDoc(doc));
    }
    return NextResponse.json({ title: "", desc: "", owner: "" });
  } catch (error) {
    console.error('Error reading draft:', error);
    return NextResponse.json({ error: 'Failed to read draft' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const draft: DraftGame = await request.json();
    const username = draft.owner || 'default';

    await setDocument(COLLECTIONS.DRAFTS, username, {
      username: username,
      title: draft.title || '',
      desc: draft.desc || '',
      owner: draft.owner || '',
      game_code: draft.gameCode || '',
      thumbnail: draft.thumbnail,
      updated_at: Date.now()
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}
