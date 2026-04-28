import type { Server as IOServer } from 'socket.io';
import { env } from '../config/env.js';
import { factionLeaderboard, globalLeaderboard } from './leaderboardQuery.js';

const NS = '/factions';

export type TerritoryPatchPayload = {
  canvasId: string;
  x: number;
  y: number;
  factionId: string;
  factionTag: string;
  placedByUserId: string;
};

function nsp(io: IOServer) {
  return io.of(NS);
}

/** Immediate full leaderboard snapshot (e.g. after client subscribes). */
export async function emitLeaderboardUpdateImmediate(io: IOServer, seasonId: string): Promise<void> {
  const [global_, factions] = await Promise.all([
    globalLeaderboard(seasonId, 30),
    factionLeaderboard(seasonId, 30),
  ]);
  nsp(io).to(`leaderboard:${seasonId}`).emit('leaderboard:update', {
    seasonId,
    global: global_,
    factions,
  });
}

type BufferEntry = { patches: TerritoryPatchPayload[]; timer?: ReturnType<typeof setTimeout> };

function territoryBufferKey(seasonId: string, canvasId: string): string {
  return `${seasonId}\0${canvasId}`;
}

const territoryBuffers = new Map<string, BufferEntry>();

function flushTerritoryBuffer(io: IOServer, seasonId: string, canvasId: string): void {
  const key = territoryBufferKey(seasonId, canvasId);
  const b = territoryBuffers.get(key);
  if (!b || b.patches.length === 0) return;
  if (b.timer) clearTimeout(b.timer);
  territoryBuffers.delete(key);
  const patches = b.patches.splice(0);

  nsp(io).to(`canvas:${canvasId}:${seasonId}`).emit('territory:batch', {
    seasonId,
    canvasId,
    patches,
    ts: Date.now(),
  });
}

/** Fan-out territory updates in batches (`territory:batch`). Clients should merge `patches` locally. */
export function emitTerritoryPatch(io: IOServer, seasonId: string, patch: TerritoryPatchPayload): void {
  const key = territoryBufferKey(seasonId, patch.canvasId);
  let b = territoryBuffers.get(key);
  if (!b) {
    b = { patches: [] };
    territoryBuffers.set(key, b);
  }
  b.patches.push(patch);

  if (b.patches.length >= env.TERRITORY_BATCH_MAX) {
    flushTerritoryBuffer(io, seasonId, patch.canvasId);
    return;
  }

  if (b.timer) clearTimeout(b.timer);
  b.timer = setTimeout(() => flushTerritoryBuffer(io, seasonId, patch.canvasId), env.TERRITORY_BATCH_MS);
}

export function emitFactionChat(
  io: IOServer,
  payload: {
    factionId: string;
    id: string;
    userId: string;
    username: string;
    body: string;
    createdAt: string;
  }
): void {
  nsp(io).to(`faction:${payload.factionId}`).emit('faction:chat', payload);
}

export function emitSeasonEvent(io: IOServer, payload: { seasonId: string; type: string; label?: string | null }) {
  nsp(io).emit('season:event', payload);
}
