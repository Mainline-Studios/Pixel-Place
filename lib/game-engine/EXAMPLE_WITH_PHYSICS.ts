/**
 * Example usage of the Pixel Place Game Engine with Input, Physics, and Asset Loading
 * 
 * This demonstrates how to use the new systems
 */

import { PixelEngine } from './index';

/**
 * Example game with input handling
 */
export function createInputGame(container: HTMLElement): () => void {
  const engine = new PixelEngine.Engine(container);
  const workspace = engine.getWorkspace();
  const input = engine.getInput();
  
  workspace.setBackground(0.1, 0.1, 0.15);
  
  // Create a controllable player
  const player = new PixelEngine.Part();
  player.setSize(1, 1, 1);
  player.setPosition(0, 2, 0);
  player.setColor('#4ecdc4');
  workspace.add(player);
  
  // Custom player entity with input handling
  class Player extends PixelEngine.Part {
    private speed: number = 5;
    
    update(deltaTime: number): void {
      const pos = this.getPosition();
      
      // Movement with WASD or arrow keys
      if (input.getKey('KeyW') || input.getKey('ArrowUp')) {
        this.setPosition(pos.x, pos.y, pos.z - this.speed * deltaTime);
      }
      if (input.getKey('KeyS') || input.getKey('ArrowDown')) {
        this.setPosition(pos.x, pos.y, pos.z + this.speed * deltaTime);
      }
      if (input.getKey('KeyA') || input.getKey('ArrowLeft')) {
        this.setPosition(pos.x - this.speed * deltaTime, pos.y, pos.z);
      }
      if (input.getKey('KeyD') || input.getKey('ArrowRight')) {
        this.setPosition(pos.x + this.speed * deltaTime, pos.y, pos.z);
      }
      
      // Jump with space (once per press)
      if (input.getKeyDown('Space')) {
        const currentPos = this.getPosition();
        this.setPosition(currentPos.x, currentPos.y + 2, currentPos.z);
      }
    }
  }
  
  const controllablePlayer = new Player();
  controllablePlayer.setSize(0.8, 0.8, 0.8);
  controllablePlayer.setPosition(3, 2, 0);
  controllablePlayer.setColor('#ff6b6b');
  workspace.add(controllablePlayer);
  
  // Create ground
  const ground = new PixelEngine.Part();
  ground.setSize(20, 1, 20);
  ground.setPosition(0, -0.5, 0);
  ground.setColor('#4a4a4a');
  workspace.add(ground);
  
  const camera = engine.getCamera();
  camera.setPosition(0, 8, 12);
  camera.setTarget(0, 0, 0);
  
  engine.start();
  
  return () => engine.destroy();
}

/**
 * Example game with physics and collision detection
 */
export function createPhysicsGame(container: HTMLElement): () => void {
  const engine = new PixelEngine.Engine(container);
  const workspace = engine.getWorkspace();
  const physics = engine.getPhysics();
  const input = engine.getInput();
  
  workspace.setBackground(0.2, 0.3, 0.4);
  
  // Create ground
  const ground = new PixelEngine.Part();
  ground.setSize(20, 1, 20);
  ground.setPosition(0, -0.5, 0);
  ground.setColor('#4a4a4a');
  workspace.add(ground);
  physics.addEntity(ground);
  
  // Create some obstacles
  const obstacles: PixelEngine.Part[] = [];
  for (let i = 0; i < 5; i++) {
    const obstacle = new PixelEngine.Part();
    obstacle.setSize(1.5, 1.5, 1.5);
    obstacle.setPosition((i - 2) * 3, 1, 0);
    obstacle.setColor(`hsl(${i * 60}, 70%, 50%)`);
    workspace.add(obstacle);
    physics.addEntity(obstacle);
    obstacles.push(obstacle);
  }
  
  // Create player with collision detection
  class PhysicsPlayer extends PixelEngine.Part {
    private velocity: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
    private speed: number = 3;
    private canJump: boolean = true;
    
    update(deltaTime: number): void {
      const pos = this.getPosition();
      
      // Apply gravity
      this.velocity.y -= 9.82 * deltaTime;
      
      // Horizontal movement
      this.velocity.x = 0;
      this.velocity.z = 0;
      
      if (input.getKey('KeyW') || input.getKey('ArrowUp')) {
        this.velocity.z = -this.speed;
      }
      if (input.getKey('KeyS') || input.getKey('ArrowDown')) {
        this.velocity.z = this.speed;
      }
      if (input.getKey('KeyA') || input.getKey('ArrowLeft')) {
        this.velocity.x = -this.speed;
      }
      if (input.getKey('KeyD') || input.getKey('ArrowRight')) {
        this.velocity.x = this.speed;
      }
      
      // Jump
      if ((input.getKeyDown('Space') || input.getKeyDown('KeyW')) && this.canJump) {
        this.velocity.y = 5;
        this.canJump = false;
      }
      
      // Update position
      const newPos = {
        x: pos.x + this.velocity.x * deltaTime,
        y: pos.y + this.velocity.y * deltaTime,
        z: pos.z + this.velocity.z * deltaTime
      };
      
      // Simple ground collision (y = 1 is ground level)
      if (newPos.y <= 1) {
        newPos.y = 1;
        this.velocity.y = 0;
        this.canJump = true;
      }
      
      // Check collisions with obstacles
      for (const obstacle of obstacles) {
        const collision = physics.checkCollision(this, obstacle);
        if (collision.collided && collision.normal) {
          // Simple collision response - push away
          newPos.x += collision.normal.x * (collision.penetration || 0.1);
          newPos.z += collision.normal.z * (collision.penetration || 0.1);
        }
      }
      
      this.setPosition(newPos.x, newPos.y, newPos.z);
    }
  }
  
  const player = new PhysicsPlayer();
  player.setSize(0.8, 0.8, 0.8);
  player.setPosition(0, 3, -5);
  player.setColor('#00ff00');
  workspace.add(player);
  physics.addEntity(player);
  
  const camera = engine.getCamera();
  camera.setPosition(0, 8, 12);
  camera.setTarget(0, 2, -2);
  
  engine.start();
  
  return () => engine.destroy();
}

