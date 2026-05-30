/**
 * RCT2-inspired ride roster (names/types from RollerCoaster Tycoon 2 ride list).
 * Coasters use track-building; all other categories are single-tile placements.
 */

export type RideCategory = 'coaster' | 'gentle' | 'thrill' | 'transport' | 'water';

export type RideRegistryEntry = {
  id: string;
  label: string;
  /** RCT2 ride type for flavor */
  rctType: string;
  category: RideCategory;
  baseCost: number;
  tileCost: number;
  excitement: number;
  scenery: number;
  capacity: number;
  rideTicks: number;
  ticket: number;
  upkeep: number;
  minTiles: number;
  color: string;
  trackColor: string;
  icon: string;
};

function c(
  id: string,
  label: string,
  rctType: string,
  category: RideCategory,
  baseCost: number,
  excitement: number,
  opts: Partial<RideRegistryEntry> = {}
): RideRegistryEntry {
  const isCoaster = category === 'coaster';
  return {
    id,
    label,
    rctType,
    category,
    baseCost,
    tileCost: opts.tileCost ?? (isCoaster ? 70 + excitement * 12 : 0),
    excitement,
    scenery: opts.scenery ?? (category === 'gentle' ? 4 : category === 'transport' ? 2 : 2),
    capacity: opts.capacity ?? Math.round(6 + excitement * 1.2),
    rideTicks: opts.rideTicks ?? Math.round(130 - excitement * 4),
    ticket: opts.ticket ?? Math.round(4 + excitement * 1.8),
    upkeep: opts.upkeep ?? Math.round(10 + excitement * 5 + baseCost / 200),
    minTiles: opts.minTiles ?? (isCoaster ? Math.max(4, Math.round(excitement)) : 0),
    color: opts.color ?? '#78909c',
    trackColor: opts.trackColor ?? '#546e7a',
    icon: opts.icon ?? '🎢',
  };
}

