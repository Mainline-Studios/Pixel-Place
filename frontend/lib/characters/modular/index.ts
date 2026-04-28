export type {
  ModularCharacterComponent,
  ModularEmoteId,
  AvatarTextureSlots,
  ModularCharacterBuildOptions,
} from './types';
export { textureSlotFromSkin } from './types';

export { createModularPartMaterials, type ResolvedPartMaterials } from './materials';

export { createModularCharacter, modularOptionsFromSkin, type ModularCharacterRig } from './factory';

export { updateModularRigEmote, snapModularHipsHeight, type ModularRigBones } from './emotes';

export { tickModularAvatarEmote } from './runtime';
