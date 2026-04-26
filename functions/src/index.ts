/**
 * Firebase Cloud Functions - API backend for Pixel Place static export
 * Deploy: firebase deploy --only functions
 * URL: https://us-central1-pixel-place-823b1.cloudfunctions.net/api
 */
import path from 'path';
import { randomUUID } from 'crypto';
import { config as loadEnv } from 'dotenv';

// Load functions/.env (no deprecated functions.config() - works after March 2026)
loadEnv({ path: path.join(__dirname, '..', '.env') });

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

admin.initializeApp();
const db = admin.firestore();
const COLLECTIONS = {
  USERS: 'users',
  USER_DEVICES: 'user_devices',
  DEVICE_USERS: 'device_users',
  HARDWARE_BANS: 'hardware_bans',
  SKINS_CATALOG: 'skins_catalog',
  USER_SAFETY: 'user_safety',
  PUBLISHED_GAMES: 'published_games',
  TAB_CONTENT: 'tab_content',
  BANS: 'bans',
  REPORTS: 'reports',
  APPEALS: 'ban_appeals',
  APPEAL_MESSAGES: 'appeal_messages',
  MESSAGES: 'messages',
  FRIENDS: 'friends',
  ACCESSORIES_CATALOG: 'accessories_catalog',
  GAMES: 'games',
  SCENES: 'scenes',
  DRAFTS: 'drafts',
  PREBUILT_GAMES: 'prebuilt_games',
  GAME_SUBMISSIONS: 'game_submissions',
  PRESENCE: 'presence',
  GAME_SESSIONS: 'game_sessions',
  STATUS_PAGE: 'status_page',
  STRIPE_PAYMENT_CREDITS: 'stripe_payment_credits',
};

/** Public status page payload (mirrors status-site/status.json). */
const DEFAULT_STATUS_PAGE = {
  updatedAt: '2026-03-24T12:00:00.000Z',
  pixelPlace: {
    status: 'operational' as string,
    title: 'Pixel Place',
    message:
      'We are shipping updates regularly. Play and account services are expected to be available. Check here if something feels off.',
    glowColor: '' as string,
    accentColor: '' as string,
    headerTitle: '' as string,
    headerSubtitle: '' as string,
    customStatusLabel: '' as string,
  },
  maintenance: {
    active: false as boolean,
    message: '' as string,
    accentColor: '' as string,
  },
  urgent: {
    active: false as boolean,
    message: '' as string,
  },
};

const STATUS_ALLOWED = new Set(['operational', 'degraded', 'maintenance', 'outage']);
const STATUS_TITLE_MAX = 200;
const STATUS_MSG_MAX = 5000;
const MAINT_MSG_MAX = 2000;
const URGENT_MSG_MAX = 400;
const HEADER_TITLE_MAX = 120;
const HEADER_SUB_MAX = 400;
const CUSTOM_LABEL_MAX = 64;

function sanitizeStatusHex(v: unknown): string {
  const x = String(v ?? '').trim();
  if (!x) return '';
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(x)) return x;
  return '';
}

function normalizeStatusPagePayload(body: any): { ok: true; data: typeof DEFAULT_STATUS_PAGE } | { ok: false; error: string } {
  const pp = body?.pixelPlace;
  const mt = body?.maintenance;
  if (!pp || typeof pp !== 'object' || !mt || typeof mt !== 'object') {
    return { ok: false, error: 'pixelPlace and maintenance objects required' };
  }
  const status = String(pp.status || 'operational').toLowerCase();
  if (!STATUS_ALLOWED.has(status)) return { ok: false, error: 'Invalid pixelPlace.status' };
  const title = String(pp.title ?? 'Pixel Place').slice(0, STATUS_TITLE_MAX);
  const message = String(pp.message ?? '').slice(0, STATUS_MSG_MAX);
  const glowColor = sanitizeStatusHex(pp.glowColor);
  const accentColor = sanitizeStatusHex(pp.accentColor);
  const headerTitle = String(pp.headerTitle ?? '').slice(0, HEADER_TITLE_MAX);
  const headerSubtitle = String(pp.headerSubtitle ?? '').slice(0, HEADER_SUB_MAX);
  const customStatusLabel = String(pp.customStatusLabel ?? '').slice(0, CUSTOM_LABEL_MAX);
  const active = mt.active === true;
  const mMsg = String(mt.message ?? '').slice(0, MAINT_MSG_MAX);
  const maintAccent = sanitizeStatusHex(mt.accentColor);
  const urgIn = body?.urgent && typeof body.urgent === 'object' ? body.urgent : {};
  const urgentActive = urgIn.active === true;
  const urgentMessage = String(urgIn.message ?? '').slice(0, URGENT_MSG_MAX).trim();
  if (urgentActive && !urgentMessage) {
    return { ok: false, error: 'Urgent banner requires a non-empty message' };
  }
  return {
    ok: true,
    data: {
      updatedAt: new Date().toISOString(),
      pixelPlace: { status, title, message, glowColor, accentColor, headerTitle, headerSubtitle, customStatusLabel },
      maintenance: { active, message: mMsg, accentColor: maintAccent },
      urgent: { active: urgentActive, message: urgentActive ? urgentMessage : '' },
    },
  };
}

function cloneDefaultStatusPage(): typeof DEFAULT_STATUS_PAGE {
  return JSON.parse(JSON.stringify(DEFAULT_STATUS_PAGE)) as typeof DEFAULT_STATUS_PAGE;
}

async function readStatusPagePayload(): Promise<typeof DEFAULT_STATUS_PAGE> {
  const snap = await db.collection(COLLECTIONS.STATUS_PAGE).doc('current').get();
  if (!snap.exists) return cloneDefaultStatusPage();
  const n = normalizeStatusPagePayload(snap.data());
  if (!n.ok) return cloneDefaultStatusPage();
  return n.data;
}

import { requireAuth, requireAdmin, requireOwnerOrAdmin, getAuthFromRequest, isAdmin, getJwtSecret } from './authMiddleware';
import { mountStripeEmbeddedWebhook, mountStripeEmbeddedPayRoutes } from './stripeEmbeddedPay';

const DEVICE_ID_MAX = 128;
const LABEL_MAX = 64;
const FOUNDER_LIMIT = 100;
const FOUNDER_COIN_FLOOR = 1_000_000_000;

function sanitizeDeviceId(id: string): string {
  return String(id).slice(0, DEVICE_ID_MAX).replace(/[^a-zA-Z0-9_-]/g, '');
}

function founderRankFromTopUsers(topUsers: admin.firestore.QueryDocumentSnapshot[], usernameLower: string): number | null {
  const idx = topUsers.findIndex((d) => d.id === usernameLower);
  if (idx === -1) return null;
  return idx + 1;
}

