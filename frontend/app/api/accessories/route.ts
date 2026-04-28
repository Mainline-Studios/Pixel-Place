import { NextRequest, NextResponse } from 'next/server';
import { getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';
import { Accessory } from '@/types';
import { NEW_ACCESSORIES } from '@/lib/newCatalog';

function mergeAccessories(catalog: Accessory[] | undefined, defaults: Accessory[]): Accessory[] {
  const byId = new Map<string, Accessory>();
  for (const a of catalog || []) {
    if (a?.id) byId.set(a.id, a);
  }
  for (const a of defaults) {
    if (a?.id && !byId.has(a.id)) {
      byId.set(a.id, a);
    }
  }
  return Array.from(byId.values());
}

export async function GET() {
  try {
    // Get accessories from Firestore (stored as a single document with array)
    const accessoriesDoc = await getDocument(COLLECTIONS.ACCESSORIES_CATALOG, 'catalog');
    if (accessoriesDoc && accessoriesDoc.accessories && Array.isArray(accessoriesDoc.accessories)) {
      return NextResponse.json(
        mergeAccessories(accessoriesDoc.accessories as Accessory[], NEW_ACCESSORIES)
      );
    }
    return NextResponse.json(NEW_ACCESSORIES);
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
