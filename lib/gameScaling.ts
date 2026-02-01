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
