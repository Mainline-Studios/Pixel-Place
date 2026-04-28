import { useEngineContext } from "@/editor/EngineContext";
import { useEditorStore } from "@/editor/store/editorStore";

/**
 * Primary toolbar: hosts transport controls mirroring Roblox Studio's Play/Stop affordance.
 */
export function TopBar() {
  const { engine, playSession } = useEngineContext();
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setPlaying = useEditorStore((s) => s.setPlaying);

  const onTogglePlay = () => {
    playSession.toggle(engine);
    setPlaying(engine.isPlayMode());
  };

  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-mark">◆</span>
        <div>
          <div className="brand-title">Pixel Studio</div>
          <div className="brand-subtitle">Modular three.js editor shell</div>
        </div>
      </div>
      <div className="top-actions">
        <button
          type="button"
          className={isPlaying ? "play-toggle active" : "play-toggle"}
          onClick={onTogglePlay}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
        <span className="hint">
          Edit: click to select · Ctrl+Z / Ctrl+Y undo · Shift+drag sculpts terrain. Play: right-click locks look · WASD · Space jump (character) or up (fly)
        </span>
      </div>
    </header>
  );
}
