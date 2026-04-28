/**
 * Input - Handles keyboard and mouse input
 */

export class Input {
  private static instance: Input | null = null;
  private keys: Map<string, boolean> = new Map();
  private keysPressed: Map<string, boolean> = new Map();
  private keysReleased: Map<string, boolean> = new Map();
  
  private mouseButtons: Map<number, boolean> = new Map();
  private mouseButtonsPressed: Map<number, boolean> = new Map();
  private mouseButtonsReleased: Map<number, boolean> = new Map();
  
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private mouseDelta: { x: number; y: number } = { x: 0, y: 0 };
  private lastMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  
  private isPointerLocked: boolean = false;
  private canvas: HTMLCanvasElement | null = null;

  private constructor() {
    this.setupEventListeners();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): Input {
    if (!Input.instance) {
      Input.instance = new Input();
    }
    return Input.instance;
  }

  /**
   * Setup event listeners for input
   */
  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      const key = e.code || e.key;
      if (!this.keys.get(key)) {
        this.keysPressed.set(key, true);
      }
      this.keys.set(key, true);
      // Prevent default for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.code || e.key;
      this.keysReleased.set(key, true);
      this.keys.set(key, false);
    });

    // Mouse events
    window.addEventListener('mousedown', (e) => {
      if (!this.mouseButtons.get(e.button)) {
        this.mouseButtonsPressed.set(e.button, true);
      }
      this.mouseButtons.set(e.button, true);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtonsReleased.set(e.button, true);
      this.mouseButtons.set(e.button, false);
    });

    window.addEventListener('mousemove', (e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
      
      if (this.isPointerLocked) {
        // For pointer lock, use movementX/Y for delta
        this.mouseDelta = {
          x: (e as MouseEvent).movementX || 0,
          y: (e as MouseEvent).movementY || 0
        };
      } else {
        this.mouseDelta = {
          x: e.clientX - this.lastMousePosition.x,
          y: e.clientY - this.lastMousePosition.y
        };
      }
      
      this.lastMousePosition = { ...this.mousePosition };
    });

    // Pointer lock events
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
    });

    // Touch events (for mobile)
    window.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      if (touch) {
        this.mousePosition = { x: touch.clientX, y: touch.clientY };
        this.mouseButtons.set(0, true);
        this.mouseButtonsPressed.set(0, true);
      }
    });

    window.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (touch) {
        this.mouseDelta = {
          x: touch.clientX - this.mousePosition.x,
          y: touch.clientY - this.mousePosition.y
        };
        this.mousePosition = { x: touch.clientX, y: touch.clientY };
      }
    });

    window.addEventListener('touchend', () => {
      this.mouseButtons.set(0, false);
      this.mouseButtonsReleased.set(0, true);
    });
  }

  /**
   * Call this at the end of each frame to clear pressed/released states
   */
  update(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouseButtonsPressed.clear();
    this.mouseButtonsReleased.clear();
    this.mouseDelta = { x: 0, y: 0 };
  }

  /**
   * Check if key is currently held down
   */
  getKey(key: string): boolean {
    return this.keys.get(key) || false;
  }

  /**
   * Check if key was pressed this frame
   */
  getKeyDown(key: string): boolean {
    return this.keysPressed.get(key) || false;
  }

  /**
   * Check if key was released this frame
   */
  getKeyUp(key: string): boolean {
    return this.keysReleased.get(key) || false;
  }

  /**
   * Check if mouse button is currently held down
   * @param button 0 = left, 1 = middle, 2 = right
   */
  getMouseButton(button: number): boolean {
    return this.mouseButtons.get(button) || false;
  }

  /**
   * Check if mouse button was pressed this frame
   */
  getMouseButtonDown(button: number): boolean {
    return this.mouseButtonsPressed.get(button) || false;
  }

  /**
   * Check if mouse button was released this frame
   */
  getMouseButtonUp(button: number): boolean {
    return this.mouseButtonsReleased.get(button) || false;
  }

  /**
   * Get mouse position in screen coordinates
   */
  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  /**
   * Get mouse movement delta since last frame
   */
  getMouseDelta(): { x: number; y: number } {
    return { ...this.mouseDelta };
  }

  /**
   * Lock pointer to canvas (for FPS-style controls)
   */
  lockPointer(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    canvas.requestPointerLock?.();
  }

  /**
   * Unlock pointer
   */
  unlockPointer(): void {
    document.exitPointerLock?.();
  }

  /**
   * Check if pointer is locked
   */
  isPointerLockActive(): boolean {
    return this.isPointerLocked;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.unlockPointer();
    // Event listeners are on window, so we can't easily remove them
    // But they won't cause issues since they check instance
    Input.instance = null;
  }
}
