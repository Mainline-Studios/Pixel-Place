/** Cumulative XP threshold to *enter* this level (level is 1-based). */
export function thresholdEnterLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * level;
}

export function levelFromTotalXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= thresholdEnterLevel(level + 1)) {
    level++;
    if (level > 9999) return 9999;
  }
  return level;
}

export function xpIntoCurrentLevel(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  const level = levelFromTotalXp(totalXp);
  const floor = thresholdEnterLevel(level);
  const ceiling = thresholdEnterLevel(level + 1);
  return {
    level,
    xpIntoLevel: totalXp - floor,
    xpForNextLevel: Math.max(1, ceiling - floor),
  };
}
