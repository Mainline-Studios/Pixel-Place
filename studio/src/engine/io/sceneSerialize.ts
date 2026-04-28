import { AnimationComponent } from "@/engine/AnimationComponent";
import { CharacterMotorSettings } from "@/engine/CharacterMotorSettings";
import type { Engine } from "@/engine/Engine";
import { GameObject } from "@/engine/GameObject";
import type { MeshSourceKind } from "@/engine/MeshRenderer";
import { MeshRenderer } from "@/engine/MeshRenderer";
import { ProceduralMotion } from "@/engine/ProceduralMotion";
import { Script } from "@/engine/Script";
import { createObjectId } from "@/engine/id";
import type { TerrainBiome } from "@/engine/terrain/TerrainManager";
import type { ProceduralMotionKind } from "@/engine/ProceduralMotion";
import { createDefaultSurface, type SurfaceSettings } from "@/engine/materials/surfaceTypes";

export type SerializedObject = {
  id: string;
  name: string;
  parentId: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  mesh: {
    enabled: boolean;
    source?: MeshSourceKind;
    modelUrl?: string | null;
    primitive: string;
    color: string;
    size: number;
    surface: Record<string, unknown>;
  };
  scriptUser?: string;
  animation?: {
    clipName: string | null;
    enabled: boolean;
    loop: boolean;
    blendDuration: number;
  };
  character?: {
    enabled: boolean;
    moveSpeed: number;
    jumpImpulse: number;
    cameraDistance: number;
    cameraHeight: number;
    mouseSensitivity: number;
  };
  procedural?: {
    kind: string;
    speed: number;
    amplitude: number;
    axisX: number;
    axisY: number;
    axisZ: number;
  };
};

export type SerializedStudioProject = {
  version: 1 | 2;
  objects: SerializedObject[];
  terrain?: {
    resolution: number;
    worldSize: number;
    heights: number[];
    splat: number[];
    biome: string;
  };
};

function serializeObject(go: GameObject): SerializedObject {
  return {
    id: go.id,
    name: go.name,
    parentId: go.parent?.id ?? null,
    position: [go.transform.localPosition.x, go.transform.localPosition.y, go.transform.localPosition.z],
    rotation: [go.transform.localRotation.x, go.transform.localRotation.y, go.transform.localRotation.z],
    scale: [go.transform.localScale.x, go.transform.localScale.y, go.transform.localScale.z],
    mesh: {
      enabled: go.meshRenderer.enabled,
      source: go.meshRenderer.source,
      modelUrl: go.meshRenderer.modelUrl,
      primitive: go.meshRenderer.primitive,
      color: go.meshRenderer.color,
      size: go.meshRenderer.size,
      surface: { ...go.meshRenderer.surface } as unknown as Record<string, unknown>,
    },
    scriptUser: go.script?.userSource,
    animation: go.animation
      ? {
          clipName: go.animation.clipName,
          enabled: go.animation.enabled,
          loop: go.animation.loop,
          blendDuration: go.animation.blendDuration,
        }
      : undefined,
    character: go.character
      ? {
          enabled: go.character.enabled,
          moveSpeed: go.character.moveSpeed,
          jumpImpulse: go.character.jumpImpulse,
          cameraDistance: go.character.cameraDistance,
          cameraHeight: go.character.cameraHeight,
          mouseSensitivity: go.character.mouseSensitivity,
        }
      : undefined,
    procedural: go.procedural
      ? {
          kind: go.procedural.kind,
          speed: go.procedural.speed,
          amplitude: go.procedural.amplitude,
          axisX: go.procedural.axisX,
          axisY: go.procedural.axisY,
          axisZ: go.procedural.axisZ,
        }
      : undefined,
  };
}

/** Serializes the editor scene + terrain into JSON for Save/Load workflows. */
export function serializeProject(engine: Engine): SerializedStudioProject {
  const objects: SerializedObject[] = [];
  engine.sceneGraph.traverse((go) => {
    objects.push(serializeObject(go));
  });

  return {
    version: 2,
    objects,
    terrain: {
      resolution: engine.terrain.resolution,
      worldSize: engine.terrain.worldSize,
      heights: Array.from(engine.terrain.heights),
      splat: Array.from(engine.terrain.splat),
      biome: engine.terrain.biome,
    },
  };
}

function applyMeshToRenderer(mesh: SerializedObject["mesh"], target: MeshRenderer): void {
  target.enabled = mesh.enabled;
  target.source = mesh.source ?? "primitive";
  target.modelUrl = mesh.modelUrl ?? null;
  target.primitive = mesh.primitive as MeshRenderer["primitive"];
  target.color = mesh.color;
  target.size = mesh.size;
  target.surface = { ...createDefaultSurface(), ...(mesh.surface as Partial<SurfaceSettings>) };
}

