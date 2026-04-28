import type { AnimationClip } from "three";
import { AnimationAction, AnimationMixer } from "three";
import type { GameObject } from "@/engine/GameObject";
import type { Object3D } from "three";

type Entry = {
  mixer: AnimationMixer;
  actions: Map<string, AnimationAction>;
  current: string | null;
};

/**
 * Owns {@link AnimationMixer} instances for GLTF-backed objects and applies clip selection from {@link AnimationComponent}.
 */
export class AnimationPlaybackManager {
  private readonly entries = new Map<string, Entry>();

  sync(gameObject: GameObject, root: Object3D, clips: AnimationClip[]): void {
    if (!gameObject.animation?.enabled || clips.length === 0) {
      this.remove(gameObject.id);
      return;
    }

    let entry = this.entries.get(gameObject.id);
    if (!entry) {
      const mixer = new AnimationMixer(root);
      const actions = new Map<string, AnimationAction>();
      for (const clip of clips) {
        actions.set(clip.name, mixer.clipAction(clip));
      }
      entry = { mixer, actions, current: null };
      this.entries.set(gameObject.id, entry);
    }

    const clipName = gameObject.animation.clipName || clips[0].name;
    if (entry.current === clipName) return;

    const next = entry.actions.get(clipName);
    if (!next) return;

    if (entry.current) {
      const prev = entry.actions.get(entry.current);
      prev?.fadeOut(gameObject.animation.blendDuration);
    }
    next.reset().fadeIn(gameObject.animation.blendDuration).play();
    entry.current = clipName;
  }

  update(delta: number): void {
    for (const entry of this.entries.values()) {
      entry.mixer.update(delta);
    }
  }

  remove(gameObjectId: string): void {
    const entry = this.entries.get(gameObjectId);
    if (!entry) return;
    for (const action of entry.actions.values()) {
      action.stop();
    }
    this.entries.delete(gameObjectId);
  }

  clear(): void {
    for (const id of [...this.entries.keys()]) {
      this.remove(id);
    }
  }
}
