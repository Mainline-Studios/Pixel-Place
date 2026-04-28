import { PerspectiveCamera, Vector3 } from "three";

export type FlyCameraState = {
  position: Vector3;
  yaw: number;
  pitch: number;
};

/**
 * Editor navigation: WASD movement on the camera XZ plane, mouse-look when pointer lock is active.
 * Keys are always tracked while attached so character controllers can read them during play.
 */
export class FlyCameraController {
  private readonly camera: PerspectiveCamera;
  private readonly keys = new Set<string>();
  private readonly moveDir = new Vector3();
  private pointerLocked = false;
  private enabled = true;

  /** When false, WASD moves the camera (editor / free-fly play). Character mode keeps this false. */
  translateEnabled = true;

  /** Allow yaw/pitch updates from the mouse even when `enabled` is false (unused; mouse uses enabled OR character path). */
  allowLookWhenDisabled = false;

  /** Radians; positive yaw turns left. */
  yaw = 0;

  /** Radians; clamped to avoid gimbal singularities. */
  pitch = 0;

  moveSpeed = 6;
  lookSensitivity = 0.0025;

  constructor(camera: PerspectiveCamera) {
    this.camera = camera;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) {
      this.moveDir.set(0, 0, 0);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  /**
   * Pointer events bind to `element`; keyboard uses `window` so WASD works without manual focus hacks.
   */
  attach(element: HTMLElement): () => void {
    const isTypingTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      return Boolean(el.closest("input, textarea, select, [contenteditable='true']"));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      this.keys.add(event.code);
      if (this.enabled && ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      this.keys.delete(event.code);
    };
    const onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === element;
    };
    const onMouseMove = (event: MouseEvent) => {
      if (!this.pointerLocked) return;
      if (!this.enabled && !this.allowLookWhenDisabled) return;
      this.yaw -= event.movementX * this.lookSensitivity;
      this.pitch -= event.movementY * this.lookSensitivity;
      const limit = Math.PI / 2 - 0.01;
      this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
    };
    const onMouseDown = (event: MouseEvent) => {
      if (!this.enabled && !this.allowLookWhenDisabled) return;
      if (event.button !== 2) return;
      event.preventDefault();
      if (document.pointerLockElement !== element) {
        void element.requestPointerLock();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    element.addEventListener("mousemove", onMouseMove);
    element.addEventListener("mousedown", onMouseDown);
    element.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      element.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("mousedown", onMouseDown);
      element.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      if (document.pointerLockElement === element) {
        document.exitPointerLock();
      }
    };
  }

  /** Copies orientation vectors into `camera` and optionally advances position from held keys. */
  update(deltaSeconds: number): void {
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    if (!this.translateEnabled || !this.enabled) return;

    this.moveDir.set(0, 0, 0);
    if (this.keys.has("KeyW")) this.moveDir.z -= 1;
    if (this.keys.has("KeyS")) this.moveDir.z += 1;
    if (this.keys.has("KeyA")) this.moveDir.x -= 1;
    if (this.keys.has("KeyD")) this.moveDir.x += 1;
    if (this.keys.has("Space")) this.moveDir.y += 1;
    if (this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")) this.moveDir.y -= 1;

    if (this.moveDir.lengthSq() > 0) {
      this.moveDir.normalize();
      const step = this.moveSpeed * deltaSeconds;
      this.camera.translateX(this.moveDir.x * step);
      this.camera.translateY(this.moveDir.y * step);
      this.camera.translateZ(this.moveDir.z * step);
    }
  }

  captureState(): FlyCameraState {
    return {
      position: this.camera.position.clone(),
      yaw: this.yaw,
      pitch: this.pitch,
    };
  }

  restoreState(state: FlyCameraState): void {
    this.camera.position.copy(state.position);
    this.yaw = state.yaw;
    this.pitch = state.pitch;
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }
}
