# Pixel Place Game Engine

A custom game engine similar to Roblox, built from scratch using WebGL.

## Architecture Overview

```
lib/game-engine/
├── core/
│   ├── Engine.ts          # Main engine class
│   ├── Renderer.ts        # WebGL renderer
│   └── Scene.ts           # Scene management
├── entities/
│   ├── Entity.ts          # Base entity class
│   ├── Part.ts            # Roblox-style Part
│   └── Model.ts           # Group of parts
├── camera/
│   └── Camera.ts          # Camera system
├── materials/
│   └── Material.ts        # Material system
├── lighting/
│   └── Light.ts           # Lighting system
├── input/
│   └── Input.ts           # Input handling
├── physics/
│   └── Physics.ts         # Basic physics/collision
└── api/
    └── GameAPI.ts         # Developer-facing API
```

## Usage

Games will use this API instead of Three.js:

```javascript
export function createGame(container) {
  // Create engine
  const engine = new PixelEngine.Engine(container);
  const workspace = engine.getWorkspace();
  
  // Create parts (like Roblox)
  const part = new PixelEngine.Part();
  part.Size = { X: 4, Y: 1, Z: 2 };
  part.Position = { X: 0, Y: 0, Z: 0 };
  part.Color = '#ff0000';
  part.Material = 'Plastic';
  workspace.add(part);
  
  // Start engine
  engine.start();
  
  return () => engine.destroy();
}
```

## Roadmap

1. ✅ Core Engine & Renderer
<<<<<<< HEAD
2. ⏳ Scene & Entity System
3. ⏳ Camera System
4. ⏳ Materials & Lighting
5. ⏳ Input System
6. ⏳ Physics System
7. ⏳ Developer API
=======
2. ✅ Scene & Entity System
3. ✅ Camera System
4. ✅ Input System (Keyboard, Mouse, Touch)
5. ✅ Physics System (Collision Detection, Raycasting)
6. ✅ Asset Loading (Textures, Audio, JSON)
7. ⏳ Materials & Lighting
8. ⏳ Advanced Physics (Gravity, Forces)
9. ⏳ Scene Manager (State Switching)
10. ⏳ Developer API

## New Realistic Character Features

### PBR (Physically Based Rendering) Shaders
Realistic lighting and materials with subsurface scattering for skin:
```typescript
import { createSkinMaterial, createFabricMaterial, createMetalMaterial } from '@/lib/game-engine';

// Realistic skin with subsurface scattering
const skinMat = createSkinMaterial(THREE, { r: 0.96, g: 0.8, b: 0.69 });

// Realistic fabric/clothing
const fabricMat = createFabricMaterial(THREE, { r: 0.3, g: 0.4, b: 0.5 });

// Realistic metal
const metalMat = createMetalMaterial(THREE, { r: 0.8, g: 0.8, b: 0.9 });
```

### IK (Inverse Kinematics) System
Natural limb movement and foot placement:
```typescript
import { IKSystem, applyIKToThreeJS } from '@/lib/game-engine';

const ikSystem = new IKSystem();
ikSystem.addBoneChain([
  { name: 'hip', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, length: 1 },
  { name: 'knee', position: { x: 0, y: -1, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, length: 1 },
  { name: 'ankle', position: { x: 0, y: -2, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, length: 0.3 }
]);

// Solve IK to reach target position
const result = ikSystem.solve({ position: { x: 0, y: -1.5, z: 1 } });
```

### Cloth Physics Simulation
Realistic cloth/hair/accessory movement:
```typescript
import { ClothPhysics } from '@/lib/game-engine';

const cloth = new ClothPhysics();
cloth.initializeCloth(2, 2, { x: 10, y: 10 }, ['top']);

// Update in game loop
cloth.update(deltaTime);

// Get positions for rendering
const positions = cloth.getParticlePositions();
```

## New Features

### Input System
Handle keyboard, mouse, and touch input with per-frame state tracking:
```typescript
const input = engine.getInput();
if (input.getKey('KeyW')) {
  // Move forward
}
if (input.getKeyDown('Space')) {
  // Jump (once per press)
}
if (input.getMouseButton(0)) {
  // Left mouse button held
}
```

### Physics System
Collision detection, raycasting, and bounding box calculations:
```typescript
const physics = engine.getPhysics();
physics.addEntity(entity);

// Check collision
const collision = physics.checkCollision(entity1, entity2);
if (collision.collided) {
  // Handle collision
}

// Raycast
const hit = physics.raycast(origin, direction);
if (hit) {
  // Entity hit at distance
}
```

### Asset Loader
Load textures, audio, and JSON files with caching:
```typescript
const assetLoader = PixelEngine.AssetLoader.getInstance();
const texture = await assetLoader.loadTexture('/path/to/texture.png');
const audio = await assetLoader.loadAudio('/path/to/sound.mp3');
const data = await assetLoader.loadJSON<MyType>('/path/to/data.json');
```
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328








