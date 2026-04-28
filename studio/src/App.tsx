import { EditorLayout } from "@/editor/layout/EditorLayout";
import { EngineProvider } from "@/editor/EngineContext";

/**
 * Root React tree: wraps docked editor chrome with the engine provider.
 */
export default function App() {
  return (
    <EngineProvider>
      <EditorLayout />
    </EngineProvider>
  );
}
