import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  coins: number;
  equippedSkin: string;
  ownedSkins: string[];
  ownedAccessories: string[];
  equippedAccessories: string[];
  ownedServers: string[];
  friends: string[];
  isDonor: boolean;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      coins: 0,
      equippedSkin: '',
      ownedSkins: [],
      ownedAccessories: [],
      equippedAccessories: [],
      ownedServers: [],
      friends: [],
      isDonor: false,
    };
  } catch (error) {
    return null;
  }
}

// Get user from database
export function getUserFromDb(username: string): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const row = stmt.get(username.toLowerCase()) as any;
  
  if (!row) return null;
  
  return {
    username: row.username,
    password: '',
    gender: row.gender || '',
    role: row.role || 'user',
    coins: row.coins || 0,
    ownedSkins: JSON.parse(row.owned_skins || '[]'),
    equippedSkin: row.equipped_skin || '',
    ownedAccessories: JSON.parse(row.owned_accessories || '[]'),
    equippedAccessories: JSON.parse(row.equipped_accessories || '[]'),
    ownedServers: JSON.parse(row.owned_servers || '[]'),
    friends: JSON.parse(row.friends || '[]'),
    friendRequests: JSON.parse(row.friend_requests || '[]'),
    sentFriendRequests: JSON.parse(row.sent_friend_requests || '[]'),
    isDonor: row.is_donor === 1,
  };
}

// Get user by ID
export function getUserByIdFromDb(id: number): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return {
    username: row.username,
    password: '',
    gender: row.gender || '',
    role: row.role || 'user',
    coins: row.coins || 0,
    ownedSkins: JSON.parse(row.owned_skins || '[]'),
    equippedSkin: row.equipped_skin || '',
    ownedAccessories: JSON.parse(row.owned_accessories || '[]'),
    equippedAccessories: JSON.parse(row.equipped_accessories || '[]'),
    ownedServers: JSON.parse(row.owned_servers || '[]'),
    friends: JSON.parse(row.friends || '[]'),
    friendRequests: JSON.parse(row.friend_requests || '[]'),
    sentFriendRequests: JSON.parse(row.sent_friend_requests || '[]'),
    isDonor: row.is_donor === 1,
  };
}

// Create or update user
export async function createOrUpdateUser(user: User, password?: string): Promise<number> {
  const db = getDb();
  const existing = getUserFromDb(user.username);
  
  if (existing) {
    const updateStmt = db.prepare(`
      UPDATE users SET
        gender = ?,
        role = ?,
        coins = ?,
        owned_skins = ?,
        equipped_skin = ?,
        owned_accessories = ?,
        equipped_accessories = ?,
        owned_servers = ?,
        friends = ?,
        friend_requests = ?,
        sent_friend_requests = ?,
        is_donor = ?,
        updated_at = strftime('%s', 'now')
      WHERE username = ?
    `);
    
    updateStmt.run(
      user.gender || '',
      user.role || 'user',
      user.coins || 0,
      JSON.stringify(user.ownedSkins || []),
      user.equippedSkin || '',
      JSON.stringify(user.ownedAccessories || []),
      JSON.stringify(user.equippedAccessories || []),
      JSON.stringify(user.ownedServers || []),
      JSON.stringify(user.friends || []),
      JSON.stringify(user.friendRequests || []),
      JSON.stringify(user.sentFriendRequests || []),
      user.isDonor ? 1 : 0,
      user.username.toLowerCase()
    );
    
    const getIdStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    const result = getIdStmt.get(user.username.toLowerCase()) as any;
    return result.id;
  } else {
    if (!password) {
      throw new Error('Password required for new users');
    }
    
    const passwordHash = await hashPassword(password);
    const insertStmt = db.prepare(`
      INSERT INTO users (
        username, password_hash, gender, role, coins, owned_skins, equipped_skin,
        owned_accessories, equipped_accessories, owned_servers, friends,
        friend_requests, sent_friend_requests, is_donor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertStmt.run(
      user.username.toLowerCase(),
      passwordHash,
      user.gender || '',
      user.role || 'user',
      user.coins || 0,
      JSON.stringify(user.ownedSkins || []),
      user.equippedSkin || '',
      JSON.stringify(user.ownedAccessories || []),
      JSON.stringify(user.equippedAccessories || []),
      JSON.stringify(user.ownedServers || []),
      JSON.stringify(user.friends || []),
      JSON.stringify(user.friendRequests || []),
      JSON.stringify(user.sentFriendRequests || []),
      user.isDonor ? 1 : 0
    );
    
    return result.lastInsertRowid as number;
  }
}

// Authenticate user
export async function authenticateUser(username: string, password: string): Promise<{ user: User; token: string } | null> {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const row = stmt.get(username.toLowerCase()) as any;
  
  if (!row) return null;
  
  const isValid = await verifyPassword(password, row.password_hash);
  if (!isValid) return null;
  
  const user = getUserFromDb(username);
  if (!user) return null;
  
  const authUser: AuthUser = {
    id: row.id,
    username: user.username,
    role: user.role,
    coins: user.coins,
    equippedSkin: user.equippedSkin,
    ownedSkins: user.ownedSkins,
    ownedAccessories: user.ownedAccessories,
    equippedAccessories: user.equippedAccessories,
    ownedServers: user.ownedServers,
    friends: user.friends || [],
    isDonor: user.isDonor || false,
  };
  
  const token = generateToken(authUser);
  
  const sessionStmt = db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `);
  
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
  sessionStmt.run(
    `${row.id}_${Date.now()}`,
    row.id,
    token,
    Math.floor(expiresAt / 1000)
  );
  
  return { user, token };
}

// Get authenticated user from request
export function getAuthUser(request: Request): AuthUser | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
}
