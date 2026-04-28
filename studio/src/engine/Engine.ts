import type { AnimationClip } from "three";
import {
  AmbientLight,
  BoxHelper,
  Clock,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { AnimationPlaybackManager } from "./animation/AnimationPlaybackManager";
import { CharacterMotor } from "./character/CharacterMotor";
import { FlyCameraController } from "./FlyCameraController";
import { GameObject } from "./GameObject";
import { PrimitiveBuilder } from "./geometry/PrimitiveBuilder";
import { GizmoController } from "./gizmos/GizmoController";
import {
  applyRendererMaterial,
  buildPrimitiveKey,
  type MeshVisualRecord,
} from "./materials/meshAppearance";
import { textureAssetCache } from "./materials/textureAssetCache";
import { loadGltfCached } from "./models/gltfCache";
import { disposeObjectSubtree, tagMeshesWithPickId } from "./models/modelSceneUtils";
import { PhysicsRuntime } from "./physics/PhysicsRuntime";
import { createSkySphere } from "./rendering/SkySphere";
import { bindUserScript } from "./scripting/bindUserScript";
import { cloneSceneGraph } from "./scene/sceneClone";
import { SceneGraph } from "./SceneGraph";
import { SelectionResolver } from "./SelectionResolver";
import { ShaderManager } from "./shaders/ShaderManager";
import { TerrainManager } from "./terrain/TerrainManager";

type ModelAttachment = { url: string; root: Group; clips: AnimationClip[] };

/**
 * Runtime façade: Three.js rendering, GLTF models, animation mixers, physics, terrain, character, sky.
 */
export class Engine {
  readonly sceneGraph = new SceneGraph();
  runtimeGraph: SceneGraph | null = null;

  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly flyController: FlyCameraController;
  readonly selectionResolver = new SelectionResolver();
  private readonly terrainRaycaster = new Raycaster();
  private readonly terrainNdc = new Vector2();
  readonly shaderManager = new ShaderManager();
  readonly physics = new PhysicsRuntime();
  readonly terrain = new TerrainManager();
  readonly animationPlayback = new AnimationPlaybackManager();

  private readonly sky: Mesh;
  private readonly modelAttachments = new Map<string, ModelAttachment>();
  private readonly modelLoadToken = new Map<string, number>();
  private readonly procFloatBase = new Map<string, number>();

  gizmo: GizmoController | null = null;
  private gizmoDragging = false;

  characterMotor: CharacterMotor | null = null;

  private readonly clock = new Clock();
  private totalTime = 0;
  private readonly sceneRoot = new Group();
  private readonly groups = new Map<string, Group>();
  private readonly meshes = new Map<string, MeshVisualRecord>();
  private playMode = false;
  private disposers: Array<() => void> = [];
  private selectionHelper: BoxHelper | null = null;
  private selectedId: string | null = null;

  private sun: DirectionalLight;
  private ambient: AmbientLight;

  constructor() {
    this.scene.background = new Color(0x12141a);
    this.scene.add(this.sceneRoot);
    this.sky = createSkySphere();
    this.scene.add(this.sky);
    this.scene.add(this.terrain.mesh);

    this.camera = new PerspectiveCamera(60, 1, 0.1, 500);
    this.camera.position.set(4, 3, 6);

    this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.sun = new DirectionalLight(0xffffff, 1.1);
    this.sun.position.set(3, 6, 4);
    this.sun.castShadow = true;
    this.scene.add(this.sun);
    this.ambient = new AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambient);

    this.flyController = new FlyCameraController(this.camera);
    this.flyController.yaw = -0.7;
    this.flyController.pitch = -0.35;
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.flyController.yaw;
    this.camera.rotation.x = this.flyController.pitch;
  }

  mount(container: HTMLElement): void {
    container.innerHTML = "";
    container.appendChild(this.renderer.domElement);
    this.renderer.setSize(container.clientWidth, container.clientHeight, false);
    this.camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera.updateProjectionMatrix();

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);
    this.disposers.push(() => resizeObserver.disconnect());
  }

  dispose(): void {
    for (const dispose of this.disposers) dispose();
    this.disposers = [];
    this.renderer.dispose();
    for (const record of this.meshes.values()) {
      record.mesh.geometry.dispose();
      record.material.dispose();
    }
    this.meshes.clear();
    for (const m of this.modelAttachments.values()) {
      m.root.removeFromParent();
      disposeObjectSubtree(m.root);
    }
    this.modelAttachments.clear();
    this.groups.clear();
    this.terrain.dispose();
    this.sky.geometry.dispose();
    (this.sky.material as MeshBasicMaterial).dispose();
  }

  notifyMaterialsDirty(): void {
    this.onMaterialDirty?.();
  }

  private onMaterialDirty?: () => void;

  setMaterialDirtyNotifier(cb: () => void): void {
    this.onMaterialDirty = cb;
    textureAssetCache.setNotifier(cb);
  }

  setGizmoDragging(active: boolean): void {
    this.gizmoDragging = active;
  }

  setSelectedId(id: string | null): void {
    this.selectedId = id;
    this.refreshSelectionHelper();
  }

  getSelectedId(): string | null {
    return this.selectedId;
  }

  getObjectGroup(id: string): Group | undefined {
    return this.groups.get(id);
  }

  private refreshSelectionHelper(): void {
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper.dispose();
      this.selectionHelper = null;
    }
    if (!this.selectedId) return;
    const group = this.groups.get(this.selectedId);
    if (!group) return;
    this.selectionHelper = new BoxHelper(group, 0x2fe0ff);
    this.scene.add(this.selectionHelper);
  }

  setLightingPreset(preset: "day" | "night"): void {
    const skyMat = this.sky.material as MeshBasicMaterial;
    if (preset === "day") {
      this.scene.background = new Color(0x9ec8ff);
      skyMat.color.set(0x7eb6ff);
      this.sun.intensity = 1.1;
      this.ambient.intensity = 0.35;
    } else {
      this.scene.background = new Color(0x070a12);
      skyMat.color.set(0x0a1528);
      this.sun.intensity = 0.35;
      this.ambient.intensity = 0.12;
    }
  }

  setPlayMode(on: boolean): void {
    this.playMode = on;
    if (!on && document.pointerLockElement === this.renderer.domElement.parentElement) {
      document.exitPointerLock();
    }
    if (this.gizmo) {
      this.gizmo.controls.enabled = !on;
    }
  }

  isPlayMode(): boolean {
    return this.playMode;
  }

  getActiveGraph(): SceneGraph {
    return this.runtimeGraph ?? this.sceneGraph;
  }

  enterPlayMode(): void {
    this.physics.setCollisionHandler((a, b) => {
      const ga = this.runtimeGraph?.getObject(a);
      const gb = this.runtimeGraph?.getObject(b);
      ga?.script?.onCollision?.(b, ga, this);
      gb?.script?.onCollision?.(a, gb, this);
    });

    this.runtimeGraph = cloneSceneGraph(this.sceneGraph);
    this.runtimeGraph.traverse((go) => {
      const src = go.script?.userSource?.trim();
      if (src) {
        bindUserScript(go, this, src);
      }
    });

    this.characterMotor = null;
    this.runtimeGraph.traverse((go) => {
      if (go.character?.enabled) {
        this.characterMotor = new CharacterMotor(this, go.id);
      }
    });

    if (this.characterMotor) {
      this.flyController.setEnabled(true);
      this.flyController.translateEnabled = false;
    } else {
      this.flyController.setEnabled(false);
      this.flyController.translateEnabled = true;
    }

    this.physics.rebuild(this.runtimeGraph);
    this.setPlayMode(true);
  }

  exitPlayMode(): void {
    this.setPlayMode(false);
    this.physics.setCollisionHandler(null);
    this.physics.clear();
    this.runtimeGraph = null;
    this.characterMotor = null;
    this.flyController.setEnabled(true);
    this.flyController.translateEnabled = true;
    this.animationPlayback.clear();
  }

  /** Ray pick in play mode for script onClick. */
  dispatchPlayClick(clientX: number, clientY: number, domWidth: number, domHeight: number): void {
    if (!this.playMode || !this.runtimeGraph) return;
    const id = this.pickFromDomEvent(clientX, clientY, domWidth, domHeight);
    if (!id) return;
    const go = this.runtimeGraph.getObject(id);
    if (go?.script?.onClick) {
      go.script.onClick(go, this);
    }
  }

  bootstrapDemoScene(): void {
    const floor = this.sceneGraph.createPrimitive("Baseplate", "plane", null);
    floor.transform.localScale.set(4, 4, 4);
    floor.meshRenderer.color = "#2a2f3a";

    const cube = this.sceneGraph.createPrimitive("Part", "box", null);
    cube.transform.localPosition.set(0, 0.6, 0);
    cube.meshRenderer.color = "#4a90d9";
    this.sceneGraph.attachDemoSpinner(cube);

    const orb = this.sceneGraph.createPrimitive("Orb", "sphere", cube);
    orb.transform.localPosition.set(1.1, 0.9, 0);
    orb.meshRenderer.color = "#f5a524";
    orb.meshRenderer.size = 0.45;
  }

  private applyProceduralMotion(graph: SceneGraph, dt: number): void {
    const t = this.totalTime;
    graph.traverse((go) => {
      const p = go.procedural;
      if (!p || p.kind === "none") return;
      if (p.kind === "orbit") {
        go.transform.localRotation.y += dt * p.speed * p.amplitude;
      }
      if (p.kind === "float") {
        let base = this.procFloatBase.get(go.id);
        if (base === undefined) {
          base = go.transform.localPosition.y;
          this.procFloatBase.set(go.id, base);
        }
        go.transform.localPosition.y = base + Math.sin(t * p.speed) * p.amplitude;
      }
      if (p.kind === "pulseScale") {
        const s = 1 + Math.sin(t * p.speed) * 0.12 * p.amplitude;
        go.transform.localScale.set(s, s, s);
      }
    });
  }

  tick(): void {
    const delta = Math.min(this.clock.getDelta(), 0.05);
    this.totalTime += delta;
    const graph = this.getActiveGraph();

    if (this.playMode && this.runtimeGraph) {
      this.characterMotor?.applyMovement(delta);
      this.physics.step(delta);
      this.physics.syncTransforms(this.runtimeGraph);
    }

    this.applyProceduralMotion(graph, delta);
    this.syncSceneGraph(graph);

    for (const [id, att] of this.modelAttachments) {
      const go = graph.getObject(id);
      if (go?.animation?.enabled && att.clips.length) {
        this.animationPlayback.sync(go, att.root, att.clips);
      }
    }
    this.animationPlayback.update(delta);

    if (this.playMode && this.runtimeGraph) {
      this.runtimeGraph.traverse((go) => {
        if (go.script?.enabled && !go.script._playStarted) {
          go.script._playStarted = true;
          go.script.onStart?.(go, this);
        }
      });
      this.runtimeGraph.traverse((go) => {
        if (go.script?.enabled) {
          go.script.onUpdate(delta, go, this);
        }
      });
    }

    if (this.characterMotor) {
      this.flyController.update(delta);
      this.characterMotor.updateCamera(delta);
    } else {
      this.flyController.update(delta);
    }

    if (this.selectionHelper) {
      const group = this.selectedId ? this.groups.get(this.selectedId) : null;
      if (group) {
        this.selectionHelper.setFromObject(group);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  pickFromDomEvent(clientX: number, clientY: number, domWidth: number, domHeight: number): string | null {
    return this.selectionResolver.pick(this.camera, this.sceneRoot, clientX, clientY, domWidth, domHeight);
  }

  pickTerrainXZ(clientX: number, clientY: number, domWidth: number, domHeight: number): { x: number; z: number } | null {
    if (domWidth <= 0 || domHeight <= 0) return null;
    this.terrainNdc.x = (clientX / domWidth) * 2 - 1;
    this.terrainNdc.y = -(clientY / domHeight) * 2 + 1;
    this.terrainRaycaster.setFromCamera(this.terrainNdc, this.camera);
    const hits = this.terrainRaycaster.intersectObject(this.terrain.mesh, false);
    if (!hits.length) return null;
    const p = hits[0].point;
    return { x: p.x, z: p.z };
  }

  private syncSceneGraph(graph: SceneGraph): void {
    const seen = new Set<string>();

    const visit = (gameObject: GameObject) => {
      seen.add(gameObject.id);
      let group = this.groups.get(gameObject.id);
      if (!group) {
        group = new Group();
        group.userData.gameObjectId = gameObject.id;
        this.groups.set(gameObject.id, group);
      }

      const skipTransform = this.gizmoDragging && gameObject.id === this.selectedId;
      if (!skipTransform) {
        group.position.copy(gameObject.transform.localPosition);
        group.rotation.copy(gameObject.transform.localRotation);
        group.scale.copy(gameObject.transform.localScale);
      }

      this.syncVisual(gameObject, group);

      if (gameObject.parent) {
        const parentGroup = this.groups.get(gameObject.parent.id);
        if (parentGroup && group.parent !== parentGroup) {
          parentGroup.add(group);
        }
      } else if (group.parent !== this.sceneRoot) {
        this.sceneRoot.add(group);
      }

      for (const child of gameObject.children) {
        visit(child);
      }
    };

    for (const root of graph.getRoots()) {
      visit(root);
    }

    for (const id of [...this.groups.keys()]) {
      if (!seen.has(id)) {
        const group = this.groups.get(id)!;
        group.removeFromParent();
        this.groups.delete(id);
        this.clearPrimitiveVisual(id, group);
        this.clearModelVisual(id, group);
        this.animationPlayback.remove(id);
        this.procFloatBase.delete(id);
      }
    }
  }

  private syncVisual(gameObject: GameObject, group: Group): void {
    const mr = gameObject.meshRenderer;
    if (!mr.enabled) {
      this.clearPrimitiveVisual(gameObject.id, group);
      this.clearModelVisual(gameObject.id, group);
      return;
    }
    if (mr.source === "model" && mr.modelUrl) {
      this.clearPrimitiveVisual(gameObject.id, group);
      this.syncModel(gameObject, group, mr.modelUrl, mr.size);
    } else {
      this.clearModelVisual(gameObject.id, group);
      this.syncMesh(gameObject, group);
    }
  }

  private clearPrimitiveVisual(gameObjectId: string, group: Group): void {
    const existing = this.meshes.get(gameObjectId);
    if (existing) {
      group.remove(existing.mesh);
      existing.mesh.geometry.dispose();
      if ("map" in existing.material && existing.material.map) {
        existing.material.map = null;
      }
      existing.material.dispose();
      this.meshes.delete(gameObjectId);
    }
  }

  private clearModelVisual(gameObjectId: string, group: Group): void {
    const att = this.modelAttachments.get(gameObjectId);
    if (!att) return;
    group.remove(att.root);
    disposeObjectSubtree(att.root);
    this.modelAttachments.delete(gameObjectId);
    this.animationPlayback.remove(gameObjectId);
  }

  private syncModel(gameObject: GameObject, group: Group, url: string, size: number): void {
    const existing = this.modelAttachments.get(gameObject.id);
    if (existing && existing.url === url) {
      existing.root.scale.setScalar(size);
      tagMeshesWithPickId(existing.root, gameObject.id);
      if (gameObject.animation?.enabled && existing.clips.length) {
        this.animationPlayback.sync(gameObject, existing.root, existing.clips);
      }
      return;
    }

    this.clearModelVisual(gameObject.id, group);
    const token = (this.modelLoadToken.get(gameObject.id) ?? 0) + 1;
    this.modelLoadToken.set(gameObject.id, token);

    loadGltfCached(url).then(async (data) => {
      if (this.modelLoadToken.get(gameObject.id) !== token) return;
      const { clone } = await import("three/addons/utils/SkeletonUtils.js");
      const root = clone(data.scene) as Group;
      root.scale.setScalar(size);
      tagMeshesWithPickId(root, gameObject.id);
      group.add(root);
      this.modelAttachments.set(gameObject.id, { url, root, clips: data.animations });
      if (gameObject.animation?.enabled && data.animations.length) {
        this.animationPlayback.sync(gameObject, root, data.animations);
      }
      this.notifyMaterialsDirty();
    });
  }

  private syncMesh(gameObject: GameObject, group: Group): void {
    const renderer = gameObject.meshRenderer;
    let record = this.meshes.get(gameObject.id);
    const primitiveKey = buildPrimitiveKey(renderer);
    const needsNewMesh = !record || record.primitiveKey !== primitiveKey;

    if (needsNewMesh && record) {
      group.remove(record.mesh);
      record.mesh.geometry.dispose();
      if ("map" in record.material && record.material.map) {
        record.material.map = null;
      }
      record.material.dispose();
      record = undefined;
    }

    if (!record) {
      const geometry = PrimitiveBuilder.create(renderer.primitive, renderer.size);
      const mesh = new Mesh(geometry);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.gameObjectId = gameObject.id;
      group.add(mesh);
      record = applyRendererMaterial(mesh, renderer, undefined, this.shaderManager, this.totalTime);
      this.meshes.set(gameObject.id, record);
    } else {
      record = applyRendererMaterial(record.mesh, renderer, record, this.shaderManager, this.totalTime);
      this.meshes.set(gameObject.id, record);
    }

    record.mesh.visible = true;
  }
}
