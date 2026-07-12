/** Pet Habitat — habitats, animals, shops */

export type HabitatId = 'desert' | 'plains' | 'arctic' | 'forest' | 'ocean';

export type AnimalId = string;

export type HabitatDef = {
  id: HabitatId;
  name: string;
  blurb: string;
  sky: number;
  ground: number;
  accent: number;
  fog: number;
};

export type AnimalDef = {
  id: AnimalId;
  name: string;
  habitat: HabitatId;
  blurb: string;
  /** Primary / secondary / accent hex for procedural mesh */
  colors: { primary: string; secondary: string; accent: string };
  kind: 'quad' | 'bird' | 'reptile' | 'aquatic' | 'bug';
};

export type ShopItem = {
  id: string;
  name: string;
  blurb: string;
  cost: number;
  kind: 'food' | 'gear';
  /** Hunger restored 0–100 */
  hunger?: number;
  /** Health restored 0–100 */
  health?: number;
  /** Gear slot */
  slot?: 'collar' | 'hat' | 'toy' | 'outfit';
};

export const HABITATS: HabitatDef[] = [
  {
    id: 'desert',
    name: 'Desert',
    blurb: 'Sunbaked dunes and cool nights.',
    sky: 0xf4c27a,
    ground: 0xd4a574,
    accent: 0xc48a4a,
    fog: 0xf0d9b5,
  },
  {
    id: 'plains',
    name: 'Plains',
    blurb: 'Wide grass under open sky.',
    sky: 0x87b8e8,
    ground: 0x6faf5a,
    accent: 0x8bc34a,
    fog: 0xb8d4e8,
  },
  {
    id: 'arctic',
    name: 'Arctic',
    blurb: 'Ice fields and northern light.',
    sky: 0xc5d8ea,
    ground: 0xe8f0f7,
    accent: 0xa8c4d8,
    fog: 0xd8e6f0,
  },
  {
    id: 'forest',
    name: 'Forest',
    blurb: 'Mossy trails under tall trees.',
    sky: 0x6a9e7a,
    ground: 0x3d6b3a,
    accent: 0x2f5230,
    fog: 0x8fb89a,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    blurb: 'Shallow reefs and warm shallows.',
    sky: 0x4aa3c7,
    ground: 0x2a7a9a,
    accent: 0xf0d9a0,
    fog: 0x7ec4d8,
  },
];