async function getFounderRank(usernameLower: string): Promise<number | null> {
  const q = await db.collection(COLLECTIONS.USERS).orderBy('created_at', 'asc').limit(FOUNDER_LIMIT).get();
  return founderRankFromTopUsers(q.docs, usernameLower);
}

/**
 * Ensure founder reward fields are correct for top 100 users.
 * Returns latest user data and whether the one-time celebration should show this login.
 */
async function applyFounderRewardsAndConsumeCelebration(
  usernameLower: string,
  currentData: any
): Promise<{ data: any; showCelebration: boolean }> {
  let data = { ...(currentData || {}) };
  let changed = false;

  const rank = await getFounderRank(usernameLower);
  const qualifies = typeof rank === 'number' && rank >= 1 && rank <= FOUNDER_LIMIT;
  const now = Date.now();

  if (qualifies) {
    if (data.founder_lifetime_coins !== true) {
      data.founder_lifetime_coins = true;
      changed = true;
    }
    if (data.founder_ordinal !== rank) {
      data.founder_ordinal = rank;
      changed = true;
    }
    const coinsNow = Number(data.coins || 0);
    if (!Number.isFinite(coinsNow) || coinsNow < FOUNDER_COIN_FLOOR) {
      data.coins = FOUNDER_COIN_FLOOR;
      changed = true;
    }
    if (data.founder_celebration_shown_at == null && data.founder_celebration_pending !== true) {
      data.founder_celebration_pending = true;
      changed = true;
    }
  }

  const showCelebration = data.founder_celebration_pending === true;
  if (showCelebration) {
    data.founder_celebration_pending = false;
    data.founder_celebration_shown_at = data.founder_celebration_shown_at || now;
    changed = true;
  }

  if (changed) {
    await db.collection(COLLECTIONS.USERS).doc(usernameLower).set(
      {
        founder_lifetime_coins: !!data.founder_lifetime_coins,
        founder_ordinal: data.founder_ordinal ?? null,
        founder_celebration_pending: !!data.founder_celebration_pending,
        founder_celebration_shown_at: data.founder_celebration_shown_at ?? null,
        coins: data.coins ?? 0,
        updated_at: now,
      },
      { merge: true }
    );
  }

  return { data, showCelebration };
}

async function isDeviceBanned(deviceId: string): Promise<boolean> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return false;
  const doc = await db.collection(COLLECTIONS.HARDWARE_BANS).doc(id).get();
  return doc.exists;
}

/** Get hardware ban details for showing the ban screen (reason, banned_by, banned_at). */
async function getHardwareBanDetails(deviceId: string): Promise<{ reason: string; bannedBy: string; bannedAt: number } | null> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return null;
  const doc = await db.collection(COLLECTIONS.HARDWARE_BANS).doc(id).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    reason: d.reason || 'Access from this browser profile is blocked.',
    bannedBy: d.banned_by || 'Administrator',
    bannedAt: d.banned_at || Date.now(),
  };
}

async function recordDevice(username: string, deviceId: string, label: string): Promise<void> {
  const id = sanitizeDeviceId(deviceId);
  const safeLabel = String(label).slice(0, LABEL_MAX) || 'Unknown';
  if (!id) return;
  const now = Date.now();
  const usernameLower = username.toLowerCase();

  const userDevicesRef = db.collection(COLLECTIONS.USER_DEVICES).doc(usernameLower);
  const userSnap = await userDevicesRef.get();
  const devices: Array<{ deviceId: string; label: string; firstSeen: number; lastSeen: number }> =
    Array.isArray(userSnap.data()?.devices) ? userSnap.data()!.devices : [];
  const existing = devices.find((d: { deviceId: string }) => d.deviceId === id);
  if (existing) {
    existing.lastSeen = now;
    existing.label = safeLabel;
  } else {
    devices.push({ deviceId: id, label: safeLabel, firstSeen: now, lastSeen: now });
  }
  await userDevicesRef.set({ devices, updated_at: now });

  const deviceUsersRef = db.collection(COLLECTIONS.DEVICE_USERS).doc(id);
  const deviceSnap = await deviceUsersRef.get();
  const usernames: string[] = Array.isArray(deviceSnap.data()?.usernames) ? deviceSnap.data()!.usernames : [];
  if (!usernames.includes(usernameLower)) {
    usernames.push(usernameLower);
    await deviceUsersRef.set({ usernames, updated_at: now });
  }
}

/**
 * Expand from one deviceId to every device and username linked through
 * device_users ↔ user_devices (same account on multiple browsers, shared machines, etc.).
 */
async function collectLinkedHardwareNetwork(rootDeviceId: string): Promise<{ deviceIds: string[]; usernames: string[] }> {
  const root = sanitizeDeviceId(rootDeviceId);
  const deviceIds = new Set<string>();
  const usernames = new Set<string>();
  if (!root) return { deviceIds: [], usernames: [] };
  deviceIds.add(root);
  for (let round = 0; round < 32; round++) {
    const dCount = deviceIds.size;
    const uCount = usernames.size;
    for (const d of [...deviceIds]) {
      const snap = await db.collection(COLLECTIONS.DEVICE_USERS).doc(d).get();
      const list: string[] = Array.isArray(snap.data()?.usernames) ? snap.data()!.usernames : [];
      for (const u of list) {
        const ul = String(u).toLowerCase().trim();
        if (ul) usernames.add(ul);
      }
    }
    for (const u of [...usernames]) {
      const snap = await db.collection(COLLECTIONS.USER_DEVICES).doc(u).get();
      const devs: Array<{ deviceId?: string }> = Array.isArray(snap.data()?.devices) ? snap.data()!.devices : [];
      for (const row of devs) {
        const did = sanitizeDeviceId(String(row?.deviceId || ''));
        if (did) deviceIds.add(did);
      }
    }
    if (deviceIds.size === dCount && usernames.size === uCount) break;
  }
  return { deviceIds: [...deviceIds], usernames: [...usernames] };
}

// Minimal NEW_SKINS fallback (starter skins)
const FALLBACK_SKINS = [
  { id: 'starter_classic', name: 'Starter Classic', price: 0, use3d: true, colors: { head: '#f4c2a1', torso: '#4d536f', arm: '#3a3f56', legs: '#3a3f56' } },
];

