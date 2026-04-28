import { AssetBrowserPanel } from "@/editor/panels/AssetBrowserPanel";
import { BuildToolsBar } from "@/editor/panels/BuildToolsBar";
import { HierarchyPanel } from "@/editor/panels/HierarchyPanel";
import { InspectorPanel } from "@/editor/panels/InspectorPanel";
import { StudioToolsPanel } from "@/editor/panels/StudioToolsPanel";
import { TopBar } from "@/editor/panels/TopBar";
import { Viewport } from "@/editor/viewport/Viewport";

/**
 * Docking layout inspired by Roblox Studio: toolbar, outliner, viewport, inspector, and asset strip.
 */
export function EditorLayout() {
  return (
    <div className="editor-shell">
      <TopBar />
      <BuildToolsBar />
      <div className="editor-workspace">
        <HierarchyPanel />
        <main className="viewport-pane">
          <Viewport />
        </main>
        <div className="right-stack">
          <InspectorPanel />
          <StudioToolsPanel />
        </div>
      </div>
      <AssetBrowserPanel />
    </div>
  );
}
