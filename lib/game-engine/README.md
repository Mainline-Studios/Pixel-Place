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
2. ⏳ Scene & Entity System
3. ⏳ Camera System
4. ⏳ Materials & Lighting
5. ⏳ Input System
6. ⏳ Physics System
7. ⏳ Developer API