/** Build user for API response. Never expose password/hash to client. */
function userFromDoc(doc: admin.firestore.DocumentSnapshot): any {
  const d = doc.data();
  if (!d) return null;
  return {
    username: d.username || doc.id,
    password: '',
    gender: d.gender || '',
    role: d.role || 'user',
    coins: d.coins || 0,
    ownedSkins: d.owned_skins || [],
    equippedSkin: d.equipped_skin || '',
    ownedAccessories: d.owned_accessories || [],
    equippedAccessories: d.equipped_accessories || {},
    ownedServers: d.owned_servers || [],
    friends: d.friends || [],
    friendRequests: d.friend_requests || [],
    sentFriendRequests: d.sent_friend_requests || [],
    isDonor: d.is_donor === 1,
    founderLifetimeCoins: d.founder_lifetime_coins === true,
    founderOrdinal: typeof d.founder_ordinal === 'number' ? d.founder_ordinal : undefined,
  };
}

const app = express();
app.use(cors({ origin: true }));

// Cloud Functions URL is .../api - requests to .../api/users have path /api/users
// Strip /api so our routes match /users, /skins, etc. (Hosting rewrite may leave path as /api/...)
app.use((req, res, next) => {
  const p = req.path || req.url || '';
  const pathOnly = p.split('?')[0];
  if (pathOnly.startsWith('/api/') || pathOnly === '/api') {
    req.url = pathOnly === '/api' ? '/' : pathOnly.slice(4) || '/';
  }
  next();
});

mountStripeEmbeddedWebhook(app, db, COLLECTIONS.USERS, COLLECTIONS.STRIPE_PAYMENT_CREDITS);

app.use(express.json());

mountStripeEmbeddedPayRoutes(app, db);

// Liveness only — do not expose whether JWT_SECRET is configured (reconnaissance aid).
const sendJwtCheck = (_req: any, res: any) => {
  res.json({ ok: true });
};
['/auth/check-config', '/api/auth/check-config', '/check-config', '/api/check-config'].forEach(p => app.get(p, sendJwtCheck));

// GET /auth/check-device?deviceId=xxx — no auth; for app-open check so ban screen can show before login
app.get('/auth/check-device', async (req, res) => {
  try {
    const deviceId = (req.query.deviceId as string) || '';
    const id = sanitizeDeviceId(deviceId);
    if (!id) return res.json({ banned: false });
    const banned = await isDeviceBanned(deviceId);
    if (!banned) return res.json({ banned: false });
    const details = await getHardwareBanDetails(deviceId);
    const ban = details
      ? { username: 'This device', reason: details.reason, bannedBy: details.bannedBy, timestamp: details.bannedAt, permanent: true }
      : {
          username: 'This device',
          reason: 'Access from this browser profile is blocked.',
          bannedBy: 'Administrator',
          timestamp: Date.now(),
          permanent: true,
        };
    return res.json({ banned: true, ban });
  } catch (e) {
    res.json({ banned: false });
  }
});

// GET /users/devices — admin only, returns devices for a user (deviceId, label, firstSeen, lastSeen). Also /api/users/devices for Hosting rewrite.
const getUsersDevicesHandler = async (req: any, res: any) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    let username = (req.query.username as string) || '';
    if (!username.trim() && typeof req.originalUrl === 'string') {
      const match = req.originalUrl.match(/[?&]username=([^&]+)/);
      if (match) username = decodeURIComponent(match[1]);
    }
    if (!username.trim()) return res.status(400).json({ error: 'username required' });
    const doc = await db.collection(COLLECTIONS.USER_DEVICES).doc(username.trim().toLowerCase()).get();
    const devices = Array.isArray(doc.exists && doc.data()?.devices) ? doc.data()!.devices : [];
    res.json(devices);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get devices' });
  }
};
app.get('/users/devices', getUsersDevicesHandler);
app.get('/api/users/devices', getUsersDevicesHandler);

// GET /users — requires auth
const getUsersHandler = async (req: any, res: any) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const snap = await db.collection(COLLECTIONS.USERS).get();
    const users = snap.docs.map(userFromDoc).filter(Boolean);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read users' });
  }
};
app.get('/users', getUsersHandler);
app.get('/api/users', getUsersHandler);

app.post('/users', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const u = req.body;
    const id = (u.username || '').toLowerCase();
    if (!id) return res.status(400).json({ error: 'Username required' });
    const selfOnly = id === auth.username.toLowerCase();
    if (!selfOnly && !isAdmin(auth)) return res.status(403).json({ error: 'Forbidden' });
    const existing = await db.collection(COLLECTIONS.USERS).doc(id).get();
    const existingData = existing.exists ? existing.data() : null;
    const plainPassword = typeof u.password === 'string' ? u.password : '';
    const password_hash = plainPassword
      ? await bcrypt.hash(plainPassword, 10)
      : (existingData?.password_hash ?? '');
    const callerIsAdmin = isAdmin(auth);
    const safeRole = callerIsAdmin ? (u.role || existingData?.role || 'user') : (existingData?.role || 'user');
    const safeCoins = callerIsAdmin ? (u.coins ?? existingData?.coins ?? 10) : (existingData?.coins ?? u.coins ?? 10);
    const data = {
      username: u.username,
      username_lower: id,
      password_hash,
      gender: u.gender || '',
      role: safeRole,
      coins: safeCoins,
      owned_skins: u.ownedSkins || ['starter_classic'],
      equipped_skin: u.equippedSkin || 'starter_classic',
      owned_accessories: u.ownedAccessories || [],
      equipped_accessories: u.equippedAccessories || {},
      owned_servers: u.ownedServers || [],
      friends: u.friends || [],
      friend_requests: u.friendRequests || [],
      sent_friend_requests: u.sentFriendRequests || [],
      is_donor: (safeRole === 'admin' || safeRole === 'head_admin') ? 1 : 0,
      updated_at: Date.now(),
    };
    if (existing.exists) {
      await db.collection(COLLECTIONS.USERS).doc(id).set(data, { merge: true });
    } else {
      (data as any).created_at = Date.now();
      await db.collection(COLLECTIONS.USERS).doc(id).set(data);
    }
    const out = { ...u, ...data };
    delete (out as any).password_hash;
    (out as any).password = '';
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

app.put('/users', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const u = req.body;
    const id = (u.username || '').toLowerCase();
    if (!id) return res.status(400).json({ error: 'Username required' });
    const selfOnly = id === auth.username.toLowerCase();
    if (!selfOnly && !isAdmin(auth)) return res.status(403).json({ error: 'Forbidden' });
    const ref = db.collection(COLLECTIONS.USERS).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'User not found' });
    const existingData = existing.data() || {};
    const plainPassword = typeof u.password === 'string' ? u.password : '';
    const password_hash = plainPassword
      ? await bcrypt.hash(plainPassword, 10)
      : (existingData.password_hash ?? '');
    const callerIsAdmin = isAdmin(auth);
    const safeRole = callerIsAdmin ? (u.role || existingData.role || 'user') : (existingData.role || 'user');
    const safeCoins = callerIsAdmin ? (u.coins ?? existingData.coins ?? 10) : (existingData.coins ?? u.coins ?? 10);
    await ref.set({
      username: u.username,
      username_lower: id,
      password_hash,
      gender: u.gender,
      role: safeRole,
      coins: safeCoins,
      owned_skins: u.ownedSkins || [],
      equipped_skin: u.equippedSkin || '',
      owned_accessories: u.ownedAccessories || [],
      equipped_accessories: u.equippedAccessories || {},
      friends: u.friends || [],
      friend_requests: u.friendRequests || [],
      sent_friend_requests: u.sentFriendRequests || [],
      is_donor: (safeRole === 'admin' || safeRole === 'head_admin') ? 1 : 0,
      updated_at: Date.now(),
    }, { merge: true });
    const out = { ...u };
    delete (out as any).password;
    (out as any).password = '';
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET/POST /skins
app.get('/skins', async (_req, res) => {
  try {
    const doc = await db.collection(COLLECTIONS.SKINS_CATALOG).doc('catalog').get();
    const data = doc.data();
    const skins = data?.skins;
    if (Array.isArray(skins) && skins.length > 0) return res.json(skins);
    return res.json(FALLBACK_SKINS);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read skins' });
  }
});

