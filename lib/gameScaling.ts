/**
 * gameScaling.ts
 * 
 * Centralized constants for game attack ranges, widths, and scaling.
 * Scaling factor: 1 pixel = 0.5mm (studs in LEGO terms)
 * Therefore: STUD_TO_PX = 2 (1 stud = 2 pixels)
 */

// Scaling constant
export const STUD_TO_PX = 2;

// Standard attack values for most powers
const STANDARD_POWER_RANGE = 18;
const STANDARD_POWER_WIDTH = 2;

/**
 * Power Types
 */
export type Power =
  | "fire"
  | "water"
  | "wind"
  | "earth"
  | "electricity"
  | "fauna"
  | "fleur"
  | "poison"
  | "celestial"
  | "ice"
  | "invisible"
  | "mud"
  | "parasite"
  | "harmony"
  | "berserker"
  | "regen"
  | "hex"
  | "lunar"
  | "soleil"
  | "doppelganger";

/**
 * Attack ranges (in pixels) for beam-based powers
 */
export const POWER_RANGES: Record<Power, number> = {
  // Standard powers - 11 original powers with same range
  fire: STANDARD_POWER_RANGE,
  water: STANDARD_POWER_RANGE,
  wind: STANDARD_POWER_RANGE,
  earth: STANDARD_POWER_RANGE,
  electricity: STANDARD_POWER_RANGE,
  fauna: STANDARD_POWER_RANGE,
  fleur: STANDARD_POWER_RANGE,
  poison: STANDARD_POWER_RANGE,
  celestial: STANDARD_POWER_RANGE,
  ice: STANDARD_POWER_RANGE,
  invisible: STANDARD_POWER_RANGE,
  
  // Special powers with custom ranges
  mud: STANDARD_POWER_RANGE, // Creates AoE patch at range
  parasite: 10,              // Latch-on drain attack
  harmony: 16,               // Musical projectile
  berserker: 7,              // Melee swing
  regen: 7,                  // Healing beam
  hex: 10,                   // Hexing spell
  lunar: 16,                 // Moon-powered beam
  soleil: 0,                 // Sun explosion (AoE only, no beam)
  doppelganger: 2,           // Close-range slice (radius-based)
};

/**
 * Attack widths (in pixels) for beam-based powers
 */
export const POWER_WIDTHS: Record<Power, number> = {
  // Standard powers
  fire: STANDARD_POWER_WIDTH,
  water: STANDARD_POWER_WIDTH,
  wind: STANDARD_POWER_WIDTH,
  earth: STANDARD_POWER_WIDTH,
  electricity: STANDARD_POWER_WIDTH,
  fauna: STANDARD_POWER_WIDTH,
  fleur: STANDARD_POWER_WIDTH,
  poison: STANDARD_POWER_WIDTH,
  celestial: STANDARD_POWER_WIDTH,
  ice: STANDARD_POWER_WIDTH,
  invisible: STANDARD_POWER_WIDTH,
  
  // Special powers
  mud: STANDARD_POWER_WIDTH,
  parasite: 4,
  harmony: 3.2,
  berserker: 4,
  regen: 3,
  hex: STANDARD_POWER_WIDTH,
  lunar: 4,
  soleil: 0,         // Not beam-based
  doppelganger: 0,   // Not beam-based (uses radius)
};

/**
 * Attack radii (in pixels) for circular/AoE powers
 */
export const POWER_RADII: Partial<Record<Power, number>> = {
  doppelganger: 2,   // Close-range melee slice
};

/**
 * AoE effect radii
 */
export const AOE_RADII = {
  mudPatch: 3.5,           // Slowing mud patch (3D games)
  mudPatch2D: 40,          // Slowing mud patch (2D game in pixels)
  blackHoleDefault: 3,     // Black hole default radius
  blackHoleExplosion: 4.2, // Black hole explosion (default * 1.4)
  sunExplosion: 4,         // Soleil sun explosion radius
};

/**
 * 2D Game constants (SuperShowdown2D specific)
 */
export const GAME_2D = {
  bulletRadius: 4,         // Default bullet projectile radius
  bulletSpeed: 560,        // Default bullet speed
  bulletLifetime: 1.8,     // Default bullet lifetime in seconds
};

/**
 * Default attack values for powers without specific entries
 */
export const DEFAULT_ATTACK = {
  range: 20,
  width: 2,
};

/**
 * Helper functions
 */

/**
 * Get attack range for a power
 */
export function getPowerRange(power: Power): number {
  return POWER_RANGES[power] ?? DEFAULT_ATTACK.range;
}

/**
 * Get attack width for a power
 */
export function getPowerWidth(power: Power): number {
  return POWER_WIDTHS[power] ?? DEFAULT_ATTACK.width;
}

/**
 * Get attack radius for a power (if applicable)
 */
export function getPowerRadius(power: Power): number | undefined {
  return POWER_RADII[power];
}

/**
 * Convert studs to pixels
 */
export function studsToPixels(studs: number): number {
  return studs * STUD_TO_PX;
}

/**
 * Convert pixels to studs
 */
export function pixelsToStuds(pixels: number): number {
  return pixels / STUD_TO_PX;
}
