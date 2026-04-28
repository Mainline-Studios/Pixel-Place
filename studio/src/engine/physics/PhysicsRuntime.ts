import { Box, Body, Vec3, World } from "cannon-es";
import type { GameObject } from "@/engine/GameObject";
import type { SceneGraph } from "@/engine/SceneGraph";
import type { PrimitiveKind } from "@/engine/types";
import { Euler, Quaternion, Vector3 } from "three";

const tmpHalf = new Vector3();
const tmpQ = new Quaternion();
const tmpE = new Euler(0, 0, 0, "YXZ");

export type CollisionPairHandler = (gameIdA: string, gameIdB: string) => void;

/**
 * Lightweight physics pass for play mode: gravity, box/sphere approximations, floor plane.
 * Keeps simulation data out of editor objects so stopping play returns to a pristine edit graph.
 */
export class PhysicsRuntime {
  readonly world = new World({ gravity: new Vec3(0, -9.82, 0) });
  private readonly bodies = new Map<string, Body>();
  private readonly bodyToId = new Map<Body, string>();
  private ground: Body | null = null;
  private collisionHandler: CollisionPairHandler | null = null;

  setCollisionHandler(handler: CollisionPairHandler | null): void {
    this.collisionHandler = handler;
  }

  getBody(gameObjectId: string): Body | undefined {
    return this.bodies.get(gameObjectId);
  }

  /** Builds dynamic bodies for every visible mesh in the cloned runtime graph. */
  rebuild(scene: SceneGraph): void {
    this.clear();
    this.ensureGround();

    scene.traverse((go) => {
      if (!go.meshRenderer.enabled) return;
      this.computeHalfExtents(go);
      const shape = new Box(new Vec3(tmpHalf.x, tmpHalf.y, tmpHalf.z));
      const mass = go.meshRenderer.primitive === "plane" && go.meshRenderer.source === "primitive" ? 0 : 1;
      const body = new Body({ mass });
      body.linearDamping = 0.25;
      body.angularDamping = 0.9;
      if (go.character?.enabled) {
        body.fixedRotation = true;
        body.linearDamping = 0.4;
      }
      body.addShape(shape);
      const p = go.transform.localPosition;
      const r = go.transform.localRotation;
      body.position.set(p.x, p.y, p.z);
      tmpQ.setFromEuler(r);
      body.quaternion.set(tmpQ.x, tmpQ.y, tmpQ.z, tmpQ.w);

      if (this.collisionHandler) {
        const id = go.id;
        body.addEventListener("collide", (event: { body: Body }) => {
          const other = event.body;
          const otherId = this.bodyToId.get(other);
          if (otherId && otherId !== id) {
            this.collisionHandler?.(id, otherId);
          }
        });
      }

      this.world.addBody(body);
      this.bodies.set(go.id, body);
      this.bodyToId.set(body, go.id);
    });
  }

  step(delta: number): void {
    this.world.step(1 / 60, delta, 3);
  }

  /** Writes physics results back into the runtime transforms (Three sync reads these). */
  syncTransforms(scene: SceneGraph): void {
    for (const [id, body] of this.bodies) {
      const go = scene.getObject(id);
      if (!go) continue;
      go.transform.localPosition.set(body.position.x, body.position.y, body.position.z);
      tmpQ.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
      tmpE.setFromQuaternion(tmpQ, "YXZ");
      go.transform.localRotation.copy(tmpE);
    }
  }

  clear(): void {
    for (const body of this.bodies.values()) {
      this.world.removeBody(body);
      this.bodyToId.delete(body);
    }
    this.bodies.clear();
    if (this.ground) {
      this.world.removeBody(this.ground);
      this.ground = null;
    }
  }

  private ensureGround(): void {
    const ground = new Body({ mass: 0 });
    ground.addShape(new Box(new Vec3(50, 0.05, 50)));
    ground.position.set(0, -0.05, 0);
    this.world.addBody(ground);
    this.ground = ground;
  }

  private computeHalfExtents(go: GameObject): void {
    const mr = go.meshRenderer;
    if (mr.source === "model") {
      const s = Math.max(0.25, mr.size);
      tmpHalf.set(s * 0.35, s * 0.9, s * 0.35);
      return;
    }
    this.halfExtentsPrimitive(mr.primitive, mr.size);
  }

  private halfExtentsPrimitive(kind: PrimitiveKind, size: number): void {
    const s = Math.max(0.05, size);
    tmpHalf.set(s / 2, s / 2, s / 2);
    if (kind === "sphere") {
      const r = s * 0.55;
      tmpHalf.set(r, r, r);
    } else if (kind === "cylinder") {
      tmpHalf.set(s * 0.45, s / 2, s * 0.45);
    } else if (kind === "plane") {
      tmpHalf.set(s * 2, 0.05, s * 2);
    }
  }
}
