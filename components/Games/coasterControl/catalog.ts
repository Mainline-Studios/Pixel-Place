import type { BuildTool, RideKind, Structure } from './types';
import {
  CATEGORY_LABELS,
  COASTER_KINDS,
  RIDE_DEF,
  RIDES_REGISTRY,
  type RideCategory,
  type RideRegistryEntry,
} from './ridesRegistry';

export { RIDE_DEF, RIDES_REGISTRY, COASTER_KINDS, CATEGORY_LABELS };
export type { RideKind, RideCategory, RideRegistryEntry };

export const MAP_W = 52;
export const MAP_H = 38;
export const TILE = 14;

export const START_MONEY = 12_000;
export const START_LOAN = 5_000;
export const ADMISSION_FEE = 12;
export const BANKRUPT_AT = -2_000;

export const SCENERY_SCORE: Record<Structure, number> = {
  tree: 4,
  bench: 2,
  food: 0,
  toilet: 0,
  entrance: 1,
  flower: 3,
  fountain: 8,
  statue: 10,
  lamp: 2,
  bush: 3,
  hedge: 4,
  rock: 3,
  flowerBed: 6,
};

const sceneryCosts: Partial<Record<BuildTool, number>> = {
  path: 18,
  tree: 45,
  bench: 85,
  food: 420,
  toilet: 310,
  entrance: 250,
  flower: 35,
  fountain: 650,
  statue: 480,
  lamp: 95,
  bush: 40,
  hedge: 120,
  rock: 55,
  flowerBed: 180,
  bulldoze: 0,
};

export function getBuildCost(tool: BuildTool): number | null {
  if (tool in sceneryCosts) return sceneryCosts[tool as keyof typeof sceneryCosts] ?? null;
  const kind = toolToRideKind(tool);
  if (kind && RIDE_DEF[kind]) return RIDE_DEF[kind].baseCost;
  return null;
}

export function toolToRideKind(tool: BuildTool): RideKind | null {
  if (tool.startsWith('ride_')) {
    const id = tool.slice(5);
    return id in RIDE_DEF ? (id as RideKind) : null;
  }
  if (tool.startsWith('flat_')) {
    const id = tool.slice(5);
    return id in RIDE_DEF ? (id as RideKind) : null;
  }
  return null;
}

export function rideKindToTool(kind: RideKind): BuildTool {
  return RIDE_DEF[kind].category === 'coaster' ? (`ride_${kind}` as BuildTool) : (`flat_${kind}` as BuildTool);
}

export function isCoasterTool(tool: BuildTool): boolean {
  const k = toolToRideKind(tool);
  return k != null && RIDE_DEF[k].category === 'coaster';
}

export function isFlatRideTool(tool: BuildTool): boolean {
  const k = toolToRideKind(tool);
  return k != null && RIDE_DEF[k].category !== 'coaster';
}

export function isSceneryTool(tool: BuildTool): boolean {
  return [
    'tree',
    'bench',
    'flower',
    'fountain',
    'statue',
    'lamp',
    'bush',
    'hedge',
    'rock',
    'flowerBed',
  ].includes(tool);
}

export function toolToStructure(tool: BuildTool): Structure | null {
  const scenery: Structure[] = [
    'tree',
    'bench',
    'flower',
    'fountain',
    'statue',
    'lamp',
    'bush',
    'hedge',
    'rock',
    'flowerBed',
  ];
  if (scenery.includes(tool as Structure)) return tool as Structure;
  if (tool === 'food') return 'food';
  if (tool === 'toilet') return 'toilet';
  if (tool === 'entrance') return 'entrance';
  return null;
}

const hint = (kind: RideKind) => {
  const d = RIDE_DEF[kind];
  if (d.category === 'coaster') {
    return `${d.label} (${d.rctType}) — place station, build track, Finish.`;
  }
  return `${d.label} (${d.rctType}) — click one tile to open. $${d.baseCost}.`;
};

