import { useEditorStore } from "@/editor/store/editorStore";

/**
 * Primary transform tools: gizmo modes, grid snapping, and lighting presets.
 */
export function BuildToolsBar() {
  const gizmoMode = useEditorStore((s) => s.gizmoMode);
  const setGizmoMode = useEditorStore((s) => s.setGizmoMode);
  const snapGrid = useEditorStore((s) => s.snapGrid);
  const setSnapGrid = useEditorStore((s) => s.setSnapGrid);
  const lightingPreset = useEditorStore((s) => s.lightingPreset);
  const setLightingPreset = useEditorStore((s) => s.setLightingPreset);

  return (
    <div className="build-tools">
      <div className="tool-group">
        <span className="tool-label">Gizmo</span>
        <button type="button" className={gizmoMode === "translate" ? "tool active" : "tool"} onClick={() => setGizmoMode("translate")}>
          Move
        </button>
        <button type="button" className={gizmoMode === "rotate" ? "tool active" : "tool"} onClick={() => setGizmoMode("rotate")}>
          Rotate
        </button>
        <button type="button" className={gizmoMode === "scale" ? "tool active" : "tool"} onClick={() => setGizmoMode("scale")}>
          Scale
        </button>
      </div>
      <div className="tool-group">
        <span className="tool-label">Snap</span>
        {[0, 0.5, 1].map((step) => (
          <button key={step} type="button" className={snapGrid === step ? "tool active" : "tool"} onClick={() => setSnapGrid(step)}>
            {step === 0 ? "Off" : String(step)}
          </button>
        ))}
      </div>
      <div className="tool-group">
        <span className="tool-label">Light</span>
        <button type="button" className={lightingPreset === "day" ? "tool active" : "tool"} onClick={() => setLightingPreset("day")}>
          Day
        </button>
        <button type="button" className={lightingPreset === "night" ? "tool active" : "tool"} onClick={() => setLightingPreset("night")}>
          Night
        </button>
      </div>
    </div>
  );
}
