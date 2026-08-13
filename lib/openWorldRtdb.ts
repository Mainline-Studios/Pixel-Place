'use client';

/**
 * Open World Plaza — Realtime Database JSON sync.
 *
 * open_world/{room}/players/{id}
 * open_world/{room}/chat/{pushId}
 * open_world_servers/global/{slot}     → { playerCount, updatedAt }
 * open_world_servers/private/{code}   → invite metadata
 */

import {
  getDatabase,
  ref,
  set,
  push,
  remove,
  get,
  update,
  onValue,
  onDisconnect,
  query,
  limitToLast,
  type Database,
} from 'firebase/database';
import { getOrInitFirebaseApp } from './firebaseConfig';
import { isGuestUsername } from './guestMode';
import { SITE_ORIGIN } from './seo';

export const OPEN_WORLD_PUBLIC_ROOM = 'plaza';
export const GLOBAL_MAX_PLAYERS = 15;
export const PRIVATE_INVITE_TTL_MS = 24 * 60 * 60 * 1000;
export const INVITE_CODE_PREFIX = 'ppowg-';
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
  /** Synced so others can show a verified check for admins */
  role?: string;
  /** Latest chat line for head bubble (clears after a few seconds client-side) */
  chatText?: string;
  chatAt?: number;
  updatedAt: number;
};

export type OpenWorldChatMessage = {
  id: string;
  username: string;
  text: string;
  createdAt: number;
  role?: string;
};

export type PrivateInviteRecord = {
  code: string;
  roomId: string;
  host: string;
  createdAt: number;
  expiresAt: number;
  started: boolean;
};

/** Stable private room for two usernames (order-independent). */
export function openWorldRoomForFriends(a: string, b: string): string {
  const [x, y] = [a.trim().toLowerCase(), b.trim().toLowerCase()].sort();
  const safe = (s: string) => s.replace(/[^a-z0-9_-]/gi, '_').slice(0, 40);
  return `duo_${safe(x)}_${safe(y)}`;
}

export function safeRoom(room: string) {
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

const EVERYWHERE_CHAT_PATH = 'open_world_chat_everywhere';
const EVERYWHERE_CLEAR_PATH = 'open_world_chat_everywhere_meta/clearAt';

export type OpenWorldChatChannel = 'server' | 'everywhere';

function chatPathForChannel(room: string, channel: OpenWorldChatChannel) {
  return channel === 'everywhere' ? EVERYWHERE_CHAT_PATH : chatPath(room);
}

function chatClearPath(room: string, channel: OpenWorldChatChannel) {
  return channel === 'everywhere'
    ? EVERYWHERE_CLEAR_PATH
    : `open_world/${safeRoom(room)}/mod/chatClearAt`;
}

function kicksPath(room: string) {
  return `open_world/${safeRoom(room)}/kicks`;
}

export function isOpenWorldAdmin(role?: string) {
  return role === 'admin' || role === 'head_admin';
}

function globalMetaPath(slot: number) {
  return `open_world_servers/global/${slot}`;
}

function privateMetaPath(code: string) {
  return `open_world_servers/private/${normalizeInviteCode(code)}`;
}

export function normalizeInviteCode(raw: string): string {
  const s = String(raw || '').trim().toLowerCase();
  if (s.startsWith(INVITE_CODE_PREFIX)) return s.replace(/[^a-z0-9_-]/g, '');
  return `${INVITE_CODE_PREFIX}${s.replace(/[^a-z0-9_-]/g, '')}`;
}

export function isInviteCodeFormat(raw: string): boolean {
  return /^ppowg-[a-z0-9_-]{6,48}$/i.test(String(raw || '').trim());
}

export function parseInviteCodeFromPath(pathname: string): string | null {
  const m = String(pathname || '').match(/\/open-world\/invite\/(ppowg-[a-zA-Z0-9_-]+)/i);
  return m?.[1] ? normalizeInviteCode(m[1]) : null;
}

export function invitePublicUrl(code: string): string {
  return `${SITE_ORIGIN}/open-world/invite/${normalizeInviteCode(code)}`;
}

/** Logged-out invite URL: same invite path + /redirect?login=true */
export function inviteLoginRedirectUrl(code: string): string {
  return `${invitePublicUrl(code)}/redirect?login=true`;
}

export function isInviteLoginRedirectPath(pathname: string, search = ''): boolean {
  const normalized = String(pathname || '').replace(/\/$/, '') || '/';
  const pathOk = /\/open-world\/invite\/ppowg-[a-zA-Z0-9_-]+\/redirect$/i.test(normalized);
  if (!pathOk) return false;
  const q = search.startsWith('?') ? search.slice(1) : search;
  // Accept login=true (and tolerate the ?=login=true typo form)
  return /(?:^|[?&])=?login=true(?:&|$)/i.test(q) || new URLSearchParams(q).get('login') === 'true';
}

const PENDING_INVITE_KEY = 'pixelplace_open_world_invite_pending';

export function rememberPendingOpenWorldInvite(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PENDING_INVITE_KEY, normalizeInviteCode(code));
  } catch {
    // ignore
  }
}

