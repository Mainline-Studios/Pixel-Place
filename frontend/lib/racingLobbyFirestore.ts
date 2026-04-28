'use client';

/**
 * Firestore sync for Pixel Rush Racing — up to 200 players per lobby doc.
 * Requires Firestore rules to allow read/write on `pixel_rush_lobbies` (same pattern as chess_games).
 */

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';

export const RACING_LOBBY_COLLECTION = 'pixel_rush_lobbies';
export const MAX_LOBBY_PLAYERS = 200;

export type RacingLobbyPlayerNet = {
  x: number;
  y: number;
  z: number;
  ry: number;
  skin: string;
  name: string;
  t: number;
};

function getDb() {
  if (typeof window === 'undefined') return null;
  try {
    if (getApps().length === 0) initializeApp(firebaseConfig);
    return getFirestore(getApps()[0]);
  } catch {
    return null;
  }
}

export function sanitizeLobbyId(raw: string): string {
  const s = (raw || 'GLOBAL').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  return (s.slice(0, 24) || 'GLOBAL') as string;
}

export async function joinRacingLobby(
  lobbyId: string,
  playerKey: string,
  displayName: string,
  skin: string,
  spawn: { x: number; y: number; z: number; ry: number }
): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: 'Firestore not available' };
  const id = sanitizeLobbyId(lobbyId);
  const ref = doc(db, RACING_LOBBY_COLLECTION, id);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? ((snap.data() as Record<string, unknown>).players as Record<string, RacingLobbyPlayerNet>) || {} : {};
  const keys = Object.keys(prev);
  if (keys.length >= MAX_LOBBY_PLAYERS && !prev[playerKey]) {
    return { ok: false, error: `Lobby is full (max ${MAX_LOBBY_PLAYERS} drivers).` };
  }
  const now = Date.now();
  const next = {
    ...prev,
    [playerKey]: {
      x: spawn.x,
      y: spawn.y,
      z: spawn.z,
      ry: spawn.ry,
      skin,
      name: displayName.slice(0, 24),
      t: now,
    } satisfies RacingLobbyPlayerNet,
  };
  await setDoc(
    ref,
    {
      players: next,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return { ok: true };
}

export async function leaveRacingLobby(lobbyId: string, playerKey: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const id = sanitizeLobbyId(lobbyId);
  const ref = doc(db, RACING_LOBBY_COLLECTION, id);
  try {
    await updateDoc(ref, {
      [`players.${playerKey}`]: deleteField(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    /* doc may not exist */
  }
}

export async function pushRacingPlayerState(
  lobbyId: string,
  playerKey: string,
  state: Pick<RacingLobbyPlayerNet, 'x' | 'y' | 'z' | 'ry' | 'skin' | 'name'>
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const id = sanitizeLobbyId(lobbyId);
  const ref = doc(db, RACING_LOBBY_COLLECTION, id);
  const now = Date.now();
  await setDoc(
    ref,
    {
      players: {
        [playerKey]: { ...state, t: now },
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export type RacingLobbySnapshot = {
  players: Record<string, RacingLobbyPlayerNet>;
  bestLaps: Record<string, number>;
};

export function subscribeRacingLobby(
  lobbyId: string,
  cb: (snap: RacingLobbySnapshot) => void
): () => void {
  const db = getDb();
  if (!db) {
    cb({ players: {}, bestLaps: {} });
    return () => {};
  }
  const id = sanitizeLobbyId(lobbyId);
  const ref = doc(db, RACING_LOBBY_COLLECTION, id);
  return onSnapshot(
    ref,
    (docSnap) => {
      if (!docSnap.exists()) {
        cb({ players: {}, bestLaps: {} });
        return;
      }
      const d = docSnap.data() as Record<string, unknown>;
      const p = d.players as Record<string, RacingLobbyPlayerNet> | undefined;
      const b = d.bestLaps as Record<string, number> | undefined;
      cb({
        players: p && typeof p === 'object' ? p : {},
        bestLaps: b && typeof b === 'object' ? b : {},
      });
    },
    () => cb({ players: {}, bestLaps: {} })
  );
}

/** Lower ms = better. Returns merged best-lap map after write. */
export async function submitRacingBestLap(
  lobbyId: string,
  playerKey: string,
  lapMs: number
): Promise<Record<string, number>> {
  const db = getDb();
  if (!db) return {};
  const id = sanitizeLobbyId(lobbyId);
  const ref = doc(db, RACING_LOBBY_COLLECTION, id);
  const snap = await getDoc(ref);
  const cur = ((snap.exists() ? snap.data() : {}) as Record<string, unknown>).bestLaps as Record<string, number> | undefined;
  const prevMap = cur && typeof cur === 'object' ? { ...cur } : {};
  const prev = prevMap[playerKey];
  if (prev !== undefined && lapMs >= prev) return prevMap;
  const next = { ...prevMap, [playerKey]: lapMs };
  await setDoc(
    ref,
    {
      bestLaps: next,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return next;
}
