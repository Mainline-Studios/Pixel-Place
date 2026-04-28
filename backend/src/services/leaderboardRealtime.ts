import type { Server as IOServer } from 'socket.io';
import { env } from '../config/env.js';
import { emitLeaderboardUpdateImmediate } from './broadcastRealtime.js';

const timers = new Map<string, ReturnType<typeof setTimeout>>();

/** Coalesce many territory-driven leaderboard refreshes into occasional Socket emits. */
export function scheduleLeaderboardEmit(io: IOServer, seasonId: string): void {
  const prev = timers.get(seasonId);
  if (prev) clearTimeout(prev);

  const t = setTimeout(() => {
    timers.delete(seasonId);
    void emitLeaderboardUpdateImmediate(io, seasonId).catch(() => {});
  }, env.LEADERBOARD_EMIT_DEBOUNCE_MS);

  timers.set(seasonId, t);
}
