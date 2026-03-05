export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';
import { Skin } from '@/types';
import { NEW_SKINS } from '@/lib/newCatalog';

export async function GET() {
  try {
    // Get skins from Firestore (stored as a single document with array)
    const skinsDoc = await getDocument(COLLECTIONS.SKINS_CATALOG, 'catalog');
    if (skinsDoc && skinsDoc.skins && Array.isArray(skinsDoc.skins) && skinsDoc.skins.length > 0) {
      return NextResponse.json(skinsDoc.skins);
    }
    // Fallback to NEW_SKINS when catalog is empty (includes 10-coin starter skins)
    return NextResponse.json(NEW_SKINS);
  } catch (error) {
    console.error('Error reading skins:', error);
    return NextResponse.json({ error: 'Failed to read skins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const skins: Skin[] = await request.json();
    // Store skins array in Firestore
    await setDocument(COLLECTIONS.SKINS_CATALOG, 'catalog', {
      skins: skins,
      updated_at: Date.now()
    });
    return NextResponse.json(skins);
  } catch (error) {
    console.error('Error saving skins:', error);
    return NextResponse.json({ error: 'Failed to save skins' }, { status: 500 });
  }
}