export function consumePendingOpenWorldInvite(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const code = sessionStorage.getItem(PENDING_INVITE_KEY);
    if (!code) return null;
    sessionStorage.removeItem(PENDING_INVITE_KEY);
    return isInviteCodeFormat(code) ? normalizeInviteCode(code) : null;
  } catch {
    return null;
  }
}

export function peekPendingOpenWorldInvite(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const code = sessionStorage.getItem(PENDING_INVITE_KEY);
    return code && isInviteCodeFormat(code) ? normalizeInviteCode(code) : null;
  } catch {
    return null;
  }
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

async function countActivePlayersInRoom(db: Database, room: string): Promise<number> {
  const snap = await get(ref(db, playersPath(room)));
  const val = snap.val() as Record<string, { updatedAt?: number }> | null;
  if (!val || typeof val !== 'object') return 0;
  const now = Date.now();
  let n = 0;
  for (const p of Object.values(val)) {
    if (p && typeof p.updatedAt === 'number' && now - p.updatedAt <= STALE_MS) n += 1;
  }
  return n;
}

/** Pick a global room under the cap, or open a new slot. */
export async function joinBestGlobalRoom(): Promise<string> {
  const db = getDb();
  if (!db) return 'global_0';

  const metaSnap = await get(ref(db, 'open_world_servers/global'));
  const meta = (metaSnap.val() || {}) as Record<string, { playerCount?: number; updatedAt?: number }>;
  const slots = Object.keys(meta)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  for (const slot of slots) {
    const roomId = `global_${slot}`;
    const live = await countActivePlayersInRoom(db, roomId);
    if (live < GLOBAL_MAX_PLAYERS) {
      await set(ref(db, globalMetaPath(slot)), { playerCount: live, updatedAt: Date.now() });
      return roomId;
    }
  }

  // Also probe sequential slots in case meta is empty / stale
  for (let slot = 0; slot < 40; slot++) {
    const roomId = `global_${slot}`;
    const live = await countActivePlayersInRoom(db, roomId);
    if (live < GLOBAL_MAX_PLAYERS) {
      await set(ref(db, globalMetaPath(slot)), { playerCount: live, updatedAt: Date.now() });
      return roomId;
    }
  }

  const next = (slots.length ? Math.max(...slots) + 1 : 0);
  await set(ref(db, globalMetaPath(next)), { playerCount: 0, updatedAt: Date.now() });
  return `global_${next}`;
}

export async function createPrivateInvite(hostUsername: string): Promise<PrivateInviteRecord & { url: string }> {
  const db = getDb();
  const code = normalizeInviteCode(`${INVITE_CODE_PREFIX}${randomSecret(14)}`);
  const roomId = `priv_${code.replace(/-/g, '_')}`;
  const now = Date.now();
  const record: PrivateInviteRecord = {
    code,
    roomId,
    host: hostUsername,
    createdAt: now,
    expiresAt: now + PRIVATE_INVITE_TTL_MS,
    started: false,
  };
  if (db) {
    await set(ref(db, privateMetaPath(code)), record);
  }
  return { ...record, url: invitePublicUrl(code) };
}

