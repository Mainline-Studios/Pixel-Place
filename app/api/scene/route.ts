import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, getDocuments, COLLECTIONS } from '@/lib/firestore';
import { SceneData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    const doc = await getDocument(COLLECTIONS.SCENES, userId);
    if (doc && doc.scene_data) {
      return NextResponse.json(typeof doc.scene_data === 'string' ? JSON.parse(doc.scene_data) : doc.scene_data);
    }
    return NextResponse.json({ objects: [] });
  } catch (error) {
    console.error('Error reading scene:', error);
    return NextResponse.json({ error: 'Failed to read scene' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const scene: SceneData = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    await setDocument(COLLECTIONS.SCENES, userId, {
      user_id: userId,
      scene_data: scene,
      updated_at: Date.now()
    });
    
    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error saving scene:', error);
    return NextResponse.json({ error: 'Failed to save scene' }, { status: 500 });
  }
}
