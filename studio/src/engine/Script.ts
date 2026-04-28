import type { Engine } from "./Engine";
import type { GameObject } from "./GameObject";

/**
 * Optional behaviour component invoked during **play mode** only.
 * Subclass or assign `onUpdate` for lightweight prototyping (similar in spirit to Roblox `Heartbeat`).
 */
export class Script {
  enabled = true;

  /** Optional JS source edited in the Studio code panel (applied when entering play mode). */
  userSource?: string;

  /** Fires once when the play session begins (runtime graph only). */
  onStart?(_gameObject: GameObject, _engine: Engine): void;

  /** Fires when the object is clicked in play mode (left mouse, raycast). */
  onClick?(_gameObject: GameObject, _engine: Engine): void;

  /** Fires when a physics contact begins with another object id. */
  onCollision?(_otherId: string, _gameObject: GameObject, _engine: Engine): void;

  /** Internal: reset when exiting play. */
  _playStarted = false;

  /**
   * Per-frame callback while the runtime session is active.
   * @param deltaSeconds Time since last frame in seconds (unscaled).
   * @param gameObject Owner of this script component.
   * @param engine Active engine instance (scene, time, input hooks, etc.).
   */
  onUpdate(_deltaSeconds: number, _gameObject: GameObject, _engine: Engine): void {
    // Default: no-op. Override in subclasses or monkey-patch for quick experiments.
  }
}
