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
    
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_games_owner ON games(owner);
    CREATE INDEX IF NOT EXISTS idx_published_games_owner ON published_games(owner);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);
  
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