function applyComponents(go: GameObject, o: SerializedObject): void {
  applyMeshToRenderer(o.mesh, go.meshRenderer);

  if (o.scriptUser) {
    const s = new Script();
    s.userSource = o.scriptUser;
    go.script = s;
  } else {
    go.script = undefined;
  }

  if (o.animation) {
    const a = new AnimationComponent();
    a.clipName = o.animation.clipName;
    a.enabled = o.animation.enabled;
    a.loop = o.animation.loop;
    a.blendDuration = o.animation.blendDuration;
    go.animation = a;
  } else {
    go.animation = undefined;
  }

  if (o.character) {
    const c = new CharacterMotorSettings();
    c.enabled = o.character.enabled;
    c.moveSpeed = o.character.moveSpeed;
    c.jumpImpulse = o.character.jumpImpulse;
    c.cameraDistance = o.character.cameraDistance;
    c.cameraHeight = o.character.cameraHeight;
    c.mouseSensitivity = o.character.mouseSensitivity;
    go.character = c;
  } else {
    go.character = undefined;
  }

  if (o.procedural) {
    const p = new ProceduralMotion();
    p.kind = o.procedural.kind as ProceduralMotionKind;
    p.speed = o.procedural.speed;
    p.amplitude = o.procedural.amplitude;
    p.axisX = o.procedural.axisX;
    p.axisY = o.procedural.axisY;
    p.axisZ = o.procedural.axisZ;
    go.procedural = p;
  } else {
    go.procedural = undefined;
  }
}

/** Replaces the entire edit scene + terrain from disk/network JSON. */
export function deserializeProject(engine: Engine, data: SerializedStudioProject): void {
  engine.sceneGraph.clear();
  const map = new Map<string, GameObject>();

  for (const o of data.objects) {
    const go = new GameObject(o.name, o.id);
    go.transform.localPosition.set(...o.position);
    go.transform.localRotation.set(o.rotation[0], o.rotation[1], o.rotation[2], "YXZ");
    go.transform.localScale.set(...o.scale);
    applyComponents(go, o);
    map.set(o.id, go);
  }

  for (const o of data.objects) {
    engine.sceneGraph.register(map.get(o.id)!);
  }
  for (const o of data.objects) {
    const go = map.get(o.id)!;
    const parent = o.parentId ? map.get(o.parentId) ?? null : null;
    engine.sceneGraph.setParent(go, parent);
  }

  if (data.terrain) {
    engine.terrain.importSerialized({
      resolution: data.terrain.resolution,
      worldSize: data.terrain.worldSize,
      heights: data.terrain.heights,
      splat: data.terrain.splat,
      biome: data.terrain.biome as TerrainBiome,
    });
  }
}

/** Saves a subtree as a reusable prefab (new ids on import). */
export function serializePrefab(engine: Engine, rootId: string): string {
  const root = engine.sceneGraph.getObject(rootId);
  if (!root) throw new Error(`Unknown object ${rootId}`);
  const ids = new Set<string>();
  const walk = (go: GameObject) => {
    ids.add(go.id);
    for (const c of go.children) walk(c);
  };
  walk(root);
  const objects = serializeProject(engine).objects.filter((o) => ids.has(o.id));
  return JSON.stringify({ version: 2, prefabRootId: rootId, objects, terrain: null }, null, 2);
}

export type PrefabFile = {
  version: 2;
  prefabRootId: string;
  objects: SerializedObject[];
  terrain: null;
};

/** Instantiates a prefab under `parent` (scene root when null). Returns the new root instance. */
export function importPrefab(engine: Engine, json: string, parent: GameObject | null): GameObject | undefined {
  const data = JSON.parse(json) as PrefabFile;
  if (!data.objects?.length) return undefined;

  const idMap = new Map<string, string>();
  for (const o of data.objects) {
    idMap.set(o.id, createObjectId("Prefab"));
  }

  const byOldId = new Map<string, GameObject>();
  for (const o of data.objects) {
    const go = new GameObject(o.name, idMap.get(o.id)!);
    go.transform.localPosition.set(...o.position);
    go.transform.localRotation.set(o.rotation[0], o.rotation[1], o.rotation[2], "YXZ");
    go.transform.localScale.set(...o.scale);
    applyComponents(go, o);
    byOldId.set(o.id, go);
  }

  let newRoot: GameObject | undefined;
  for (const o of data.objects) {
    engine.sceneGraph.register(byOldId.get(o.id)!);
  }
  for (const o of data.objects) {
    const go = byOldId.get(o.id)!;
    const parentInPrefab = o.parentId ? byOldId.get(o.parentId) : undefined;
    if (parentInPrefab) {
      engine.sceneGraph.setParent(go, parentInPrefab);
    } else {
      engine.sceneGraph.setParent(go, parent);
      if (o.id === data.prefabRootId) newRoot = go;
    }
  }
  return newRoot;
}

export function downloadProjectJson(engine: Engine, filename = "pixel-studio-project.json"): void {
  const data = serializeProject(engine);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
