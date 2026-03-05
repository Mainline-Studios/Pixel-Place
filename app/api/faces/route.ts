export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';

/**
 * GET /api/faces?username=xxx
 * Get user's owned faces and equipped face
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({
        ownedFaces: [],
        equippedFace: null
      });
    }

    const userDoc = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
    
    return NextResponse.json({
      ownedFaces: userDoc?.ownedFaces || [],
      equippedFace: userDoc?.equippedFace || null
    });
  } catch (error: any) {
    console.error('Error fetching faces:', error);
    return NextResponse.json({ error: 'Failed to fetch faces' }, { status: 500 });
  }
}

/**
 * POST /api/faces
 * Update user's faces (equip, purchase, etc.)
 * Body: { username, action: 'equip'|'unequip', faceId? }
 */
export async function POST(request: NextRequest) {
  try {
    const { username, action, faceId } = await request.json();

    if (!username || !action) {
      return NextResponse.json({ error: 'Username and action required' }, { status: 400 });
    }

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const userDoc = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'equip' && faceId) {
      // Verify user owns the face
      const ownedFaces = userDoc.ownedFaces || [];
      if (!ownedFaces.includes(faceId)) {
        return NextResponse.json({ error: 'Face not owned' }, { status: 400 });
      }

      await setDocument(COLLECTIONS.USERS, username.toLowerCase(), {
        ...userDoc,
        equippedFace: faceId
      });

      return NextResponse.json({ success: true, equippedFace: faceId });
    } else if (action === 'unequip') {
      await setDocument(COLLECTIONS.USERS, username.toLowerCase(), {
        ...userDoc,
        equippedFace: null
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating faces:', error);
    return NextResponse.json({ error: 'Failed to update faces' }, { status: 500 });
  }
}
