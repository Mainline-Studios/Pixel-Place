/**
 * gameScaling.ts
 * 
 * Centralized constants for attack ranges, widths, radii, and other measurements
 * used across all game files in the components/Games directory.
 * 
 * Each power has unique attributes that can be individually tuned for game balance.
 */

export type Vec2 = { x: number; y: number };

// ============================================================================
// POWER-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Individual power configurations - each power has unique stats
 */
export const POWER_STATS = {
  // SuperShowdown basic powers
  FIRE: { range: 20, width: 2, damage: 14 },
  WATER: { range: 20, width: 2, damage: 14 },
  WIND: { range: 20, width: 2, damage: 14 },
  EARTH: { range: 20, width: 2, damage: 14 },
  ELECTRICITY: { range: 20, width: 2, damage: 14 },
  POISON: { range: 20, width: 2, damage: 14 },
  CELESTIAL: { range: 20, width: 2, damage: 14 }, // Plus black hole mechanics
  ICE: { range: 20, width: 2, damage: 14 },
  INVISIBLE: { range: 20, width: 2, damage: 14 },
  FAUNA: { range: 20, width: 2, damage: 14 }, // Plus bear summoning
  FLEUR: { range: 20, width: 2, damage: 14 }, // Plus plant healing
  
  // SuperShowdown2 advanced powers
  MUD: { radius: 3.5, radiusPlayer: 2.4, tickDamage: 2 },
  PARASITE: { range: 10, width: 4, initialDamage: 10, drainDamage: 6, healAmount: 3 },
  HARMONY: { range: 16, width: 3.2, damage: 3, magSize: 4 },
  BERSERKER: { range: 7, width: 4, damageNormal: 10, damageLow: 15, damageCritical: 20 },
  REGEN: { range: 7, width: 3, beamDamage: 10, healPerTick: 2, totalTicks: 8 },
  HEX: { range: 10, width: 2, damage: 7, maxStacks: 10, damageReductionPerStack: 0.05 },
  LUNAR: { range: 16, width: 4, normalDamage: 12, midnightDamage: 24, magSize: 2 },
  SOLEIL: { teleportRange: 30, sunRadius: 4, sunTickDamage: 10 },
  DOPPELGANGER: { meleeRange: 2, sliceDamage: 40, doppelAttackDamage: 15, doppelHP: 60 },
} as const;

// ============================================================================
// ATTACK RANGES (in studs) - for backward compatibility
// ============================================================================

export const ATTACK_RANGES = {
  // Basic beam attacks
  BASIC_BEAM: 20,
  MELEE: 1,
  FAUNA_BEAR: 7,
  
  // Individual power ranges
  FIRE: POWER_STATS.FIRE.range,
  WATER: POWER_STATS.WATER.range,
  WIND: POWER_STATS.WIND.range,
  EARTH: POWER_STATS.EARTH.range,
  ELECTRICITY: POWER_STATS.ELECTRICITY.range,
  POISON: POWER_STATS.POISON.range,
  CELESTIAL: POWER_STATS.CELESTIAL.range,
  ICE: POWER_STATS.ICE.range,
  INVISIBLE: POWER_STATS.INVISIBLE.range,
  FAUNA: POWER_STATS.FAUNA.range,
  FLEUR: POWER_STATS.FLEUR.range,
  
  // SuperShowdown2 powers
  PARASITE: POWER_STATS.PARASITE.range,
  HARMONY: POWER_STATS.HARMONY.range,
  BERSERKER: POWER_STATS.BERSERKER.range,
  REGEN: POWER_STATS.REGEN.range,
  HEX: POWER_STATS.HEX.range,
  LUNAR: POWER_STATS.LUNAR.range,
  SOLEIL_TELEPORT: POWER_STATS.SOLEIL.teleportRange,
  DOPPELGANGER: POWER_STATS.DOPPELGANGER.meleeRange,
} as const;

// ============================================================================
// ATTACK WIDTHS (in studs, for beam attacks)
// ============================================================================

