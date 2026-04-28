import type { Engine } from "@/engine/Engine";
import type { GameObject } from "@/engine/GameObject";

/**
 * Attaches a user-authored script string to a runtime {@link GameObject}.
 * The body runs inside `new Function` with a tiny `api` surface — sufficient for rapid prototyping only.
 */
export function bindUserScript(gameObject: GameObject, engine: Engine, source: string): void {
  const runner = new Function("api", "dt", source);
  const script = gameObject.script;
  if (!script) return;
  const previous = script.onUpdate.bind(script);
  script.onUpdate = (dt, go, eng) => {
    previous(dt, go, eng);
    const api = {
      log: (...args: unknown[]) => console.log("[Script]", ...args),
      setColor(hex: string) {
        go.meshRenderer.color = hex;
        engine.notifyMaterialsDirty();
      },
      spin(speed: number) {
        go.transform.localRotation.y += speed * dt;
      },
    };
    runner(api, dt);
  };
}