export async function getPrivateInvite(code: string): Promise<PrivateInviteRecord | null> {
  const db = getDb();
  if (!db) return null;
  const normalized = normalizeInviteCode(code);
  if (!isInviteCodeFormat(normalized)) return null;
  const snap = await get(ref(db, privateMetaPath(normalized)));
  if (!snap.exists()) return null;
  const data = snap.val() as PrivateInviteRecord;
  if (!data || typeof data !== 'object') return null;
  if (typeof data.expiresAt === 'number' && data.expiresAt < Date.now()) return null;
  return {
    code: data.code || normalized,
    roomId: data.roomId || `priv_${normalized.replace(/-/g, '_')}`,
    host: data.host || '',
    createdAt: Number(data.createdAt) || 0,
    expiresAt: Number(data.expiresAt) || 0,
    started: data.started === true,
  };
}

export async function startPrivateServer(code: string, hostUsername: string): Promise<PrivateInviteRecord | null> {
  const invite = await getPrivateInvite(code);
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

const disconnectRegistered = new Set<string>();
let lastGlobalMetaRefresh = 0;

async function refreshGlobalMetaForRoom(db: Database, room: string) {
  const m = /^global_(\d+)$/.exec(room);
  if (!m) return;
  const now = Date.now();
  if (now - lastGlobalMetaRefresh < 2500) return;
  lastGlobalMetaRefresh = now;
  const slot = Number(m[1]);
  const live = await countActivePlayersInRoom(db, room);
  await set(ref(db, globalMetaPath(slot)), { playerCount: live, updatedAt: now });
}

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
    x: Math.round(state.x * 100) / 100,
    y: Math.round(state.y * 100) / 100,
    z: Math.round(state.z * 100) / 100,
    rotY: Math.round(state.rotY * 1000) / 1000,
    anim: state.anim,
    colors: state.colors,
    role: state.role || 'user',
    chatText: (state.chatText || '').slice(0, 80),
    chatAt: typeof state.chatAt === 'number' ? state.chatAt : 0,
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
  void refreshGlobalMetaForRoom(db, room);
}

async function removeOpenWorldChatByUsername(username: string, room: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    const snap = await get(ref(db, chatPath(room)));
    const val = snap.val() as Record<string, { username?: string }> | null;
    if (!val || typeof val !== 'object') return;
    const lower = username.toLowerCase();
    const updates: Record<string, null> = {};
    for (const [id, data] of Object.entries(val)) {
      if (String(data?.username || '').toLowerCase() === lower) updates[id] = null;
    }
    if (Object.keys(updates).length) await update(ref(db, chatPath(room)), updates);
  } catch {
    // ignore
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
    void refreshGlobalMetaForRoom(db, room);
  } catch {
    // ignore
  }
  if (isGuestUsername(username)) {
    void removeOpenWorldChatByUsername(username, room);
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
          role: typeof data.role === 'string' ? data.role : 'user',
          chatText: typeof data.chatText === 'string' ? data.chatText : '',
          chatAt: typeof data.chatAt === 'number' ? data.chatAt : 0,
          updatedAt,
        });
      }
    }
    onPlayers(players);
  });
}

/** Push a chat message (Server Only = this room, Everywhere = all Open World players). */
export async function sendOpenWorldChat(
  username: string,
  text: string,
  room: string = OPEN_WORLD_PUBLIC_ROOM,
  channel: OpenWorldChatChannel = 'server',
  role?: string,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const trimmed = text.trim().slice(0, 200);
  if (!trimmed) return;
  await push(ref(db, chatPathForChannel(room, channel)), {
    username,
    text: trimmed,
    createdAt: Date.now(),
    room: safeRoom(room),
    channel,
    role: role || 'user',
  });
}

