<<<<<<< HEAD
/**
 * Game Scaling Constants and Utility Functions
 * 
 * This file contains all the game balance constants and utility functions
 * used across the SuperShowdown game variants.
 */

type Vec2 = { x: number; y: number };

// Attack Ranges (in studs)
export const ATTACK_RANGES = {
  MELEE: 3,
  BASIC_BEAM: 15,
  BERSERKER: 4,
  REGEN: 12,
  PARASITE: 10,
  HARMONY: 14,
  HEX: 12,
  LUNAR: 16,
  SOLEIL_TELEPORT: 20,
  DOPPELGANGER: 3,
} as const;

// Attack Widths (for beam attacks, in studs)
export const ATTACK_WIDTHS = {
  BASIC_BEAM: 1.5,
  BERSERKER: 2,
  REGEN: 1.2,
  PARASITE: 1.0,
  HARMONY: 1.3,
  HEX: 1.1,
  LUNAR: 1.4,
} as const;

// Attack Radii (for circular/area attacks, in studs)
export const ATTACK_RADII = {
  MUD_PATCH: 2.5,
  MUD_PATCH_PLAYER: 1.5,
  SOLEIL_SUN: 4,
  BLACK_HOLE: 3,
} as const;

// Duration Constants (in milliseconds)
export const DURATIONS = {
  STATUS_TICK: 1000, // 1 second
  ENEMY_ACTION_DELAY: 500,
  REGEN_ACTIVATION_DELAY: 500,
  MUD_PATCH: 5000, // 5 seconds
  PARASITE_LIFETIME: 8000, // 8 seconds
  PARASITE_ATTACK_INTERVAL: 2000, // 2 seconds
  HARMONY_RELOAD: 1500,
  HEX_RELOAD: 2000,
  HEX_STACK_EXPIRE: 10000, // 10 seconds
  LUNAR_RELOAD_NORMAL: 1200,
  LUNAR_RELOAD_MIDNIGHT: 800,
  LUNAR_MIDNIGHT_COOLDOWN: 30000, // 30 seconds
  SOLEIL_TELEPORT_COOLDOWN: 8000, // 8 seconds
  DOPPELGANGER_LIFETIME: 60000, // 60 seconds (but they persist in InsaneShowdown)
  DOPPELGANGER_ATTACK_INTERVAL: 1500,
  DOPPELGANGER_SWAP_COOLDOWN: 5000, // 5 seconds
  BLACK_HOLE_EXPLOSION_DELAY: 3000, // 3 seconds
  IDLE_REGEN_THRESHOLD: 10000, // 10 seconds of idle
  ENEMY_TURN_DELAY_MIN: 800,
  ENEMY_TURN_DELAY_MAX: 1500,
  LUNAR_MIDNIGHT_DURATION: 15000, // 15 seconds
} as const;

// Damage Values
export const DAMAGE_VALUES = {
  MELEE: 15,
  BASIC_BEAM: 20,
  BERSERKER_NORMAL: 18,
  BERSERKER_CRITICAL: 35,
  BERSERKER_LOW: 12,
  REGEN_TICK: 3,
  PARASITE_INITIAL: 12,
  PARASITE_DRAIN: 5,
  PARASITE_HEAL: 8,
  HARMONY: 16,
  HEX: 14,
  LUNAR_NORMAL: 18,
  LUNAR_MIDNIGHT: 28,
  DOPPELGANGER_ATTACK: 10,
  DOPPELGANGER_ATTACK_INSANE: 12,
  DOPPELGANGER_SLICE: 25,
  SOLEIL_SUN_TICK: 4,
  BLACK_HOLE_EXPLOSION: 30,
  MUD_TICK: 2,
} as const;

// Gameplay Constants
export const GAMEPLAY_CONSTANTS = {
  HARMONY_MAG_SIZE: 6,
  HARMONY_COMBO_WINDOW: 3000, // 3 seconds
  HARMONY_COMBO_REQUIREMENT: 3,
  HARMONY_INVINCIBILITY_DURATION: 5000, // 5 seconds
  LUNAR_MAG_SIZE: 8,
  HEX_MAX_STACKS: 5,
  HEX_DAMAGE_REDUCTION_PER_STACK: 0.15, // 15% per stack
  HEX_MAX_DAMAGE_REDUCTION: 0.75, // 75% max reduction
  DOPPELGANGER_HP: 50,
  DOPPELGANGER_CHASE_SPEED: 0.15,
  FLEUR_MAX_HP: 150,
  STANDARD_MAX_HP: 100,
  LUNAR_MIDNIGHT_DAMAGE_MULTIPLIER: 1.5,
} as const;

// Power Statistics
export const POWER_STATS = {
  REGEN: {
    totalTicks: 5, // Number of regen ticks applied
  },
} as const;