app.post('/skins', async (req, res) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const skins = req.body;
    await db.collection(COLLECTIONS.SKINS_CATALOG).doc('catalog').set({ skins, updated_at: Date.now() }, { merge: true });
    res.json(skins);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save skins' });
  }
});

/** Parse admin accounts from env. Use ADMIN_ACCOUNTS_JSON or ADMIN_USERNAME + ADMIN_PASSWORD. */
function getAdminAccountsFromEnv(): { username: string; password: string }[] {
  try {
    const raw = process.env.ADMIN_ACCOUNTS_JSON;
    if (raw && typeof raw === 'string') {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const list = parsed.filter(
          (a): a is { username: string; password: string } =>
            a && typeof a === 'object' && typeof (a as any).username === 'string' && typeof (a as any).password === 'string'
        );
        if (list.length > 0) return list;
      }
    }
  } catch {
    // fall through
  }
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (u && typeof u === 'string' && p && typeof p === 'string' && u.trim() && p.trim()) {
    return [{ username: u.trim(), password: p }];
  }
  if (process.env.NODE_ENV !== 'production') {
    return [{ username: 'admin', password: 'admin' }];
  }
  return [];
}

/** Production fallback: read single admin from Firestore when env vars are not set (e.g. Firebase doesn't deploy .env). */
async function getAdminAccountsFromFirestore(): Promise<{ username: string; password: string }[]> {
  try {
    const snap = await db.collection('config').doc('admin').get();
    const d = snap?.data();
    const u = d?.admin_username ?? d?.username;
    const p = d?.admin_password ?? d?.password;
    if (u && typeof u === 'string' && p && typeof p === 'string' && u.trim() && p.trim()) {
      return [{ username: u.trim(), password: String(p) }];
    }
  } catch {
    // ignore
  }
  return [];
}

