/**
 * Play-mode player controller: physics-driven capsule-ish body + optional third-person camera.
 */
export class CharacterMotorSettings {
  enabled = false;
  moveSpeed = 8;
  jumpImpulse = 6;
  /** Camera orbits behind the character using yaw from mouse X when pointer locked. */
  cameraDistance = 7;
  cameraHeight = 2.2;
  mouseSensitivity = 0.003;
}
