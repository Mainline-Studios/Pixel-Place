import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/AppError.js';



export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {

  const role = req.auth?.role;

  if (role !== 'admin' && role !== 'head_admin') {

    next(new AppError('Forbidden', 403, 'FORBIDDEN'));

    return;

  }

  next();

}


