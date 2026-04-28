import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { verifyAccessToken } from '../auth/jwt.js';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; username: string; role: string };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = bearer || (typeof req.query.access_token === 'string' ? req.query.access_token : undefined);
    if (!token) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch {
    next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
}
