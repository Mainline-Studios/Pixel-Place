/**
 * gameScaling.ts
 * 
 * Centralized constants for attack ranges, widths, radii, and other measurements
 * used across all game files in the components/Games directory.
 * 
 * This file provides consistent scaling values for all powers and attacks,
 * making it easier to balance gameplay and maintain consistency.
 */

export type Vec2 = { x: number; y: number };

// ============================================================================
// ATTACK RANGES (in studs)
// ============================================================================

/**
 * Default attack ranges for basic powers
 */
export const ATTACK_RANGES = {
  // SuperShowdown basic powers (30 stud map)
  BASIC_BEAM: 20,       // Fire, Water, Wind, Earth, Electricity, Poison, Celestial, Ice, Invisible
  MELEE: 1,             // Punch attack
  FAUNA_BEAR: 7,        // Bear ranged attack
  
  // SuperShowdown2 advanced powers (100 stud map)
  PARASITE: 10,
  HARMONY: 16,
  BERSERKER: 7,
  REGEN: 7,
  HEX: 10,
  LUNAR: 16,
  SOLEIL_TELEPORT: 30,  // Max teleport distance
  DOPPELGANGER: 2,      // Melee range for doppelganger/slice
} as const;

// ============================================================================
// ATTACK WIDTHS (in studs, for beam attacks)
// ============================================================================

/**
 * Beam widths for directional attacks
 */
export const ATTACK_WIDTHS = {
  BASIC_BEAM: 2,        // Fire, Water, Wind, Earth, Electricity, Poison, Celestial, Ice, Invisible
  PARASITE: 4,
  HARMONY: 3.2,
  BERSERKER: 4,
  REGEN: 3,
  HEX: 2,
  LUNAR: 4,
} as const;

// ============================================================================
// ATTACK RADII (in studs, for circular/AoE effects)
// ============================================================================

/**
 * Radii for area-of-effect attacks and entities
 */
export const ATTACK_RADII = {
  // SuperShowdown entities
  PLANT_HEALING: 4,       // Fleur plant healing aura
  BLACK_HOLE: 3,          // Celestial black hole
  BLACK_HOLE_EXPLOSION: 4.2, // Black hole explosion radius (3 × 1.4)
  
  // SuperShowdown2 entities
  MUD_PATCH: 3.5,         // Mud patch slow zone
  MUD_PATCH_PLAYER: 2.4,  // Mud patch when player uses it on self
  SOLEIL_SUN: 4,          // Soleil sun damage aura
} as const;

// ============================================================================
// DURATION VALUES (in milliseconds)
// ============================================================================

/**
 * Duration constants for temporary effects and cooldowns
 */
export const DURATIONS = {
  // Status tick interval
  STATUS_TICK: 500,
  
  // SuperShowdown entity durations
  PLANT_LIFETIME: 8000,
  BLACK_HOLE_EXPLOSION_DELAY: 3000,
  
  // SuperShowdown2 durations
  MUD_PATCH: 8000,
  PARASITE_LIFETIME: 18000,
  PARASITE_ATTACK_INTERVAL: 4500,
  HARMONY_RELOAD: 1000,
  HEX_RELOAD: 1900,
  HEX_STACK_EXPIRE: 6000,
  LUNAR_RELOAD_NORMAL: 2000,
  LUNAR_RELOAD_MIDNIGHT: 1000,
  LUNAR_MIDNIGHT_DURATION: 10000,
  LUNAR_MIDNIGHT_COOLDOWN: 80000,
  SOLEIL_TELEPORT_COOLDOWN: 120000,
  DOPPELGANGER_SWAP_COOLDOWN: 30000,
  REGEN_ACTIVATION_DELAY: 5000,
  
  // Berserker attack intervals (HP-dependent)
  BERSERKER_CRITICAL: 500,   // < 10 HP
  BERSERKER_LOW: 800,        // < 50 HP
  BERSERKER_NORMAL: 1000,    // >= 50 HP
  
  // Combat timings
  IDLE_REGEN_THRESHOLD: 10000,
  ENEMY_ACTION_DELAY: 300,
  ENEMY_TURN_DELAY_MIN: 700,
  ENEMY_TURN_DELAY_MAX: 1100,
  
  // Doppelganger
  DOPPELGANGER_ATTACK_INTERVAL: 1000,
  DOPPELGANGER_LIFETIME: 24 * 60 * 60 * 1000, // 24 hours (effectively infinite)
} as const;

// ============================================================================
// DAMAGE VALUES
// ============================================================================

/**
 * Damage values for various attacks
 */
