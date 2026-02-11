/**
 * Firebase Cloud Functions - API backend for Pixel Place static export
 * Deploy: firebase deploy --only functions
 * URL: https://us-central1-pixel-place-823b1.cloudfunctions.net/api
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

admin.initializeApp();
const db = admin.firestore();
const COLLECTIONS = {
  USERS: 'users',
  SKINS_CATALOG: 'skins_catalog',
  USER_SAFETY: 'user_safety',
  PUBLISHED_GAMES: 'published_games',
  TAB_CONTENT: 'tab_content',
  BANS: 'bans',
  REPORTS: 'reports',
  APPEALS: 'ban_appeals',
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
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Minimal NEW_SKINS fallback (starter skins)
const FALLBACK_SKINS = [
  { id: 'starter_classic', name: 'Starter Classic', price: 0, use3d: true, colors: { head: '#f4c2a1', torso: '#4d536f', arm: '#3a3f56', legs: '#3a3f56' } },
];

function userFromDoc(doc: admin.firestore.DocumentSnapshot): any {
  const d = doc.data();
  if (!d) return null;
  return {
    username: d.username || doc.id,
    password: d.password_hash || '',
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
  };
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Cloud Functions URL is .../api - requests to .../api/users have path /api/users
// Strip /api so our routes match /users, /skins, etc.
app.use((req, res, next) => {
  const p = req.path;
  if (p.startsWith('/api')) {
    req.url = (p.length === 4 ? '/' : p.slice(4)) || '/';
  }
  next();
});

// GET/POST /users
app.get('/users', async (_req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.USERS).get();
    const users = snap.docs.map(userFromDoc).filter(Boolean);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const u = req.body;
    const id = (u.username || '').toLowerCase();
    if (!id) return res.status(400).json({ error: 'Username required' });
    const existing = await db.collection(COLLECTIONS.USERS).doc(id).get();
    const data = {
      username: u.username,
      username_lower: id,
      password_hash: u.password || '',
      gender: u.gender || '',
      role: u.role || 'user',
      coins: u.coins ?? 10,
      owned_skins: u.ownedSkins || ['starter_classic'],
      equipped_skin: u.equippedSkin || 'starter_classic',
      owned_accessories: u.ownedAccessories || [],
      equipped_accessories: u.equippedAccessories || {},
      owned_servers: u.ownedServers || [],
      friends: u.friends || [],
      friend_requests: u.friendRequests || [],
      sent_friend_requests: u.sentFriendRequests || [],
      is_donor: u.role === 'admin' ? 1 : 0,
      updated_at: Date.now(),
    };
    if (existing.exists) {
      await db.collection(COLLECTIONS.USERS).doc(id).set(data, { merge: true });
    } else {
      (data as any).created_at = Date.now();
      await db.collection(COLLECTIONS.USERS).doc(id).set(data);
    }
    res.json({ ...u, ...data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

app.put('/users', async (req, res) => {
  try {
    const u = req.body;
    const id = (u.username || '').toLowerCase();
    if (!id) return res.status(400).json({ error: 'Username required' });
    const ref = db.collection(COLLECTIONS.USERS).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'User not found' });
    await ref.set({
      username: u.username,
      username_lower: id,
      password_hash: u.password,
      gender: u.gender,
      role: u.role,
      coins: u.coins,
      owned_skins: u.ownedSkins || [],
      equipped_skin: u.equippedSkin || '',
      owned_accessories: u.ownedAccessories || [],
      equipped_accessories: u.equippedAccessories || {},
      friends: u.friends || [],
      friend_requests: u.friendRequests || [],
      sent_friend_requests: u.sentFriendRequests || [],
      is_donor: u.role === 'admin' ? 1 : 0,
      updated_at: Date.now(),
    }, { merge: true });
    res.json(u);
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
    const skins = req.body;
    await db.collection(COLLECTIONS.SKINS_CATALOG).doc('catalog').set({ skins, updated_at: Date.now() }, { merge: true });
    res.json(skins);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save skins' });
  }
});

// POST /auth (login, register)
app.post('/auth', async (req, res) => {
  try {
    const { username, password, action, gender, role, coins } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    if (action === 'login') {
      const doc = await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).get();
      if (!doc.exists) return res.status(401).json({ error: 'Invalid credentials' });
      const d = doc.data()!;
      const match = await bcrypt.compare(password, d.password_hash || '');
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      const user = userFromDoc(doc);
      const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user, token });
    }

    if (action === 'register') {
      const id = username.toLowerCase();
      const existing = await db.collection(COLLECTIONS.USERS).doc(id).get();
      if (existing.exists) return res.status(400).json({ error: 'Username already exists' });
      const hash = await bcrypt.hash(password, 10);
      const userData = {
        username,
        username_lower: id,
        password_hash: hash,
        gender: gender || '',
        role: role || 'user',
        coins: coins ?? 10,
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
      };
      await db.collection(COLLECTIONS.USERS).doc(id).set(userData);
      const user = userFromDoc(await db.collection(COLLECTIONS.USERS).doc(id).get());
      const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user, token });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (e) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET/POST /safety
app.get('/safety', async (req, res) => {
  try {
    const username = req.query.username as string;
    if (!username) return res.json({ safetyPoints: 0, lastBreakAt: 0 });
    const doc = await db.collection(COLLECTIONS.USER_SAFETY).doc(username.toLowerCase()).get();
    const d = doc.data();
    return res.json({ safetyPoints: d?.safety_points ?? 0, lastBreakAt: d?.last_break_at ?? 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read safety' });
  }
});

app.post('/safety', async (req, res) => {
  try {
    const { username, action, safetyPoints } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    const id = username.toLowerCase();
    const ref = db.collection(COLLECTIONS.USER_SAFETY).doc(id);
    if (action === 'updateSafetyPoints') {
      await ref.set({ safety_points: safetyPoints, updated_at: Date.now() }, { merge: true });
    }
    const doc = await ref.get();
    const d = doc.data();
    return res.json({ safetyPoints: d?.safety_points ?? 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update safety' });
  }
});

// Generic handlers for other routes - return empty or proxy to Firestore
const genericRoutes: Record<string, { get?: () => Promise<any>; post?: (body: any) => Promise<any> }> = {
  '/tabcontent': { get: async () => (await db.collection(COLLECTIONS.TAB_CONTENT).doc('content').get()).data() || {} },
  '/published': { get: async () => db.collection(COLLECTIONS.PUBLISHED_GAMES).get().then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))) },
  '/accessories': { get: async () => (await db.collection(COLLECTIONS.ACCESSORIES_CATALOG).doc('catalog').get()).data()?.accessories || [] },
  '/bans': { get: async () => db.collection(COLLECTIONS.BANS).get().then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))) },
  '/reports': { get: async () => db.collection(COLLECTIONS.REPORTS).get().then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))) },
  '/appeals': { get: async () => db.collection(COLLECTIONS.APPEALS).get().then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))) },
  '/draft': { get: async () => (await db.collection(COLLECTIONS.DRAFTS).limit(1).get()).docs[0]?.data() || {} },
  '/scene': { get: async () => (await db.collection(COLLECTIONS.SCENES).doc('default').get()).data() || {} },
  '/prebuilt': { get: async () => db.collection(COLLECTIONS.PREBUILT_GAMES).get().then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))) },
  '/games': { get: async () => db.collection(COLLECTIONS.GAMES).get().then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))) },
};

for (const [path, handlers] of Object.entries(genericRoutes)) {
  if (handlers.get) app.get(path, async (_req, res) => { try { res.json(await handlers.get!()); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
}

// 404 for unknown routes
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export const api = functions.region('us-central1').https.onRequest(app);
