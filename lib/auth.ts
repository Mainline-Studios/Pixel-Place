import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDocument, setDocument, queryDocuments, addDocument, COLLECTIONS } from './firestore';
import { User } from '@/types';

const DEFAULT_JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function isUnsafeJwtSecret(): boolean {
  return !process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_JWT_SECRET;
}

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

/** Build user for API/client. Never expose password or hash. */
function userFromDoc(doc: any): User {
  return {
    username: doc.username || doc.id,
    password: '',
    gender: doc.gender || '',
    role: (doc.role || 'user') as 'admin' | 'user' | 'head_admin',
    coins: doc.coins || 0,
    ownedSkins: Array.isArray(doc.owned_skins) ? doc.owned_skins : (typeof doc.owned_skins === 'string' ? JSON.parse(doc.owned_skins || '[]') : []),
    equippedSkin: doc.equipped_skin || '',
    ownedAccessories: Array.isArray(doc.owned_accessories) ? doc.owned_accessories : (typeof doc.owned_accessories === 'string' ? JSON.parse(doc.owned_accessories || '[]') : []),
    equippedAccessories: Array.isArray(doc.equipped_accessories) ? doc.equipped_accessories : (typeof doc.equipped_accessories === 'string' ? JSON.parse(doc.equipped_accessories || '[]') : []),
    ownedServers: Array.isArray(doc.owned_servers) ? doc.owned_servers : (typeof doc.owned_servers === 'string' ? JSON.parse(doc.owned_servers || '[]') : []),
    friends: Array.isArray(doc.friends) ? doc.friends : (typeof doc.friends === 'string' ? JSON.parse(doc.friends || '[]') : []),
    friendRequests: Array.isArray(doc.friend_requests) ? doc.friend_requests : (typeof doc.friend_requests === 'string' ? JSON.parse(doc.friend_requests || '[]') : []),
    sentFriendRequests: Array.isArray(doc.sent_friend_requests) ? doc.sent_friend_requests : (typeof doc.sent_friend_requests === 'string' ? JSON.parse(doc.sent_friend_requests || '[]') : []),
    recentlyPlayed: Array.isArray(doc.recently_played)
      ? doc.recently_played
      : (typeof doc.recently_played === 'string'
          ? (() => {
              try {
                const parsed = JSON.parse(doc.recently_played || '[]');
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            })()
          : []),
    isDonor: doc.is_donor === 1 || doc.is_donor === true
  };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password (supports bcrypt or legacy plaintext; caller may upgrade hash after)
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const h = (hash || '').trim();
  if (h.startsWith('$2')) return bcrypt.compare(password, h);
  if (h) return password === h; // legacy plaintext
  return false;
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  if (process.env.NODE_ENV === 'production' && isUnsafeJwtSecret()) {
    throw new Error('JWT_SECRET is not configured securely');
  }
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
  if (process.env.NODE_ENV === 'production' && isUnsafeJwtSecret()) return null;
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

// Get user from Firestore
export async function getUserFromDb(username: string): Promise<User | null> {
  try {
    const doc = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
    if (!doc) return null;
    return userFromDoc(doc);
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
}

// Get user by ID (using username as ID in Firestore)
export async function getUserByIdFromDb(id: number | string): Promise<User | null> {
  try {
    // In Firestore, we use username as the document ID
    // If id is a number, we need to find by username or use a different approach
    // For now, we'll search all users (not ideal, but works)
    const users = await queryDocuments(COLLECTIONS.USERS, 'username', '==', String(id));
    if (users.length > 0) {
      return userFromDoc(users[0]);
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID from Firestore:', error);
    return null;
  }
}

// Create or update user in Firestore
export async function createOrUpdateUser(user: User, password?: string): Promise<number> {
  try {
    const usernameLower = user.username.toLowerCase();
    const existingDoc = await getDocument(COLLECTIONS.USERS, usernameLower);
    const existing = existingDoc ? userFromDoc(existingDoc) : null;
    
    if (existing && existingDoc) {
      // Update existing user — keep existing hash if no new password
      const passwordHash = password ? await hashPassword(password) : (existingDoc.password_hash || (existingDoc as any).password || '');
      
      await setDocument(COLLECTIONS.USERS, usernameLower, {
        username: user.username,
        username_lower: usernameLower,
        password_hash: passwordHash,
        gender: user.gender || '',
        role: user.role || 'user',
        coins: user.coins || 0,
        owned_skins: user.ownedSkins || [],
        equipped_skin: user.equippedSkin || '',
        owned_accessories: user.ownedAccessories || [],
        equipped_accessories: user.equippedAccessories || [],
        owned_servers: user.ownedServers || [],
        friends: user.friends || [],
        friend_requests: user.friendRequests || [],
        sent_friend_requests: user.sentFriendRequests || [],
        is_donor: user.isDonor ? 1 : 0,
        updated_at: Date.now()
      });
      
      return 1; // Return a dummy ID (Firestore uses document IDs, not numeric IDs)
    } else {
      // Create new user
      if (!password) {
        throw new Error('Password required for new users');
      }
      
      const passwordHash = await hashPassword(password);
      
      await setDocument(COLLECTIONS.USERS, usernameLower, {
        username: user.username,
        username_lower: usernameLower,
        password_hash: passwordHash,
        gender: user.gender || '',
        role: user.role || 'user',
        coins: user.coins || 0,
        owned_skins: user.ownedSkins || [],
        equipped_skin: user.equippedSkin || '',
        owned_accessories: user.ownedAccessories || [],
        equipped_accessories: user.equippedAccessories || [],
        owned_servers: user.ownedServers || [],
        friends: user.friends || [],
        friend_requests: user.friendRequests || [],
        sent_friend_requests: user.sentFriendRequests || [],
        is_donor: user.isDonor ? 1 : 0,
        created_at: Date.now(),
        updated_at: Date.now()
      });
      
      return 1; // Return a dummy ID
    }
  } catch (error) {
    console.error('Error creating/updating user in Firestore:', error);
    throw error;
  }
}

// Authenticate user
export async function authenticateUser(username: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const doc = await getDocument(COLLECTIONS.USERS, username.toLowerCase());
    if (!doc) return null;
    
    const isValid = await verifyPassword(password, doc.password_hash || doc.password || '');
    if (!isValid) return null;
    
    const user = userFromDoc(doc);
    
    const authUser: AuthUser = {
      id: 1, // Dummy ID (Firestore doesn't use numeric IDs)
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
    
    // Store session in Firestore
    const sessionId = `${username}_${Date.now()}`;
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    await addDocument('sessions', {
      id: sessionId,
      user_id: username,
      token: token,
      expires_at: Math.floor(expiresAt / 1000),
      created_at: Date.now()
    });
    
    return { user, token };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
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
