/** Base pixel cooldown (ms); server enforces caps so paid boosts never dominate skill. */
export const BASE_PIXEL_COOLDOWN_MS = 1000;

/** One-time cooldown boost maximum reduction (~10%). Premium subscription does NOT reduce cooldown (fair play). */
export const COOLDOWN_BOOST_MULTIPLIER = 0.9;

/** Absolute minimum cooldown anyone can reach (still fair to free players who sit at BASE). */
export const MIN_PIXEL_COOLDOWN_MS = 550;

/** Cosmetic theme IDs unlocked by Premium subscription (visual only). */
export const PREMIUM_SUBSCRIPTION_THEMES = ['theme_midnight', 'theme_aurora_shell'] as const;

/** Extra private canvas slots included with active Premium (convenience, not score). */
export const PREMIUM_INCLUDED_PRIVATE_SLOTS = 1;

/** Themes granted by one-time cosmetic pack purchase. */
export const COSMETIC_PACK_THEMES = ['theme_concrete', 'theme_pastel_grid'] as const;
