'use client';

/**
 * Pet Habitat — Realtime Database multiplayer (same pattern as Open World).
 *
 * pet_habitat/{room}/players/{id}
 * pet_habitat_servers/global|private
 * pet_habitat_saves/{username}  — offline pet save (present only while in a room)
 */

import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  update,
  onValue,
  onDisconnect,
  type Database,
} from 'firebase/database';
import { getOrInitFirebaseApp } from './firebaseConfig';
import { SITE_ORIGIN } from './seo';
import type { HabitatId } from './petHabitatData';
import { NEGLECT_MS } from './petHabitatData';

export const PET_HABITAT_MAX_PLAYERS = 12;
export const PET_INVITE_TTL_MS = 24 * 60 * 60 * 1000;
export const PET_INVITE_PREFIX = 'ppph-';
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

export type PetSaveState = {
  username: string;
  habitat: HabitatId;
  animalId: string;
  hunger: number;
  health: number;
  gear: string[];
  lastCareAt: number;
  createdAt: number;
  /** If set and past, pet is considered neglected/dead */
  neglectDeadline: number;
  coinsEarnedLifetime: number;
  updatedAt: number;
};

export type PetPlayerState = {
  username: string;
  habitat: HabitatId;
  animalId: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  anim: 'idle' | 'walk';
  hunger: number;
  health: number;
  gear: string[];
  updatedAt: number;
};

export type PetPrivateInvite = {
  code: string;
  roomId: string;
  host: string;
  createdAt: number;
  expiresAt: number;
  started: boolean;
};

function safeRoom(room: string) {
  return room.replace(/[^a-z0-9_-]/gi, '_').slice(0, 80) || 'habitat_0';
}

function playerKey(username: string) {
  return username.toLowerCase().replace(/[^a-z0-9_-]/gi, '_').slice(0, 48) || 'player';
}

function playersPath(room: string) {
  return `pet_habitat/${safeRoom(room)}/players`;
}

function savePath(username: string) {
  return `pet_habitat_saves/${playerKey(username)}`;
}

function globalMetaPath(slot: number) {
  return `pet_habitat_servers/global/${slot}`;
}

function privateMetaPath(code: string) {
  return `pet_habitat_servers/private/${normalizePetInviteCode(code)}`;
}

export function normalizePetInviteCode(raw: string): string {
  const s = String(raw || '').trim().toLowerCase();
  if (s.startsWith(PET_INVITE_PREFIX)) return s.replace(/[^a-z0-9_-]/g, '');
  return `${PET_INVITE_PREFIX}${s.replace(/[^a-z0-9_-]/g, '')}`;
}

export function isPetInviteCodeFormat(raw: string): boolean {
  return /^ppph-[a-z0-9_-]{6,48}$/i.test(String(raw || '').trim());
}

export function parsePetInviteFromPath(pathname: string): string | null {
  const m = String(pathname || '').match(/\/pet-habitat\/invite\/(ppph-[a-zA-Z0-9_-]+)/i);
  return m?.[1] ? normalizePetInviteCode(m[1]) : null;
}

export function petInvitePublicUrl(code: string): string {
  return `${SITE_ORIGIN}/pet-habitat/invite/${normalizePetInviteCode(code)}`;
}

export function petInviteLoginRedirectUrl(code: string): string {
  return `${petInvitePublicUrl(code)}/redirect?login=true`;
}

export function petRoomForFriends(a: string, b: string): string {
  const [x, y] = [a.trim().toLowerCase(), b.trim().toLowerCase()].sort();
  const safe = (s: string) => s.replace(/[^a-z0-9_-]/gi, '_').slice(0, 40);
  return `pet_duo_${safe(x)}_${safe(y)}`;
}

function randomSecret(len = 12): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const bytes = new Uint8Array(len);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < len; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out;
}

async function countActive(db: Database, room: string): Promise<number> {
  const snap = await get(ref(db, playersPath(room)));
  const val = snap.val() as Record<string, { updatedAt?: number }> | null;
  if (!val) return 0;
  const now = Date.now();
  let n = 0;
  for (const p of Object.values(val)) {
    if (p && typeof p.updatedAt === 'number' && now - p.updatedAt <= STALE_MS) n += 1;
  }
  return n;
}

