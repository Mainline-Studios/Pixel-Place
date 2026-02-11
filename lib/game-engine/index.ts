/**
 * Pixel Place Game Engine
 * Main entry point - exports all public APIs
 */

// Core
export { Engine } from './core/Engine';
export { Scene } from './core/Scene';
export { Renderer } from './core/Renderer';

// Entities
export { Entity } from './entities/Entity';
export { Part } from './entities/Part';

// Camera
export { Camera } from './camera/Camera';

=======
// Input
export { Input } from './input/Input';

// Physics
export { Physics } from './physics/Physics';

// Assets
export { AssetLoader } from './assets/AssetLoader';

// Graphics
export { createPBRMaterial, createSkinMaterial, createFabricMaterial, createMetalMaterial } from './graphics/PBRShader';

// Animation
export { IKSystem, applyIKToThreeJS } from './animation/IKSystem';

// Physics
export { ClothPhysics } from './physics/ClothPhysics';

>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
// Import classes for namespace object
import { Engine } from './core/Engine';
import { Scene } from './core/Scene';
import { Renderer } from './core/Renderer';
import { Entity } from './entities/Entity';
import { Part } from './entities/Part';
import { Camera } from './camera/Camera';
<<<<<<< HEAD
// Create a namespace-like object for easy access
export const PixelEngine = {
  Engine,
  Scene,
  Renderer,
  Entity,
  Part,
  Camera};

// Default export
export default PixelEngine;