/** All rides keyed by id */
export const RIDES_REGISTRY: RideRegistryEntry[] = [
  // —— Roller coasters (track build) ——
  c('side_friction', 'Side Friction Coaster', 'Side Friction Roller Coaster', 'coaster', 1200, 1.8, { icon: '🛤️', color: '#8d6e63', trackColor: '#5d4037', minTiles: 4 }),
  c('junior_coaster', 'Junior Roller Coaster', 'Junior Roller Coaster', 'coaster', 1500, 2.5, { icon: '🎠', color: '#f48fb1', trackColor: '#c2185b' }),
  c('mini_coaster', 'Mini Roller Coaster', 'Mini Roller Coaster', 'coaster', 1400, 3, { icon: '🎢', color: '#c4a574', trackColor: '#8b6914' }),
  c('kiddie', 'Kiddie Coaster', 'Mini Roller Coaster', 'coaster', 900, 2, { icon: '🧸', color: '#ffab91', trackColor: '#e64a19', minTiles: 4 }),
  c('wooden', 'Wooden Roller Coaster', 'Wooden Roller Coaster', 'coaster', 2800, 5, { icon: '🪵', color: '#8d6e63', trackColor: '#4e342e' }),
  c('wooden_twister', 'Wooden Twister Coaster', 'Wooden Twister Roller Coaster', 'coaster', 3400, 5.8, { icon: '🌪️', color: '#6d4c41', trackColor: '#3e2723' }),
  c('mine_train', 'Mine Train Coaster', 'Mine Train Coaster', 'coaster', 3200, 4.5, { icon: '⛏️', color: '#795548', trackColor: '#4e342e' }),
  c('steel', 'Steel Roller Coaster', 'Steel Roller Coaster', 'coaster', 4200, 6.5, { icon: '⚡', color: '#5b8def', trackColor: '#3d5a80' }),
  c('standup', 'Stand-Up Coaster', 'Stand-Up Steel Roller Coaster', 'coaster', 4800, 7, { icon: '🧍', color: '#7e57c2', trackColor: '#4527a0' }),
  c('corkscrew', 'Corkscrew Coaster', 'Corkscrew Roller Coaster', 'coaster', 4500, 6.8, { icon: '🌀', color: '#ef5350', trackColor: '#b71c1c' }),
  c('looping', 'Looping Coaster', 'Looping Roller Coaster', 'coaster', 5200, 7.2, { icon: '🔁', color: '#42a5f5', trackColor: '#1565c0' }),
  c('bobsled', 'Bobsleigh Coaster', 'Bobsleigh Coaster', 'coaster', 3600, 5.5, { icon: '🛷', color: '#90caf9', trackColor: '#0277bd' }),
  c('steeplechase', 'Steeplechase', 'Steeplechase', 'coaster', 3000, 4.8, { icon: '🐎', color: '#a1887f', trackColor: '#5d4037', minTiles: 6 }),
  c('inverted', 'Inverted Coaster', 'Inverted Roller Coaster', 'coaster', 5800, 7.8, { icon: '🦇', color: '#7b1fa2', trackColor: '#4a148c' }),
  c('suspended', 'Suspended Coaster', 'Suspended Swinging Coaster', 'coaster', 6200, 7.5, { icon: '🎐', color: '#26a69a', trackColor: '#00695c' }),
  c('wild_mouse', 'Wild Mouse', 'Spinning Wild Mouse', 'coaster', 3800, 6, { icon: '🐭', color: '#ffca28', trackColor: '#f57f17', minTiles: 6 }),
  c('heartline', 'Heartline Twister', 'Heartline Twister Coaster', 'coaster', 5500, 7.4, { icon: '💓', color: '#ec407a', trackColor: '#ad1457' }),
  c('flying', 'Flying Coaster', 'Flying Roller Coaster', 'coaster', 7200, 8.5, { icon: '🦅', color: '#ff9800', trackColor: '#e65100' }),
  c('floorless', 'Floorless Coaster', 'Floorless Roller Coaster', 'coaster', 6800, 8.2, { icon: '🕳️', color: '#29b6f6', trackColor: '#01579b' }),
  c('wing', 'Wing Coaster', 'Wing Coaster', 'coaster', 7500, 8.6, { icon: '🪽', color: '#5c6bc0', trackColor: '#1a237e' }),
  c('hyper', 'Hypercoaster', 'Hypercoaster', 'coaster', 9500, 9, { icon: '🚀', color: '#00e5ff', trackColor: '#006064' }),
  c('giga', 'Giga Coaster', 'Giga Coaster', 'coaster', 16_000, 9.6, { icon: '🏔️', color: '#7c4dff', trackColor: '#311b92', minTiles: 16 }),
  c('lim_launch', 'LIM Launched Coaster', 'LIM Launched Roller Coaster', 'coaster', 8000, 8.8, { icon: '⚡', color: '#ffee58', trackColor: '#f9a825' }),
  c('air_powered', 'Air Powered Coaster', 'Air Powered Vertical Coaster', 'coaster', 6500, 8, { icon: '💨', color: '#80deea', trackColor: '#00838f', minTiles: 5 }),
  c('reverse_freefall', 'Reverse Freefall', 'Reverse Freefall Coaster', 'coaster', 10_000, 9.4, { icon: '⬇️', color: '#ff5252', trackColor: '#c62828', minTiles: 4 }),
  c('pipeline', 'Pipeline Coaster', 'Pipeline Coaster', 'coaster', 5000, 6.2, { icon: '🔧', color: '#78909c', trackColor: '#37474f' }),
  c('lay_down', 'Lay-down Coaster', 'Lay-down Roller Coaster', 'coaster', 7000, 8.3, { icon: '🛌', color: '#9575cd', trackColor: '#512da8' }),
  c('hybrid', 'Steel-Wood Hybrid', 'Hybrid Coaster', 'coaster', 6000, 7, { icon: '🌉', color: '#8d6e63', trackColor: '#5b8def' }),
  c('enclosed', 'Enclosed Coaster', 'Enclosed Roller Coaster', 'coaster', 4800, 5.8, { icon: '🌑', color: '#424242', trackColor: '#212121' }),
  c('powered', 'Powered Coaster', 'Powered Coaster', 'coaster', 2200, 3.5, { icon: '🔋', color: '#aed581', trackColor: '#558b2f' }),
  c('scenic_railway', 'Scenic Railway', 'Scenic Railway', 'coaster', 2600, 3.8, { icon: '🚂', color: '#a1887f', trackColor: '#6d4c41', scenery: 5 }),
  c('virginia_reel', 'Virginia Reel', 'Virginia Reel', 'coaster', 2000, 3.2, { icon: '🎡', color: '#bcaaa4', trackColor: '#795548' }),
  c('motorbike', 'Motorbike Coaster', 'Motorbike Roller Coaster', 'coaster', 6400, 7.6, { icon: '🏍️', color: '#ff7043', trackColor: '#bf360c' }),
  c('single_rail', 'Single-Rail Impulse', 'Single-Rail Roller Coaster', 'coaster', 5800, 7.9, { icon: '📏', color: '#4dd0e1', trackColor: '#006064', minTiles: 6 }),
  c('alpine', 'Alpine Coaster', 'Alpine Coaster', 'coaster', 3500, 4.6, { icon: '🏔️', color: '#e0e0e0', trackColor: '#757575', scenery: 6 }),
  c('water_coaster', 'Water Coaster', 'Water Coaster', 'coaster', 5200, 6.4, { icon: '💦', color: '#4fc3f7', trackColor: '#0277bd', category: 'coaster' }),
  c('dark_coaster', 'Indoor Coaster', 'Dark Ride / Coaster', 'coaster', 4500, 5.5, { icon: '👻', color: '#37474f', trackColor: '#263238' }),
  c('scream', 'Scream Machine', 'Steel Looping Coaster', 'coaster', 9000, 9.2, { icon: '💀', color: '#ff4d6d', trackColor: '#9d0208' }),
  c('observation_coaster', 'Spiral Coaster', 'Spiral Roller Coaster', 'coaster', 3100, 4.2, { icon: '🗼', color: '#90a4ae', trackColor: '#455a64' }),

  // —— Gentle rides ——
  c('ferris_wheel', 'Ferris Wheel', 'Ferris Wheel', 'gentle', 2200, 2.5, { icon: '🎡', color: '#ef5350', capacity: 16, scenery: 6 }),
  c('merry_go_round', 'Merry-Go-Round', 'Merry-Go-Round', 'gentle', 1600, 1.5, { icon: '🎠', color: '#ab47bc', capacity: 12 }),
  c('haunted_house', 'Haunted House', 'Haunted House', 'gentle', 2800, 2.8, { icon: '👻', color: '#5c6bc0', rideTicks: 150 }),
  c('hedge_maze', 'Hedge Maze', 'Maze', 'gentle', 1400, 1.2, { icon: '🌿', color: '#388e3c', capacity: 20, rideTicks: 180 }),
  c('observation_tower', 'Observation Tower', 'Observation Tower', 'gentle', 3500, 2.2, { icon: '🗼', color: '#78909c', capacity: 8, scenery: 8 }),
  c('spiral_slide', 'Spiral Slide', 'Spiral Slide', 'gentle', 1200, 2, { icon: '🛝', color: '#ff7043' }),
  c('dodgems', 'Dodgems', 'Dodgems', 'gentle', 1900, 3.5, { icon: '🚗', color: '#ffca28', capacity: 10 }),
  c('space_rings', 'Space Rings', 'Space Rings', 'gentle', 2100, 2.4, { icon: '🪐', color: '#7e57c2' }),
  c('crooked_house', 'Crooked House', 'Crooked House', 'gentle', 1800, 2, { icon: '🏚️', color: '#8d6e63' }),
  c('mini_golf', 'Mini Golf', 'Mini Golf', 'gentle', 2400, 1.8, { icon: '⛳', color: '#66bb6a', rideTicks: 200, capacity: 4 }),
  c('vintage_cars', 'Vintage Cars', 'Car Ride', 'gentle', 2000, 2.2, { icon: '🚙', color: '#5c6bc0' }),
  c('sports_cars', 'Sports Cars', 'Car Ride', 'gentle', 2100, 2.5, { icon: '🏎️', color: '#e53935' }),
  c('racing_cars', 'Racing Cars', 'Car Ride', 'gentle', 2300, 3, { icon: '🏁', color: '#1e88e5' }),
  c('pickup_trucks', 'Pickup Trucks', 'Car Ride', 'gentle', 1900, 2.3, { icon: '🛻', color: '#6d4c41' }),
  c('cheshire_cats', "Cheshire Cats", 'Car Ride', 'gentle', 1700, 2, { icon: '🐱', color: '#ec407a' }),
  c('ghost_train', 'Ghost Train', 'Ghost Train', 'gentle', 2600, 3, { icon: '🚃', color: '#455a64' }),
  c('flying_saucers', 'Flying Saucers', 'Flying Saucers', 'gentle', 2400, 2.8, { icon: '🛸', color: '#26c6da' }),
  c('circus', 'Circus Show', 'Circus', 'gentle', 3000, 2, { icon: '🎪', color: '#ff5722', capacity: 24, scenery: 5 }),
  c('mini_helicopters', 'Mini Helicopters', 'Mini Helicopters', 'gentle', 2800, 3.2, { icon: '🚁', color: '#29b6f6' }),
  c('monorail_cycles', 'Monorail Cycles', 'Monorail Cycles', 'gentle', 2200, 2.5, { icon: '🚲', color: '#7cb342' }),
  c('fun_house', 'Fun House', 'Fun House', 'gentle', 2500, 2.6, { icon: '🤡', color: '#ff9800' }),
  c('cinema_3d', '3D Cinema', '3D Cinema', 'gentle', 3200, 2.4, { icon: '🎬', color: '#3949ab', capacity: 18 }),
  c('carousel', 'Carousel', 'Merry-Go-Round', 'gentle', 1600, 1.5, { icon: '🎠', color: '#ab47bc' }),
  c('teaCups', 'Tea Cups', 'Tea Cups', 'gentle', 1200, 2, { icon: '☕', color: '#ce93d8' }),
  c('swings', 'Chair Swing', 'Swinging Ship', 'gentle', 2400, 4, { icon: '🪂', color: '#66bb6a', capacity: 14 }),
  c('boat_hire', 'Boat Hire', 'Boat Hire', 'gentle', 1500, 1.5, { icon: '🚣', color: '#4fc3f7', capacity: 8 }),

  // —— Thrill rides ——
  c('drop_tower', 'Drop Tower', 'Drop Tower', 'thrill', 3800, 7, { icon: '🏗️', color: '#78909c', rideTicks: 70 }),
  c('enterprise', 'Enterprise', 'Enterprise', 'thrill', 3200, 6, { icon: '🎡', color: '#5c6bc0' }),
  c('rotor', 'Rotor', 'Rotor', 'thrill', 2800, 5.5, { icon: '🔄', color: '#8d6e63' }),
  c('top_spin', 'Top Spin', 'Top Spin', 'thrill', 4000, 7.5, { icon: '🔃', color: '#7b1fa2' }),
  c('ranger', 'Ranger', 'Ranger', 'thrill', 3500, 6.8, { icon: '⚔️', color: '#ef5350' }),
  c('scrambler', 'Scrambler', 'Scrambler', 'thrill', 2600, 5, { icon: '🌀', color: '#ffca28' }),
  c('pirate_ship', 'Pirate Ship', 'Pirate Ship', 'thrill', 3400, 6.2, { icon: '🏴‍☠️', color: '#5d4037', capacity: 20 }),
  c('swinging_ship', 'Swinging Ship', 'Swinging Ship', 'thrill', 3000, 5.8, { icon: '⛵', color: '#1976d2' }),
  c('magic_carpet', 'Magic Carpet', 'Magic Carpet', 'thrill', 2900, 5.5, { icon: '🧞', color: '#ff7043' }),
  c('double_decker', 'Double Deck Carousel', 'Double Deck Carousel', 'thrill', 4200, 5, { icon: '🎠', color: '#e91e63', capacity: 24 }),
  c('motion_sim', 'Motion Simulator', 'Motion Simulator', 'thrill', 4500, 6.5, { icon: '🎥', color: '#303f9f', capacity: 12 }),
  c('goKarts', 'Go-Karts', 'Go-Karts', 'thrill', 3200, 5, { icon: '🏎️', color: '#ff7043' }),
  c('bumper', 'Bumper Cars', 'Dodgems', 'thrill', 1900, 3.5, { icon: '💥', color: '#ffca28' }),
  c('twist', 'Twist', 'Twist', 'thrill', 2400, 4.5, { icon: '🌪️', color: '#26a69a' }),
  c('slide_extreme', 'Giant Slide', 'Spiral Slide', 'thrill', 2000, 4, { icon: '🛝', color: '#ff5722' }),

  // —— Transport rides ——
  c('steam_train', 'Steam Trains', 'Miniature Railway', 'transport', 2800, 1, { icon: '🚂', color: '#5d4037', capacity: 24, ticket: 3, scenery: 3 }),
  c('steam_covered', 'Covered Steam Train', 'Miniature Railway', 'transport', 3200, 1, { icon: '🚃', color: '#6d4c41', capacity: 22 }),
  c('american_steam', 'American Steam Train', 'Miniature Railway', 'transport', 3400, 1.2, { icon: '🤠', color: '#795548', capacity: 26, scenery: 4 }),
  c('maharaja_train', 'Maharaja Steam Train', 'Miniature Railway', 'transport', 3600, 1.2, { icon: '🕌', color: '#ff6f00', capacity: 24, scenery: 5 }),
  c('monorail_small', 'Small Monorail', 'Monorail', 'transport', 4000, 1.5, { icon: '🚝', color: '#42a5f5', capacity: 20 }),
  c('monorail_stream', 'Streamlined Monorail', 'Monorail', 'transport', 4800, 1.5, { icon: '🚄', color: '#1e88e5', capacity: 22 }),
  c('monorail_retro', 'Retro Monorail', 'Monorail', 'transport', 4500, 1.4, { icon: '🕰️', color: '#8d6e63', capacity: 20 }),
  c('suspended_monorail', 'Suspended Monorail', 'Suspended Monorail', 'transport', 5200, 2, { icon: '🚟', color: '#26a69a', capacity: 18, scenery: 4 }),
  c('airship_monorail', 'Airship Monorail', 'Suspended Monorail', 'transport', 5500, 2.2, { icon: '🎈', color: '#90a4ae', capacity: 16, scenery: 6 }),
  c('chairlift', 'Chairlift', 'Chairlift', 'transport', 2400, 1, { icon: '🪑', color: '#78909c', capacity: 12, ticket: 2 }),
  c('ski_lift', 'Ski-lift Chairs', 'Chairlift', 'transport', 2600, 1.1, { icon: '⛷️', color: '#eceff1', capacity: 12 }),
  c('lift_ride', 'Lift', 'Lift', 'transport', 1800, 0.8, { icon: '🛗', color: '#bdbdbd', capacity: 8, ticket: 2 }),
  c('mine_lift', 'Mine Lift', 'Lift', 'transport', 2200, 1, { icon: '⛏️', color: '#6d4c41', capacity: 10 }),
  c('teleporter', 'Teleporter', 'Lift', 'transport', 5000, 2.5, { icon: '✨', color: '#7c4dff', capacity: 6, excitement: 2.5 }),
  c('trams', 'Trams', 'Trams', 'transport', 3000, 1, { icon: '🚋', color: '#66bb6a', capacity: 22 }),
  c('london_bus', 'London Bus Tram', 'Trams', 'transport', 3200, 1, { icon: '🚌', color: '#c62828', capacity: 20, scenery: 4 }),
  c('san_fran_tram', 'San Francisco Tram', 'Trams', 'transport', 3100, 1, { icon: '🚃', color: '#ef5350', capacity: 20 }),
  c('school_bus', 'School Bus Ride', 'Trams', 'transport', 2800, 1.2, { icon: '🚌', color: '#ffca28', capacity: 18 }),

  // —— Water rides ——
  c('log_flume', 'Log Flume', 'Log Flume', 'water', 4500, 5.5, { icon: '🪵', color: '#4fc3f7', scenery: 5 }),
  c('river_rapids', 'River Rapids', 'River Rapids', 'water', 5200, 5.8, { icon: '🌊', color: '#0288d1', capacity: 8, rideTicks: 160 }),
  c('submarine', 'Submarine Ride', 'Submarine Ride', 'water', 4800, 4.5, { icon: '🔱', color: '#00838f' }),
  c('canoe', 'Canoes', 'Boat Hire', 'water', 1600, 2, { icon: '🛶', color: '#4db6ac' }),
  c('dinghy', 'Dinghy Slide', 'Dinghy Slide', 'water', 3800, 5, { icon: '⛵', color: '#29b6f6' }),
  c('splash_boats', 'Splash Boats', 'Boat Hire', 'water', 2200, 3, { icon: '💦', color: '#03a9f4' }),
];

export type RideKind = (typeof RIDES_REGISTRY)[number]['id'];

export const RIDE_DEF = Object.fromEntries(RIDES_REGISTRY.map((r) => [r.id, r])) as Record<
  RideKind,
  RideRegistryEntry
>;

export const COASTER_KINDS = RIDES_REGISTRY.filter((r) => r.category === 'coaster').map(
  (r) => r.id
) as RideKind[];

export const FLAT_KINDS = RIDES_REGISTRY.filter((r) => r.category !== 'coaster').map(
  (r) => r.id
) as RideKind[];

export const CATEGORY_LABELS: Record<RideCategory, string> = {
  coaster: 'Roller Coasters',
  gentle: 'Gentle Rides',
  thrill: 'Thrill Rides',
  transport: 'Transport Rides',
  water: 'Water Rides',
};
