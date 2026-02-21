/**
 * Auth middleware for Cloud Functions. Identity from JWT only — never trust username from query/body.
 */
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  username: string;
  role: string;
}

export function getAuthFromRequest(req: Request): AuthUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username?: string; role?: string };
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
