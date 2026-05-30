import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { WEB_DEPLOY_JWT_AUD, type WebDeploySession } from '@/lib/webDeployAuth';

const DEFAULT_JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

function isUnsafeJwtSecret(): boolean {
  return !process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_JWT_SECRET;
}

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const t = authHeader.slice(7).trim();
    if (t) return t;
  }
  const x = request.headers.get('x-auth-token');
  if (x?.trim()) return x.trim();
  return null;
}

export function verifyWebDeployToken(token: string): WebDeploySession | null {
  if (isUnsafeJwtSecret()) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      aud?: string;
      deployUid?: string;
      email?: string;
      displayName?: string;
      photoURL?: string | null;
    };
    if (decoded.aud !== WEB_DEPLOY_JWT_AUD) return null;
    if (!decoded.deployUid || !decoded.email) return null;
    return {
      deployUid: String(decoded.deployUid),
      email: String(decoded.email),
      displayName: String(decoded.displayName || decoded.email.split('@')[0] || 'User'),
      photoURL: decoded.photoURL ? String(decoded.photoURL) : undefined,
    };
  } catch {
    return null;
  }
}

export function getWebDeployAuthFromRequest(request: NextRequest): WebDeploySession | null {
  const token = extractToken(request);
  if (!token) return null;
  return verifyWebDeployToken(token);
}

export function signWebDeployToken(session: WebDeploySession): string {
  if (process.env.NODE_ENV === 'production' && isUnsafeJwtSecret()) {
    throw new Error('JWT_SECRET is not configured securely');
  }
  return jwt.sign(
    {
      aud: WEB_DEPLOY_JWT_AUD,
      deployUid: session.deployUid,
      email: session.email,
      displayName: session.displayName,
      photoURL: session.photoURL || null,
      role: 'deploy_user',
    },
    JWT_SECRET,
    { expiresIn: '30d' },
  );
}
