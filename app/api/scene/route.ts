import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocument, setDocument, getDocuments, COLLECTIONS } from '@/lib/firestore';
=======
import { getDb } from '@/lib/db';
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
import { SceneData } from '@/types';

export async function GET(request: NextRequest) {
  try {
<<<<<<< HEAD
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    const doc = await getDocument(COLLECTIONS.SCENES, userId);
    if (doc && doc.scene_data) {
      return NextResponse.json(typeof doc.scene_data === 'string' ? JSON.parse(doc.scene_data) : doc.scene_data);
=======
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    const row = db.prepare('SELECT * FROM scenes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
    if (row) {
      return NextResponse.json(JSON.parse(row.scene_data));
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    }
    return NextResponse.json({ objects: [] });
  } catch (error) {
    console.error('Error reading scene:', error);
    return NextResponse.json({ error: 'Failed to read scene' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
=======
    const db = getDb();
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    const scene: SceneData = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
<<<<<<< HEAD
    await setDocument(COLLECTIONS.SCENES, userId, {
      user_id: userId,
      scene_data: scene,
      updated_at: Date.now()
    });
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    
    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error saving scene:', error);
    return NextResponse.json({ error: 'Failed to save scene' }, { status: 500 });
  }
}
