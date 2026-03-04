export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';
import { Accessory } from '@/types';

export async function GET() {
  try {
    // Get accessories from Firestore (stored as a single document with array)
    const accessoriesDoc = await getDocument(COLLECTIONS.ACCESSORIES_CATALOG, 'catalog');
    if (accessoriesDoc && accessoriesDoc.accessories) {
      return NextResponse.json(accessoriesDoc.accessories);
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error reading accessories:', error);
    return NextResponse.json({ error: 'Failed to read accessories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessories: Accessory[] = await request.json();
    // Store accessories array in Firestore
    await setDocument(COLLECTIONS.ACCESSORIES_CATALOG, 'catalog', {
      accessories: accessories,
      updated_at: Date.now()
    });
    return NextResponse.json(accessories);
  } catch (error) {
    console.error('Error saving accessories:', error);
    return NextResponse.json({ error: 'Failed to save accessories' }, { status: 500 });
  }
}
