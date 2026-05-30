export type { RideKind, RideCategory } from './ridesRegistry';

export type Terrain = 'grass' | 'path' | 'water';

export type Structure =
  | 'tree'
  | 'bench'
  | 'food'
  | 'toilet'
  | 'entrance'
  | 'flower'
  | 'fountain'
  | 'statue'
  | 'lamp'
  | 'bush'
  | 'hedge'
  | 'rock'
  | 'flowerBed';

import type { RideKind } from './ridesRegistry';

/** Base + dynamic ride tools (ride_* / flat_*) */
export type BaseBuildTool =
  | 'select'
  | 'bulldoze'
  | 'path'
  | 'tree'
  | 'bench'
  | 'food'
  | 'toilet'
  | 'entrance'
  | 'flower'
  | 'fountain'
  | 'statue'
  | 'lamp'
  | 'bush'
  | 'hedge'
  | 'rock'
  | 'flowerBed';

export type BuildTool = BaseBuildTool | `ride_${RideKind}` | `flat_${RideKind}`;

export type Cell = {
  terrain: Terrain;
  structure?: Structure;
  rideId?: number;
  ridePart?: 'station' | 'track';
};

export type Ride = {
  id: number;
  kind: RideKind;
  isCoaster: boolean;
  cells: Array<{ x: number; y: number }>;
  station: { x: number; y: number };
  open: boolean;
  queue: number;
  running: number;
};

export type Guest = {
  id: number;
  x: number;
  y: number;
  animX: number;
  animY: number;
  happiness: number;
  hunger: number;
  nausea: number;
  boredom: number;
  cashSpent: number;
  targetRideId: number | null;
  state: 'wander' | 'queue' | 'riding' | 'leaving';
  rideTimer: number;
  path: Array<{ x: number; y: number }>;
  pathIndex: number;
};

export type GamePhase = 'menu' | 'playing' | 'bankrupt' | 'won';

export type ScenarioId =
  | 'sandbox'
  | 'firstPark'
  | 'coasterRush'
  | 'sceneryDream'
  | 'profitPush'
  | 'thrillSeeker'
  | 'familyFair'
  | 'lakeResort';

export type ScenarioGoal =
  | { type: 'none' }
  | { type: 'guests'; count: number }
  | { type: 'rating'; min: number }
  | { type: 'money'; amount: number; byYear?: number }
  | { type: 'scenery'; min: number }
  | { type: 'excitement'; min: number }
  | { type: 'coasters'; count: number; minKinds?: number }
  | { type: 'flatRides'; count: number }
  | { type: 'ridesOpen'; count: number }
  | { type: 'avgHappiness'; min: number }
  | { type: 'structures'; structure: Structure; count: number };

export type ParkState = {
  phase: GamePhase;
  scenarioId: ScenarioId;
  sandbox: boolean;
  paused: boolean;
  speed: 1 | 2 | 3;
  money: number;
  loan: number;
  day: number;
  month: number;
  year: number;
  guestsTotal: number;
  guestsInPark: number;
  rating: number;
  cleanliness: number;
  scenery: number;
  excitement: number;
  mapW: number;
  mapH: number;
  cells: Cell[];
  rides: Ride[];
  guests: Guest[];
  nextGuestId: number;
  nextRideId: number;
  tool: BuildTool;
  coasterDraft: {
    kind: RideKind;
    cells: Array<{ x: number; y: number }>;
    station: { x: number; y: number } | null;
  } | null;
  messages: string[];
  tutorialStep: number;
  stats: {
    incomeToday: number;
    upkeepToday: number;
    admissionsToday: number;
  };
};
