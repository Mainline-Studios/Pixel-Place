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

// Create a namespace-like object for easy access
export const PixelEngine = {
  Engine,
  Scene,
  Renderer,
  Entity,
  Part,
  Camera
};

// Default export
export default PixelEngine;








