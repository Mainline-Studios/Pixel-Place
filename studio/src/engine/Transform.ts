import { Euler, Vector3 } from "three";

/**
 * Local transform data for a {@link GameObject}.
 * Mirrors Roblox-style "CFrame-lite" semantics: position, rotation, and scale in parent space.
 * The rendering layer copies these values onto a Three.js `Object3D` each frame.
 */
export class Transform {
  /** Local position relative to the parent object (or world root if unparented). */
  readonly localPosition = new Vector3();

  /** Local rotation in radians (Euler order `YXZ` matches typical FPS/editor tooling). */
  readonly localRotation = new Euler(0, 0, 0, "YXZ");

  /** Local scale; kept separate from Three.js to allow game-logic mutations without retaining scene refs. */
  readonly localScale = new Vector3(1, 1, 1);

  copyFrom(other: Transform): void {
    this.localPosition.copy(other.localPosition);
    this.localRotation.copy(other.localRotation);
    this.localScale.copy(other.localScale);
  }
}