export const ANIMALS: AnimalDef[] = [
  // Desert
  { id: 'camel', name: 'Camel', habitat: 'desert', blurb: 'Steady desert walker.', colors: { primary: '#c4a06a', secondary: '#8b6914', accent: '#5c4030' }, kind: 'quad' },
  { id: 'fennec', name: 'Fennec Fox', habitat: 'desert', blurb: 'Big ears, soft paws.', colors: { primary: '#f0d9a8', secondary: '#e8c878', accent: '#fff8e8' }, kind: 'quad' },
  { id: 'lizard', name: 'Lizard', habitat: 'desert', blurb: 'Sun-loving climber.', colors: { primary: '#7a9e4a', secondary: '#5a7a30', accent: '#c4d88a' }, kind: 'reptile' },
  { id: 'scorpion', name: 'Scorpion', habitat: 'desert', blurb: 'Curved and careful.', colors: { primary: '#8b4513', secondary: '#5c2e0a', accent: '#c4783a' }, kind: 'bug' },
  { id: 'roadrunner', name: 'Roadrunner', habitat: 'desert', blurb: 'Fast on hot sand.', colors: { primary: '#6a7a8a', secondary: '#4a5a6a', accent: '#c4783a' }, kind: 'bird' },
  // Plains
  { id: 'horse', name: 'Horse', habitat: 'plains', blurb: 'Proud plains runner.', colors: { primary: '#8b5a2b', secondary: '#5c3a1a', accent: '#1a1a1a' }, kind: 'quad' },
  { id: 'cow', name: 'Cow', habitat: 'plains', blurb: 'Gentle grazer.', colors: { primary: '#f5f5f5', secondary: '#2a2a2a', accent: '#e8c878' }, kind: 'quad' },
  { id: 'rabbit', name: 'Rabbit', habitat: 'plains', blurb: 'Soft hops in the grass.', colors: { primary: '#e8dcc8', secondary: '#c4b098', accent: '#fff' }, kind: 'quad' },
  { id: 'eagle', name: 'Eagle', habitat: 'plains', blurb: 'Sky-high hunter.', colors: { primary: '#6a4a2a', secondary: '#3a2a1a', accent: '#e8c878' }, kind: 'bird' },
  { id: 'bison', name: 'Bison', habitat: 'plains', blurb: 'Strong and shaggy.', colors: { primary: '#4a3020', secondary: '#2a1810', accent: '#6a4a30' }, kind: 'quad' },
  // Arctic
  { id: 'penguin', name: 'Penguin', habitat: 'arctic', blurb: 'Waddle on ice.', colors: { primary: '#1a1a1a', secondary: '#f5f5f5', accent: '#e8a030' }, kind: 'bird' },
  { id: 'polar_bear', name: 'Polar Bear', habitat: 'arctic', blurb: 'Fluffy arctic giant.', colors: { primary: '#f2f4f8', secondary: '#d8dce8', accent: '#1a1a1a' }, kind: 'quad' },
  { id: 'arctic_fox', name: 'Arctic Fox', habitat: 'arctic', blurb: 'Snow-white and sly.', colors: { primary: '#f8f8fc', secondary: '#e0e4f0', accent: '#1a1a1a' }, kind: 'quad' },
  { id: 'seal', name: 'Seal', habitat: 'arctic', blurb: 'Slick ice swimmer.', colors: { primary: '#6a7a8a', secondary: '#4a5a6a', accent: '#c8d0d8' }, kind: 'aquatic' },
  { id: 'snowy_owl', name: 'Snowy Owl', habitat: 'arctic', blurb: 'Quiet winter wings.', colors: { primary: '#f5f5f8', secondary: '#d0d4e0', accent: '#e8c878' }, kind: 'bird' },
  // Forest
  { id: 'deer', name: 'Deer', habitat: 'forest', blurb: 'Graceful woodland friend.', colors: { primary: '#a07040', secondary: '#f0e0c8', accent: '#5c3a1a' }, kind: 'quad' },
  { id: 'fox', name: 'Fox', habitat: 'forest', blurb: 'Clever red coat.', colors: { primary: '#e07030', secondary: '#fff', accent: '#1a1a1a' }, kind: 'quad' },
  { id: 'bear', name: 'Bear', habitat: 'forest', blurb: 'Big and cozy.', colors: { primary: '#5c3a1a', secondary: '#3a2410', accent: '#1a1a1a' }, kind: 'quad' },
  { id: 'squirrel', name: 'Squirrel', habitat: 'forest', blurb: 'Busy nut hunter.', colors: { primary: '#c4783a', secondary: '#e8a868', accent: '#fff' }, kind: 'quad' },
  { id: 'owl', name: 'Owl', habitat: 'forest', blurb: 'Night watch.', colors: { primary: '#8a7048', secondary: '#c4a878', accent: '#e8c878' }, kind: 'bird' },
  // Ocean
  { id: 'dolphin', name: 'Dolphin', habitat: 'ocean', blurb: 'Playful reef friend.', colors: { primary: '#6a8aa8', secondary: '#c8d8e8', accent: '#4a6a88' }, kind: 'aquatic' },
  { id: 'turtle', name: 'Sea Turtle', habitat: 'ocean', blurb: 'Slow and steady.', colors: { primary: '#3a6a4a', secondary: '#8aaa5a', accent: '#c4d88a' }, kind: 'aquatic' },
  { id: 'clownfish', name: 'Clownfish', habitat: 'ocean', blurb: 'Bright reef dancer.', colors: { primary: '#f07020', secondary: '#fff', accent: '#1a1a1a' }, kind: 'aquatic' },
  { id: 'octopus', name: 'Octopus', habitat: 'ocean', blurb: 'Eight-arm explorer.', colors: { primary: '#c45a8a', secondary: '#8a3060', accent: '#e898b8' }, kind: 'aquatic' },
  { id: 'shark', name: 'Shark', habitat: 'ocean', blurb: 'Sleek ocean prowler.', colors: { primary: '#6a7a8a', secondary: '#c8d0d8', accent: '#1a1a1a' }, kind: 'aquatic' },
];

export const FOOD_ITEMS: ShopItem[] = [
  { id: 'kibble', name: 'Basic Kibble', blurb: 'Everyday meal.', cost: 5, kind: 'food', hunger: 25, health: 5 },
  { id: 'fresh_meal', name: 'Fresh Meal', blurb: 'Tasty and filling.', cost: 15, kind: 'food', hunger: 50, health: 15 },
  { id: 'gourmet', name: 'Gourmet Feast', blurb: 'Keep them thriving.', cost: 35, kind: 'food', hunger: 80, health: 30 },
  { id: 'treat', name: 'Happy Treat', blurb: 'Mood booster snack.', cost: 10, kind: 'food', hunger: 15, health: 10 },
];

export const GEAR_ITEMS: ShopItem[] = [
  { id: 'collar_basic', name: 'Leather Collar', blurb: 'A simple collar.', cost: 25, kind: 'gear', slot: 'collar' },
  { id: 'hat_cap', name: 'Tiny Cap', blurb: 'Looks sharp.', cost: 40, kind: 'gear', slot: 'hat' },
  { id: 'toy_ball', name: 'Play Ball', blurb: 'Bouncy fun.', cost: 20, kind: 'gear', slot: 'toy' },
  { id: 'outfit_scarf', name: 'Cozy Scarf', blurb: 'Warm and stylish.', cost: 55, kind: 'gear', slot: 'outfit' },
];

export const NEGLECT_MS = 365 * 24 * 60 * 60 * 1000; // ~1 year
export const HEALTHY_COIN_INTERVAL_MS = 60_000; // earn while healthy each minute online
export const HEALTHY_COIN_AMOUNT = 2;

export function animalsForHabitat(habitat: HabitatId): AnimalDef[] {
  return ANIMALS.filter((a) => a.habitat === habitat);
}

export function getHabitat(id: HabitatId): HabitatDef {
  return HABITATS.find((h) => h.id === id) || HABITATS[0]!;
}

export function getAnimal(id: AnimalId): AnimalDef | undefined {
  return ANIMALS.find((a) => a.id === id);
}

export function getShopItem(id: string): ShopItem | undefined {
  return [...FOOD_ITEMS, ...GEAR_ITEMS].find((i) => i.id === id);
}
