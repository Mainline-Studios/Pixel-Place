/**
 * Firebase Cloud Functions - API backend for Pixel Place static export
 * Deploy: firebase deploy --only functions
 * URL: https://us-central1-pixel-place-823b1.cloudfunctions.net/api
 */
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
      is_donor: (u.role === 'admin' || u.role === 'head_admin') ? 1 : 0,
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
      is_donor: (u.role === 'admin' || u.role === 'head_admin') ? 1 : 0,
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
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
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

// Draft: GET by username, POST to save
app.get('/draft', async (req, res) => {
  try {
    const username = (req.query.username as string) || 'default';
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
    const draft = req.body;
    const username = draft.owner || 'default';
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

// Scene: GET/POST by userId
app.get('/scene', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default';
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
    const scene = req.body;
    const userId = (req.query.userId as string) || 'default';
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

// Games: GET all or by owner, POST to create
app.get('/games', async (req, res) => {
  try {
    const owner = req.query.owner as string;
    let snap;
    if (owner) {
      snap = await db.collection(COLLECTIONS.GAMES).where('owner', '==', owner).orderBy('ts', 'desc').get();
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
        fileType: data.file_type
      };
    });
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read games' });
  }
});
app.post('/games', async (req, res) => {
  try {
    const game = req.body;
    const gameId = game.id || `game_${Date.now()}`;
    await db.collection(COLLECTIONS.GAMES).doc(gameId).set({
      id: gameId,
      title: game.title,
      description: game.desc || '',
      owner: game.owner,
      ts: game.ts || Date.now(),
      scene_data: game.sceneData || null,
      preset_messages: game.presetMessages || null,
      controls: game.controls || null,
      published_by: game.publishedBy || null,
      game_type: game.gameType || null,
      file_content: game.fileContent || null,
      file_type: game.fileType || null,
      created_at: Date.now(),
      updated_at: Date.now()
    }, { merge: true });
    res.json({ success: true, game: { ...game, id: gameId, ts: game.ts || Date.now() } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Gym Pump game API (for production - Next.js API routes not available with static export)
app.post('/games/gym-pump/connect', async (req, res) => {
  try {
    const { gameId, username } = req.body;
    if (!gameId || !username) return res.status(400).json({ error: 'gameId and username required' });
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.collection('gym_pump_sessions').doc(sessionId).set({ sessionId, gameId, username, timestamp: Date.now() });
    return res.json({ sessionId });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to connect' });
  }
});
app.post('/games/gym-pump/score', async (req, res) => {
  try {
    const { gameId, power, coins, level, username } = req.body;
    if (!gameId || power === undefined || coins === undefined || level === undefined) return res.status(400).json({ error: 'Invalid request' });
    await db.collection('gym_pump_scores').add({ gameId, username: username || 'Anonymous', power, coins, level: level || 1, timestamp: Date.now() });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save score' });
  }
});
app.post('/games/gym-pump/sync', async (req, res) => {
  try {
    const { gameId, power, coins, level, username } = req.body;
    if (!gameId || !username || power === undefined || coins === undefined || level === undefined) return res.status(400).json({ error: 'Invalid request' });
    const progressId = `${username}_${gameId}`;
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

// Tab content, accessories, bans, reports, appeals (GET only)
app.get('/tabcontent', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.TAB_CONTENT).doc('content').get()).data() || {}); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/accessories', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.ACCESSORIES_CATALOG).doc('catalog').get()).data()?.accessories || []); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/bans', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.BANS).get()).docs.map(d => ({ id: d.id, ...d.data() }))); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/reports', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.REPORTS).get()).docs.map(d => ({ id: d.id, ...d.data() }))); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/appeals', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.APPEALS).get()).docs.map(d => ({ id: d.id, ...d.data() }))); } catch (e) { res.status(500).json({ error: 'Failed' }); } });

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
    const s = req.body;
    const id = s.id || `submission_${Date.now()}`;
    await db.collection(COLLECTIONS.GAME_SUBMISSIONS).doc(id).set({
      id,
      title: s.title,
      description: s.desc || '',
      owner: s.owner || '',
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
    await db.collection(COLLECTIONS.GAME_SUBMISSIONS).doc(id).delete();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete game submission' });
  }
});

// AI Game Generator (Groq + template fallback)
import { handleGenerateGame } from './generate-game';
import { handleChat } from './chat';
app.post('/generate-game', (req, res) => handleGenerateGame(req, res));
app.post('/chat', (req, res) => handleChat(req, res));

// 404 for unknown routes
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

export const api = functions.region('us-central1').https.onRequest(app);
