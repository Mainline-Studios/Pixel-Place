import { ASSET_CATALOG } from "@/assets/assetCatalog";
import { useEngineContext } from "@/editor/EngineContext";
import { useEditorStore } from "@/editor/store/editorStore";

/**
 * Lightweight content drawer: double-click spawns primitives under the current selection.
 */
export function AssetBrowserPanel() {
  const { engine } = useEngineContext();
  const selectedId = useEditorStore((s) => s.selectedId);
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const bumpScene = useEditorStore((s) => s.bumpScene);

  const spawnPrimitive = (label: string, primitive: NonNullable<(typeof ASSET_CATALOG)[number]["primitive"]>) => {
    const parent = selectedId ? engine.sceneGraph.getObject(selectedId) ?? null : null;
    const created = engine.sceneGraph.createPrimitive(label, primitive, parent);
    setSelectedId(created.id);
    bumpScene();
  };

  return (
    <footer className="panel asset-panel">
      <div className="panel-header">
        <span>Asset Browser</span>
        <span className="muted tiny">Double-click to insert</span>
      </div>
      <div className="asset-strip">
        {ASSET_CATALOG.map((asset) => (
          <button
            key={asset.id}
            type="button"
            className="asset-card"
            onDoubleClick={() => {
              if (asset.kind === "primitive" && asset.primitive) {
                spawnPrimitive(asset.label, asset.primitive);
              }
            }}
          >
            <div className="asset-thumb">
              {asset.kind === "texture" && asset.url ? (
                <img src={asset.url} alt="" />
              ) : (
                <div className="asset-placeholder">{asset.label[0]}</div>
              )}
            </div>
            <div className="asset-meta">
              <div className="asset-title">{asset.label}</div>
              <div className="asset-desc">{asset.description}</div>
            </div>
          </button>
        ))}
      </div>
    </footer>
  );
}
