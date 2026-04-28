export type WorldId =
  | 'super_showdown'
  | 'super_showdown_2'
  | 'super_showdown_insane'
  | 'space_adventure'
  | 'underwater_odyssey';

export type WorldConfig = {
  id: WorldId;
  displayName: string;
  gravity: number;
  moveSpeed: number;
  runSpeed: number;
  jumpSpeed: number;
  drag: number;
  buoyancy: number;
  skyColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  ambientIntensity: number;
  sunIntensity: number;
  sunColor: number;
  allowSwim: boolean;
  lowGravity: boolean;
  textureTheme: {
    ground: string;
    obstacle: string;
    accent: string;
  };
  arena: {
    width: number;
    depth: number;
  };
  obstacleCount: number;
  hasFloatingPlatforms: boolean;
};

export const WORLD_CONFIGS: Record<WorldId, WorldConfig> = {
  super_showdown: {
    id: 'super_showdown',
    displayName: 'Super Showdown',
    gravity: 24,
    moveSpeed: 7,
    runSpeed: 10.5,
    jumpSpeed: 10.2,
    drag: 8,
    buoyancy: 0,
    skyColor: 0x85c8ff,
    fogColor: 0x8bc5ff,
    fogNear: 35,
    fogFar: 140,
    ambientIntensity: 0.45,
    sunIntensity: 1.25,
    sunColor: 0xffffff,
    allowSwim: false,
    lowGravity: false,
    textureTheme: {
      ground: 'arena_concrete',
      obstacle: 'arena_cover',
      accent: 'arena_neon',
    },
    arena: { width: 140, depth: 140 },
    obstacleCount: 32,
    hasFloatingPlatforms: false,
  },
  super_showdown_2: {
    id: 'super_showdown_2',
    displayName: 'Super Showdown 2',
    gravity: 24,
    moveSpeed: 7.3,
    runSpeed: 11,
    jumpSpeed: 10.6,
    drag: 8.3,
    buoyancy: 0,
    skyColor: 0x94d0ff,
    fogColor: 0x94d0ff,
    fogNear: 35,
    fogFar: 145,
    ambientIntensity: 0.5,
    sunIntensity: 1.3,
    sunColor: 0xfff7ea,
    allowSwim: false,
    lowGravity: false,
    textureTheme: {
      ground: 'arena_concrete_alt',
      obstacle: 'arena_cover_tech',
      accent: 'arena_energy',
    },
    arena: { width: 150, depth: 150 },
    obstacleCount: 38,
    hasFloatingPlatforms: false,
  },
  super_showdown_insane: {
    id: 'super_showdown_insane',
    displayName: 'Insane Showdown',
    gravity: 26,
    moveSpeed: 8.3,
    runSpeed: 12.5,
    jumpSpeed: 11.2,
    drag: 7.4,
    buoyancy: 0,
    skyColor: 0x6e90d4,
    fogColor: 0x5e74a8,
    fogNear: 25,
    fogFar: 120,
    ambientIntensity: 0.38,
    sunIntensity: 1.5,
    sunColor: 0xffe6d1,
    allowSwim: false,
    lowGravity: false,
    textureTheme: {
      ground: 'arena_volcanic',
      obstacle: 'arena_chaos_cover',
      accent: 'arena_chaos_rune',
    },
    arena: { width: 170, depth: 170 },
    obstacleCount: 48,
    hasFloatingPlatforms: false,
  },
  space_adventure: {
    id: 'space_adventure',
    displayName: 'Space Adventure',
    gravity: 5.8,
    moveSpeed: 6.8,
    runSpeed: 8.9,
    jumpSpeed: 7.8,
    drag: 4.5,
    buoyancy: 0,
    skyColor: 0x050612,
    fogColor: 0x0a0d20,
    fogNear: 120,
    fogFar: 320,
    ambientIntensity: 0.34,
    sunIntensity: 0.82,
    sunColor: 0xa3b8ff,
    allowSwim: false,
    lowGravity: true,
    textureTheme: {
      ground: 'space_plate',
      obstacle: 'space_rock',
      accent: 'space_glow',
    },
    arena: { width: 220, depth: 220 },
    obstacleCount: 26,
    hasFloatingPlatforms: true,
  },
  underwater_odyssey: {
    id: 'underwater_odyssey',
    displayName: 'Underwater Odyssey',
    gravity: 8.8,
    moveSpeed: 4.9,
    runSpeed: 6.2,
    jumpSpeed: 6.4,
    drag: 6.5,
    buoyancy: 6.2,
    skyColor: 0x0f5f8b,
    fogColor: 0x0d6288,
    fogNear: 18,
    fogFar: 95,
    ambientIntensity: 0.58,
    sunIntensity: 0.78,
    sunColor: 0x9dd8ff,
    allowSwim: true,
    lowGravity: false,
    textureTheme: {
      ground: 'ocean_floor',
      obstacle: 'coral_rock',
      accent: 'reef',
    },
    arena: { width: 180, depth: 180 },
    obstacleCount: 30,
    hasFloatingPlatforms: false,
  },
};

