/**
 * Auth middleware for Cloud Functions. Identity from JWT only — never trust username from query/body.
 * JWT_SECRET must be set in Google Cloud Console: Cloud Functions → api → Edit → Runtime environment variables.
 */
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const DEFAULT_JWT_SECRET = 'your-secret-key-change-in-production';

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  return s && s !== DEFAULT_JWT_SECRET ? s : DEFAULT_JWT_SECRET;
}

const isUnsafeJwtSecret = (): boolean => getJwtSecret() === DEFAULT_JWT_SECRET;
export { getJwtSecret };

export interface AuthUser {
  username: string;
  role: string;
}

/** Hosting rewrites sometimes drop Authorization; also accept X-Auth-Token and JSON body.authToken. */
export function extractAuthTokenFromRequest(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const t = authHeader.slice(7).trim();
    if (t) return t;
  }
  const xAuth = req.headers['x-auth-token'];
  if (typeof xAuth === 'string' && xAuth.trim()) return xAuth.trim();
  const body = req.body as { authToken?: unknown } | undefined;
  if (typeof body?.authToken === 'string' && body.authToken.trim()) return body.authToken.trim();
  return '';
}

export function getAuthFromRequest(req: Request): AuthUser | null {
  if (isUnsafeJwtSecret()) return null;
  const token = extractAuthTokenFromRequest(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { username?: string; role?: string };
    const username = decoded?.username;
    if (!username || typeof username !== 'string') return null;
    return { username: String(username), role: decoded?.role || 'user' };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response): AuthUser | null {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return auth;
}

export function isAdmin(auth: AuthUser): boolean {
  return auth.role === 'admin' || auth.role === 'head_admin';
}

/** Require admin role; returns 403 if not. Call after requireAuth. */
export function requireAdmin(req: Request, res: Response): AuthUser | null {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  if (!isAdmin(auth)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return auth;
}

/** Require requester to be the resource owner or admin. Call after requireAuth. Returns false and sends 403 if not allowed. */
export function requireOwnerOrAdmin(req: Request, res: Response, resourceOwner: string): boolean {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  const ownerLower = (resourceOwner || '').toLowerCase();
  const selfLower = auth.username.toLowerCase();
  if (ownerLower !== selfLower && !isAdmin(auth)) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}