// POST /auth (login, register)
app.post('/auth', async (req, res) => {
  try {
    const { username, password, action, gender, role, coins, deviceId, deviceLabel } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    if (action === 'login') {
      if (deviceId && (await isDeviceBanned(deviceId))) {
        const details = await getHardwareBanDetails(deviceId);
        const ban = details
          ? {
              username: 'This device',
              reason: details.reason,
              bannedBy: details.bannedBy,
              timestamp: details.bannedAt,
              permanent: true,
            }
          : {
              username: 'This device',
              reason: 'Access from this browser profile is blocked.',
              bannedBy: 'Administrator',
              timestamp: Date.now(),
              permanent: true,
            };
        return res.status(401).json({
          error: 'Access from this browser profile is blocked. You cannot sign in.',
          deviceBanned: true,
          ban,
        });
      }
      let doc = await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).get();
      if (!doc.exists) {
        let adminAccounts = getAdminAccountsFromEnv();
        if (adminAccounts.length === 0) adminAccounts = await getAdminAccountsFromFirestore();
        const admin = adminAccounts.find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === password);
        if (admin) {
          const hash = await bcrypt.hash(password, 10);
          await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).set({
            username,
            username_lower: username.toLowerCase(),
            password_hash: hash,
            gender: '',
            role: 'admin',
            coins: 99999,
            owned_skins: ['starter_classic'],
            equipped_skin: 'starter_classic',
            owned_accessories: [],
            equipped_accessories: {},
            owned_servers: [],
            friends: [],
            friend_requests: [],
            sent_friend_requests: [],
            is_donor: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
          });
          doc = await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).get();
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }
      if (!doc.exists) return res.status(401).json({ error: 'Invalid credentials' });
      const d = doc.data()!;
      // Firestore: some users have blank password_hash (e.g. Google-only, legacy imports).
      const storedHash = (d.password_hash || '').trim();
      let match = false;
      if (storedHash.startsWith('$2')) {
        match = await bcrypt.compare(password, storedHash);
      } else if (storedHash) {
        // Legacy: stored value is plaintext (pre-bcrypt migration). Compare and upgrade to bcrypt.
        match = password === storedHash;
        if (match) {
          const hash = await bcrypt.hash(password, 10);
          await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).update({ password_hash: hash, updated_at: Date.now() });
        }
      }
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      if (deviceId) await recordDevice(username, deviceId, deviceLabel || 'Unknown');
      const founder = await applyFounderRewardsAndConsumeCelebration(username.toLowerCase(), d);
      const user = {
        ...userFromDoc(doc),
        coins: founder.data.coins ?? d.coins ?? 0,
        founderLifetimeCoins: founder.data.founder_lifetime_coins === true,
        founderOrdinal:
          typeof founder.data.founder_ordinal === 'number' ? founder.data.founder_ordinal : undefined,
        showFounderCelebration: founder.showCelebration,
      };
      const token = jwt.sign({ username: user.username, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
      return res.json({ success: true, user, token });
    }

    if (action === 'register') {
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      if (deviceId && (await isDeviceBanned(deviceId))) {
        const details = await getHardwareBanDetails(deviceId);
        const ban = details
          ? {
              username: 'This device',
              reason: details.reason,
              bannedBy: details.bannedBy,
              timestamp: details.bannedAt,
              permanent: true,
            }
          : {
              username: 'This device',
              reason: 'Access from this browser profile is blocked.',
              bannedBy: 'Administrator',
              timestamp: Date.now(),
              permanent: true,
            };
        return res.status(400).json({
          error: 'Access from this browser profile is blocked. You cannot create new accounts here.',
          deviceBanned: true,
          ban,
        });
      }
      const id = username.toLowerCase();
      const existing = await db.collection(COLLECTIONS.USERS).doc(id).get();
      if (existing.exists) return res.status(400).json({ error: 'Username already exists' });
      const hash = await bcrypt.hash(password, 10);
      const userData = {
        username,
        username_lower: id,
        password_hash: hash,
        gender: gender || '',
        role: 'user',
        coins: 10,
        owned_skins: ['starter_classic'],
        equipped_skin: 'starter_classic',
        owned_accessories: [],
        equipped_accessories: {},
        owned_servers: [],
        friends: [],
        friend_requests: [],
        sent_friend_requests: [],
        is_donor: 0,
        founder_lifetime_coins: false,
        founder_ordinal: null,
        founder_celebration_pending: false,
        founder_celebration_shown_at: null,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      await db.collection(COLLECTIONS.USERS).doc(id).set(userData);
      if (deviceId) await recordDevice(username, deviceId, deviceLabel || 'Unknown');
      const createdDoc = await db.collection(COLLECTIONS.USERS).doc(id).get();
      const founder = await applyFounderRewardsAndConsumeCelebration(id, createdDoc.data() || userData);
      const user = {
        ...userFromDoc(createdDoc),
        coins: founder.data.coins ?? createdDoc.data()?.coins ?? 0,
        founderLifetimeCoins: founder.data.founder_lifetime_coins === true,
        founderOrdinal:
          typeof founder.data.founder_ordinal === 'number' ? founder.data.founder_ordinal : undefined,
        showFounderCelebration: founder.showCelebration,
      };
      const token = jwt.sign({ username, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
      return res.json({ success: true, user, token });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (e) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET/POST /safety — identity from token only
app.get('/safety', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const username = auth.username;
    const doc = await db.collection(COLLECTIONS.USER_SAFETY).doc(username.toLowerCase()).get();
    const d = doc.data();
    return res.json({ safetyPoints: d?.safety_points ?? 0, lastBreakAt: d?.last_break_at ?? 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read safety' });
  }
});

app.post('/safety', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const username = auth.username;
    const { action, safetyPoints, playtime } = req.body;
    const id = username.toLowerCase();
    const ref = db.collection(COLLECTIONS.USER_SAFETY).doc(id);
    if (action === 'updateSafetyPoints') {
      await ref.set({ safety_points: safetyPoints, updated_at: Date.now() }, { merge: true });
    } else if (action === 'updatePlaytime' && typeof playtime === 'number') {
      const doc = await ref.get();
      const d = doc.data() || {};
      const playtimeToday = (d.playtime_today ?? 0) + playtime;
      const totalPlaytime = (d.total_playtime ?? 0) + playtime;
      await ref.set({
        playtime_today: playtimeToday,
        total_playtime: totalPlaytime,
        last_active_at: Date.now(),
        updated_at: Date.now()
      }, { merge: true });
      return res.json({ success: true, playtimeToday, totalPlaytime });
    }
    const doc = await ref.get();
    const d = doc.data();
    return res.json({ safetyPoints: d?.safety_points ?? 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update safety' });
  }
});

// Draft: GET/POST — identity from token only
app.get('/draft', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const username = auth.username;
    const doc = await db.collection(COLLECTIONS.DRAFTS).doc(username).get();
    const d = doc.data();
    if (!d) return res.json({ title: '', desc: '', owner: '' });
    res.json({
      title: d.title || '',
      desc: d.desc || '',
      owner: d.owner || '',
      gameCode: d.game_code || '',
      thumbnail: d.thumbnail,
      sceneData: d.scene_data,
      gameType: d.game_type,
      fileContent: d.file_content,
      fileType: d.file_type
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read draft' });
  }
});
app.post('/draft', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const username = auth.username;
    const draft = req.body;
    await db.collection(COLLECTIONS.DRAFTS).doc(username).set({
      username,
      title: draft.title || '',
      desc: draft.desc || '',
      owner: draft.owner || '',
      game_code: draft.gameCode || '',
      thumbnail: draft.thumbnail,
      scene_data: draft.sceneData || null,
      game_type: draft.gameType || null,
      file_content: draft.fileContent || null,
      file_type: draft.fileType || null,
      updated_at: Date.now()
    }, { merge: true });
    res.json(draft);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Scene: GET/POST — identity from token only
app.get('/scene', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const userId = auth.username.toLowerCase();
    const doc = await db.collection(COLLECTIONS.SCENES).doc(userId).get();
    const d = doc.data();
    if (!d || !d.scene_data) return res.json({ objects: [] });
    const sceneData = typeof d.scene_data === 'string' ? JSON.parse(d.scene_data) : d.scene_data;
    res.json(sceneData);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read scene' });
  }
});
app.post('/scene', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const scene = req.body;
    const userId = auth.username.toLowerCase();
    await db.collection(COLLECTIONS.SCENES).doc(userId).set({
      user_id: userId,
      scene_data: scene,
      updated_at: Date.now()
    }, { merge: true });
    res.json(scene);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save scene' });
  }
});

// Games: GET all or by owner (owner from token only when filtering)
app.get('/games', async (req, res) => {
  try {
    const ownerQuery = req.query.owner as string;
    let snap;
    if (ownerQuery) {
      const auth = getAuthFromRequest(req);
      if (!auth) return res.status(401).json({ error: 'Unauthorized' });
      snap = await db.collection(COLLECTIONS.GAMES).where('owner', '==', auth.username).orderBy('ts', 'desc').get();
    } else {
      snap = await db.collection(COLLECTIONS.GAMES).orderBy('ts', 'desc').get();
    }
    const games = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        desc: data.description || '',
        owner: data.owner,
        ts: data.ts,
        sceneData: typeof data.scene_data === 'string' ? JSON.parse(data.scene_data) : data.scene_data,
        presetMessages: typeof data.preset_messages === 'string' ? JSON.parse(data.preset_messages) : data.preset_messages,
        controls: typeof data.controls === 'string' ? JSON.parse(data.controls) : data.controls,
        publishedBy: data.published_by,
        gameType: data.game_type,
        fileContent: data.file_content,
        fileType: data.file_type,
        gameCode: data.game_code || undefined
      };
    });
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read games' });
  }
});
app.post('/games', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const game = req.body;
    const gameId = game.id || `game_${Date.now()}`;
    await db.collection(COLLECTIONS.GAMES).doc(gameId).set({
      id: gameId,
      title: game.title,
      description: game.desc || '',
      owner: auth.username,
      ts: game.ts || Date.now(),
      scene_data: game.sceneData || null,
      preset_messages: game.presetMessages || null,
      controls: game.controls || null,
      published_by: game.publishedBy || null,
      game_type: game.gameType || null,
      file_content: game.fileContent || null,
      file_type: game.fileType || null,
      game_code: game.gameCode || null,
      created_at: Date.now(),
      updated_at: Date.now()
    }, { merge: true });
    res.json({ success: true, game: { ...game, id: gameId, ts: game.ts || Date.now() } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Gym Pump game API — identity from token only
app.post('/games/gym-pump/connect', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const { gameId } = req.body;
    if (!gameId) return res.status(400).json({ error: 'gameId required' });
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.collection('gym_pump_sessions').doc(sessionId).set({ sessionId, gameId, username: auth.username, timestamp: Date.now() });
    return res.json({ sessionId });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to connect' });
  }
});
app.post('/games/gym-pump/score', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const { gameId, power, coins, level } = req.body;
    if (!gameId || power === undefined || coins === undefined || level === undefined) return res.status(400).json({ error: 'Invalid request' });
    await db.collection('gym_pump_scores').add({ gameId, username: auth.username, power, coins, level: level || 1, timestamp: Date.now() });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save score' });
  }
});
app.post('/games/gym-pump/sync', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const { gameId, power, coins, level } = req.body;
    if (!gameId || power === undefined || coins === undefined || level === undefined) return res.status(400).json({ error: 'Invalid request' });
    const progressId = `${auth.username}_${gameId}`;
    const ref = db.collection('gym_pump_progress').doc(progressId);
    const existing = (await ref.get()).data();
    const merged = {
      power: Math.max(existing?.power ?? 0, power),
      coins: Math.max(existing?.coins ?? 0, coins),
      level: Math.max(existing?.level ?? 1, level ?? 1),
      lastSynced: Date.now()
    };
    await ref.set(merged, { merge: true });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to sync' });
  }
});
app.get('/games/gym-pump/sync', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const gameId = (req.query.gameId as string) || 'gym-pump';
    const progressId = `${auth.username}_${gameId}`;
    const ref = db.collection('gym_pump_progress').doc(progressId);
    const existing = (await ref.get()).data();
    if (!existing) return res.json({ power: 0, coins: 0, level: 1 });
    return res.json({
      power: existing.power ?? 0,
      coins: existing.coins ?? 0,
      level: existing.level ?? 1
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to get progress' });
  }
});
app.get('/games/gym-pump/leaderboard', async (req, res) => {
  try {
    const snap = await db.collection('gym_pump_scores').orderBy('power', 'desc').limit(parseInt(String(req.query.limit)) || 50).get();
    const leaderboard = snap.docs.map((d, i) => {
      const data = d.data();
      return { rank: i + 1, username: data.username || 'Anonymous', power: data.power ?? 0, coins: data.coins ?? 0, level: data.level ?? 1 };
    });
    return res.json(leaderboard);
  } catch (e) {
    return res.json([]);
  }
});

