export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, setDocument } from '@/lib/firestore';
import { Skin } from '@/types';
import { requireAdmin } from '@/lib/middleware';

/**
 * POST /api/skins/force-init
 * Overwrites Firestore skins catalog with starter + safety-points-only skins (500+ poly).
 * All use3d, supported accessory types only. Run manually to reset catalog.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;

    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const starter: Skin = {
      id: 'starter_classic',
      name: 'Starter Classic',
      price: 0,
      img: '',
      colors: { head: '#f4c2a1', torso: '#4d536f', arm: '#3a3f56', legs: '#3a3f56' },
      use3d: true,
      defaultAnimation: 'idle',
    };

    const safetyOnlySkins: Skin[] = [
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
        materials: {
          torso: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ffff', emissiveIntensity: 0.8 },
          head: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ffff', emissiveIntensity: 0.6 },
          arm: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#00ccff', emissiveIntensity: 0.7 },
          legs: { type: 'metal', roughness: 0.2, metalness: 0.8, emissive: '#0099ff', emissiveIntensity: 0.7 },
        },
        accessories: [
          { id: 'neon_helmet', type: 'hat', name: 'Neon Helmet', color: '#00ffff', position: { x: 0, y: 0.2, z: 0 } },
          { id: 'neon_aura', type: 'backpack', name: 'Neon Aura', color: '#00ffff', position: { x: 0, y: 0, z: 0 } },
        ],
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
        materials: {
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff4500', emissiveIntensity: 1.0 },
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff6b35', emissiveIntensity: 0.8 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#ff3300', emissiveIntensity: 0.9 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#cc0000', emissiveIntensity: 0.9 },
        },
        accessories: [
          { id: 'fire_crown', type: 'hat', name: 'Fire Crown', color: '#ff4500', position: { x: 0, y: 0.3, z: 0 } },
          { id: 'fire_aura', type: 'backpack', name: 'Fire Aura', color: '#ff3300', position: { x: 0, y: 0, z: 0 } },
        ],
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
        materials: {
          torso: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#87ceeb', emissiveIntensity: 0.9 },
          head: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#e0f7ff', emissiveIntensity: 0.7 },
          arm: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#5dade2', emissiveIntensity: 0.8 },
          legs: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: '#3498db', emissiveIntensity: 0.8 },
        },
        accessories: [
          { id: 'ice_crown', type: 'hat', name: 'Ice Crown', color: '#87ceeb', position: { x: 0, y: 0.3, z: 0 } },
          { id: 'ice_wings', type: 'wings', name: 'Ice Wings', color: '#5dade2', position: { x: 0, y: 0.5, z: 0 } },
        ],
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
        materials: {
          torso: { type: 'metal', roughness: 0.0, metalness: 1.0, emissive: '#6600ff', emissiveIntensity: 0.6 },
          head: { type: 'metal', roughness: 0.0, metalness: 1.0, emissive: '#6600ff', emissiveIntensity: 0.4 },
          arm: { type: 'metal', roughness: 0.0, metalness: 1.0, emissive: '#6600ff', emissiveIntensity: 0.5 },
          legs: { type: 'metal', roughness: 0.0, metalness: 1.0, emissive: '#6600ff', emissiveIntensity: 0.5 },
        },
        accessories: [
          { id: 'shadow_hood', type: 'hat', name: 'Shadow Hood', color: '#1a1a1a', position: { x: 0, y: 0, z: 0.1 } },
          { id: 'shadow_wings', type: 'wings', name: 'Shadow Wings', color: '#6600ff', position: { x: 0, y: 0.3, z: 0 } },
        ],
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
        materials: {
          torso: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffd700', emissiveIntensity: 1.0 },
          head: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffd700', emissiveIntensity: 0.8 },
          arm: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffb347', emissiveIntensity: 0.9 },
          legs: { type: 'metal', roughness: 0.1, metalness: 1.0, emissive: '#ffa500', emissiveIntensity: 0.9 },
        },
        accessories: [
          { id: 'golden_crown', type: 'hat', name: 'Golden Crown', color: '#ffd700', position: { x: 0, y: 0.3, z: 0 } },
          { id: 'golden_wings', type: 'wings', name: 'Golden Wings', color: '#ffb347', position: { x: 0, y: 0.5, z: 0 } },
        ],
      },
      { id: 'safety_guardian', name: 'Guardian', price: 0, safetyPointsPrice: 50, isSpecial: true, img: 'guardian', colors: { head: '#f4c2a1', torso: '#2d4a7c', arm: '#1e3a5f', legs: '#1e3a5f' }, use3d: true, defaultAnimation: 'idle' },
      { id: 'safety_protector', name: 'Protector', price: 0, safetyPointsPrice: 60, isSpecial: true, img: 'protector', colors: { head: '#f4c2a1', torso: '#4a90e2', arm: '#357abd', legs: '#357abd' }, use3d: true, defaultAnimation: 'idle' },
      { id: 'safety_sentinel', name: 'Sentinel', price: 0, safetyPointsPrice: 65, isSpecial: true, img: 'sentinel', colors: { head: '#e8d5b7', torso: '#3d5a80', arm: '#2d4a6f', legs: '#2d4a6f' }, use3d: true, defaultAnimation: 'idle' },
      { id: 'safety_warden', name: 'Warden', price: 0, safetyPointsPrice: 70, isSpecial: true, img: 'warden', colors: { head: '#f4c2a1', torso: '#5a7fb8', arm: '#4a6fa8', legs: '#4a6fa8' }, use3d: true, defaultAnimation: 'idle' },
      { id: 'safety_defender', name: 'Defender', price: 0, safetyPointsPrice: 75, isSpecial: true, img: 'defender', colors: { head: '#e8d5b7', torso: '#6b8fc7', arm: '#5a7fb8', legs: '#5a7fb8' }, use3d: true, defaultAnimation: 'idle' },
      { id: 'safety_shield', name: 'Shield Warrior', price: 0, safetyPointsPrice: 80, isSpecial: true, img: 'shield_warrior', colors: { head: '#f4c2a1', torso: '#5a7fb8', arm: '#4a6fa8', legs: '#4a6fa8' }, use3d: true, defaultAnimation: 'idle' },
      { id: 'safety_knight', name: 'Safety Knight', price: 0, safetyPointsPrice: 85, isSpecial: true, img: 'safety_knight', colors: { head: '#e8d5b7', torso: '#4a5568', arm: '#3a4558', legs: '#3a4558' }, use3d: true, defaultAnimation: 'idle' },
      { id: 'safety_vanguard', name: 'Vanguard', price: 0, safetyPointsPrice: 100, isSpecial: true, img: 'vanguard', colors: { head: '#f4c2a1', torso: '#8bb0e6', arm: '#7ba0d6', legs: '#7ba0d6' }, use3d: true, defaultAnimation: 'idle' },
      { id: 'safety_legend', name: 'Safety Legend', price: 0, safetyPointsPrice: 175, isSpecial: true, img: 'safety_legend', colors: { head: '#f4c2a1', torso: '#7ba0d6', arm: '#6b8fc7', legs: '#6b8fc7' }, use3d: true, defaultAnimation: 'idle' },
    ];

    const skins: Skin[] = [starter, ...safetyOnlySkins];

    await setDocument(COLLECTIONS.SKINS_CATALOG, 'catalog', {
      skins,
      updated_at: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Skins catalog force-initialized',
      count: skins.length,
      skins: skins.map((s) => ({ id: s.id, name: s.name })),
    });
  } catch (error: any) {
    console.error('Error force-initializing skins:', error);
    return NextResponse.json({ error: 'Failed to force-init skins' }, { status: 500 });
  }
}
