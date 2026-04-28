import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Engine } from "@/engine/Engine";
import { PlaySession } from "@/runtime/PlaySession";
import { SceneHistory } from "@/editor/history/SceneHistory";
import { useEditorStore } from "@/editor/store/editorStore";

type EngineContextValue = {
  engine: Engine;
  playSession: PlaySession;
  history: SceneHistory;
};

const EngineContext = createContext<EngineContextValue | null>(null);

/**
 * Provides a single {@link Engine} instance for the whole SPA and wires graph mutations to Zustand.
 */
export function EngineProvider({ children }: { children: ReactNode }) {
  const engine = useMemo(() => new Engine(), []);
  const playSession = useMemo(() => new PlaySession(), []);
  const history = useMemo(() => new SceneHistory(), []);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = engine.sceneGraph.subscribe(() => {
      useEditorStore.getState().bumpScene();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        history.push(engine);
      }, 380);
    });
    if (engine.sceneGraph.getRoots().length === 0) {
      engine.bootstrapDemoScene();
    }
    useEditorStore.getState().bumpScene();
    history.push(engine);
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [engine, history]);

  const value = useMemo(() => ({ engine, playSession, history }), [engine, playSession, history]);
  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

export function useEngineContext(): EngineContextValue {
  const ctx = useContext(EngineContext);
  if (!ctx) {
    throw new Error("useEngineContext must be used within EngineProvider");
  }
  return ctx;
}
