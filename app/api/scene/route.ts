import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { SceneData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    const row = db.prepare('SELECT * FROM scenes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
    if (row) {
      return NextResponse.json(JSON.parse(row.scene_data));
    }
    return NextResponse.json({ objects: [] });
  } catch (error) {
    console.error('Error reading scene:', error);
    return NextResponse.json({ error: 'Failed to read scene' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const scene: SceneData = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    const existing = db.prepare('SELECT * FROM scenes WHERE user_id = ?').get(userId);
    
    if (existing) {
      db.prepare(`
        UPDATE scenes SET
          scene_data = ?,
          updated_at = strftime('%s', 'now')
        WHERE user_id = ?
      `).run(JSON.stringify(scene), userId);
    } else {
      db.prepare(`
        INSERT INTO scenes (user_id, scene_data)
        VALUES (?, ?)
      `).run(userId, JSON.stringify(scene));
    }
    
    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error saving scene:', error);
    return NextResponse.json({ error: 'Failed to save scene' }, { status: 500 });
  }
}
