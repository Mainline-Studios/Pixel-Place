import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { healthRouter } from './routes/v1/health.js';
import { authRouter } from './routes/v1/auth.js';
import { usersRouter } from './routes/v1/users.js';
import { progressionRouter } from './routes/v1/progression.js';
import { factionsRouter } from './routes/v1/factions.js';
import { seasonsRouter } from './routes/v1/seasons.js';
import { leaderboardsRouter } from './routes/v1/leaderboards.js';
import { territoryRouter } from './routes/v1/territory.js';
import { billingRouter, stripeWebhookHandler } from './routes/v1/billing.js';
import { adminAbuseRouter } from './routes/v1/adminAbuse.js';
import { adminDashboardRouter } from './routes/v1/adminDashboard.js';
import { privacyRouter } from './routes/v1/privacy.js';
import { familyRouter } from './routes/v1/family.js';

export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    })
  );

  app.post(
    '/api/v1/billing/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
      void stripeWebhookHandler(req, res).catch(next);
    }
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info(
        {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          ms: Date.now() - start,
        },
        'http_request'
      );
    });
    next();
  });

  app.use(globalLimiter);

  const v1 = express.Router();
  v1.use(healthRouter);
  v1.use(authRouter);
  v1.use(usersRouter);
  v1.use(privacyRouter);
  v1.use(familyRouter);
  v1.use(progressionRouter);
  v1.use(factionsRouter);
  v1.use(seasonsRouter);
  v1.use(leaderboardsRouter);
  v1.use(territoryRouter);
  v1.use(billingRouter);
  v1.use(adminAbuseRouter);
  v1.use(adminDashboardRouter);

  app.use('/api/v1', v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
