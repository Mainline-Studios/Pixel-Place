'use client';

/**
 * Guest 3D online arenas — RTDB presence + score.
 * guest_arena/{gameId}/global/players/{id}
 * guest_arena/{gameId}/global/meta
 */

import {
  getDatabase,
  ref,
  set,
  remove,
  onValue,
  onDisconnect,
  type Database,
} from 'firebase/database';
import { getOrInitFirebaseApp } from './firebaseConfig';

const STALE_MS = 20_000;
const disconnectRegistered = new Set<string>();

function getDb(): Database | null {
  if (typeof window === 'undefined') return null;
  try {
    const app = getOrInitFirebaseApp();
    if (!app) return null;
    return getDatabase(app);
  } catch {
    return null;
  }
}

function playerKey(username: string): string {
  return String(username || 'guest')
    .toLowerCase()
    .replace(/[.#$\[\]/]/g, '_')
    .slice(0, 64);
}

function playersPath(gameId: string): string {
  return `guest_arena/${gameId}/global/players`;
}

function metaPath(gameId: string): string {
  return `guest_arena/${gameId}/global/meta`;
}

export type ArenaPlayerState = {
  username: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  anim: string;
  score: number;
  extra: number;
  colors?: {
    head?: string;
    torso?: string;
    arm?: string;
    legs?: string;
  };
  updatedAt: number;
};

export type ArenaMeta = {
  itUsername?: string;
  taken?: string;
  wave?: number;
  updatedAt: number;
};

export async function publishArenaPlayer(
  gameId: string,
  state: Omit<ArenaPlayerState, 'updatedAt'>,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const path = `${playersPath(gameId)}/${playerKey(state.username)}`;
  const playerRef = ref(db, path);
  const payload: ArenaPlayerState = {
    username: state.username,
    x: Math.round(state.x * 100) / 100,
    y: Math.round(state.y * 100) / 100,
    z: Math.round(state.z * 100) / 100,
    rotY: Math.round(state.rotY * 1000) / 1000,
    anim: state.anim || 'idle',
    score: Math.max(0, Math.round(state.score)),
    extra: Math.round(state.extra || 0),
    colors: state.colors,
    updatedAt: Date.now(),
  };
  await set(playerRef, payload);
  if (!disconnectRegistered.has(path)) {
    disconnectRegistered.add(path);
    try {
      await onDisconnect(playerRef).remove();
    } catch {
      disconnectRegistered.delete(path);
    }
  }
}

export async function leaveArena(gameId: string, username: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const path = `${playersPath(gameId)}/${playerKey(username)}`;
  disconnectRegistered.delete(path);
  try {
    await remove(ref(db, path));
  } catch {
    // ignore
  }
}

export function subscribeArenaPlayers(
  gameId: string,
  localUsername: string,
  onPlayers: (players: ArenaPlayerState[]) => void,
): () => void {
  const db = getDb();
  if (!db) return () => {};
  const r = ref(db, playersPath(gameId));
  return onValue(r, (snap) => {
    const val = snap.val() as Record<string, ArenaPlayerState> | null;
    if (!val || typeof val !== 'object') {
      onPlayers([]);
      return;
    }
    const now = Date.now();
    const local = localUsername.toLowerCase();
    const list = Object.values(val).filter((p) => {
      if (!p || typeof p.username !== 'string') return false;
      if (p.username.toLowerCase() === local) return false;
      if (typeof p.updatedAt !== 'number' || now - p.updatedAt > STALE_MS) return false;
      return true;
    });
    onPlayers(list);
  });
}

export async function publishArenaMeta(gameId: string, meta: Omit<ArenaMeta, 'updatedAt'>): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await set(ref(db, metaPath(gameId)), { ...meta, updatedAt: Date.now() });
  } catch {
    // ignore
  }
}

export function subscribeArenaMeta(gameId: string, onMeta: (meta: ArenaMeta | null) => void): () => void {
  const db = getDb();
  if (!db) return () => {};
  return onValue(ref(db, metaPath(gameId)), (snap) => {
    const val = snap.val() as ArenaMeta | null;
    onMeta(val && typeof val === 'object' ? val : null);
  });
}
