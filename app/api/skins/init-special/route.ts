import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';
import { Skin } from '@/types';

/**
 * POST /api/skins/init-special
 * Initialize special skins that cost Safety Points
 * This is a one-time setup route
 */
export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Get existing skins
    const existingSkins = await db.collection(COLLECTIONS.SKINS_CATALOG).get();
    const existingSkinIds = new Set(existingSkins.docs.map(doc => doc.id));

    // Define special skins (50-250 Safety Points)
    const specialSkins: Skin[] = [
      {
        id: 'safety_guardian',
        name: 'Guardian',
        price: 0, // Free with coins, but costs Safety Points
        safetyPointsPrice: 50,
        isSpecial: true,
        img: 'guardian',
        colors: {
          head: '#f4c2a1',
          torso: '#2d4a7c',
          arm: '#1e3a5f',
          legs: '#1e3a5f'
        },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'guardian',
        rarity: 'rare'
      },
      {
        id: 'safety_protector',
        name: 'Protector',
        price: 0,
        safetyPointsPrice: 75,
        isSpecial: true,
        img: 'protector',
        colors: {
          head: '#f4c2a1',
          torso: '#4a90e2',
          arm: '#357abd',
          legs: '#357abd'
        },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'protector',
        rarity: 'rare'
      },
      {
        id: 'safety_shield',
        name: 'Shield Warrior',
        price: 0,
        safetyPointsPrice: 100,
        isSpecial: true,
        img: 'shield_warrior',
        colors: {
          head: '#f4c2a1',
          torso: '#5a7fb8',
          arm: '#4a6fa8',
          legs: '#4a6fa8'
        },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'warrior',
        rarity: 'epic'
      },
      {
        id: 'safety_hero',
        name: 'Safety Hero',
        price: 0,
        safetyPointsPrice: 150,
        isSpecial: true,
        img: 'safety_hero',
        colors: {
          head: '#f4c2a1',
          torso: '#6b8fc7',
          arm: '#5a7fb8',
          legs: '#5a7fb8'
        },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'hero',
        rarity: 'legendary'
      },
      {
        id: 'safety_legend',
        name: 'Safety Legend',
        price: 0,
        safetyPointsPrice: 250,
        isSpecial: true,
        img: 'safety_legend',
        colors: {
          head: '#f4c2a1',
          torso: '#7ba0d6',
          arm: '#6b8fc7',
          legs: '#6b8fc7'
        },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'legend',
        rarity: 'legendary'
      }
    ];

    // Add special skins that don't exist
    const batch = db.batch();
    let added = 0;
    
    for (const skin of specialSkins) {
      if (!existingSkinIds.has(skin.id)) {
        const docRef = db.collection(COLLECTIONS.SKINS_CATALOG).doc(skin.id);
        batch.set(docRef, skin);
        added++;
      }
    }

    if (added > 0) {
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true, 
      message: `Initialized ${added} special skins`,
      added,
      total: specialSkins.length
    });
  } catch (error: any) {
    console.error('Error initializing special skins:', error);
    return NextResponse.json({ error: 'Failed to initialize special skins' }, { status: 500 });
  }
}
