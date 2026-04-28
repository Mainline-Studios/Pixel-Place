import type { ModularCharacterRig } from './factory';
import { updateModularRigEmote } from './emotes';
import type { ModularEmoteId } from './types';
import type { Object3D } from 'three';

/** If `root` was built with `createModularCharacter` (or `createAvatarInScene` modular), drive procedural emotes. */
export function tickModularAvatarEmote(
  root: Object3D,
  animation: ModularEmoteId | string,
  timeSeconds: number
): void {
  const rig = root.userData?.modularRig as ModularCharacterRig | undefined;
  const hipY = (root.userData?.hipBaseY as number | undefined) ?? rig?.hipBaseY ?? 0.95;
  if (rig) {
    updateModularRigEmote(rig.bones, animation, timeSeconds, hipY);
  }
}
