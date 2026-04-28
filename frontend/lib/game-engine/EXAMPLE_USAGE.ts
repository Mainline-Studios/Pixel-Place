/**
 * Example usage of the Pixel Place Game Engine
 * 
 * This shows how to use the engine in game code
 */

import { PixelEngine } from './index';

/**
 * Example game function
 */
export function createGame(container: HTMLElement): () => void {
  // 1. Create the engine
  const engine = new PixelEngine.Engine(container);
  
  // 2. Get workspace (like Roblox)
  const workspace = engine.getWorkspace();
  
  // 3. Set background color
  workspace.setBackground(0.2, 0.3, 0.4); // Dark blue
  
  // 4. Create parts
  const ground = new PixelEngine.Part();
  ground.setSize(20, 1, 20);
  ground.setPosition(0, -0.5, 0);
  ground.setColor('#4a4a4a'); // Gray
  ground.setShape('Block');
  workspace.add(ground);
  
  // Create some colorful blocks
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
  for (let i = 0; i < 5; i++) {
    const part = new PixelEngine.Part();
    part.setSize(2, 2, 2);
    part.setPosition((i - 2) * 3, 1, 0);
    part.setColor(colors[i]);
    part.setShape('Block');
    workspace.add(part);
  }
  
  // Create a sphere
  const sphere = new PixelEngine.Part();
  sphere.setSize(3, 3, 3);
  sphere.setPosition(0, 3, -5);
  sphere.setColor('#00a2ff');
  sphere.setShape('Sphere');
  workspace.add(sphere);
  
  // 5. Set up camera
  const camera = engine.getCamera();
  camera.setPosition(0, 8, 12);
  camera.setTarget(0, 0, 0);
  
  // 6. Start the engine
  engine.start();
  
  // 7. Return cleanup function
  return () => {
    engine.destroy();
  };
}

/**
 * Animation example
 */
export function createAnimatedGame(container: HTMLElement): () => void {
  const engine = new PixelEngine.Engine(container);
  const workspace = engine.getWorkspace();
  
  workspace.setBackground(0.1, 0.1, 0.15);
  
  // Create rotating cube
  const cube = new PixelEngine.Part();
  cube.setSize(2, 2, 2);
  cube.setPosition(0, 2, 0);
  cube.setColor('#ff6b6b');
  cube.setShape('Block');
  workspace.add(cube);
  
  // Custom entity for animation
  class RotatingPart extends PixelEngine.Part {
    update(deltaTime: number) {
      const rot = this.getRotation();
      this.setRotation(rot.x + deltaTime * 2, rot.y + deltaTime * 2, rot.z);
    }
  }
  
  const rotatingCube = new RotatingPart();
  rotatingCube.setSize(1.5, 1.5, 1.5);
  rotatingCube.setPosition(3, 2, 0);
  rotatingCube.setColor('#4ecdc4');
  workspace.add(rotatingCube);
  
  const camera = engine.getCamera();
  camera.setPosition(0, 5, 8);
  camera.setTarget(0, 1, 0);
  
  engine.start();
  
  return () => engine.destroy();
}








