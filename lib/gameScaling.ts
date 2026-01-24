/**
 * Game Scaling Utilities
 * 
 * This file defines consistent scaling factors and measurement constants
 * for converting between game units (studs) and screen pixels.
 * 
 * Conversion: 1 pixel = 0.5 millimeters (base reference)
 */

/**
 * Power attack range constants in studs.
 * These represent the canonical attack ranges for different power types.
 */
export const ATTACK_RANGES = {
  PUNCH: 1,           // Melee punch range (studs)
  BERSERKER: 7,       // Berserker attack range (studs)
  GENERIC_BEAM: 20,   // Generic beam/fire attack range (studs)
  HARMONY: 16,        // Harmony musical note range (studs)
} as const;

/**
 * Power attack width constants in studs.
 * These represent the beam/cone widths for directional attacks.
 */
export const ATTACK_WIDTHS = {
  BERSERKER: 4,       // Berserker attack width (studs)
  GENERIC_BEAM: 2,    // Generic beam/fire attack width (studs)
  HARMONY: 3.2,       // Harmony musical note width (studs)
} as const;

/**
 * Creates a STUD_TO_PX conversion factor for a given map size.
 * @param mapSizeStuds - The size of the map in studs (square)
 * @param canvasSizePx - The size of the canvas in pixels (default: 700)
 * @returns The conversion factor from studs to pixels
 */
export function createStudToPxFactor(mapSizeStuds: number, canvasSizePx: number = 700): number {
  return canvasSizePx / mapSizeStuds;
}
