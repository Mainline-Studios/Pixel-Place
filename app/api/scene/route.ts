import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { getDb } from '@/lib/db';
import { SceneData } from '@/types';

// Get scene data (requires auth)
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT scene_data FROM scenes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1');
    const row = stmt.get(authResult.user.username) as any;
    
    if (!row || !row.scene_data) {
      return NextResponse.json({ objects: [] });
    }
    
    const sceneData: SceneData = JSON.parse(row.scene_data);
    return NextResponse.json(sceneData);
  } catch (error) {
    console.error('Error reading scene:', error);
    return NextResponse.json({ error: 'Failed to read scene' }, { status: 500 });
  }
}

// Save scene data (requires auth)
export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  
  try {
    const scene: SceneData = await request.json();
    const db = getDb();
    
    // Check if scene exists
    const checkStmt = db.prepare('SELECT id FROM scenes WHERE user_id = ?');
    const existing = checkStmt.get(authResult.user.username) as any;
    
    if (existing) {
      // Update existing
      const updateStmt = db.prepare(`
        UPDATE scenes SET scene_data = ?, updated_at = strftime('%s', 'now')
        WHERE user_id = ?
      `);
      updateStmt.run(JSON.stringify(scene), authResult.user.username);
    } else {
      // Insert new
      const insertStmt = db.prepare(`
        INSERT INTO scenes (user_id, scene_data)
        VALUES (?, ?)
      `);
      insertStmt.run(authResult.user.username, JSON.stringify(scene));
    }
    
    return NextResponse.json(scene);
  } catch (error: any) {
    console.error('Error saving scene:', error);
    return NextResponse.json({ error: error.message || 'Failed to save scene' }, { status: 500 });
  }
}
