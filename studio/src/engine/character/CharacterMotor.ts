import { Vector3 } from "three";
import type { Engine } from "@/engine/Engine";

const wish = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const camOffset = new Vector3();
const camTarget = new Vector3();

/**
 * Physics-driven character with third-person camera using fly-controller yaw/pitch.
 */
export class CharacterMotor {
  private jumpCooldown = 0;

  constructor(
    readonly engine: Engine,
    readonly playerId: string,
  ) {}

  /** Call before {@link PhysicsRuntime.step} to set horizontal velocity and jumping. */
  applyMovement(_delta: number): void {
    const graph = this.engine.runtimeGraph;
    if (!graph) return;
    const go = graph.getObject(this.playerId);
    const body = this.engine.physics.getBody(this.playerId);
    const settings = go?.character;
    if (!go || !body || !settings?.enabled) return;

    const fly = this.engine.flyController;
    const yaw = fly.yaw;

    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, -Math.sin(yaw));

    wish.set(0, 0, 0);
    if (fly.isKeyDown("KeyW")) wish.add(forward);
    if (fly.isKeyDown("KeyS")) wish.sub(forward);
    if (fly.isKeyDown("KeyD")) wish.add(right);
    if (fly.isKeyDown("KeyA")) wish.sub(right);
    if (wish.lengthSq() > 0) wish.normalize();

    const speed = settings.moveSpeed;
    body.velocity.x = wish.x * speed;
    body.velocity.z = wish.z * speed;

    this.jumpCooldown = Math.max(0, this.jumpCooldown - _delta);
    if (fly.isKeyDown("Space") && Math.abs(body.velocity.y) < 0.6 && this.jumpCooldown <= 0) {
      body.velocity.y = settings.jumpImpulse;
      this.jumpCooldown = 0.35;
    }
  }

  /** Call after transforms sync so the camera follows the smoothed body position. */
  updateCamera(delta: number): void {
    const graph = this.engine.runtimeGraph;
    if (!graph) return;
    const go = graph.getObject(this.playerId);
    const settings = go?.character;
    if (!go || !settings?.enabled) return;

    const fly = this.engine.flyController;
    const yaw = fly.yaw;
    const pitch = fly.pitch;

    const pos = go.transform.localPosition;
    const dist = settings.cameraDistance;
    const height = settings.cameraHeight;
    camOffset.set(
      Math.sin(yaw) * Math.cos(pitch) * dist,
      Math.sin(-pitch) * dist + height,
      Math.cos(yaw) * Math.cos(pitch) * dist,
    );
    camTarget.set(pos.x + camOffset.x, pos.y + camOffset.y, pos.z + camOffset.z);
    this.engine.camera.position.lerp(camTarget, 1 - Math.exp(-6 * delta));
    this.engine.camera.lookAt(pos.x, pos.y + 1.1, pos.z);
  }
}