/** Admin: wipe current chat channel (clients hide messages older than clearAt). */
export async function clearOpenWorldChat(
  room: string,
  channel: OpenWorldChatChannel = 'server',
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const now = Date.now();
  await set(ref(db, chatClearPath(room, channel)), now);
  // Best-effort delete of stored messages (rules allow remove)
  try {
    await remove(ref(db, chatPathForChannel(room, channel)));
  } catch {
    // clearAt still hides history for everyone
  }
}

const KICK_TTL_MS = 10 * 60 * 1000;

/** Admin: remove player from room and block rejoin briefly. */
export async function kickOpenWorldPlayer(
  room: string,
  targetUsername: string,
  byUsername: string,
  reason = '',
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const key = playerKey(targetUsername);
  const until = Date.now() + KICK_TTL_MS;
  await set(ref(db, `${kicksPath(room)}/${key}`), {
    username: targetUsername.trim(),
    by: byUsername,
    reason: reason.slice(0, 120),
    at: Date.now(),
    until,
  });
  try {
    await remove(ref(db, `${playersPath(room)}/${key}`));
  } catch {
    // kick record still forces leave
  }
  void refreshGlobalMetaForRoom(db, room);
}

export async function isKickedFromOpenWorldRoom(
  room: string,
  username: string,
): Promise<{ kicked: boolean; by?: string; reason?: string }> {
  const db = getDb();
  if (!db) return { kicked: false };
  const snap = await get(ref(db, `${kicksPath(room)}/${playerKey(username)}`));
  const data = snap.val() as { until?: number; by?: string; reason?: string } | null;
  if (!data || typeof data.until !== 'number') return { kicked: false };
  if (Date.now() > data.until) {
    try {
      await remove(ref(db, `${kicksPath(room)}/${playerKey(username)}`));
    } catch {
      /* ignore */
    }
    return { kicked: false };
  }
  return { kicked: true, by: data.by, reason: data.reason };
}

/** Watch for being kicked from the current room. */
export function subscribeOpenWorldKick(
  room: string,
  username: string,
  onKick: (info: { by?: string; reason?: string }) => void,
): () => void {
  const db = getDb();
  if (!db) return () => {};
  const kickRef = ref(db, `${kicksPath(room)}/${playerKey(username)}`);
  return onValue(kickRef, (snap) => {
    const data = snap.val() as { until?: number; by?: string; reason?: string } | null;
    if (!data || typeof data.until !== 'number') return;
    if (Date.now() > data.until) return;
    onKick({ by: data.by, reason: data.reason });
  });
}

/** Live chat feed for Server Only or Everywhere. */
export function subscribeOpenWorldChat(
  onMessages: (msgs: OpenWorldChatMessage[]) => void,
  room: string = OPEN_WORLD_PUBLIC_ROOM,
  channel: OpenWorldChatChannel = 'server',
): () => void {
  const db = getDb();
  if (!db) return () => {};

  let clearAt = 0;
  let rawMsgs: OpenWorldChatMessage[] = [];

  const emit = () => {
    onMessages(rawMsgs.filter((m) => m.createdAt > clearAt));
  };

  const clearUnsub = onValue(ref(db, chatClearPath(room, channel)), (snap) => {
    clearAt = typeof snap.val() === 'number' ? snap.val() : 0;
    emit();
  });

  const chatQuery = query(ref(db, chatPathForChannel(room, channel)), limitToLast(channel === 'everywhere' ? 60 : 40));
  const chatUnsub = onValue(chatQuery, (snap) => {
    const msgs: OpenWorldChatMessage[] = [];
    const val = snap.val() as Record<
      string,
      { username?: string; text?: string; createdAt?: number; role?: string }
    > | null;
    if (val && typeof val === 'object') {
      for (const [id, data] of Object.entries(val)) {
        if (!data) continue;
        msgs.push({
          id,
          username: data.username || 'Player',
          text: data.text || '',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
          role: typeof data.role === 'string' ? data.role : undefined,
        });
      }
    }
    msgs.sort((a, b) => a.createdAt - b.createdAt);
    rawMsgs = msgs;
    emit();
  });

  return () => {
    clearUnsub();
    chatUnsub();
  };
}
