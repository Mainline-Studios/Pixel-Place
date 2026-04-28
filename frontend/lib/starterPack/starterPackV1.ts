/**
 * Pixel Place — Starter Pack v1
 * One art direction: semi-stylized outdoor “Playground Pop” (matches `manifest.json` artStyle + env pack lighting).
 */

import type { Skin } from '@/types';
import type { StarterPackPropPreset } from '@/lib/props/starterPackProps';
import type { BuildingStyle } from '@/lib/props/buildingProp';
import { STARTER_DAY_ONE_SKINS } from '@/lib/newCatalog';

export const STARTER_PACK_VERSION = 1;

/** 10 seamless terrain materials (albedo + normal + roughness + ao @512). Run `npm run environment-pack:generate`. */
export const STARTER_ENV_TEXTURE_IDS = [
  'dirt',
  'sand',
  'rock',
  'water_calm',
  'grass_meadow',
  'grass_lush',
  'grass_dry',
  'grass_patchy',
  'cobble',
  'moss_flagstone',
] as const;

export type StarterEnvTextureId = (typeof STARTER_ENV_TEXTURE_IDS)[number];

/** Albedo URL for one terrain slot (paths match `environment_pack_v1.json`). */
export function starterEnvAlbedoUrl(id: StarterEnvTextureId): string {
  const subfolder =
    id === 'grass_lush' || id === 'grass_dry' || id === 'grass_patchy' || id === 'cobble' || id === 'moss_flagstone'
      ? 'variants'
      : 'base';
  const baseName =
    id === 'dirt'
      ? 'pp_env_dirt'
      : id === 'sand'
        ? 'pp_env_sand'
        : id === 'rock'
          ? 'pp_env_rock'
          : id === 'water_calm'
            ? 'pp_env_water_calm'
            : id === 'grass_meadow'
              ? 'pp_env_grass_meadow'
              : id === 'grass_lush'
                ? 'pp_env_grass_lush'
                : id === 'grass_dry'
                  ? 'pp_env_grass_dry'
                  : id === 'grass_patchy'
                    ? 'pp_env_grass_patchy'
                    : id === 'cobble'
                      ? 'pp_env_cobble'
                      : 'pp_env_moss_flagstone';
  return `/assets/textures/environment/${subfolder}/${baseName}_albedo_512.png`;
}

export function getStarterDayOneSkins(): Skin[] {
  return STARTER_DAY_ONE_SKINS;
}

/** 15 props: tree + furniture + interactives + starter geometry presets. */
export const STARTER_PROP_15: ReadonlyArray<
  | { category: 'tree' }
  | { category: 'furniture'; variant: 'chair' | 'table' }
  | { category: 'interactive'; variant: 'chest' | 'crystal_pedestal' }
  | { category: 'starter'; preset: StarterPackPropPreset }
> = [
  { category: 'tree' },
  { category: 'furniture', variant: 'chair' },
  { category: 'furniture', variant: 'table' },
  { category: 'interactive', variant: 'chest' },
  { category: 'interactive', variant: 'crystal_pedestal' },
  { category: 'starter', preset: 'barrel' },
  { category: 'starter', preset: 'crate' },
  { category: 'starter', preset: 'bush' },
  { category: 'starter', preset: 'rock_pile' },
  { category: 'starter', preset: 'street_lamp' },
  { category: 'starter', preset: 'bench' },
  { category: 'starter', preset: 'fountain' },
  { category: 'starter', preset: 'hay_bale' },
  { category: 'starter', preset: 'sign_post' },
  { category: 'starter', preset: 'flower_patch' },
];

export const STARTER_BUILDINGS_3: BuildingStyle[] = ['cottage', 'shop', 'tower'];
