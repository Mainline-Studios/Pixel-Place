import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreInstance, COLLECTIONS, getDocument, setDocument } from '@/lib/firestore';
import { Accessory } from '@/types';

/**
 * POST /api/accessories/init-drone
 * Initialize the sci-fi drone accessory
 * Place the exported .glb file in /public/models/sci_fi_drone.glb
 */
export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreInstance();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Get existing accessories
    const accessoriesDoc = await getDocument(COLLECTIONS.ACCESSORIES_CATALOG, 'catalog');
    const existingAccessories: Accessory[] = accessoriesDoc?.accessories || [];
    const existingAccessoryIds = new Set(existingAccessories.map((a: Accessory) => a.id));

    // Sci-Fi Drone accessory
    const droneAccessory: Accessory = {
      id: 'sci_fi_drone',
      name: 'Sci-Fi Drone',
      type: 'drone',
      price: 5000, // Expensive premium accessory
      img: 'sci_fi_drone',
      color: '#1a1a2e',
      modelUrl: '/models/sci_fi_drone.glb', // Path to GLB file
      floatHeight: 3.5, // Float 3.5 units above player
      rotationSpeed: 0.8, // Rotation speed for floating animation
      scale: 0.8, // Scale the model to fit nicely
      position: { x: 0, y: 3.5, z: 0 }
    };

    // Check if already exists
    if (existingAccessoryIds.has(droneAccessory.id)) {
      return NextResponse.json({ 
        success: true, 
        message: 'Drone accessory already exists',
        accessory: droneAccessory
      });
    }

    // Add to catalog
    const updatedAccessories = [...existingAccessories, droneAccessory];
    
    await setDocument(COLLECTIONS.ACCESSORIES_CATALOG, 'catalog', {
      accessories: updatedAccessories,
      updated_at: Date.now()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Sci-Fi Drone accessory added successfully',
      accessory: droneAccessory,
      instructions: [
        '1. Export your Blender drone model as .glb format',
        '2. Place the file at: /public/models/sci_fi_drone.glb',
        '3. The drone will automatically float above equipped players',
        '4. Players can purchase it for 5000 coins in the Avatar Shop'
      ]
    });
  } catch (error: any) {
    console.error('Error initializing drone accessory:', error);
    return NextResponse.json({ error: 'Failed to initialize drone accessory' }, { status: 500 });
  }
}