let lastMetaRefresh = 0;
async function refreshGlobalMeta(db: Database, room: string) {
  const m = /^habitat_(\d+)$/.exec(room);
  if (!m) return;
  const now = Date.now();
  if (now - lastMetaRefresh < 2500) return;
  lastMetaRefresh = now;
  const slot = Number(m[1]);
  const live = await countActive(db, room);
  await set(ref(db, globalMetaPath(slot)), { playerCount: live, updatedAt: now });
}

export async function joinBestPetHabitatRoom(): Promise<string> {
  const db = getDb();
  if (!db) return 'habitat_0';
  const metaSnap = await get(ref(db, 'pet_habitat_servers/global'));
  const meta = (metaSnap.val() || {}) as Record<string, { playerCount?: number }>;
  let best = -1;
  let bestCount = Infinity;
  for (const [k, v] of Object.entries(meta)) {
    const slot = Number(k);
    if (!Number.isFinite(slot)) continue;
    const c = typeof v?.playerCount === 'number' ? v.playerCount : 0;
    if (c < PET_HABITAT_MAX_PLAYERS && c < bestCount) {
      bestCount = c;
      best = slot;
    }
  }
  if (best < 0) {
    const used = Object.keys(meta)
      .map(Number)
      .filter((n) => Number.isFinite(n));
    best = used.length ? Math.max(...used) + 1 : 0;
  }
  return `habitat_${best}`;
}

export async function createPetPrivateInvite(hostUsername: string): Promise<PetPrivateInvite & { url: string }> {
  const db = getDb();
  const code = normalizePetInviteCode(randomSecret(10));
  const now = Date.now();
  const invite: PetPrivateInvite = {
    code,
    roomId: `pet_priv_${code.replace(/-/g, '_')}`,
    host: hostUsername,
    createdAt: now,
    expiresAt: now + PET_INVITE_TTL_MS,
    started: false,
  };
  if (db) {
    await set(ref(db, privateMetaPath(code)), invite);
  }
  return { ...invite, url: petInvitePublicUrl(code) };
}

export async function getPetPrivateInvite(code: string): Promise<PetPrivateInvite | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await get(ref(db, privateMetaPath(code)));
  const data = snap.val() as Partial<PetPrivateInvite> | null;
  if (!data || !data.code) return null;
  if (typeof data.expiresAt === 'number' && Date.now() > data.expiresAt) return null;
  return {
    code: normalizePetInviteCode(data.code),
    roomId: data.roomId || `pet_priv_${normalizePetInviteCode(data.code).replace(/-/g, '_')}`,
    host: data.host || '',
    createdAt: Number(data.createdAt) || 0,
    expiresAt: Number(data.expiresAt) || 0,
    started: data.started === true,
  };
}

export async function startPetPrivateServer(code: string, hostUsername: string): Promise<PetPrivateInvite | null> {
  const invite = await getPetPrivateInvite(code);
  if (!invite) return null;
  const db = getDb();
  if (!db) return invite;
  await update(ref(db, privateMetaPath(invite.code)), {
    started: true,
    host: invite.host || hostUsername,
    startedAt: Date.now(),
  });
  return { ...invite, started: true };
}

export async function loadPetSave(username: string): Promise<PetSaveState | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await get(ref(db, savePath(username)));
  const data = snap.val() as Partial<PetSaveState> | null;
  if (!data || !data.animalId || !data.habitat) return null;
  return {
    username: data.username || username,
    habitat: data.habitat as HabitatId,
    animalId: data.animalId,
    hunger: typeof data.hunger === 'number' ? data.hunger : 80,
    health: typeof data.health === 'number' ? data.health : 90,
    gear: Array.isArray(data.gear) ? data.gear.filter((g) => typeof g === 'string') : [],
    lastCareAt: typeof data.lastCareAt === 'number' ? data.lastCareAt : Date.now(),
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    neglectDeadline:
      typeof data.neglectDeadline === 'number' ? data.neglectDeadline : Date.now() + NEGLECT_MS,
    coinsEarnedLifetime: typeof data.coinsEarnedLifetime === 'number' ? data.coinsEarnedLifetime : 0,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
  };
}

export async function savePetSave(state: Omit<PetSaveState, 'updatedAt'>): Promise<void> {
  const db = getDb();
  if (!db) return;
  const payload: PetSaveState = { ...state, updatedAt: Date.now() };
  await set(ref(db, savePath(state.username)), payload);
}

