import { useMemo } from "react";
import type { GameObject } from "@/engine/GameObject";
import { useEngineContext } from "@/editor/EngineContext";
import { useEditorStore } from "@/editor/store/editorStore";

function HierarchyNode({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: GameObject;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const isSelected = node.id === selectedId;
  return (
    <div className="hierarchy-node">
      <button
        type="button"
        className={isSelected ? "hierarchy-row selected" : "hierarchy-row"}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onSelect(node.id)}
      >
        <span className="hierarchy-chevron">{node.children.length ? "▾" : "·"}</span>
        <span className="hierarchy-name">{node.name}</span>
        <span className="hierarchy-type">{node.meshRenderer.primitive}</span>
      </button>
      {node.children.map((child) => (
        <HierarchyNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

/**
 * Outliner listing every root plus nested children (scene graph order).
 */
export function HierarchyPanel() {
  const { engine } = useEngineContext();
  const selectedId = useEditorStore((s) => s.selectedId);
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const sceneRevision = useEditorStore((s) => s.sceneRevision);
  const bumpScene = useEditorStore((s) => s.bumpScene);

  const roots = useMemo(() => {
    void sceneRevision;
    return [...engine.sceneGraph.getRoots()];
  }, [engine, sceneRevision]);

  const onDelete = () => {
    if (!selectedId) return;
    const target = engine.sceneGraph.getObject(selectedId);
    if (!target) return;
    engine.sceneGraph.destroy(target);
    setSelectedId(null);
    bumpScene();
  };

  const onAddPrimitive = () => {
    const parent = selectedId ? engine.sceneGraph.getObject(selectedId) ?? null : null;
    const created = engine.sceneGraph.createPrimitive("Part", "box", parent);
    setSelectedId(created.id);
    bumpScene();
  };

  return (
    <aside className="panel hierarchy-panel">
      <div className="panel-header">
        <span>Hierarchy</span>
        <div className="panel-header-actions">
          <button type="button" className="ghost" onClick={onAddPrimitive}>
            + Part
          </button>
          <button type="button" className="ghost danger" onClick={onDelete} disabled={!selectedId}>
            Delete
          </button>
        </div>
      </div>
      <div className="panel-body scrollable">
        {roots.map((root) => (
          <HierarchyNode
            key={root.id}
            node={root}
            depth={0}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ))}
      </div>
    </aside>
  );
}