/**
 * Example with asset loading
 */
export async function createAssetGame(container: HTMLElement): Promise<() => void> {
  const engine = new PixelEngine.Engine(container);
  const workspace = engine.getWorkspace();
  const assetLoader = PixelEngine.AssetLoader.getInstance();
  
  workspace.setBackground(0.15, 0.15, 0.2);
  
  // Load assets (example - replace with actual URLs)
  try {
    // Example: Load texture (uncomment when you have texture URLs)
    // const texture = await assetLoader.loadTexture('/path/to/texture.png');
    // console.log('Texture loaded:', texture.width, 'x', texture.height);
    
    // Example: Load audio
    // const sound = await assetLoader.loadAudio('/path/to/sound.mp3');
    // sound.play();
    
    console.log('Assets loaded successfully');
  } catch (error) {
    console.error('Failed to load assets:', error);
  }
  
  // Create game objects
  const part = new PixelEngine.Part();
  part.setSize(2, 2, 2);
  part.setPosition(0, 2, 0);
  part.setColor('#ff6b6b');
  workspace.add(part);
  
  const camera = engine.getCamera();
  camera.setPosition(0, 5, 8);
  camera.setTarget(0, 1, 0);
  
  engine.start();
  
  return () => engine.destroy();
}

/**
 * FPS-style camera with mouse look
 */
export function createFPSCamera(container: HTMLElement): () => void {
  const engine = new PixelEngine.Engine(container);
  const workspace = engine.getWorkspace();
  const input = engine.getInput();
  const camera = engine.getCamera();
  
  workspace.setBackground(0.05, 0.05, 0.1);
  
  // Create a scene with objects
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      const part = new PixelEngine.Part();
      part.setSize(1, 1, 1);
      part.setPosition(i * 2, 0.5, j * 2);
      part.setColor(`hsl(${(i + j) * 10}, 70%, 50%)`);
      workspace.add(part);
    }
  }
  
  // FPS camera controller
  let yaw = 0; // Horizontal rotation
  let pitch = 0; // Vertical rotation
  const sensitivity = 0.002;
  
  class FPSCamera {
    private position: { x: number; y: number; z: number } = { x: 0, y: 2, z: 10 };
    private speed: number = 5;
    
    update(deltaTime: number): void {
      // Mouse look
      const mouseDelta = input.getMouseDelta();
      yaw -= mouseDelta.x * sensitivity;
      pitch -= mouseDelta.y * sensitivity;
      
      // Clamp pitch
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
      
      // Movement
      const forward = {
        x: Math.sin(yaw),
        y: 0,
        z: Math.cos(yaw)
      };
      
      const right = {
        x: Math.cos(yaw),
        y: 0,
        z: -Math.sin(yaw)
      };
      
      if (input.getKey('KeyW')) {
        this.position.x += forward.x * this.speed * deltaTime;
        this.position.z += forward.z * this.speed * deltaTime;
      }
      if (input.getKey('KeyS')) {
        this.position.x -= forward.x * this.speed * deltaTime;
        this.position.z -= forward.z * this.speed * deltaTime;
      }
      if (input.getKey('KeyA')) {
        this.position.x -= right.x * this.speed * deltaTime;
        this.position.z -= right.z * this.speed * deltaTime;
      }
      if (input.getKey('KeyD')) {
        this.position.x += right.x * this.speed * deltaTime;
        this.position.z += right.z * this.speed * deltaTime;
      }
      
      // Update camera
      camera.setPosition(this.position.x, this.position.y, this.position.z);
      
      const target = {
        x: this.position.x + Math.sin(yaw) * Math.cos(pitch),
        y: this.position.y + Math.sin(pitch),
        z: this.position.z + Math.cos(yaw) * Math.cos(pitch)
      };
      
      camera.setTarget(target.x, target.y, target.z);
    }
  }
  
  const fpsCamera = new FPSCamera();
  
  // Lock pointer on click
  const canvas = engine.getCanvas();
  canvas.addEventListener('click', () => {
    input.lockPointer(canvas);
  });
  
  // Update camera in game loop (simplified - in real engine this would be in Entity.update)
  const originalUpdate = workspace.update.bind(workspace);
  workspace.update = (deltaTime: number) => {
    fpsCamera.update(deltaTime);
    originalUpdate(deltaTime);
  };
  
  engine.start();
  
  return () => {
    input.unlockPointer();
    engine.destroy();
  };
}
