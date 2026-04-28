import type { Engine } from "@/engine/Engine";
import type { FlyCameraState } from "@/engine/FlyCameraController";

/**
 * Coordinates **play mode** transitions: captures editor camera state, hands control to scripts,
 * and restores the sandbox when returning to edit mode (similar to Roblox Studio's Play/Stop).
 */
export class PlaySession {
  private savedCamera: FlyCameraState | null = null;

  /** Clones the edit graph, boots physics, and enables script ticks (Roblox-style isolation). */
  start(engine: Engine): void {
    if (engine.isPlayMode()) return;
    this.savedCamera = engine.flyController.captureState();
    engine.enterPlayMode();
  }

  /** Drops the runtime clone and restores the fly camera snapshot. */
  stop(engine: Engine): void {
    if (!engine.isPlayMode()) return;
    engine.exitPlayMode();
    if (this.savedCamera) {
      engine.flyController.restoreState(this.savedCamera);
    }
    this.savedCamera = null;
  }

  toggle(engine: Engine): void {
    if (engine.isPlayMode()) this.stop(engine);
    else this.start(engine);
  }
}
