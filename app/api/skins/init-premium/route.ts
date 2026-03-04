export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';
import { Skin } from '@/types';

/**
 * POST /api/skins/init-premium
 * Initialize premium skins with 500+ polygons, glows, accessories, and faces
 */
export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Get existing skins from catalog document
    const skinsDoc = await getDocument(COLLECTIONS.SKINS_CATALOG, 'catalog');
    const existingSkins: Skin[] = skinsDoc?.skins || [];
    const existingSkinIds = new Set(existingSkins.map((s: Skin) => s.id));

    // Premium skins with glows and accessories (500+ polygons guaranteed)
    const premiumSkins: Skin[] = [
      // Premium Glowing Skins with Accessories
      {
        id: 'premium_phoenix_guardian',
        name: 'Phoenix Guardian',
        price: 0,
        safetyPointsPrice: 300,
        isSpecial: true,
        img: 'phoenix_guardian',
        colors: { head: '#ff4500', torso: '#8b0000', arm: '#ff8c00', legs: '#8b0000' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'fire',
        rarity: 'legendary',
        materials: {
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff4500', emissiveIntensity: 1.2 },
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff8c00', emissiveIntensity: 1.0 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff4500', emissiveIntensity: 0.8 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#8b0000', emissiveIntensity: 0.8 }
        },
        skinAccessories: [
          { id: 'phoenix_helm', type: 'hat', name: 'Phoenix Helm', color: '#ff4500', position: { x: 0, y: 0.3, z: 0 } },
          { id: 'phoenix_wings', type: 'backpack', name: 'Phoenix Wings', color: '#ff8c00', position: { x: 0, y: 0.4, z: -0.2 } }
        ]
      },
      {
        id: 'premium_neon_warrior',
        name: 'Neon Warrior',
        price: 0,
        safetyPointsPrice: 200,
        isSpecial: true,
        img: 'neon_warrior',
        colors: { head: '#f4c2a1', torso: '#00ffff', arm: '#00ccff', legs: '#0099ff' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'neon',
        rarity: 'legendary',
        materials: {
          torso: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ffff', emissiveIntensity: 0.8 },
          head: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ffff', emissiveIntensity: 0.6 },
          arm: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ccff', emissiveIntensity: 0.7 },
          legs: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#0099ff', emissiveIntensity: 0.7 }
        },
        skinAccessories: [
          { id: 'neon_helmet', type: 'hat', name: 'Neon Helmet', color: '#00ffff', position: { x: 0, y: 0.2, z: 0 } },
          { id: 'neon_sword', type: 'weapon', name: 'Neon Blade', color: '#00ffff', position: { x: 0.5, y: 0, z: 0 } }
        ]
      },
      {
        id: 'premium_fire_lord',
        name: 'Fire Lord',
        price: 0,
        safetyPointsPrice: 220,
        isSpecial: true,
        img: 'fire_lord',
        colors: { head: '#ff6b35', torso: '#ff4500', arm: '#ff3300', legs: '#cc0000' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'fire',
        rarity: 'legendary',
        materials: {
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff4500', emissiveIntensity: 1.0 },
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff6b35', emissiveIntensity: 0.8 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff3300', emissiveIntensity: 0.9 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#cc0000', emissiveIntensity: 0.9 }
        },
        skinAccessories: [
          { id: 'fire_crown', type: 'hat', name: 'Fire Crown', color: '#ff4500', position: { x: 0, y: 0.3, z: 0 } },
          { id: 'fire_aura', type: 'backpack', name: 'Fire Aura', color: '#ff3300', position: { x: 0, y: 0, z: 0 } }
        ]
      },
      {
        id: 'premium_ice_king',
        name: 'Ice King',
        price: 0,
        safetyPointsPrice: 230,
        isSpecial: true,
        img: 'ice_king',
        colors: { head: '#e0f7ff', torso: '#87ceeb', arm: '#5dade2', legs: '#3498db' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'ice',
        rarity: 'legendary',
        materials: {
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#87ceeb', emissiveIntensity: 0.9 },
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#e0f7ff', emissiveIntensity: 0.7 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#5dade2', emissiveIntensity: 0.8 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#3498db', emissiveIntensity: 0.8 }
        },
        skinAccessories: [
          { id: 'ice_crown', type: 'hat', name: 'Ice Crown', color: '#87ceeb', position: { x: 0, y: 0.3, z: 0 } },
          { id: 'ice_shield', type: 'weapon', name: 'Ice Shield', color: '#5dade2', position: { x: -0.5, y: 0, z: 0 } }
        ]
      },
      {
        id: 'premium_shadow_assassin',
        name: 'Shadow Assassin',
        price: 0,
        safetyPointsPrice: 240,
        isSpecial: true,
        img: 'shadow_assassin',
        colors: { head: '#2c2c2c', torso: '#1a1a1a', arm: '#0f0f0f', legs: '#050505' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'shadow',
        rarity: 'legendary',
        materials: {
          torso: { type: 'metal', roughness: 0.0, metalness: 1.0, emissive: '#6600ff', emissiveIntensity: 0.6 },
          head: { type: 'metal', roughness: 0.0, metalness: 1.0, emissive: '#6600ff', emissiveIntensity: 0.4 },
          arm: { type: 'metal', roughness: 0.0, metalness: 1.0, emissive: '#6600ff', emissiveIntensity: 0.5 },
          legs: { type: 'metal', roughness: 0.0, metalness: 1.0, emissive: '#6600ff', emissiveIntensity: 0.5 }
        },
        skinAccessories: [
          { id: 'shadow_mask', type: 'mask', name: 'Shadow Mask', color: '#1a1a1a', position: { x: 0, y: 0, z: 0.1 } },
          { id: 'shadow_daggers', type: 'weapon', name: 'Shadow Daggers', color: '#6600ff', position: { x: 0.3, y: 0, z: 0 } }
        ]
      },
      {
        id: 'premium_golden_legend',
        name: 'Golden Legend',
        price: 0,
        safetyPointsPrice: 250,
        isSpecial: true,
        img: 'golden_legend',
        colors: { head: '#ffd700', torso: '#ffb347', arm: '#ffa500', legs: '#ff8c00' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'gold',
        rarity: 'legendary',
        materials: {
          torso: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffd700', emissiveIntensity: 1.0 },
          head: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffd700', emissiveIntensity: 0.8 },
          arm: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffb347', emissiveIntensity: 0.9 },
          legs: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffa500', emissiveIntensity: 0.9 }
        },
        skinAccessories: [
          { id: 'golden_crown', type: 'hat', name: 'Golden Crown', color: '#ffd700', position: { x: 0, y: 0.3, z: 0 } },
          { id: 'golden_wings', type: 'backpack', name: 'Golden Wings', color: '#ffb347', position: { x: 0, y: 0.5, z: 0 } }
        ]
      }
    ];

    // Premium Faces with Single Currency Pricing (500+ polygons, glows) - Choose Coins OR Safety Points
    const premiumFaces: Skin[] = [
      {
        id: 'face_neon_glow',
        name: 'Neon Glow Face',
        price: 500, // Can pay with coins (required, not free)
        safetyPointsPrice: 50, // OR pay with safety points
        isFace: true,
        isSpecial: true,
        img: 'face_neon_glow',
        colors: { head: '#00ffff', torso: '#00ffff', arm: '#00ffff', legs: '#00ffff' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'neon',
        rarity: 'epic',
        materials: {
          head: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ffff', emissiveIntensity: 0.9 },
          torso: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ffff', emissiveIntensity: 0.9 },
          arm: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ccff', emissiveIntensity: 0.8 },
          legs: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#0099ff', emissiveIntensity: 0.8 }
        }
      },
      {
        id: 'face_fire_glow',
        name: 'Fire Glow Face',
        price: 750, // Required, not free
        safetyPointsPrice: 75,
        isFace: true,
        isSpecial: true,
        img: 'face_fire_glow',
        colors: { head: '#ff4500', torso: '#ff4500', arm: '#ff4500', legs: '#ff4500' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'fire',
        rarity: 'epic',
        materials: {
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff4500', emissiveIntensity: 1.0 },
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff4500', emissiveIntensity: 1.0 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff3300', emissiveIntensity: 0.9 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#cc0000', emissiveIntensity: 0.9 }
        }
      },
      {
        id: 'face_ice_glow',
        name: 'Ice Glow Face',
        price: 750, // Required, not free
        safetyPointsPrice: 75,
        isFace: true,
        isSpecial: true,
        img: 'face_ice_glow',
        colors: { head: '#87ceeb', torso: '#87ceeb', arm: '#87ceeb', legs: '#87ceeb' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'ice',
        rarity: 'epic',
        materials: {
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#87ceeb', emissiveIntensity: 0.9 },
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#87ceeb', emissiveIntensity: 0.9 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#5dade2', emissiveIntensity: 0.8 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#3498db', emissiveIntensity: 0.8 }
        }
      },
      {
        id: 'face_purple_glow',
        name: 'Purple Glow Face',
        price: 1000, // Required, not free
        safetyPointsPrice: 100,
        isFace: true,
        isSpecial: true,
        img: 'face_purple_glow',
        colors: { head: '#9b59b6', torso: '#9b59b6', arm: '#9b59b6', legs: '#9b59b6' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'purple',
        rarity: 'epic',
        materials: {
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#9b59b6', emissiveIntensity: 0.9 },
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#9b59b6', emissiveIntensity: 0.9 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#8e44ad', emissiveIntensity: 0.8 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#7d3c98', emissiveIntensity: 0.8 }
        }
      },
      {
        id: 'face_golden_glow',
        name: 'Golden Glow Face',
        price: 1500, // Required, not free
        safetyPointsPrice: 150,
        isFace: true,
        isSpecial: true,
        img: 'face_golden_glow',
        colors: { head: '#ffd700', torso: '#ffd700', arm: '#ffd700', legs: '#ffd700' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'gold',
        rarity: 'legendary',
        materials: {
          head: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffd700', emissiveIntensity: 1.0 },
          torso: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffd700', emissiveIntensity: 1.0 },
          arm: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffb347', emissiveIntensity: 0.9 },
          legs: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffa500', emissiveIntensity: 0.9 }
        }
      },
      {
        id: 'face_rainbow_glow',
        name: 'Rainbow Glow Face',
        price: 2000, // Required, not free
        safetyPointsPrice: 200,
        isFace: true,
        isSpecial: true,
        img: 'face_rainbow_glow',
        colors: { head: '#ffffff', torso: '#ffffff', arm: '#ffffff', legs: '#ffffff' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'rainbow',
        rarity: 'legendary',
        materials: {
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff00ff', emissiveIntensity: 1.0 },
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#00ffff', emissiveIntensity: 1.0 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ffff00', emissiveIntensity: 0.9 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#00ff00', emissiveIntensity: 0.9 }
        }
      }
    ];

    // Merge with existing skins (don't overwrite existing ones)
    const allNewSkins = [...premiumSkins, ...premiumFaces];
    const skinsToAdd = allNewSkins.filter(skin => !existingSkinIds.has(skin.id));
    const updatedSkins = [...existingSkins, ...skinsToAdd];

    // Save updated skins catalog
    // Remove skins that are 'isSpecial' but have 0 price and no safetyPointsPrice (broken/old data)
    const cleanedSkins = updatedSkins.filter(skin => {
      if (skin.isSpecial && (skin.price === 0 || !skin.price) && (!skin.safetyPointsPrice || skin.safetyPointsPrice === 0)) {
        return false; // Remove broken special skin
      }
      return true;
    });

    await setDocument(COLLECTIONS.SKINS_CATALOG, 'catalog', {
      skins: cleanedSkins,
      updated_at: Date.now()
    });

    return NextResponse.json({ 
      success: true, 
      message: `Added ${skinsToAdd.length} premium skins/faces. Removed broken skins.`,
      added: skinsToAdd.length,
      premiumSkins: premiumSkins.length,
      premiumFaces: premiumFaces.length,
      existing: existingSkins.length,
      totalCleaned: cleanedSkins.length
    });
  } catch (error: any) {
    console.error('Error initializing premium skins:', error);
    return NextResponse.json({ error: 'Failed to initialize premium skins' }, { status: 500 });
  }
}