// Published: GET all, POST to replace all (admin)
app.get('/published', async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.PUBLISHED_GAMES).orderBy('ts', 'desc').get();
    const games = snap.docs.map(d => {
      const data = d.data();
      return {
        title: data.title,
        desc: data.description || '',
        owner: data.owner,
        ts: data.ts,
        thumbnail: data.thumbnail,
        gameCode: data.game_code || '',
        playable: data.playable !== false,
        multiplayer: data.multiplayer === true,
        maxPlayers: data.max_players
      };
    });
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read published games' });
  }
});
app.post('/published', async (req, res) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const games = req.body as any[];
    const batch = db.batch();
    const existing = await db.collection(COLLECTIONS.PUBLISHED_GAMES).get();
    existing.docs.forEach(d => batch.delete(d.ref));
    for (const g of games) {
      const id = `${g.owner}_${g.ts}`;
      const ref = db.collection(COLLECTIONS.PUBLISHED_GAMES).doc(id);
      batch.set(ref, {
        title: g.title,
        description: g.desc || '',
        owner: g.owner,
        ts: g.ts,
        thumbnail: g.thumbnail,
        game_code: g.gameCode || '',
        playable: g.playable !== false,
        multiplayer: g.multiplayer === true,
        max_players: g.maxPlayers,
        created_at: Date.now()
      });
    }
    await batch.commit();
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save published games' });
  }
});

// Prebuilt: GET all, POST to replace (admin)
app.get('/prebuilt', async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.PREBUILT_GAMES).orderBy('ts', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read prebuilt games' });
  }
});
app.post('/prebuilt', async (req, res) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const games = req.body as any[];
    const batch = db.batch();
    const existing = await db.collection(COLLECTIONS.PREBUILT_GAMES).get();
    existing.docs.forEach(d => batch.delete(d.ref));
    for (const g of games) {
      const ref = db.collection(COLLECTIONS.PREBUILT_GAMES).doc(g.id || `prebuilt_${Date.now()}`);
      batch.set(ref, { ...g, updated_at: Date.now() });
    }
    await batch.commit();
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save prebuilt games' });
  }
});

