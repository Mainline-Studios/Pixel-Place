import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';
import { requireAuth, requireOwnerOrAdmin } from '@/lib/middleware';
import { DraftGame } from '@/types';

function draftFromDoc(doc: any): DraftGame {
  return {
    title: doc.title || '',
    desc: doc.desc || '',
    owner: doc.owner || '',
    gameCode: doc.game_code || '',
    thumbnail: doc.thumbnail,
    sceneData: doc.scene_data || undefined,
    gameType: doc.game_type || undefined,
    fileContent: doc.file_content || undefined,
    fileType: doc.file_type || undefined
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usernameParam = searchParams.get('username') || '';

    const auth = usernameParam
      ? requireOwnerOrAdmin(request, usernameParam)
      : requireAuth(request);
    if (auth.error) return auth.error;

    const username = usernameParam || auth.user?.username || 'default';

    const doc = await getDocument(COLLECTIONS.DRAFTS, username.toLowerCase());
    if (doc) {
      return NextResponse.json(draftFromDoc(doc));
    }
    return NextResponse.json({ title: '', desc: '', owner: '' });
  } catch (error) {
    console.error('Error reading draft:', error);
    return NextResponse.json({ error: 'Failed to read draft' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const draft: DraftGame = await request.json();
    const username = (draft.owner || '').trim() || 'default';

    const auth = requireOwnerOrAdmin(request, username);
    if (auth.error) return auth.error;

    await setDocument(COLLECTIONS.DRAFTS, username.toLowerCase(), {
      username: username,
      title: draft.title || '',
      desc: draft.desc || '',
      owner: draft.owner || '',
      game_code: draft.gameCode || '',
      thumbnail: draft.thumbnail,
      scene_data: draft.sceneData || null,
      game_type: draft.gameType || null,
      file_content: draft.fileContent || null,
      file_type: draft.fileType || null,
      updated_at: Date.now()
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}