export const ATTACK_WIDTHS = {
  // Basic beam attacks
  BASIC_BEAM: 2,
  
  // Individual power widths
  FIRE: POWER_STATS.FIRE.width,
  WATER: POWER_STATS.WATER.width,
  WIND: POWER_STATS.WIND.width,
  EARTH: POWER_STATS.EARTH.width,
  ELECTRICITY: POWER_STATS.ELECTRICITY.width,
  POISON: POWER_STATS.POISON.width,
  CELESTIAL: POWER_STATS.CELESTIAL.width,
  ICE: POWER_STATS.ICE.width,
  INVISIBLE: POWER_STATS.INVISIBLE.width,
  FAUNA: POWER_STATS.FAUNA.width,
  FLEUR: POWER_STATS.FLEUR.width,
  
  // SuperShowdown2 powers
  PARASITE: POWER_STATS.PARASITE.width,
  HARMONY: POWER_STATS.HARMONY.width,
  BERSERKER: POWER_STATS.BERSERKER.width,
  REGEN: POWER_STATS.REGEN.width,
  HEX: POWER_STATS.HEX.width,
  LUNAR: POWER_STATS.LUNAR.width,
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
  MUD_PATCH: POWER_STATS.MUD.radius,
  MUD_PATCH_PLAYER: POWER_STATS.MUD.radiusPlayer,
  SOLEIL_SUN: POWER_STATS.SOLEIL.sunRadius,
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
  
  // Individual basic power damage
  FIRE: POWER_STATS.FIRE.damage,
  WATER: POWER_STATS.WATER.damage,
  WIND: POWER_STATS.WIND.damage,
  EARTH: POWER_STATS.EARTH.damage,
  ELECTRICITY: POWER_STATS.ELECTRICITY.damage,
  POISON: POWER_STATS.POISON.damage,
  CELESTIAL: POWER_STATS.CELESTIAL.damage,
  ICE: POWER_STATS.ICE.damage,
  INVISIBLE: POWER_STATS.INVISIBLE.damage,
  FAUNA: POWER_STATS.FAUNA.damage,
  FLEUR: POWER_STATS.FLEUR.damage,
  
  // SuperShowdown entity damage
  BLACK_HOLE_EXPLOSION: 22,
  
  // SuperShowdown2 power damage
  PARASITE_INITIAL: POWER_STATS.PARASITE.initialDamage,
  PARASITE_DRAIN: POWER_STATS.PARASITE.drainDamage,
  PARASITE_HEAL: POWER_STATS.PARASITE.healAmount,
  HARMONY: POWER_STATS.HARMONY.damage,
  BERSERKER_CRITICAL: POWER_STATS.BERSERKER.damageCritical,
  BERSERKER_LOW: POWER_STATS.BERSERKER.damageLow,
  BERSERKER_NORMAL: POWER_STATS.BERSERKER.damageNormal,
  REGEN_BEAM: POWER_STATS.REGEN.beamDamage,
  REGEN_TICK: POWER_STATS.REGEN.healPerTick,
  REGEN_TOTAL: POWER_STATS.REGEN.healPerTick * POWER_STATS.REGEN.totalTicks,
  HEX: POWER_STATS.HEX.damage,
  LUNAR_NORMAL: POWER_STATS.LUNAR.normalDamage,
  LUNAR_MIDNIGHT: POWER_STATS.LUNAR.midnightDamage,
  SOLEIL_SUN_TICK: POWER_STATS.SOLEIL.sunTickDamage,
  DOPPELGANGER_SLICE: POWER_STATS.DOPPELGANGER.sliceDamage,
  DOPPELGANGER_ATTACK: POWER_STATS.DOPPELGANGER.doppelAttackDamage,
  DOPPELGANGER_ATTACK_INSANE: 12, // Adjusted for InsaneShowdown
  MUD_TICK: POWER_STATS.MUD.tickDamage,
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
  HEX_DAMAGE_REDUCTION_PER_STACK: POWER_STATS.HEX.damageReductionPerStack,
  HEX_MAX_STACKS: POWER_STATS.HEX.maxStacks,
  HEX_MAX_DAMAGE_REDUCTION: POWER_STATS.HEX.maxStacks * POWER_STATS.HEX.damageReductionPerStack,
  
  // Harmony combo system
  HARMONY_MAG_SIZE: POWER_STATS.HARMONY.magSize,
  HARMONY_COMBO_REQUIREMENT: 6,  // Hits needed for invincibility
  HARMONY_INVINCIBILITY_DURATION: 4, // In ticks (2 seconds at 500ms per tick)
  HARMONY_COMBO_WINDOW: 2000,    // Time window for consecutive hits
  
  // Lunar system
  LUNAR_MAG_SIZE: POWER_STATS.LUNAR.magSize,
  LUNAR_MIDNIGHT_DAMAGE_MULTIPLIER: 2,
  
  // Doppelganger
  DOPPELGANGER_HP: POWER_STATS.DOPPELGANGER.doppelHP,
  
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