// Hardware bans — GET list, POST add (deviceId + reason), DELETE remove (query deviceId). Also /api/* for Hosting rewrite.
const getHardwareBansHandler = async (req: any, res: any) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const snap = await db.collection(COLLECTIONS.HARDWARE_BANS).get();
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        deviceId: data.deviceId || d.id,
        bannedAt: data.banned_at || 0,
        bannedBy: data.banned_by || '',
        reason: data.reason,
        linkedUsernames: Array.isArray(data.linked_usernames) ? data.linked_usernames : [],
      };
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list hardware bans' });
  }
};
const postHardwareBansHandler = async (req: any, res: any) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const { deviceId: rawId, reason } = req.body || {};
    const id = sanitizeDeviceId(typeof rawId === 'string' ? rawId : '');
    if (!id) return res.status(400).json({ error: 'deviceId required' });

    const { deviceIds, usernames } = await collectLinkedHardwareNetwork(id);
    const groupId = randomUUID();
    const now = Date.now();
    const linked = [...usernames];
    const reasonText = reason || '';

    let batch = db.batch();
    let n = 0;
    const flush = async () => {
      if (n === 0) return;
      await batch.commit();
      batch = db.batch();
      n = 0;
    };
    for (const devId of deviceIds) {
      batch.set(
        db.collection(COLLECTIONS.HARDWARE_BANS).doc(devId),
        {
          deviceId: devId,
          banned_at: now,
          banned_by: auth.username,
          reason: reasonText,
          linked_usernames: linked,
          group_id: groupId,
          root_device_id: id,
          created_at: now,
        },
        { merge: false }
      );
      n++;
      if (n >= 400) await flush();
    }
    await flush();

    const bannedUsernames: string[] = [];
    const deviceIdsForBan = deviceIds;
    for (const un of usernames) {
      const banRef = db.collection(COLLECTIONS.BANS).doc(un);
      const banSnap = await banRef.get();
      if (banSnap.exists) continue;
      await banRef.set({
        username: un,
        username_lower: un,
        reason: reasonText || `Hardware ban — all linked browsers/devices (${deviceIds.length} device ids)`,
        banned_by: auth.username,
        banned_at: now,
        expires_at: null,
        permanent: true,
        hardware_ban_device_id: id,
        hardware_ban_group_id: groupId,
        hardware_ban_device_ids: deviceIdsForBan,
        created_at: now,
      });
      bannedUsernames.push(un);
    }
    res.json({ success: true, bannedUsernames, bannedDeviceIds: deviceIds, groupId });
  } catch (e) {
    res.status(500).json({ error: 'Failed to add hardware ban' });
  }
};
const deleteHardwareBansHandler = async (req: any, res: any) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    let deviceId = (req.query.deviceId as string) || '';
    if (!deviceId && typeof req.originalUrl === 'string') {
      const match = req.originalUrl.match(/[?&]deviceId=([^&]+)/);
      if (match) deviceId = decodeURIComponent(match[1]);
    }
    const id = sanitizeDeviceId(deviceId);
    if (!id) return res.status(400).json({ error: 'deviceId required' });

    const hwDoc = await db.collection(COLLECTIONS.HARDWARE_BANS).doc(id).get();
    const groupId = typeof hwDoc.data()?.group_id === 'string' ? hwDoc.data()!.group_id : null;

    const unbannedUsernames: string[] = [];

    if (groupId) {
      const hwSnap = await db.collection(COLLECTIONS.HARDWARE_BANS).where('group_id', '==', groupId).get();
      let batch = db.batch();
      let n = 0;
      for (const d of hwSnap.docs) {
        batch.delete(d.ref);
        n++;
        if (n >= 400) {
          await batch.commit();
          batch = db.batch();
          n = 0;
        }
      }
      if (n > 0) await batch.commit();

      const bansSnap = await db.collection(COLLECTIONS.BANS).where('hardware_ban_group_id', '==', groupId).get();
      for (const d of bansSnap.docs) {
        const un = d.data()?.username_lower || d.id;
        unbannedUsernames.push(un);
        await d.ref.delete();
      }
    } else {
      await db.collection(COLLECTIONS.HARDWARE_BANS).doc(id).delete();
      const bansSnap = await db.collection(COLLECTIONS.BANS).where('hardware_ban_device_id', '==', id).get();
      for (const d of bansSnap.docs) {
        const un = d.data()?.username_lower || d.id;
        unbannedUsernames.push(un);
        await d.ref.delete();
      }
    }

    res.json({ success: true, unbannedUsernames });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove hardware ban' });
  }
};
app.get('/hardware-bans', getHardwareBansHandler);
app.get('/api/hardware-bans', getHardwareBansHandler);
app.post('/hardware-bans', postHardwareBansHandler);
app.post('/api/hardware-bans', postHardwareBansHandler);
app.delete('/hardware-bans', deleteHardwareBansHandler);
app.delete('/api/hardware-bans', deleteHardwareBansHandler);

// Tab content, accessories, bans, reports, appeals (GET only)
app.get('/tabcontent', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.TAB_CONTENT).doc('content').get()).data() || {}); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/accessories', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.ACCESSORIES_CATALOG).doc('catalog').get()).data()?.accessories || []); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/bans', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.BANS).get()).docs.map(d => ({ id: d.id, ...d.data() }))); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
// POST /bans — admin only, create ban (body: { username, bannedBy, reason, timestamp?, permanent?, expiresAt? })
const postBansHandler = async (req: any, res: any) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const body = req.body || {};
  const username = (body.username ?? '').toString().trim();
  if (!username) return res.status(400).json({ error: 'username required' });
  const bannedBy = (body.bannedBy ?? '').toString().trim() || 'Administrator';
  const reason = (body.reason ?? '').toString().trim() || 'No reason given';
  const permanent = body.permanent === true;
  const timestamp = typeof body.timestamp === 'number' ? body.timestamp : Date.now();
  const expiresAt = permanent ? undefined : (typeof body.expiresAt === 'number' ? body.expiresAt : undefined);
  const usernameLower = username.toLowerCase();
  try {
    const existing = await db.collection(COLLECTIONS.BANS).where('username_lower', '==', usernameLower).get();
    const batch = db.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    await db.collection(COLLECTIONS.BANS).doc(usernameLower).set({
      username,
      username_lower: usernameLower,
      reason,
      banned_by: bannedBy,
      banned_at: timestamp,
      expires_at: expiresAt ?? null,
      permanent,
      created_at: Date.now(),
    });
    res.status(200).json({
      username,
      bannedBy,
      reason,
      timestamp,
      permanent,
      expiresAt: expiresAt ?? undefined,
    });
  } catch (e) {
    console.error('Error creating ban:', e);
    res.status(500).json({ error: 'Failed to create ban' });
  }
};
app.post('/bans', postBansHandler);
app.post('/api/bans', postBansHandler);
// DELETE /bans?username=xxx — admin only, unban user
const deleteBansHandler = async (req: any, res: any) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  let username = (req.query.username as string) || '';
  if (!username.trim() && typeof req.originalUrl === 'string') {
    const match = req.originalUrl.match(/[?&]username=([^&]+)/);
    if (match) username = decodeURIComponent(match[1]);
  }
  if (!username.trim()) return res.status(400).json({ error: 'username required' });
  try {
    const snap = await db.collection(COLLECTIONS.BANS).where('username_lower', '==', username.trim().toLowerCase()).get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to unban' });
  }
};
app.delete('/bans', deleteBansHandler);
app.delete('/api/bans', deleteBansHandler);
app.get('/reports', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.REPORTS).get()).docs.map(d => ({ id: d.id, ...d.data() }))); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/appeals', async (_req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.APPEALS).orderBy('created_at', 'desc').get();
    const appeals = await Promise.all(snap.docs.map(async (d) => {
      const data = d.data();
      const banId = data.ban_id;
      let ban: { reason?: string; bannedBy?: string; timestamp?: number } | null = null;
      if (banId) {
        const banDoc = await db.collection(COLLECTIONS.BANS).doc(banId).get();
        if (banDoc.exists) {
          const b = banDoc.data();
          ban = { reason: b?.reason, bannedBy: b?.banned_by, timestamp: b?.banned_at ?? b?.timestamp };
        }
      }
      return {
        id: d.id,
        username: data.username,
        appealText: data.appeal_text,
        appealMessage: data.appeal_text,
        timestamp: data.created_at ?? Date.now(),
        status: data.status || 'pending',
        reviewedBy: data.reviewed_by,
        adminNotes: data.admin_notes,
        reviewedAt: data.reviewed_at,
        device_id: data.device_id,
        ban_id: data.ban_id,
        ban,
      };
    }));
    res.json(appeals);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read appeals' });
  }
});

