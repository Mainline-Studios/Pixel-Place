import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../../lib/prisma.js';
import { validateRequest } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { AppError } from '../../errors/AppError.js';
import { signAccessToken } from '../../auth/jwt.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { nestedCreateForNewUser } from '../../lib/userLifecycle.js';
import { effectiveRoleForBuiltinAccount } from '../../lib/builtinAdminRole.js';

export const authRouter = Router();

const registerSchema = z.object({
  username: z.string().min(2).max(32),
  password: z.string().min(6).max(128),
  email: z.string().email().optional(),
  gender: z.string().max(32).optional(),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

function uniqueUsernameBase(base: string): string {
  const cleaned = base.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) || 'player';
  return cleaned;
}

async function ensureUniqueUsername(base: string): Promise<string> {
  let candidate = uniqueUsernameBase(base);
  let n = 0;
  for (;;) {
    const lower = candidate.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { usernameLower: lower } });
    if (!exists) return candidate;
    n += 1;
    candidate = `${uniqueUsernameBase(base)}_${n}`;
  }
}

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value ?? undefined;
          let user = await prisma.user.findFirst({
            where: {
              OR: [{ googleId }, ...(email ? [{ email }] : [])],
            },
          });

          if (!user) {
            const username = await ensureUniqueUsername(profile.displayName || `g_${googleId}`);
            user = await prisma.user.create({
              data: {
                username,
                usernameLower: username.toLowerCase(),
                googleId,
                email: email ?? null,
                ownedSkins: ['starter_classic'],
                equippedSkin: 'starter_classic',
                ...nestedCreateForNewUser(),
              },
            });
          } else if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId, email: email ?? user.email },
            });
          }

          done(null, {
            id: user.id,
            username: user.username,
            role: user.role,
          });
        } catch (e) {
          done(e as Error);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth disabled: set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL');
}

authRouter.post(
  '/auth/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  async (req, res, next) => {
    try {
      const body = registerSchema.parse(req.body);
      const usernameLower = body.username.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { usernameLower } });
      if (existing) throw new AppError('Username already taken', 409, 'USERNAME_TAKEN');

      if (body.email) {
        const emailTaken = await prisma.user.findUnique({ where: { email: body.email } });
        if (emailTaken) throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');
      }

      const passwordHash = await bcrypt.hash(body.password, 12);
      const user = await prisma.user.create({
        data: {
          username: body.username,
          usernameLower,
          passwordHash,
          gender: body.gender ?? '',
          email: body.email ?? null,
          ownedSkins: ['starter_classic'],
          equippedSkin: 'starter_classic',
          ...nestedCreateForNewUser(),
        },
      });

      const token = signAccessToken({
        sub: user.id,
        username: user.username,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        data: {
          accessToken: token,
          tokenType: 'Bearer',
          user: { id: user.id, username: user.username, role: user.role },
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

authRouter.post(
  '/auth/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const body = loginSchema.parse(req.body);
      const user = await prisma.user.findUnique({
        where: { usernameLower: body.username.toLowerCase() },
      });
      if (!user?.passwordHash) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

      const ok = await bcrypt.compare(body.password, user.passwordHash);
      if (!ok) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

      const role = effectiveRoleForBuiltinAccount(user.username, user.role);
      if (role !== user.role) {
        await prisma.user.update({ where: { id: user.id }, data: { role } });
      }

      const token = signAccessToken({
        sub: user.id,
        username: user.username,
        role,
      });

      res.json({
        success: true,
        data: {
          accessToken: token,
          tokenType: 'Bearer',
          user: { id: user.id, username: user.username, role },
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

authRouter.get('/auth/google', authLimiter, (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID) {
    next(new AppError('Google OAuth not configured', 503, 'OAUTH_UNAVAILABLE'));
    return;
  }
  const state = randomBytes(24).toString('hex');
  res.cookie('pp_oauth_state', state, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600_000,
    path: '/',
  });
  passport.authenticate('google', { scope: ['profile', 'email'], session: false, state })(req, res, next);
});

authRouter.get(
  '/auth/google/callback',
  authLimiter,
  (req, res, next) => {
    if (!env.GOOGLE_CLIENT_ID) {
      next(new AppError('Google OAuth not configured', 503, 'OAUTH_UNAVAILABLE'));
      return;
    }
    const returned = typeof req.query.state === 'string' ? req.query.state : '';
    const expected = req.cookies?.pp_oauth_state as string | undefined;
    if (!returned || !expected || returned !== expected) {
      next(new AppError('Invalid OAuth state', 403, 'OAUTH_STATE'));
      return;
    }
    res.clearCookie('pp_oauth_state', { path: '/' });
    next();
  },
  (req, res, next) => {
    passport.authenticate('google', { session: false, failureRedirect: '/api/v1/auth/google/failure' })(
      req,
      res,
      next
    );
  },
  async (req, res, next) => {
    try {
      const user = req.user;
      if (!user?.id) throw new AppError('OAuth failed', 401, 'OAUTH_FAILED');

      const token = signAccessToken({
        sub: user.id,
        username: user.username,
        role: user.role,
      });

      const redirectBase = env.OAUTH_SUCCESS_REDIRECT || 'http://localhost:3000/';
      const url = new URL(redirectBase);
      url.hash = `access_token=${encodeURIComponent(token)}&token_type=Bearer`;
      res.redirect(url.toString());
    } catch (e) {
      next(e);
    }
  }
);

authRouter.get('/auth/google/failure', (_req, res) => {
  res.status(401).json({
    success: false,
    error: { code: 'OAUTH_FAILED', message: 'Google sign-in failed' },
  });
});

const appleSchema = z.object({
  idToken: z.string().min(10),
});

authRouter.post(
  '/auth/oauth/apple',
  authLimiter,
  validateRequest({ body: appleSchema }),
  async (_req, res) => {
    res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message:
          'Apple Sign-In token verification is not wired yet. Add jwks-rsa / apple verification and map appleId on User.',
      },
    });
  }
);
