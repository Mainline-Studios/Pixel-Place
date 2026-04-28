import { AnimationComponent } from "@/engine/AnimationComponent";
import { CharacterMotorSettings } from "@/engine/CharacterMotorSettings";
import { GameObject } from "@/engine/GameObject";
import { MeshRenderer } from "@/engine/MeshRenderer";
import { ProceduralMotion } from "@/engine/ProceduralMotion";
import { Script } from "@/engine/Script";
import { SceneGraph } from "@/engine/SceneGraph";

/**
 * Deep-clones an entire {@link SceneGraph} for play-mode isolation (editor state stays untouched).
 */
export function cloneSceneGraph(source: SceneGraph): SceneGraph {
  const target = new SceneGraph();

  const cloneObject = (go: GameObject): GameObject => {
    const next = new GameObject(go.name, go.id);
    next.transform.copyFrom(go.transform);
    cloneMeshRenderer(go.meshRenderer, next.meshRenderer);
    if (go.animation) {
      const a = new AnimationComponent();
      a.clipName = go.animation.clipName;
      a.enabled = go.animation.enabled;
      a.loop = go.animation.loop;
      a.blendDuration = go.animation.blendDuration;
      next.animation = a;
    }
    if (go.character) {
      const c = new CharacterMotorSettings();
      c.enabled = go.character.enabled;
      c.moveSpeed = go.character.moveSpeed;
      c.jumpImpulse = go.character.jumpImpulse;
      c.cameraDistance = go.character.cameraDistance;
      c.cameraHeight = go.character.cameraHeight;
      c.mouseSensitivity = go.character.mouseSensitivity;
      next.character = c;
    }
    if (go.procedural) {
      const p = new ProceduralMotion();
      p.kind = go.procedural.kind;
      p.speed = go.procedural.speed;
      p.amplitude = go.procedural.amplitude;
      p.axisX = go.procedural.axisX;
      p.axisY = go.procedural.axisY;
      p.axisZ = go.procedural.axisZ;
      next.procedural = p;
    }
    if (go.script) {
      const s = new Script();
      s.enabled = go.script.enabled;
      s.userSource = go.script.userSource;
      s.onStart = go.script.onStart;
      s.onClick = go.script.onClick;
      s.onCollision = go.script.onCollision;
      s._playStarted = false;
      s.onUpdate = (dt, g, e) => go.script!.onUpdate(dt, g, e);
      next.script = s;
    }
    return next;
  };

  const cloneSubtree = (src: GameObject, parentDest: GameObject | null) => {
    const dst = cloneObject(src);
    target.register(dst);
    target.setParent(dst, parentDest);
    for (const child of src.children) {
      cloneSubtree(child, dst);
    }
  };

  for (const root of source.getRoots()) {
    cloneSubtree(root, null);
  }

  return target;
}

function cloneMeshRenderer(from: MeshRenderer, to: MeshRenderer): void {
  to.enabled = from.enabled;
  to.source = from.source;
  to.modelUrl = from.modelUrl;
  to.primitive = from.primitive;
  to.color = from.color;
  to.size = from.size;
  to.surface = { ...from.surface };
}