// GET appeal messages (admin only) - for moderator chat in admin panel
app.get('/appeals/messages', async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const appealId = req.query.appealId as string;
  if (!appealId) {
    res.status(400).json({ error: 'appealId required' });
    return;
  }
  try {
    const snap = await db.collection(COLLECTIONS.APPEAL_MESSAGES)
      .where('appeal_id', '==', appealId)
      .get();
    const messages = snap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          appealId: data.appeal_id,
          fromUsername: data.from_username,
          message: data.message,
          timestamp: data.created_at ?? data.timestamp ?? 0,
        };
      })
      .sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Game submissions: GET all, POST to submit for evaluation, DELETE
app.get('/gamesubmissions', async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.GAME_SUBMISSIONS).orderBy('ts', 'desc').get();
    const submissions = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        desc: data.description || '',
        owner: data.owner,
        ts: data.ts,
        sceneData: typeof data.scene_data === 'string' ? JSON.parse(data.scene_data) : data.scene_data,
        status: data.status || 'pending',
        reviewedBy: data.reviewed_by,
        adminNotes: data.admin_notes,
        gameType: data.game_type,
        fileContent: data.file_content,
        fileType: data.file_type
      };
    });
    res.json(submissions);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read game submissions' });
  }
});
app.post('/gamesubmissions', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const s = req.body;
    const id = s.id || `submission_${Date.now()}`;
    await db.collection(COLLECTIONS.GAME_SUBMISSIONS).doc(id).set({
      id,
      title: s.title,
      description: s.desc || '',
      owner: auth.username,
      ts: s.ts || Date.now(),
      scene_data: s.sceneData || null,
      status: s.status || 'pending',
      game_type: s.gameType || null,
      file_content: s.fileContent || null,
      file_type: s.fileType || null,
      created_at: Date.now()
    }, { merge: true });
    res.json({ success: true, submission: { ...s, id } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save game submission' });
  }
});
app.delete('/gamesubmissions', async (req, res) => {
  try {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const doc = await db.collection(COLLECTIONS.GAME_SUBMISSIONS).doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    const resourceOwner = (doc.data()?.owner as string) || '';
    if (!requireOwnerOrAdmin(req, res, resourceOwner)) return;
    await db.collection(COLLECTIONS.GAME_SUBMISSIONS).doc(id).delete();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete game submission' });
  }
});

// Pyx content filter - calls Pyx API (register both /pyx/* and /api/pyx/* for Hosting rewrite)
import { filterForDisplay, sendFeedback, checkForPublish, analyzeCodeForPublish, pyxCodeComplete } from './pyx';
const pyxFilter = async (req: any, res: any) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const filtered = await filterForDisplay(text);
    res.json({ filtered, score: 0 });
  } catch (e) {
    res.status(500).json({ filtered: '', error: 'Filter failed' });
  }
};
const pyxFeedback = async (req: any, res: any) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const safe = req.body?.safe === true;
    if (!text) return res.status(400).json({ error: 'text required' });
    await sendFeedback(text, safe);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Feedback failed' });
  }
};
const pyxCheck = async (req: any, res: any) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const result = await checkForPublish(text);
    res.json(result);
  } catch (e) {
    console.error('[Pyx] Check route error:', e);
    res.status(500).json({ safe: false, filtered: '', connectionError: true });
  }
};
const pyxAnalyze = async (req: any, res: any) => {
  try {
    const source = typeof req.body?.source === 'string' ? req.body.source : '';
    const result = await analyzeCodeForPublish(source);
    res.json(result);
  } catch (e) {
    console.error('[Pyx] Analyze route error:', e);
    res.status(500).json({ safe: false, connectionError: true });
  }
};
const pyxCodeCompleteHandler = async (req: any, res: any) => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt : '';
    const maxTokens = typeof req.body?.max_tokens === 'number' ? req.body.max_tokens : 256;
    const result = await pyxCodeComplete(prompt, maxTokens);
    res.json(result);
  } catch (e) {
    console.error('[Pyx] Code complete route error:', e);
    res.status(500).json({ completion: '', connectionError: true });
  }
};
['/pyx/filter', '/api/pyx/filter'].forEach((path) => app.post(path, pyxFilter));
['/pyx/feedback', '/api/pyx/feedback'].forEach((path) => app.post(path, pyxFeedback));
['/pyx/check', '/api/pyx/check'].forEach((path) => app.post(path, pyxCheck));
['/pyx/analyze', '/api/pyx/analyze'].forEach((path) => app.post(path, pyxAnalyze));
['/pyx/code/complete', '/api/pyx/code/complete'].forEach((path) => app.post(path, pyxCodeCompleteHandler));

// AI Game Generator (Groq + template fallback)
import { handleGenerateGame } from './generate-game';
import { handleChat } from './chat';
app.post('/generate-game', (req, res) => handleGenerateGame(req, res));
app.post('/api/generate-game', (req, res) => handleGenerateGame(req, res));
app.post('/chat', (req, res) => handleChat(req, res));
app.post('/api/chat', (req, res) => handleChat(req, res));

// HistoriMac Computer Use (BYOK — OpenAI Responses `computer` or Anthropic `computer_20250124`)
import { handleHistoriMacCopilotTurn } from './historimac-copilot-turn';
app.post('/historimac-copilot-turn', (req, res) => void handleHistoriMacCopilotTurn(req, res));
app.post('/api/historimac-copilot-turn', (req, res) => void handleHistoriMacCopilotTurn(req, res));

// Public status page JSON (status.pixelplaceofficial.com); admin updates via PUT
const getStatusPageHandler = async (_req: any, res: any) => {
  try {
    const payload = await readStatusPagePayload();
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read status' });
  }
};
const putStatusPageHandler = async (req: any, res: any) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const n = normalizeStatusPagePayload(req.body);
  if (!n.ok) return res.status(400).json({ error: n.error });
  try {
    await db.collection(COLLECTIONS.STATUS_PAGE).doc('current').set(n.data);
    res.json({ success: true, ...n.data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save status' });
  }
};
app.get('/status-page', getStatusPageHandler);
app.get('/api/status-page', getStatusPageHandler);
app.put('/status-page', putStatusPageHandler);
app.put('/api/status-page', putStatusPageHandler);

// 404 for unknown routes (include path debug so we can see what Express received)
app.use((req: any, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
  });
});

export const api = functions.region('us-central1').https.onRequest(app);
