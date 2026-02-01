/**
 * Engine - Main game engine class
 */

import { Renderer } from './Renderer';
import { Scene } from './Scene';
import { Camera } from '../camera/Camera';
import { Entity } from '../entities/Entity';
import { Input } from '../input/Input';
import { Physics } from '../physics/Physics';

export class Engine {
  private renderer: Renderer;
  private scene: Scene;
  private camera: Camera;
  private container: HTMLElement;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private input: Input;
  private physics: Physics;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Create renderer
    this.renderer = new Renderer(container);
    
    // Create scene
    this.scene = new Scene();
    
    // Create camera
    this.camera = new Camera();
    this.camera.setAspect(this.renderer.getSize().width / this.renderer.getSize().height);
    
    // Initialize input system
    this.input = Input.getInstance();
    
    // Initialize physics system
    this.physics = new Physics();
  }

  /**
   * Get the workspace (scene) - Roblox-style API
   */
  getWorkspace(): Scene {
    return this.scene;
  }

  /**
   * Get the camera
   */
  getCamera(): Camera {
    return this.camera;
  }

  /**
   * Get the input system
   */
  getInput(): Input {
    return this.input;
  }

  /**
   * Get the physics system
   */
  getPhysics(): Physics {
    return this.physics;
  }

  /**
   * Get the renderer's canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.renderer.getCanvas();
  }

  /**
   * Start the engine
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  /**
   * Stop the engine
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main game loop
   */
  private tick = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;
    
    // Update physics
    this.physics.update(deltaTime);
    
    // Update scene
    this.scene.update(deltaTime);
    
    // Update input (clear pressed/released states)
    this.input.update();
    
    // Render
    this.render();
    
    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * Render frame
   */
  private render(): void {
    const bg = this.scene.getBackground();
    this.renderer.clear(bg.r, bg.g, bg.b);
    
    const entities = this.scene.getEntities();
    const allVertices: number[] = [];
    const allColors: number[] = [];
    const allIndices: number[] = [];
    let indexOffset = 0;
    
    // Collect mesh data from all entities
    entities.forEach(entity => {
      const meshData = entity.getMeshData();
      if (!meshData) return;
      
      // Add vertices
      for (let i = 0; i < meshData.vertices.length; i++) {
        allVertices.push(meshData.vertices[i]);
      }
      
      // Add colors
      for (let i = 0; i < meshData.colors.length; i++) {
        allColors.push(meshData.colors[i]);
      }
      
      // Add indices with offset
      for (let i = 0; i < meshData.indices.length; i++) {
        allIndices.push(meshData.indices[i] + indexOffset);
      }
      
      indexOffset += meshData.vertices.length / 3; // Number of vertices
    });
    
    if (allVertices.length === 0) return;
    
    // Create typed arrays
    const vertices = new Float32Array(allVertices);
    const colors = new Float32Array(allColors);
    const indices = new Uint16Array(allIndices);
    
    // Get matrices
    const modelViewMatrix = this.camera.getModelViewMatrix();
    const projectionMatrix = this.camera.getProjectionMatrix();
    
    // Render
    this.renderer.render(vertices, colors, indices, modelViewMatrix, projectionMatrix);
  }

  /**
   * Cleanup and destroy engine
   */
  destroy(): void {
    this.stop();
    this.scene.clear();
    this.renderer.destroy();
  }
}








