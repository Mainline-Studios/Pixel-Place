/**
 * Web Deploy Services — Google sign-in only; separate from Pixel Place users/JWT.
 */
import type { Express } from 'express';
import * as admin from 'firebase-admin';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './authMiddleware';

export const WEB_DEPLOY_JWT_AUD = 'pp_web_deploy';

type Collections = { WEB_DEPLOY_ACCOUNTS: string };

export type WebDeployAuthUser = {
  deployUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
};

function signWebDeployToken(account: WebDeployAuthUser): string {
  return jwt.sign(
    {
      aud: WEB_DEPLOY_JWT_AUD,
      deployUid: account.deployUid,
      email: account.email,
      displayName: account.displayName,
      photoURL: account.photoURL || null,
      role: 'deploy_user',
    },
    getJwtSecret(),
    { expiresIn: '30d' },
  );
}

export function getWebDeployAuthFromRequest(req: Request): WebDeployAuthUser | null {
  const secret = getJwtSecret();
  if (secret === 'your-secret-key-change-in-production') return null;
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }
  if (!token) {
    const x = req.headers['x-auth-token'];
    if (typeof x === 'string' && x.trim()) token = x.trim();
  }
  if (!token) {
    const body = req.body as { authToken?: unknown } | undefined;
    if (typeof body?.authToken === 'string' && body.authToken.trim()) token = body.authToken.trim();
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, secret) as {
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

export function requireWebDeployAuth(req: Request, res: Response): WebDeployAuthUser | null {
  const auth = getWebDeployAuthFromRequest(req);
  if (!auth) {
    res.status(401).json({ error: 'Sign in with Google on Web Deploy Services' });
    return null;
  }
  return auth;
}

const googleAuthHandler = async (
  req: Request,
  res: Response,
  db: admin.firestore.Firestore,
  collections: Collections,
) => {
  const idToken = String(req.body?.idToken ?? '').trim();
  if (!idToken) return res.status(400).json({ error: 'ID token required' });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const deployUid = decoded.uid;
    const email = String(decoded.email ?? '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Google account must have an email address' });
    }
    const displayName = String(decoded.name || email.split('@')[0] || 'Deploy user').trim();
    const photoURL = String(decoded.picture || '').trim() || undefined;
    const now = Date.now();

    const accountRef = db.collection(collections.WEB_DEPLOY_ACCOUNTS).doc(deployUid);
    const existing = await accountRef.get();
    const accountPayload: Record<string, unknown> = {
      deploy_uid: deployUid,
      email,
      display_name: displayName,
      photo_url: photoURL || null,
      last_login_at: now,
      updated_at: now,
    };
    if (!existing.exists) accountPayload.created_at = now;
    await accountRef.set(accountPayload, { merge: true });

    const account: WebDeployAuthUser = { deployUid, email, displayName, photoURL };
    const token = signWebDeployToken(account);
    res.json({
      success: true,
      token,
      session: account,
    });
  } catch (e) {
    console.error('web-deploy-auth/google failed:', e);
    res.status(401).json({ error: 'Google sign-in failed' });
  }
};

export function mountWebDeployAuthRoutes(
  app: Express,
  db: admin.firestore.Firestore,
  collections: Collections,
) {
  const handler = (req: Request, res: Response) => googleAuthHandler(req, res, db, collections);
  app.post('/web-deploy-auth/google', handler);
  app.post('/api/web-deploy-auth/google', handler);
}
