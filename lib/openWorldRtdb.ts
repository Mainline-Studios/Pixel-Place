'use client';

/**
 * Open World Plaza — Realtime Database JSON sync.
 * Path shape:
 *   open_world/{room}/players/{playerId}  → position + anim
 *   open_world/{room}/chat/{pushId}       → chat messages
 */

import {
  getDatabase,
  ref,
  set,
  push,
  remove,
  onValue,
  onDisconnect,
  query,
  limitToLast,
  type Database,
} from 'firebase/database';
import { getOrInitFirebaseApp } from './firebaseConfig';

export const OPEN_WORLD_PUBLIC_ROOM = 'plaza';
const STALE_MS = 45_000;

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

export type OpenWorldPlayerState = {
  username: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  anim: 'idle' | 'walk';
  colors: {
    head: string;
    torso: string;
    arm: string;
    legs: string;
  };
  updatedAt: number;
};

export type OpenWorldChatMessage = {
  id: string;
  username: string;
  text: string;
  createdAt: number;
};

/** Stable private room for two usernames (order-independent). */
export function openWorldRoomForFriends(a: string, b: string): string {
  const [x, y] = [a.trim().toLowerCase(), b.trim().toLowerCase()].sort();
  const safe = (s: string) => s.replace(/[^a-z0-9_-]/gi, '_').slice(0, 40);
  return `duo_${safe(x)}_${safe(y)}`;
}

function safeRoom(room: string) {
  return room.replace(/[^a-z0-9_-]/gi, '_').slice(0, 80) || OPEN_WORLD_PUBLIC_ROOM;
}

function playerKey(username: string) {
  return username.toLowerCase().replace(/[^a-z0-9_-]/gi, '_').slice(0, 48) || 'player';
}

function playersPath(room: string) {
  return `open_world/${safeRoom(room)}/players`;
}

function chatPath(room: string) {
  return `open_world/${safeRoom(room)}/chat`;
}

const disconnectRegistered = new Set<string>();

/** Publish local player transform as RTDB JSON (throttled by caller). */
export async function publishOpenWorldPlayer(
  state: Omit<OpenWorldPlayerState, 'updatedAt'> & { room?: string },
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const room = state.room || OPEN_WORLD_PUBLIC_ROOM;
  const key = playerKey(state.username);
  const path = `${playersPath(room)}/${key}`;
  const playerRef = ref(db, path);
  const payload: OpenWorldPlayerState = {
    username: state.username,
    x: state.x,
    y: state.y,
    z: state.z,
    rotY: state.rotY,
    anim: state.anim,
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

/** Remove presence when leaving. */
export async function leaveOpenWorld(username: string, room: string = OPEN_WORLD_PUBLIC_ROOM): Promise<void> {
  const db = getDb();
  if (!db) return;
  const path = `${playersPath(room)}/${playerKey(username)}`;
  disconnectRegistered.delete(path);
  try {
    await remove(ref(db, path));
  } catch {
    // ignore
  }
}

/** Live player list for a room (filters stale). */
export function subscribeOpenWorldPlayers(
  localUsername: string,
  onPlayers: (players: OpenWorldPlayerState[]) => void,
  room: string = OPEN_WORLD_PUBLIC_ROOM,
): () => void {
  const db = getDb();
  if (!db) return () => {};

  const playersRef = ref(db, playersPath(room));
  return onValue(playersRef, (snap) => {
    const now = Date.now();
    const players: OpenWorldPlayerState[] = [];
    const val = snap.val() as Record<string, Partial<OpenWorldPlayerState>> | null;
    if (val && typeof val === 'object') {
      for (const data of Object.values(val)) {
        if (!data || typeof data !== 'object') continue;
        const username = (data.username || '').trim();
        if (!username || username.toLowerCase() === localUsername.toLowerCase()) continue;
        const updatedAt = typeof data.updatedAt === 'number' ? data.updatedAt : 0;
        if (now - updatedAt > STALE_MS) continue;
        players.push({
          username,
          x: Number(data.x) || 0,
          y: Number(data.y) || 0,
          z: Number(data.z) || 0,
          rotY: Number(data.rotY) || 0,
          anim: data.anim === 'walk' ? 'walk' : 'idle',
          colors: {
            head: data.colors?.head || '#f4c2a1',
            torso: data.colors?.torso || '#4d536f',
            arm: data.colors?.arm || '#3a3f56',
            legs: data.colors?.legs || '#3a3f56',
          },
          updatedAt,
        });
      }
    }
    onPlayers(players);
  });
}

/** Push a chat message into the room JSON tree. */
export async function sendOpenWorldChat(
  username: string,
  text: string,
  room: string = OPEN_WORLD_PUBLIC_ROOM,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const trimmed = text.trim().slice(0, 200);
  if (!trimmed) return;
  await push(ref(db, chatPath(room)), {
    username,
    text: trimmed,
    createdAt: Date.now(),
  });
}

/** Live chat feed for a room. */
export function subscribeOpenWorldChat(
  onMessages: (msgs: OpenWorldChatMessage[]) => void,
  room: string = OPEN_WORLD_PUBLIC_ROOM,
): () => void {
  const db = getDb();
  if (!db) return () => {};

  const chatQuery = query(ref(db, chatPath(room)), limitToLast(40));
  return onValue(chatQuery, (snap) => {
    const msgs: OpenWorldChatMessage[] = [];
    const val = snap.val() as Record<string, { username?: string; text?: string; createdAt?: number }> | null;
    if (val && typeof val === 'object') {
      for (const [id, data] of Object.entries(val)) {
        if (!data) continue;
        msgs.push({
          id,
          username: data.username || 'Player',
          text: data.text || '',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
        });
      }
    }
    msgs.sort((a, b) => a.createdAt - b.createdAt);
    onMessages(msgs);
  });
}