export function isPetNeglected(save: PetSaveState, now = Date.now()): boolean {
  return now - save.lastCareAt >= NEGLECT_MS || now >= save.neglectDeadline;
}

/** Apply offline hunger/health drift when returning (slow decay, no death until year). */
export function applyOfflineDecay(save: PetSaveState, now = Date.now()): PetSaveState {
  const elapsed = Math.max(0, now - (save.updatedAt || save.lastCareAt));
  const days = elapsed / (24 * 60 * 60 * 1000);
  if (days < 0.05) return save;
  const hungerLoss = Math.min(70, days * 4);
  const healthLoss = Math.min(40, days * 1.5);
  return {
    ...save,
    hunger: Math.max(5, save.hunger - hungerLoss),
    health: Math.max(15, save.health - healthLoss),
  };
}

const disconnectRegistered = new Set<string>();

export async function publishPetPlayer(
  state: Omit<PetPlayerState, 'updatedAt'> & { room: string },
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const room = safeRoom(state.room);
  const key = playerKey(state.username);
  const path = `${playersPath(room)}/${key}`;
  const payload: PetPlayerState = {
    username: state.username,
    habitat: state.habitat,
    animalId: state.animalId,
    x: Math.round(state.x * 100) / 100,
    y: Math.round(state.y * 100) / 100,
    z: Math.round(state.z * 100) / 100,
    rotY: Math.round(state.rotY * 1000) / 1000,
    anim: state.anim,
    hunger: state.hunger,
    health: state.health,
    gear: state.gear.slice(0, 8),
    updatedAt: Date.now(),
  };
  await set(ref(db, path), payload);
  if (!disconnectRegistered.has(path)) {
    disconnectRegistered.add(path);
    try {
      await onDisconnect(ref(db, path)).remove();
    } catch {
      disconnectRegistered.delete(path);
    }
  }
  void refreshGlobalMeta(db, room);
}

export async function leavePetHabitat(username: string, room: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const path = `${playersPath(room)}/${playerKey(username)}`;
  disconnectRegistered.delete(path);
  try {
    await remove(ref(db, path));
    void refreshGlobalMeta(db, room);
  } catch {
    /* ignore */
  }
}

export function subscribePetPlayers(
  localUsername: string,
  onPlayers: (players: PetPlayerState[]) => void,
  room: string,
): () => void {
  const db = getDb();
  if (!db) return () => {};
  return onValue(ref(db, playersPath(room)), (snap) => {
    const now = Date.now();
    const players: PetPlayerState[] = [];
    const val = snap.val() as Record<string, Partial<PetPlayerState>> | null;
    if (val) {
      for (const data of Object.values(val)) {
        if (!data || typeof data !== 'object') continue;
        const username = (data.username || '').trim();
        if (!username || username.toLowerCase() === localUsername.toLowerCase()) continue;
        const updatedAt = typeof data.updatedAt === 'number' ? data.updatedAt : 0;
        if (now - updatedAt > STALE_MS) continue;
        players.push({
          username,
          habitat: (data.habitat as HabitatId) || 'plains',
          animalId: data.animalId || 'rabbit',
          x: Number(data.x) || 0,
          y: Number(data.y) || 0,
          z: Number(data.z) || 0,
          rotY: Number(data.rotY) || 0,
          anim: data.anim === 'walk' ? 'walk' : 'idle',
          hunger: typeof data.hunger === 'number' ? data.hunger : 50,
          health: typeof data.health === 'number' ? data.health : 50,
          gear: Array.isArray(data.gear) ? data.gear.map(String) : [],
          updatedAt,
        });
      }
    }
    onPlayers(players);
  });
}

const PENDING_PET_INVITE_KEY = 'pixelplace_pet_habitat_invite_pending';

export function rememberPendingPetInvite(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PENDING_PET_INVITE_KEY, normalizePetInviteCode(code));
  } catch {
    /* ignore */
  }
}

export function consumePendingPetInvite(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const code = sessionStorage.getItem(PENDING_PET_INVITE_KEY);
    if (!code) return null;
    sessionStorage.removeItem(PENDING_PET_INVITE_KEY);
    return isPetInviteCodeFormat(code) ? normalizePetInviteCode(code) : null;
  } catch {
    return null;
  }
}
