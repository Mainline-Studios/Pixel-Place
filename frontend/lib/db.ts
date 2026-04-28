import Database from 'better-sqlite3';
import path from 'path';
import { promises as fs } from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'database.db');

// Ensure data directory exists
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// Initialize database
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  
  // Ensure directory exists (sync for initial setup)
  try {
    require('fs').mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }
  
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL'); // Better performance
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      gender TEXT,
      role TEXT DEFAULT 'user',
      coins INTEGER DEFAULT 0,
      owned_skins TEXT DEFAULT '[]',
      equipped_skin TEXT,
      owned_accessories TEXT DEFAULT '[]',
      equipped_accessories TEXT DEFAULT '[]',
      owned_servers TEXT DEFAULT '[]',
      friends TEXT DEFAULT '[]',
      friend_requests TEXT DEFAULT '[]',
      sent_friend_requests TEXT DEFAULT '[]',
      is_donor INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      owner TEXT NOT NULL,
      ts INTEGER NOT NULL,
      scene_data TEXT,
      preset_messages TEXT,
      controls TEXT,
      published_by TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS published_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      owner TEXT NOT NULL,
      ts INTEGER NOT NULL,
      thumbnail TEXT,
      game_code TEXT,
      scene_data TEXT,
      playable INTEGER DEFAULT 1,
      multiplayer INTEGER DEFAULT 0,
      max_players INTEGER,
      server_id TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS scenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      scene_data TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS game_submissions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      owner TEXT NOT NULL,
      ts INTEGER NOT NULL,
      scene_data TEXT,
      status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      title TEXT,
      desc TEXT,
      owner TEXT,
      game_code TEXT,
      thumbnail TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(username)
    );
    
    CREATE TABLE IF NOT EXISTS bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      reason TEXT,
      banned_by TEXT,
      banned_at INTEGER NOT NULL,
      expires_at INTEGER,
      permanent INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS ban_appeals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ban_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      appeal_text TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (ban_id) REFERENCES bans(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reported_username TEXT NOT NULL,
      reported_by TEXT NOT NULL,
      reason TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS friend_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_username TEXT NOT NULL,
      to_username TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_username TEXT NOT NULL,
      to_username TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS tab_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tab_name TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS game_servers (
      id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      plan_id TEXT,
      max_players INTEGER,
      current_players INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS server_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      max_players INTEGER NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      features TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS prebuilt_games (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      owner TEXT NOT NULL,
      ts INTEGER NOT NULL,
      scene_data TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_games_owner ON games(owner);
    CREATE INDEX IF NOT EXISTS idx_published_games_owner ON published_games(owner);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_bans_username ON bans(username);
    CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests(from_username);
    CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_username);
    CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_username);
    CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_username);
  `);

  // Lightweight migrations (ignore duplicate column errors when re-run)
  const alters = [
    `ALTER TABLE users ADD COLUMN owned_faces TEXT DEFAULT '[]';`,
    `ALTER TABLE users ADD COLUMN equipped_face TEXT;`,
    `ALTER TABLE users ADD COLUMN safety_points INTEGER DEFAULT 0;`,
    `ALTER TABLE users ADD COLUMN locale TEXT;`,
    `ALTER TABLE users ADD COLUMN shadow_banned INTEGER DEFAULT 0;`,
    `ALTER TABLE users ADD COLUMN chat_muted_until INTEGER;`,
    `ALTER TABLE users ADD COLUMN chat_violation_score INTEGER DEFAULT 0;`,
    `ALTER TABLE users ADD COLUMN last_ip_hash TEXT;`,
  ];
  for (const sql of alters) {
    try {
      db.exec(sql);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('duplicate column')) {
        console.warn('SQLite migration warning:', msg);
      }
    }
  }

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
