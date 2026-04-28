import { AnimationComponent } from "./AnimationComponent";
import { CharacterMotorSettings } from "./CharacterMotorSettings";
import { GameObject } from "./GameObject";
import { ProceduralMotion } from "./ProceduralMotion";
import { Script } from "./Script";
import type { PrimitiveKind } from "./types";

export type SceneChangeListener = () => void;

/**
 * Owns the authoritative object hierarchy for the editor and runtime.
 * All reparenting flows through this class so child arrays and parent pointers stay consistent.
 */
export class SceneGraph {
  private readonly roots: GameObject[] = [];
  private readonly index = new Map<string, GameObject>();
  private readonly listeners = new Set<SceneChangeListener>();

  subscribe(listener: SceneChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }

  getRoots(): readonly GameObject[] {
    return this.roots;
  }

  getObject(id: string): GameObject | undefined {
    return this.index.get(id);
  }

  /** Removes every root object (and their subtrees) from the graph. */
  clear(): void {
    const roots = [...this.roots];
    for (const root of roots) {
      this.destroy(root);
    }
  }

  /** Creates a renderable primitive under an optional parent (parent = scene root when omitted). */
  createPrimitive(name: string, primitive: PrimitiveKind, parent: GameObject | null = null): GameObject {
    const go = new GameObject(name);
    go.meshRenderer.primitive = primitive;
    this.register(go);
    this.setParent(go, parent);
    this.emit();
    return go;
  }

  /** Registers an object without parenting it (becomes a root until reparented). */
  register(gameObject: GameObject): void {
    if (this.index.has(gameObject.id)) {
      throw new Error(`GameObject ${gameObject.id} is already registered`);
    }
    this.index.set(gameObject.id, gameObject);
    if (!gameObject.parent && !this.roots.includes(gameObject)) {
      this.roots.push(gameObject);
    }
    this.emit();
  }

  destroy(gameObject: GameObject): void {
    if (!this.index.has(gameObject.id)) return;

    // Detach children first (move to root to preserve them, Roblox-style "ungroup" alternative).
    const snapshot = [...gameObject.children];
    for (const child of snapshot) {
      this.setParent(child, gameObject.parent);
    }

    this.setParent(gameObject, null);
    this.roots.splice(this.roots.indexOf(gameObject), 1);
    this.index.delete(gameObject.id);
    this.emit();
  }

  /**
   * Reparents `child` under `newParent` (or unparents to root when `newParent` is `null`).
   * Prevents cycles by rejecting moves that would make `newParent` a descendant of `child`.
   */
  setParent(child: GameObject, newParent: GameObject | null): void {
    if (!this.index.has(child.id)) {
      throw new Error(`Unknown GameObject ${child.id}`);
    }
    if (newParent && !this.index.has(newParent.id)) {
      throw new Error(`Unknown parent GameObject ${newParent.id}`);
    }
    if (newParent && this.isDescendant(newParent, child)) {
      throw new Error("Cannot parent an object to one of its descendants");
    }

    if (child.parent) {
      const siblings = child.parent.children;
      siblings.splice(siblings.indexOf(child), 1);
    } else {
      const idx = this.roots.indexOf(child);
      if (idx >= 0) this.roots.splice(idx, 1);
    }

    child.parent = newParent;
    if (newParent) {
      newParent.children.push(child);
    } else if (!this.roots.includes(child)) {
      this.roots.push(child);
    }

    this.emit();
  }

  private isDescendant(possibleAncestor: GameObject, node: GameObject): boolean {
    let cursor: GameObject | null = node.parent;
    while (cursor) {
      if (cursor.id === possibleAncestor.id) return true;
      cursor = cursor.parent;
    }
    return false;
  }

  /** Depth-first traversal used by tooling (selection highlights, serialization, etc.). */
  traverse(visitor: (go: GameObject) => void): void {
    const walk = (node: GameObject) => {
      visitor(node);
      for (const child of node.children) walk(child);
    };
    for (const root of this.roots) walk(root);
  }

  /** Applies a demo script to showcase play mode without user-authored code. */
  attachDemoSpinner(gameObject: GameObject): void {
    const spinner = new Script();
    spinner.onUpdate = (dt, go) => {
      go.transform.localRotation.y += dt * 0.9;
    };
    gameObject.script = spinner;
    this.emit();
  }

  /** Utility for editor defaults when duplicating component stacks. */
  cloneMeshAndScriptFrom(source: GameObject, target: GameObject): void {
    target.meshRenderer.enabled = source.meshRenderer.enabled;
    target.meshRenderer.source = source.meshRenderer.source;
    target.meshRenderer.modelUrl = source.meshRenderer.modelUrl;
    target.meshRenderer.primitive = source.meshRenderer.primitive;
    target.meshRenderer.color = source.meshRenderer.color;
    target.meshRenderer.size = source.meshRenderer.size;
    target.meshRenderer.surface = { ...source.meshRenderer.surface };

    if (source.animation) {
      const a = new AnimationComponent();
      a.clipName = source.animation.clipName;
      a.enabled = source.animation.enabled;
      a.loop = source.animation.loop;
      a.blendDuration = source.animation.blendDuration;
      target.animation = a;
    } else {
      target.animation = undefined;
    }

    if (source.character) {
      const c = new CharacterMotorSettings();
      c.enabled = source.character.enabled;
      c.moveSpeed = source.character.moveSpeed;
      c.jumpImpulse = source.character.jumpImpulse;
      c.cameraDistance = source.character.cameraDistance;
      c.cameraHeight = source.character.cameraHeight;
      c.mouseSensitivity = source.character.mouseSensitivity;
      target.character = c;
    } else {
      target.character = undefined;
    }

    if (source.procedural) {
      const pr = new ProceduralMotion();
      pr.kind = source.procedural.kind;
      pr.speed = source.procedural.speed;
      pr.amplitude = source.procedural.amplitude;
      pr.axisX = source.procedural.axisX;
      pr.axisY = source.procedural.axisY;
      pr.axisZ = source.procedural.axisZ;
      target.procedural = pr;
    } else {
      target.procedural = undefined;
    }

    if (source.script) {
      const clone = new Script();
      clone.enabled = source.script.enabled;
      clone.userSource = source.script.userSource;
      clone.onStart = source.script.onStart;
      clone.onClick = source.script.onClick;
      clone.onCollision = source.script.onCollision;
      clone._playStarted = false;
      clone.onUpdate = (dt, go, eng) => source.script!.onUpdate(dt, go, eng);
      target.script = clone;
    } else {
      target.script = undefined;
    }
    this.emit();
  }
}
