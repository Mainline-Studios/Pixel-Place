/** Minimum gap between successful territory claims (before multiplier). */
export const BASE_TERRITORY_COOLDOWN_MS = 480;

/** Minimum gap between progression pixel batch reports (before multiplier). */
export const BASE_PROGRESSION_COOLDOWN_MS = 320;

/** Rolling window for burst detection (ms). */
export const BURST_WINDOW_MS = 10_000;

/** Max territory claims in burst window before strong penalty. */
export const TERRITORY_BURST_SOFT = 14;
export const TERRITORY_BURST_HARD = 22;

/** Interval regularity: stddev below this (ms) over recent gaps looks bot-like. */
export const ROBOT_STDDEV_MAX_MS = 9;

/** Mouse entropy below this with low pointer counts is suspicious (if client sends signals). */
export const LOW_MOUSE_ENTROPY = 0.07;

/** Pointer moves in window below this + low entropy → suspicious. */
export const LOW_POINTER_MOVES = 4;

/** Distinct accounts sharing a fingerprint within DB triggers a review flag. */
export const FINGERPRINT_PEER_ALERT = 4;
