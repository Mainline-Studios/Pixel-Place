import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';
import { Skin } from '@/types';

/**
 * POST /api/skins/init-special
 * Initialize special skins that cost Safety Points
 * These use high-polygon models (500+ polygons) for premium look
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

    // Define 30+ special skins with high-poly models (50-250 Safety Points)
    const specialSkins: Skin[] = [
      // Tier 1: 50-75 Safety Points (Entry Level)
      {
        id: 'safety_guardian',
        name: 'Guardian',
        price: 0,
        safetyPointsPrice: 50,
        isSpecial: true,
        img: 'guardian',
        colors: { head: '#f4c2a1', torso: '#2d4a7c', arm: '#1e3a5f', legs: '#1e3a5f' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'guardian',
        rarity: 'rare'
      },
      {
        id: 'safety_protector',
        name: 'Protector',
        price: 0,
        safetyPointsPrice: 60,
        isSpecial: true,
        img: 'protector',
        colors: { head: '#f4c2a1', torso: '#4a90e2', arm: '#357abd', legs: '#357abd' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'protector',
        rarity: 'rare'
      },
      {
        id: 'safety_sentinel',
        name: 'Sentinel',
        price: 0,
        safetyPointsPrice: 65,
        isSpecial: true,
        img: 'sentinel',
        colors: { head: '#e8d5b7', torso: '#3d5a80', arm: '#2d4a6f', legs: '#2d4a6f' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'sentinel',
        rarity: 'rare'
      },
      {
        id: 'safety_warden',
        name: 'Warden',
        price: 0,
        safetyPointsPrice: 70,
        isSpecial: true,
        img: 'warden',
        colors: { head: '#f4c2a1', torso: '#5a7fb8', arm: '#4a6fa8', legs: '#4a6fa8' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'warden',
        rarity: 'rare'
      },
      {
        id: 'safety_defender',
        name: 'Defender',
        price: 0,
        safetyPointsPrice: 75,
        isSpecial: true,
        img: 'defender',
        colors: { head: '#e8d5b7', torso: '#6b8fc7', arm: '#5a7fb8', legs: '#5a7fb8' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'defender',
        rarity: 'rare'
      },

      // Tier 2: 80-120 Safety Points (Mid Tier)
      {
        id: 'safety_shield',
        name: 'Shield Warrior',
        price: 0,
        safetyPointsPrice: 80,
        isSpecial: true,
        img: 'shield_warrior',
        colors: { head: '#f4c2a1', torso: '#5a7fb8', arm: '#4a6fa8', legs: '#4a6fa8' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'warrior',
        rarity: 'epic'
      },
      {
        id: 'safety_knight',
        name: 'Safety Knight',
        price: 0,
        safetyPointsPrice: 85,
        isSpecial: true,
        img: 'safety_knight',
        colors: { head: '#e8d5b7', torso: '#4a5568', arm: '#3a4558', legs: '#3a4558' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'knight',
        rarity: 'epic'
      },
      {
        id: 'safety_paladin',
        name: 'Paladin',
        price: 0,
        safetyPointsPrice: 90,
        isSpecial: true,
        img: 'paladin',
        colors: { head: '#f4c2a1', torso: '#6b8fc7', arm: '#5a7fb8', legs: '#5a7fb8' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'paladin',
        rarity: 'epic'
      },
      {
        id: 'safety_champion',
        name: 'Champion',
        price: 0,
        safetyPointsPrice: 95,
        isSpecial: true,
        img: 'champion',
        colors: { head: '#e8d5b7', torso: '#7ba0d6', arm: '#6b8fc7', legs: '#6b8fc7' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'champion',
        rarity: 'epic'
      },
      {
        id: 'safety_vanguard',
        name: 'Vanguard',
        price: 0,
        safetyPointsPrice: 100,
        isSpecial: true,
        img: 'vanguard',
        colors: { head: '#f4c2a1', torso: '#8bb0e6', arm: '#7ba0d6', legs: '#7ba0d6' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'vanguard',
        rarity: 'epic'
      },
      {
        id: 'safety_elite',
        name: 'Elite Guard',
        price: 0,
        safetyPointsPrice: 105,
        isSpecial: true,
        img: 'elite_guard',
        colors: { head: '#e8d5b7', torso: '#9bc0f6', arm: '#8bb0e6', legs: '#8bb0e6' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'elite',
        rarity: 'epic'
      },
      {
        id: 'safety_guardian_elite',
        name: 'Guardian Elite',
        price: 0,
        safetyPointsPrice: 110,
        isSpecial: true,
        img: 'guardian_elite',
        colors: { head: '#f4c2a1', torso: '#acd0ff', arm: '#9bc0f6', legs: '#9bc0f6' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'elite',
        rarity: 'epic'
      },
      {
        id: 'safety_master',
        name: 'Master Protector',
        price: 0,
        safetyPointsPrice: 115,
        isSpecial: true,
        img: 'master_protector',
        colors: { head: '#e8d5b7', torso: '#bde0ff', arm: '#acd0ff', legs: '#acd0ff' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'master',
        rarity: 'epic'
      },
      {
        id: 'safety_legendary',
        name: 'Legendary Guard',
        price: 0,
        safetyPointsPrice: 120,
        isSpecial: true,
        img: 'legendary_guard',
        colors: { head: '#f4c2a1', torso: '#cef0ff', arm: '#bde0ff', legs: '#bde0ff' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'legendary',
        rarity: 'epic'
      },

      // Tier 3: 125-175 Safety Points (High Tier)
      {
        id: 'safety_hero',
        name: 'Safety Hero',
        price: 0,
        safetyPointsPrice: 125,
        isSpecial: true,
        img: 'safety_hero',
        colors: { head: '#f4c2a1', torso: '#6b8fc7', arm: '#5a7fb8', legs: '#5a7fb8' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'hero',
        rarity: 'legendary'
      },
      {
        id: 'safety_phoenix',
        name: 'Phoenix Guardian',
        price: 0,
        safetyPointsPrice: 130,
        isSpecial: true,
        img: 'phoenix_guardian',
        colors: { head: '#ffd4a1', torso: '#ff6b35', arm: '#e85a2b', legs: '#e85a2b' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'phoenix',
        rarity: 'legendary'
      },
      {
        id: 'safety_dragon',
        name: 'Dragon Warrior',
        price: 0,
        safetyPointsPrice: 135,
        isSpecial: true,
        img: 'dragon_warrior',
        colors: { head: '#f4c2a1', torso: '#c0392b', arm: '#a93226', legs: '#a93226' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'dragon',
        rarity: 'legendary'
      },
      {
        id: 'safety_titan',
        name: 'Titan',
        price: 0,
        safetyPointsPrice: 140,
        isSpecial: true,
        img: 'titan',
        colors: { head: '#e8d5b7', torso: '#34495e', arm: '#2c3e50', legs: '#2c3e50' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'titan',
        rarity: 'legendary'
      },
      {
        id: 'safety_celestial',
        name: 'Celestial',
        price: 0,
        safetyPointsPrice: 145,
        isSpecial: true,
        img: 'celestial',
        colors: { head: '#fff5e1', torso: '#9b59b6', arm: '#8e44ad', legs: '#8e44ad' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'celestial',
        rarity: 'legendary'
      },
      {
        id: 'safety_void',
        name: 'Void Guardian',
        price: 0,
        safetyPointsPrice: 150,
        isSpecial: true,
        img: 'void_guardian',
        colors: { head: '#f4c2a1', torso: '#1a1a2e', arm: '#0f0f1e', legs: '#0f0f1e' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'void',
        rarity: 'legendary'
      },
      {
        id: 'safety_storm',
        name: 'Storm Warrior',
        price: 0,
        safetyPointsPrice: 155,
        isSpecial: true,
        img: 'storm_warrior',
        colors: { head: '#e8d5b7', torso: '#3498db', arm: '#2980b9', legs: '#2980b9' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'storm',
        rarity: 'legendary'
      },
      {
        id: 'safety_frost',
        name: 'Frost Guardian',
        price: 0,
        safetyPointsPrice: 160,
        isSpecial: true,
        img: 'frost_guardian',
        colors: { head: '#f0f8ff', torso: '#5dade2', arm: '#3498db', legs: '#3498db' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'frost',
        rarity: 'legendary'
      },
      {
        id: 'safety_inferno',
        name: 'Inferno',
        price: 0,
        safetyPointsPrice: 165,
        isSpecial: true,
        img: 'inferno',
        colors: { head: '#ffd4a1', torso: '#e74c3c', arm: '#c0392b', legs: '#c0392b' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'inferno',
        rarity: 'legendary'
      },
      {
        id: 'safety_aurora',
        name: 'Aurora',
        price: 0,
        safetyPointsPrice: 170,
        isSpecial: true,
        img: 'aurora',
        colors: { head: '#fff5e1', torso: '#1abc9c', arm: '#16a085', legs: '#16a085' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'aurora',
        rarity: 'legendary'
      },
      {
        id: 'safety_legend',
        name: 'Safety Legend',
        price: 0,
        safetyPointsPrice: 175,
        isSpecial: true,
        img: 'safety_legend',
        colors: { head: '#f4c2a1', torso: '#7ba0d6', arm: '#6b8fc7', legs: '#6b8fc7' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'legend',
        rarity: 'legendary'
      },

      // Tier 4: 180-250 Safety Points (Ultimate Tier)
      {
        id: 'safety_immortal',
        name: 'Immortal',
        price: 0,
        safetyPointsPrice: 180,
        isSpecial: true,
        img: 'immortal',
        colors: { head: '#fff5e1', torso: '#f39c12', arm: '#e67e22', legs: '#e67e22' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'immortal',
        rarity: 'legendary'
      },
      {
        id: 'safety_eternal',
        name: 'Eternal Guardian',
        price: 0,
        safetyPointsPrice: 185,
        isSpecial: true,
        img: 'eternal_guardian',
        colors: { head: '#f4c2a1', torso: '#9b59b6', arm: '#8e44ad', legs: '#8e44ad' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'eternal',
        rarity: 'legendary'
      },
      {
        id: 'safety_archon',
        name: 'Archon',
        price: 0,
        safetyPointsPrice: 190,
        isSpecial: true,
        img: 'archon',
        colors: { head: '#fff5e1', torso: '#34495e', arm: '#2c3e50', legs: '#2c3e50' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'archon',
        rarity: 'legendary'
      },
      {
        id: 'safety_divine',
        name: 'Divine Protector',
        price: 0,
        safetyPointsPrice: 195,
        isSpecial: true,
        img: 'divine_protector',
        colors: { head: '#fff5e1', torso: '#f1c40f', arm: '#f39c12', legs: '#f39c12' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'divine',
        rarity: 'legendary'
      },
      {
        id: 'safety_primordial',
        name: 'Primordial',
        price: 0,
        safetyPointsPrice: 200,
        isSpecial: true,
        img: 'primordial',
        colors: { head: '#e8d5b7', torso: '#1a1a2e', arm: '#0f0f1e', legs: '#0f0f1e' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'primordial',
        rarity: 'legendary'
      },
      {
        id: 'safety_apocalypse',
        name: 'Apocalypse',
        price: 0,
        safetyPointsPrice: 210,
        isSpecial: true,
        img: 'apocalypse',
        colors: { head: '#f4c2a1', torso: '#8b0000', arm: '#660000', legs: '#660000' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'apocalypse',
        rarity: 'legendary'
      },
      {
        id: 'safety_omega',
        name: 'Omega',
        price: 0,
        safetyPointsPrice: 220,
        isSpecial: true,
        img: 'omega',
        colors: { head: '#fff5e1', torso: '#2c3e50', arm: '#1a252f', legs: '#1a252f' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'omega',
        rarity: 'legendary'
      },
      {
        id: 'safety_ultimate',
        name: 'Ultimate Guardian',
        price: 0,
        safetyPointsPrice: 230,
        isSpecial: true,
        img: 'ultimate_guardian',
        colors: { head: '#f4c2a1', torso: '#7d3c98', arm: '#6c3483', legs: '#6c3483' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'ultimate',
        rarity: 'legendary'
      },
      {
        id: 'safety_transcendent',
        name: 'Transcendent',
        price: 0,
        safetyPointsPrice: 240,
        isSpecial: true,
        img: 'transcendent',
        colors: { head: '#fff5e1', torso: '#1abc9c', arm: '#16a085', legs: '#16a085' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'transcendent',
        rarity: 'legendary'
      },
      {
        id: 'safety_mythic',
        name: 'Mythic Legend',
        price: 0,
        safetyPointsPrice: 250,
        isSpecial: true,
        img: 'mythic_legend',
        colors: { head: '#fff5e1', torso: '#e74c3c', arm: '#c0392b', legs: '#c0392b' },
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'mythic',
        rarity: 'legendary'
      }
    ];

    // Merge with existing skins (don't overwrite existing ones)
    const skinsToAdd = specialSkins.filter(skin => !existingSkinIds.has(skin.id));
    const updatedSkins = [...existingSkins, ...skinsToAdd];

    // Save updated skins catalog
    await setDocument(COLLECTIONS.SKINS_CATALOG, 'catalog', {
      skins: updatedSkins,
      updated_at: Date.now()
    });

    return NextResponse.json({ 
      success: true, 
      message: `Added ${skinsToAdd.length} special high-poly skins`,
      added: skinsToAdd.length,
      total: specialSkins.length,
      existing: existingSkins.length
    });
  } catch (error: any) {
    console.error('Error initializing special skins:', error);
    return NextResponse.json({ error: 'Failed to initialize special skins' }, { status: 500 });
  }
}
