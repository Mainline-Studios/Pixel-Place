import { AnimationComponent } from "./AnimationComponent";
import { CharacterMotorSettings } from "./CharacterMotorSettings";
import { MeshRenderer } from "./MeshRenderer";
import { ProceduralMotion } from "./ProceduralMotion";
import { Script } from "./Script";
import { Transform } from "./Transform";
import { createObjectId } from "./id";

/**
 * Fundamental scene entity: a named node in the hierarchy with a transform and optional components.
 * Parent/child relationships are managed by {@link SceneGraph} to keep invariants centralized.
 */
export class GameObject {
  readonly id: string;
  name: string;
  readonly transform = new Transform();
  readonly meshRenderer: MeshRenderer;
  script?: Script;
  animation?: AnimationComponent;
  character?: CharacterMotorSettings;
  procedural?: ProceduralMotion;

  parent: GameObject | null = null;
  readonly children: GameObject[] = [];

  constructor(name?: string, id?: string) {
    this.id = id ?? createObjectId("GameObject");
    this.name = name ?? "GameObject";
    this.meshRenderer = new MeshRenderer();
  }

  /** Returns a stable path like `Root / Child / Leaf` for hierarchy debugging. */
  getPath(): string {
    const parts: string[] = [];
    let cursor: GameObject | null = this;
    while (cursor) {
      parts.unshift(cursor.name);
      cursor = cursor.parent;
    }
    return parts.join(" / ");
  }
}
