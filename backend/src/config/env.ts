import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  /** Public URL of the API (used in OAuth redirects) */
  API_PUBLIC_URL: z.string().url().optional(),
  /** Where to send the browser after Google OAuth (hash will contain access_token=...) */
  OAUTH_SUCCESS_REDIRECT: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  /** Apple Sign-In (verify later; optional URL for JWKS if needed) */
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  SOCKET_PATH: z.string().default('/socket.io'),

  /** Published legal doc versions — must match consent records */
  LEGAL_TERMS_VERSION: z.string().default('2026-04-22'),
  LEGAL_PRIVACY_VERSION: z.string().default('2026-04-22'),
  /**
   * Optional 32-byte key (base64) for AES-256-GCM envelopes (`lib/cryptoAtRest`).
   * Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   */
  DATA_ENCRYPTION_KEY: z.string().optional(),
  /** When deleting an account, factions they created transfer to this user (otherwise first admin). */
  ACCOUNT_TRANSFER_USER_ID: z.string().optional(),

  /** Redis — Socket.IO adapter, HTTP cache, BullMQ (optional; omit for single-node dev) */
  REDIS_URL: z.string().url().optional(),
  /** Leaderboard HTTP cache TTL (seconds) when Redis enabled */
  LEADERBOARD_CACHE_TTL_SEC: z.coerce.number().min(1).max(120).default(5),
  /** Territory socket batch window (ms) */
  TERRITORY_BATCH_MS: z.coerce.number().min(10).max(500).default(55),
  /** Max patches per territory batch before immediate flush */
  TERRITORY_BATCH_MAX: z.coerce.number().min(5).max(500).default(120),
  /** Debounce leaderboard Socket push after territory changes (ms) */
  LEADERBOARD_EMIT_DEBOUNCE_MS: z.coerce.number().min(50).max(5000).default(220),

  /** Stripe (optional — billing disabled if secret missing) */
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  /** Recurring premium — subscription (no pay-to-win: cosmetic + 1 private canvas; no faster pixels) */
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().optional(),
  /** One-time: UI theme pack (cosmetic) */
  STRIPE_PRICE_COSMETIC_THEMES: z.string().optional(),
  /** One-time: ~10% faster pixel cooldown, hard-capped with free-to-play floor (see lib/billing) */
  STRIPE_PRICE_COOLDOWN_BOOST: z.string().optional(),
  /** One-time: +1 private canvas slot (convenience) */
  STRIPE_PRICE_PRIVATE_CANVAS_SLOT: z.string().optional(),
  /** Return URL after checkout (e.g. http://localhost:3000) */
  BILLING_FRONTEND_BASE_URL: z.string().url().optional(),

  /** Cloudflare Turnstile (optional — CAPTCHA verification disabled without secret) */
  TURNSTILE_SECRET_KEY: z.string().optional(),
  /** When true, skips abuse gates (development only). */
  ABUSE_CHECKS_DISABLED: z.preprocess(
    (v) => v === undefined || v === '' ? undefined : String(v).toLowerCase(),
    z.enum(['true', 'false', '1', '0']).optional()
  ).transform((v) => v === 'true' || v === '1'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}

export const env = loadEnv();
