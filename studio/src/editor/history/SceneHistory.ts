import type { Engine } from "@/engine/Engine";
import { deserializeProject, serializeProject, type SerializedStudioProject } from "@/engine/io/sceneSerialize";

/**
 * Snapshot-based undo/redo for the entire edit scene + terrain.
 */
export class SceneHistory {
  private readonly undoStack: string[] = [];
  private readonly redoStack: string[] = [];
  private readonly limit = 45;
  private suppress = false;

  push(engine: Engine): void {
    if (this.suppress) return;
    const snap = JSON.stringify(serializeProject(engine));
    const last = this.undoStack[this.undoStack.length - 1];
    if (last === snap) return;
    this.undoStack.push(snap);
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack.length = 0;
  }

  undo(engine: Engine): boolean {
    if (this.undoStack.length < 2) return false;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    const prev = this.undoStack[this.undoStack.length - 1]!;
    this.apply(engine, prev);
    return true;
  }

  redo(engine: Engine): boolean {
    const next = this.redoStack.pop();
    if (!next) return false;
    this.undoStack.push(next);
    this.apply(engine, next);
    return true;
  }

  /** Clears undo/redo and records the current scene as the first undo state (after Load / full replace). */
  resetSnapshot(engine: Engine): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.undoStack.push(JSON.stringify(serializeProject(engine)));
  }

  private apply(engine: Engine, json: string): void {
    this.suppress = true;
    try {
      deserializeProject(engine, JSON.parse(json) as SerializedStudioProject);
    } finally {
      this.suppress = false;
    }
  }
}