export const TOOL_HINTS: Partial<Record<BuildTool, string>> = {
  select: 'Inspect tiles and rides.',
  bulldoze: 'Remove paths, scenery, and rides.',
  path: 'Guests walk on paths. Connect entrance to rides.',
  tree: 'Scenery (+4).',
  bench: 'Rest spot (+2 scenery).',
  food: 'Stops hunger.',
  toilet: 'Lowers nausea.',
  entrance: 'Guest spawn point.',
  flower: 'Scenery (+3).',
  fountain: 'Premium scenery (+8), animated.',
  statue: 'Landmark (+10).',
  lamp: 'Path lighting (+2).',
  bush: 'Greenery (+3).',
  hedge: 'Formal borders (+4).',
  rock: 'Natural décor (+3).',
  flowerBed: 'Flower patch (+6).',
};

for (const r of RIDES_REGISTRY) {
  TOOL_HINTS[rideKindToTool(r.id)] = hint(r.id);
}

export type ToolGroup = {
  title: string;
  category?: RideCategory | 'build';
  tools: Array<{ id: BuildTool; label: string; icon: string; cost?: number }>;
};

export const TOOL_GROUPS: ToolGroup[] = [
  {
    title: 'Tools',
    category: 'build',
    tools: [
      { id: 'select', label: 'Inspect', icon: '🔍' },
      { id: 'bulldoze', label: 'Bulldoze', icon: '🚧' },
      { id: 'path', label: 'Path', icon: '🛤️', cost: 18 },
      { id: 'entrance', label: 'Entrance', icon: '🎫', cost: 250 },
    ],
  },
  {
    title: 'Shops',
    category: 'build',
    tools: [
      { id: 'food', label: 'Food', icon: '🍔', cost: 420 },
      { id: 'toilet', label: 'Toilet', icon: '🚻', cost: 310 },
      { id: 'bench', label: 'Bench', icon: '🪑', cost: 85 },
    ],
  },
  {
    title: 'Scenery',
    category: 'build',
    tools: [
      { id: 'tree', label: 'Tree', icon: '🌲', cost: 45 },
      { id: 'bush', label: 'Bush', icon: '🌿', cost: 40 },
      { id: 'flower', label: 'Flower', icon: '🌼', cost: 35 },
      { id: 'flowerBed', label: 'Flowers', icon: '💐', cost: 180 },
      { id: 'hedge', label: 'Hedge', icon: '🟩', cost: 120 },
      { id: 'rock', label: 'Rock', icon: '🪨', cost: 55 },
      { id: 'lamp', label: 'Lamp', icon: '💡', cost: 95 },
      { id: 'fountain', label: 'Fountain', icon: '⛲', cost: 650 },
      { id: 'statue', label: 'Statue', icon: '🗿', cost: 480 },
    ],
  },
  ...(['coaster', 'gentle', 'thrill', 'transport', 'water'] as RideCategory[]).map((cat) => ({
    title: CATEGORY_LABELS[cat],
    category: cat,
    tools: RIDES_REGISTRY.filter((r) => r.category === cat).map((r) => ({
      id: rideKindToTool(r.id),
      label: r.label,
      icon: r.icon,
      cost: r.baseCost,
    })),
  })),
];

/** Legacy save migration for renamed ride ids */
export const LEGACY_RIDE_IDS: Record<string, RideKind> = {
  mini: 'mini_coaster',
  steel: 'steel',
  scream: 'scream',
  inverted: 'inverted',
  flying: 'flying',
  hyper: 'hyper',
  wooden: 'wooden',
  ferris: 'ferris_wheel',
  carousel: 'merry_go_round',
  dropTower: 'drop_tower',
  bumper: 'dodgems',
  swings: 'swings',
  logFlume: 'log_flume',
  teaCups: 'teaCups',
  goKarts: 'goKarts',
};
