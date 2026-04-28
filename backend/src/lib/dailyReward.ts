export function utcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function computeDailyStreakUpdate(params: {
  today: string;
  lastDailyClaimDate: string | null;
  currentStreak: number;
}):
  | { ok: false; reason: 'already_claimed' }
  | { ok: true; nextStreak: number } {
  const { today, lastDailyClaimDate, currentStreak } = params;
  if (lastDailyClaimDate === today) return { ok: false, reason: 'already_claimed' };
  if (!lastDailyClaimDate) return { ok: true, nextStreak: 1 };

  const prev = new Date(`${lastDailyClaimDate}T12:00:00.000Z`);
  const todayD = new Date(`${today}T12:00:00.000Z`);
  const diffDays = Math.round((todayD.getTime() - prev.getTime()) / 86_400_000);

  if (diffDays === 1) return { ok: true, nextStreak: currentStreak + 1 };
  return { ok: true, nextStreak: 1 };
}

export function rewardForStreak(streak: number): { coins: number; xp: number } {
  return {
    coins: 25 + Math.min(streak * 5, 150),
    xp: 15 + Math.min(streak * 3, 75),
  };
}