// Utility Functions

/**
 * Calculate distance between two points
 */
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Check if a point is within a circle
 */
export function inCircle(center: Vec2, radius: number, point: Vec2): boolean {
  return distance(center, point) <= radius;
}

/**
 * Check if a point is within a beam (rectangular area defined by start, direction, width, and range)
 */
export function isInBeam(
  start: Vec2,
  direction: Vec2,
  width: number,
  range: number,
  point: Vec2
): boolean {
  // Vector from start to point
  const toPoint = { x: point.x - start.x, y: point.y - start.y };
  
  // Project point onto beam direction
  const projection = toPoint.x * direction.x + toPoint.y * direction.y;
  
  // Check if point is within range along the beam
  if (projection < 0 || projection > range) {
    return false;
  }
  
  // Calculate perpendicular distance from point to beam line
  const projectedPoint = {
    x: start.x + direction.x * projection,
    y: start.y + direction.y * projection,
  };
  
  const perpDist = distance(projectedPoint, point);
  
  // Check if perpendicular distance is within beam width
  return perpDist <= width / 2;
}
=======
// Game scaling constants and utility functions for SuperShowdown games

export const POWER_STATS = {
  REGEN: {
    totalTicks: 8,
    tickInterval: 500,
    activationDelay: 5000,
  },
};

export const ATTACK_RANGES = {
  PARASITE: 15,
  HARMONY: 20,
  HEX: 18,
  LUNAR: 25,
  SOLEIL_TELEPORT: 30,
  SOLEIL_SUN: 12,
  DOPPELGANGER: 5,
};

export const ATTACK_WIDTHS = {
  PARASITE: 2,
  HARMONY: 1.5,
  HEX: 2,
  LUNAR: 1.8,
};

export const ATTACK_RADII = {
  SOLEIL_SUN: 12,
  MUD_PATCH: 8,
  MUD_PATCH_PLAYER: 6,
};

export const DURATIONS = {
  STATUS_TICK: 500,
  HEX_STACK_EXPIRE: 10000,
  PARASITE_ATTACK_INTERVAL: 2000,
  PARASITE_LIFETIME: 15000,
  MUD_PATCH: 8000,
  HARMONY_RELOAD: 3000,
  REGEN_ACTIVATION_DELAY: 5000,
  HEX_RELOAD: 4000,
  LUNAR_RELOAD_NORMAL: 2000,
  LUNAR_RELOAD_MIDNIGHT: 1500,
  SOLEIL_TELEPORT_COOLDOWN: 5000,
  DOPPELGANGER_ATTACK_INTERVAL: 1500,
  DOPPELGANGER_LIFETIME: 20000,
  DOPPELGANGER_SWAP_COOLDOWN: 3000,
  LUNAR_MIDNIGHT_COOLDOWN: 80000,
  LUNAR_MIDNIGHT_DURATION: 10000,
};

export const DAMAGE_VALUES = {
  PARASITE_INITIAL: 5,
  PARASITE_DRAIN: 2,
  PARASITE_HEAL: 3,
  HARMONY: 8,
  HEX: 6,
  LUNAR_NORMAL: 10,
  LUNAR_MIDNIGHT: 20,
  SOLEIL_SUN_TICK: 3,
  REGEN_TICK: 2,
  DOPPELGANGER_ATTACK: 4,
};

export const GAMEPLAY_CONSTANTS = {
  HARMONY_MAG_SIZE: 6,
  HARMONY_COMBO_WINDOW: 3000,
  HARMONY_COMBO_REQUIREMENT: 3,
  HARMONY_INVINCIBILITY_DURATION: 2000,
  HEX_MAX_STACKS: 5,
  HEX_DAMAGE_REDUCTION_PER_STACK: 0.1,
  LUNAR_MAG_SIZE: 8,
  DOPPELGANGER_HP: 50,
  DOPPELGANGER_CHASE_SPEED: 0.05,
};

// Utility functions
export function isInBeam(
  start: { x: number; y: number },
  direction: { x: number; y: number },
  width: number,
  range: number,
  point: { x: number; y: number }
): boolean {
  const toPoint = { x: point.x - start.x, y: point.y - start.y };
  const dist = Math.sqrt(toPoint.x * toPoint.x + toPoint.y * toPoint.y);
  
  if (dist > range) return false;
  
  const dot = toPoint.x * direction.x + toPoint.y * direction.y;
  const projDist = dot / dist;
  const perpDist = Math.sqrt(dist * dist - projDist * projDist);
  
  return perpDist <= width / 2;
}

export function inCircle(
  center: { x: number; y: number },
  radius: number,
  point: { x: number; y: number }
): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

export function distance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
