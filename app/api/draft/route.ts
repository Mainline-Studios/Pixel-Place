import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DraftGame } from '@/types';

function draftFromRow(row: any): DraftGame {
  return {
    title: row.title || '',
    desc: row.desc || '',
    owner: row.owner || '',
    gameCode: row.game_code || '',
    thumbnail: row.thumbnail
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'default';
    
    const row = db.prepare('SELECT * FROM drafts WHERE username = ?').get(username);
    if (row) {
      return NextResponse.json(draftFromRow(row));
    }
    return NextResponse.json({ title: "", desc: "", owner: "" });
  } catch (error) {
    console.error('Error reading draft:', error);
    return NextResponse.json({ error: 'Failed to read draft' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const draft: DraftGame = await request.json();
    const username = draft.owner || 'default';
    
    const existing = db.prepare('SELECT * FROM drafts WHERE username = ?').get(username);
    
    if (existing) {
      db.prepare(`
        UPDATE drafts SET
          title = ?,
          desc = ?,
          owner = ?,
          game_code = ?,
          thumbnail = ?,
          updated_at = strftime('%s', 'now')
        WHERE username = ?
      `).run(
        draft.title || '',
        draft.desc || '',
        draft.owner || '',
        draft.gameCode || '',
        draft.thumbnail,
        username
      );
    } else {
      db.prepare(`
        INSERT INTO drafts (username, title, desc, owner, game_code, thumbnail)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        username,
        draft.title || '',
        draft.desc || '',
        draft.owner || '',
        draft.gameCode || '',
        draft.thumbnail
      );
    }
    
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}
