import { useEffect, useRef } from "react";
import { GizmoController } from "@/engine/gizmos/GizmoController";
import { GameObject } from "@/engine/GameObject";
import { useEngineContext } from "@/editor/EngineContext";
import { useEditorStore } from "@/editor/store/editorStore";

/**
 * Full-bleed WebGL host: mounts the renderer, runs the real-time loop, routes picking, and wires gizmos.
 */
export function Viewport() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gizmoRef = useRef<GizmoController | null>(null);
  const { engine, history } = useEngineContext();
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const selectedId = useEditorStore((s) => s.selectedId);
  const gizmoMode = useEditorStore((s) => s.gizmoMode);
  const snapGrid = useEditorStore((s) => s.snapGrid);
  const lightingPreset = useEditorStore((s) => s.lightingPreset);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const bumpScene = useEditorStore((s) => s.bumpScene);

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  useEffect(() => {
    engine.setMaterialDirtyNotifier(() => bumpScene());
  }, [engine, bumpScene]);

  useEffect(() => {
    engine.setLightingPreset(lightingPreset);
  }, [engine, lightingPreset]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    engine.mount(el);
    const gizmo = new GizmoController(engine.camera, engine.renderer.domElement);
    gizmo.addToScene(engine.scene);
    gizmoRef.current = gizmo;
    engine.gizmo = gizmo;

    const onDraggingChanged = (event: { value?: unknown }) => {
      engine.setGizmoDragging(Boolean(event.value));
    };
    gizmo.controls.addEventListener("dragging-changed", onDraggingChanged);
    const onObjectChange = () => {
      gizmo.syncGameObjectFromGizmo();
      bumpScene();
    };
    gizmo.controls.addEventListener("objectChange", onObjectChange);

    const detachFly = engine.flyController.attach(el);

    let frame = 0;
    const loop = () => {
      engine.tick();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      gizmo.controls.removeEventListener("dragging-changed", onDraggingChanged);
      gizmo.controls.removeEventListener("objectChange", onObjectChange);
      gizmo.detach();
      gizmo.dispose();
      engine.gizmo = null;
      gizmoRef.current = null;
      detachFly();
      el.replaceChildren();
    };
  }, [engine, bumpScene]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;

      const currentSelection = selectedIdRef.current;

      if (event.key === "Delete") {
        if (!currentSelection) return;
        const go = engine.sceneGraph.getObject(currentSelection);
        if (go) {
          engine.sceneGraph.destroy(go);
          setSelectedId(null);
          bumpScene();
        }
        event.preventDefault();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        if (!currentSelection) return;
        const src = engine.sceneGraph.getObject(currentSelection);
        if (!src) return;
        const parent = src.parent;
        const dup = new GameObject(`${src.name} Copy`);
        dup.transform.copyFrom(src.transform);
        engine.sceneGraph.register(dup);
        engine.sceneGraph.setParent(dup, parent);
        engine.sceneGraph.cloneMeshAndScriptFrom(src, dup);
        setSelectedId(dup.id);
        bumpScene();
        event.preventDefault();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        if (history.undo(engine)) bumpScene();
        event.preventDefault();
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey))
      ) {
        if (history.redo(engine)) bumpScene();
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [engine, history, bumpScene, setSelectedId]);

  useEffect(() => {
    const gizmo = gizmoRef.current;
    if (!gizmo) return;
    gizmo.setMode(gizmoMode);
  }, [gizmoMode]);

  useEffect(() => {
    const gizmo = gizmoRef.current;
    if (!gizmo) return;
    gizmo.setSnapGrid(snapGrid);
  }, [snapGrid]);

  useEffect(() => {
    engine.setSelectedId(selectedId);
    const raf = requestAnimationFrame(() => {
      const gizmo = gizmoRef.current;
      if (!gizmo) return;
      if (!selectedId || isPlaying) {
        gizmo.detach();
        return;
      }
      const owner = engine.sceneGraph.getObject(selectedId);
      const group = engine.getObjectGroup(selectedId);
      if (owner && group) {
        gizmo.attachToThreeObject(group, owner);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [engine, selectedId, isPlaying]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (!hostRef.current?.contains(target)) return;

    const rect = hostRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (event.shiftKey) {
      const hit = engine.pickTerrainXZ(x, y, rect.width, rect.height);
      if (hit) {
        const st = useEditorStore.getState();
        if (st.terrainBrush === "paint") {
          engine.terrain.paintSplat(hit.x, hit.z, st.terrainBrushRadius, st.terrainPaintLayer);
        } else {
          engine.terrain.applyBrush(
            hit.x,
            hit.z,
            st.terrainBrushRadius,
            st.terrainBrushStrength,
            st.terrainBrush === "flatten" ? "flatten" : st.terrainBrush,
            0,
          );
        }
        bumpScene();
      }
      return;
    }
    if (isPlaying) {
      engine.dispatchPlayClick(x, y, rect.width, rect.height);
      return;
    }
    const id = engine.pickFromDomEvent(x, y, rect.width, rect.height);
    setSelectedId(id);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!event.shiftKey || event.buttons !== 1) return;
    const rect = hostRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = engine.pickTerrainXZ(x, y, rect.width, rect.height);
    if (!hit) return;
    const st = useEditorStore.getState();
    if (st.terrainBrush === "paint") {
      engine.terrain.paintSplat(hit.x, hit.z, st.terrainBrushRadius, st.terrainPaintLayer);
    } else {
      engine.terrain.applyBrush(
        hit.x,
        hit.z,
        st.terrainBrushRadius,
        st.terrainBrushStrength,
        st.terrainBrush === "flatten" ? "flatten" : st.terrainBrush,
        0,
      );
    }
    bumpScene();
  };

  return (
    <div
      ref={hostRef}
      className="viewport-host"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      role="application"
      aria-label="3D viewport"
    />
  );
}