export const DAMAGE_VALUES = {
  // Basic attacks
  BASIC_BEAM: 14,
  MELEE: 10,
  
  // SuperShowdown entity damage
  BLACK_HOLE_EXPLOSION: 22,
  
  // SuperShowdown2 power damage
  PARASITE_INITIAL: 10,
  PARASITE_DRAIN: 6,
  PARASITE_HEAL: 3,
  HARMONY: 3,
  BERSERKER_CRITICAL: 20,    // < 10 HP
  BERSERKER_LOW: 15,         // < 50 HP
  BERSERKER_NORMAL: 10,      // >= 50 HP
  REGEN_TICK: 2,
  REGEN_TOTAL: 16,           // 8 ticks × 2 HP
  HEX: 7,
  LUNAR_NORMAL: 12,
  LUNAR_MIDNIGHT: 24,        // 2x during midnight
  SOLEIL_SUN_TICK: 10,
  DOPPELGANGER_SLICE: 40,
  DOPPELGANGER_ATTACK: 15,
  DOPPELGANGER_ATTACK_INSANE: 12, // Adjusted for InsaneShowdown
  MUD_TICK: 2,
  MUD_TICK_SUPERSHOWDOWN2: 3, // Original value in SuperShowdown2
  MUD_POISON_STACKS: 12,
} as const;

// ============================================================================
// OTHER GAMEPLAY CONSTANTS
// ============================================================================

/**
 * Miscellaneous gameplay constants
 */
export const GAMEPLAY_CONSTANTS = {
  // Movement and positioning
  WHIRLPOOL_PULL_FRACTION: 0.16,  // Pulls 16% of distance per tick
  DOPPELGANGER_CHASE_SPEED: 0.12, // Chase movement speed fraction
  
  // Status effects
  HEX_DAMAGE_REDUCTION_PER_STACK: 0.05, // 5% damage reduction per stack
  HEX_MAX_STACKS: 10,
  HEX_MAX_DAMAGE_REDUCTION: 0.50, // 50% at max stacks
  
  // Harmony combo system
  HARMONY_MAG_SIZE: 4,
  HARMONY_COMBO_REQUIREMENT: 6,  // Hits needed for invincibility
  HARMONY_INVINCIBILITY_DURATION: 4, // In ticks (2 seconds at 500ms per tick)
  HARMONY_COMBO_WINDOW: 2000,    // Time window for consecutive hits
  
  // Lunar system
  LUNAR_MAG_SIZE: 2,
  LUNAR_MIDNIGHT_DAMAGE_MULTIPLIER: 2,
  
  // Doppelganger
  DOPPELGANGER_HP: 60,
  
  // Entity health
  FLEUR_MAX_HP: 120,  // Fleur power grants extra HP
  STANDARD_MAX_HP: 100,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate Euclidean distance between two points
 */
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Check if a target position is within a beam attack
 * 
 * @param source - The starting position of the beam
 * @param dir - The normalized direction vector of the beam
 * @param width - The width of the beam (perpendicular to direction)
 * @param range - The length of the beam
 * @param targetPos - The position to check
 * @returns true if the target is within the beam
 */
export function isInBeam(
  source: Vec2,
  dir: Vec2,
  width: number,
  range: number,
  targetPos: Vec2
): boolean {
  const toT = { x: targetPos.x - source.x, y: targetPos.y - source.y };
  const proj = toT.x * dir.x + toT.y * dir.y;
  if (proj < 0 || proj > range) return false;
  const perpSq = toT.x * toT.x + toT.y * toT.y - proj * proj;
  const perp = Math.sqrt(Math.max(0, perpSq));
  return perp <= width / 2;
}

/**
 * Check if a target position is within a circular area
 * 
 * @param center - The center of the circle
 * @param radius - The radius of the circle
 * @param targetPos - The position to check
 * @returns true if the target is within the circle
 */
export function inCircle(center: Vec2, radius: number, targetPos: Vec2): boolean {
  return distance(center, targetPos) <= radius;
}

/**
 * Normalize a vector to unit length
 * 
 * @param vec - The vector to normalize
 * @returns The normalized vector (or a small default if zero-length)
 */
export function normalize(vec: Vec2): Vec2 {
  const len = Math.hypot(vec.x, vec.y) || 0.0001;
  return { x: vec.x / len, y: vec.y / len };
}

/**
 * Calculate direction vector between two points and normalize it
 * 
 * @param from - Starting position
 * @param to - Target position
 * @returns Normalized direction vector
 */
export function getDirection(from: Vec2, to: Vec2): Vec2 {
  return normalize({ x: to.x - from.x, y: to.y - from.y });
}
