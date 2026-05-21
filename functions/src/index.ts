/**
 * Firebase Cloud Functions - API backend for Pixel Place static export
 * Deploy: firebase deploy --only functions
 * URL: https://us-central1-pixel-place-823b1.cloudfunctions.net/api
 */
import path from 'path';
import { randomBytes, randomUUID, createHash } from 'crypto';
import { config as loadEnv } from 'dotenv';

// Load functions/.env (no deprecated functions.config() - works after March 2026)
loadEnv({ path: path.join(__dirname, '..', '.env') });

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { dispatchLoginCodeEmail, maskEmailForDisplay } from './loginCodeEmail';

admin.initializeApp();
const firestoreDb = admin.firestore();
const realtimeDb = admin.database();
const COLLECTIONS = {
  USERS: 'users',
  USER_DEVICES: 'user_devices',
  DEVICE_USERS: 'device_users',
  HARDWARE_BANS: 'hardware_bans',
  SKINS_CATALOG: 'skins_catalog',
  USER_SAFETY: 'user_safety',
  PUBLISHED_GAMES: 'published_games',
  TAB_CONTENT: 'tab_content',
  BANS: 'bans',
  REPORTS: 'reports',
  APPEALS: 'ban_appeals',
  APPEAL_MESSAGES: 'appeal_messages',
  MESSAGES: 'messages',
  FRIENDS: 'friends',
  ACCESSORIES_CATALOG: 'accessories_catalog',
  GAMES: 'games',
  SCENES: 'scenes',
  DRAFTS: 'drafts',
  PREBUILT_GAMES: 'prebuilt_games',
  GAME_SUBMISSIONS: 'game_submissions',
  PRESENCE: 'presence',
  GAME_SESSIONS: 'game_sessions',
  STATUS_PAGE: 'status_page',
  STRIPE_PAYMENT_CREDITS: 'stripe_payment_credits',
};

const RTDB_COLLECTIONS = new Set<string>(['users', 'bans', 'hardware_bans', 'skins_catalog']);
const storageBucket = admin.storage().bucket();
const STORAGE_SIGNED_URL_MS = 15 * 60 * 1000;
const STORAGE_PATH_MAX = 220;
const EMAIL_VERIFY_CODE_TTL_MS = 20 * 60 * 1000;
const EMAIL_VERIFY_RESEND_COOLDOWN_MS = 45 * 1000;
const EMAIL_VERIFY_REWARD_COINS = 20;
const LOGIN_CODE_TTL_MS = 10 * 60 * 1000;
const LOGIN_CODE_RESEND_COOLDOWN_MS = 45 * 1000;

type WhereOperator = '==' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any';
type QueryState = {
  where: Array<{ field: string; operator: WhereOperator; value: any }>;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
};

function isRtdbCollection(name: string): boolean {
  return RTDB_COLLECTIONS.has(name);
}

function rtdbRows(payload: any): Array<{ id: string } & Record<string, any>> {
  if (!payload || typeof payload !== 'object') return [];
  return Object.entries(payload).map(([id, value]) => ({ id, ...(value as Record<string, any>) }));
}

function applyRtdbWhere(rows: Array<{ id: string } & Record<string, any>>, where: QueryState['where']) {
  return rows.filter((row) =>
    where.every(({ field, operator, value }) => {
      const current = row[field];
      switch (operator) {
        case '==':
          return current === value;
        case '<':
          return current < value;
        case '<=':
          return current <= value;
        case '>':
          return current > value;
        case '>=':
          return current >= value;
        case 'array-contains':
          return Array.isArray(current) && current.includes(value);
        case 'in':
          return Array.isArray(value) && value.includes(current);
        case 'array-contains-any':
          return Array.isArray(current) && Array.isArray(value) && value.some((v) => current.includes(v));
        default:
          return false;
      }
    }),
  );
}

function applyRtdbOrderLimit(rows: Array<{ id: string } & Record<string, any>>, state: QueryState) {
  const out = [...rows];
  if (state.orderBy) {
    const { field, direction } = state.orderBy;
    out.sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av > bv ? 1 : -1;
      return direction === 'desc' ? -cmp : cmp;
    });
  }
  if (typeof state.limit === 'number' && state.limit >= 0) return out.slice(0, state.limit);
  return out;
}

async function resolveRtdbCollection(collectionName: string, state?: QueryState) {
  const snap = await realtimeDb.ref(collectionName).get();
  const docs = rtdbRows(snap.val());
  const byId = new Map<string, Record<string, any>>();
  docs.forEach((doc) => byId.set(doc.id, doc));
  try {
    const fsSnap = await firestoreDb.collection(collectionName).get();
    fsSnap.docs.forEach((d: any) => {
      if (!byId.has(d.id)) byId.set(d.id, { id: d.id, ...(d.data() || {}) });
    });
  } catch (error) {
    console.warn(`Firestore fallback read failed for ${collectionName}:`, error);
  }
  const merged = Array.from(byId.values()) as Array<{ id: string } & Record<string, any>>;
  if (!state) return merged;
  return applyRtdbOrderLimit(applyRtdbWhere(merged, state.where), state);
}

function createRtdbDocRef(collectionName: string, docId: string) {
  return {
    id: docId,
    async get() {
      const snap = await realtimeDb.ref(`${collectionName}/${docId}`).get();
      if (!snap.exists()) {
        try {
          const fsDoc = await firestoreDb.collection(collectionName).doc(docId).get();
          if (fsDoc.exists) return { exists: true, id: docId, data: () => fsDoc.data() || {}, ref: this };
        } catch (error) {
          console.warn(`Firestore fallback doc read failed for ${collectionName}/${docId}:`, error);
        }
        return { exists: false, id: docId, data: () => undefined };
      }
      const value = snap.val();
      const dataObj = value && typeof value === 'object' ? value : { value };
      return { exists: true, id: docId, data: () => dataObj, ref: this };
    },
    async set(data: any, options?: { merge?: boolean }) {
      if (options?.merge) {
        await realtimeDb.ref(`${collectionName}/${docId}`).update(data);
      } else {
        await realtimeDb.ref(`${collectionName}/${docId}`).set(data);
      }
    },
    async update(data: any) {
      await realtimeDb.ref(`${collectionName}/${docId}`).update(data);
    },
    async delete() {
      await realtimeDb.ref(`${collectionName}/${docId}`).remove();
    },
  };
}

function createRtdbCollectionRef(collectionName: string, state?: QueryState): any {
  const q: QueryState = state || { where: [] };
  return {
    id: collectionName,
    doc(docId: string) {
      return createRtdbDocRef(collectionName, docId);
    },
    async add(data: any) {
      const pushed = realtimeDb.ref(collectionName).push();
      await pushed.set(data);
      return { id: String(pushed.key || ''), key: String(pushed.key || '') };
    },
    where(field: string, operator: WhereOperator, value: any) {
      q.where.push({ field, operator, value });
      return createRtdbCollectionRef(collectionName, q);
    },
    orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
      q.orderBy = { field, direction };
      return createRtdbCollectionRef(collectionName, q);
    },
    limit(n: number) {
      q.limit = Number(n);
      return createRtdbCollectionRef(collectionName, q);
    },
    async get() {
      const docs = await resolveRtdbCollection(collectionName, q);
      return {
        docs: docs.map((d) => ({
          id: d.id,
          data: () => d,
          exists: true,
          ref: createRtdbDocRef(collectionName, d.id),
        })),
        empty: docs.length === 0,
        size: docs.length,
      };
    },
  };
}

function createHybridBatch() {
  const writes: Array<() => Promise<any>> = [];
  return {
    set(ref: any, data: any, options?: { merge?: boolean }) {
      writes.push(() => ref.set(data, options));
      return this;
    },
    update(ref: any, data: any) {
      writes.push(() => ref.update(data));
      return this;
    },
    delete(ref: any) {
      writes.push(() => ref.delete());
      return this;
    },
    async commit() {
      for (const write of writes) await write();
    },
  };
}

function sanitizeStoragePath(input: unknown): string | null {
  const raw = String(input || '').trim().replace(/^\/+/, '');
  if (!raw || raw.length > STORAGE_PATH_MAX) return null;
  if (raw.includes('..') || raw.includes('\\')) return null;
  if (!/^[a-zA-Z0-9/_\-. ]+$/.test(raw)) return null;
  return raw.replace(/\s+/g, '_');
}

function canAccessStoragePath(path: string, auth: any): boolean {
  const user = String(auth?.username || '').toLowerCase();
  const role = String(auth?.role || '').toLowerCase();
  if (!user) return false;
  if (path.startsWith(`users/${user}/`) || path.startsWith('public/')) return true;
  return role === 'admin' || role === 'head_admin';
}

function getBearerTokenFromRequest(req: any): string {
  return extractAuthTokenFromRequest(req);
}

async function isJwtRevokedForUser(username: string, iatSeconds: number): Promise<boolean> {
  if (!username || !iatSeconds) return false;
  const doc = await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).get();
  if (!doc.exists) return true;
  const d = doc.data() || {};
  const revokedBefore = Number(d.token_revoked_before || 0);
  if (!Number.isFinite(revokedBefore) || revokedBefore <= 0) return false;
  return iatSeconds * 1000 <= revokedBefore;
}

function normalizeEmail(input: unknown): string {
  return String(input || '').trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashVerificationCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

function isAccountEmailVerified(d: Record<string, unknown>): boolean {
  if (d.email_verified === true || d.emailVerified === true) return true;
  const verifiedAt = Number(d.email_verified_at || 0);
  if (Number.isFinite(verifiedAt) && verifiedAt > 0) return true;
  const rewardedAt = Number(d.email_verification_rewarded_at || 0);
  if (Number.isFinite(rewardedAt) && rewardedAt > 0) return true;
  return false;
}

/** Backfill email_verified for accounts that completed verification before the flag was stored. */
async function syncAccountEmailVerifiedFlag(
  doc: admin.firestore.DocumentSnapshot,
  d: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (isAccountEmailVerified(d)) {
    if (d.email_verified !== true) {
      const now = Date.now();
      await doc.ref.set({ email_verified: true, email_verified_at: d.email_verified_at || now, updated_at: now }, { merge: true });
      return { ...d, email_verified: true, email_verified_at: d.email_verified_at || now };
    }
    return d;
  }
  return d;
}

function userNeedsLoginCode(d: Record<string, unknown>): boolean {
  if (!isAccountEmailVerified(d)) return false;
  const email = normalizeEmail(d.email);
  return isValidEmail(email);
}

async function completePasswordLoginResponse(
  doc: any,
  usernameLower: string,
  rawData: Record<string, unknown>,
) {
  const founder = await applyFounderRewardsAndConsumeCelebration(usernameLower, rawData);
  const user = {
    ...userFromDoc(doc),
    coins: founder.data.coins ?? rawData.coins ?? 0,
    founderLifetimeCoins: founder.data.founder_lifetime_coins === true,
    founderOrdinal:
      typeof founder.data.founder_ordinal === 'number' ? founder.data.founder_ordinal : undefined,
    showFounderCelebration: founder.showCelebration,
  };

  if (!userNeedsLoginCode(rawData)) {
    if (isAccountEmailVerified(rawData) && !isValidEmail(normalizeEmail(rawData.email))) {
      return {
        success: false,
        error:
          'Your email is verified but no email address is saved. Open Settings → Safety & Privacy, add your email, and request verification again.',
      };
    }
    const token = jwt.sign({ username: user.username, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
    return {
      success: true,
      user,
      token,
      requiresLoginCode: false,
      emailVerified: isAccountEmailVerified(rawData),
    };
  }

  const email = normalizeEmail(rawData.email);
  const now = Date.now();
  const lastSent = Number(rawData.login_code_last_sent_at || 0);
  if (now - lastSent < LOGIN_CODE_RESEND_COOLDOWN_MS) {
    return {
      success: false,
      error: 'Please wait before requesting another login code',
      retryAfterMs: LOGIN_CODE_RESEND_COOLDOWN_MS - (now - lastSent),
    };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const nonce = randomBytes(12).toString('hex');
  let delivery: { sent: boolean; provider?: string };
  try {
    delivery = await dispatchLoginCodeEmail({ to: email, username: user.username, code });
  } catch (err: any) {
    console.error('[login-code] Failed to send:', err);
    return {
      success: false,
      error: String(err?.message || 'Login code email was not sent. Try again in a moment or contact support.'),
    };
  }
  if (!delivery.sent) {
    return {
      success: false,
      error: 'Login code email was not sent. Try again in a moment or contact support.',
    };
  }

  await doc.ref.set(
    {
      login_code_hash: hashVerificationCode(code),
      login_code_nonce: nonce,
      login_code_expires_at: now + LOGIN_CODE_TTL_MS,
      login_code_last_sent_at: now,
      login_code_attempts: 0,
      updated_at: now,
    },
    { merge: true },
  );

  const challengeToken = jwt.sign(
    { purpose: 'login_code', username: usernameLower, nonce },
    getJwtSecret(),
    { expiresIn: '10m' },
  );

  return {
    success: true,
    requiresLoginCode: true,
    challengeToken,
    maskedEmail: maskEmailForDisplay(email),
    user,
    emailVerified: true,
  };
}

function getEmailVerificationSecret(): string {
  return process.env.EMAIL_VERIFICATION_SECRET || getJwtSecret();
}

function isFunctionsEmulator(): boolean {
  return process.env.FUNCTIONS_EMULATOR === 'true';
}

function isDeployedFunctionsRuntime(): boolean {
  return Boolean(
    process.env.K_SERVICE ||
      process.env.FUNCTION_TARGET ||
      process.env.GCLOUD_PROJECT ||
      process.env.NODE_ENV === 'production',
  );
}

function getVerificationMailFrom(): { from: string; fromEmail: string; fromName: string } {
  const fromEmail = String(process.env.EMAIL_VERIFICATION_FROM || 'boehmlaird@gmail.com').trim();
  const fromName = String(process.env.EMAIL_VERIFICATION_FROM_NAME || 'Pixel Place').trim();
  const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  return { from, fromEmail, fromName };
}

function verificationMailHeaders(to: string): Record<string, string> {
  const support = String(process.env.EMAIL_VERIFICATION_REPLY_TO || 'support@pixelplaceofficial.com').trim();
  return {
    'X-Priority': '1',
    'X-MSMail-Priority': 'High',
    Importance: 'high',
    'Auto-Submitted': 'auto-generated',
    Precedence: 'auto',
    ...(support ? { 'Reply-To': support } : {}),
    ...(to ? { 'X-Entity-Ref-ID': `pixelplace-verify-${createHash('sha256').update(to).digest('hex').slice(0, 16)}` } : {}),
  };
}

function buildVerificationMessage(params: {
  username: string;
  code: string;
  magicLink: string;
  email: string;
}): { subject: string; text: string; html: string } {
  const subject = `Your Pixel Place verification code: ${params.code}`;
  const recoverUrl = 'https://pixelplaceofficial.com/signoutall';
  const text =
    `Verify Your Pixel Place Account\n\n` +
    `Welcome to Pixel Place! To complete your account setup, please use the magic link or secret code below.\n` +
    `Magic Link:\n` +
    `${params.magicLink}\n` +
    `Or use your one-time code\n` +
    `One Time code:\n${params.code}\n` +
    `This code is valid for a limited time. If the link or code expires, you can request a new one.\n` +
    `If this looks suspicious or you didn’t choose to verify your account, click\n` +
    `Recover and Sign Out:\n${recoverUrl}\n\n` +
    `Pixel Place Customer Support\nThis is an automated message. Please do not reply directly.\nPixel Place by Mainline Studios`;
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f0f1f5;font-family:'Open Sans',Arial,Helvetica,sans-serif;color:#3d3a3b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f1f5;padding:20px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
            <tr>
              <td style="padding:16px 24px;background:#e3e8e8;text-align:right;font-size:18px;font-weight:700;">
                Verify Your Pixel Place Account
              </td>
            </tr>
            <tr>
              <td style="padding:24px;text-align:center;line-height:1.5;">
                <p>Welcome to Pixel Place! To complete your account setup, please use the magic link or secret code below.</p>
                <p style="margin-top:14px;">Magic Link:</p>
                <p style="margin-top:12px;">
                  <a href="${params.magicLink}" target="_blank" rel="noopener" style="display:inline-block;padding:13px 28px;border-radius:999px;background:linear-gradient(90deg,#c840d4,#e970f7,#f7b5fd);color:#fff;text-decoration:none;font-size:18px;">
                    Click Here
                  </a>
                </p>
                <p style="margin-top:18px;">Or use your one-time code</p>
                <p style="font-size:18px;font-weight:700;letter-spacing:1.2px;">One Time code:<br>${params.code}</p>
                <p>This code is valid for a limited time. If the link or code expires, you can request a new one.</p>
                <p>If this looks suspicious or you didn’t choose to verify your account, click</p>
                <p style="margin-top:12px;">
                  <a href="${recoverUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 24px;border-radius:12px;border:2px solid #343434;background:#c2e1ff;color:#000;text-decoration:none;font-size:18px;">
                    Recover and Sign Out
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;background:#cdd3d8;text-align:center;font-size:11px;line-height:1.4;color:#000;">
                Pixel Place Customer Support<br>
                This is an automated message. Please do not reply directly.<br>
                Pixel Place by Mainline Studios
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return { subject, text, html };
}

async function dispatchVerificationEmail(payload: {
  to: string;
  username: string;
  code: string;
  magicLink: string;
}): Promise<{ sent: boolean; preview?: any; provider?: string }> {
  const webhookUrl = String(process.env.EMAIL_VERIFICATION_WEBHOOK_URL || '').trim();
  const resendApiKey = String(process.env.RESEND_API_KEY || process.env.EMAIL_VERIFICATION_RESEND_API_KEY || '').trim();
  const { from, fromEmail } = getVerificationMailFrom();
  const smtpUser = String(process.env.EMAIL_VERIFICATION_SMTP_USER || fromEmail || '').trim();
  const smtpPass = String(
    process.env.EMAIL_VERIFICATION_SMTP_PASS || process.env.EMAIL_VERIFICATION_FROM_APP_PASSWORD || '',
  )
    .trim()
    .replace(/\s+/g, '');
  const message = buildVerificationMessage({
    username: payload.username,
    code: payload.code,
    magicLink: payload.magicLink,
    email: payload.to,
  });
  const headers = verificationMailHeaders(payload.to);

  if (webhookUrl) {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        template: 'email_verification',
        vars: {
          username: payload.username,
          code: payload.code,
          magicLink: payload.magicLink,
          rewardCoins: EMAIL_VERIFY_REWARD_COINS,
        },
      }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`Email webhook failed (${resp.status})${body ? `: ${body.slice(0, 200)}` : ''}`);
    }
    return { sent: true, provider: 'webhook' };
  }

  if (resendApiKey) {
    const resendFrom =
      String(process.env.EMAIL_VERIFICATION_RESEND_FROM || '').trim() || from;
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [payload.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const detail = String((data as { message?: string })?.message || resp.status);
      throw new Error(`Resend failed: ${detail}`);
    }
    return { sent: true, provider: 'resend' };
  }

  if (smtpUser && smtpPass) {
    const smtpHost = String(process.env.EMAIL_VERIFICATION_SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = Number(process.env.EMAIL_VERIFICATION_SMTP_PORT || 465);
    const smtpSecure = process.env.EMAIL_VERIFICATION_SMTP_SECURE !== 'false';
    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transport.verify().catch((err) => {
      console.error('[email] SMTP verify failed:', err);
      throw new Error(
        'SMTP login failed. Use a Gmail App Password (not your normal password) and set EMAIL_VERIFICATION_SMTP_USER to the same address as EMAIL_VERIFICATION_FROM.',
      );
    });
    const info = await transport.sendMail({
      from,
      to: payload.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      headers,
      envelope: { from: smtpUser, to: payload.to },
    });
    const rejected = Array.isArray((info as { rejected?: string[] })?.rejected)
      ? (info as { rejected: string[] }).rejected
      : [];
    if (rejected.length > 0) {
      throw new Error(`SMTP rejected recipient: ${rejected.join(', ')}`);
    }
    return { sent: true, provider: 'smtp' };
  }

  if (isFunctionsEmulator() && !isDeployedFunctionsRuntime()) {
    console.warn('[email] No delivery configured — returning preview only (emulator/local).');
    return {
      sent: false,
      provider: 'preview',
      preview: { from, to: payload.to, ...message, code: payload.code, magicLink: payload.magicLink },
    };
  }

  console.error(
    '[email] Verification email not configured. Set RESEND_API_KEY, EMAIL_VERIFICATION_SMTP_PASS, or EMAIL_VERIFICATION_WEBHOOK_URL in functions/.env then redeploy functions.',
  );
  throw new Error(
    'Email delivery is not configured on the server. An admin must set RESEND_API_KEY or EMAIL_VERIFICATION_SMTP_PASS in functions/.env and redeploy.',
  );
}

const db: any = {
  collection(name: string) {
    if (isRtdbCollection(name)) return createRtdbCollectionRef(name);
    return firestoreDb.collection(name);
  },
  batch() {
    return createHybridBatch();
  },
};

/** Public status page payload (mirrors status-site/status.json). */
const DEFAULT_STATUS_PAGE = {
  updatedAt: '2026-03-24T12:00:00.000Z',
  pixelPlace: {
    status: 'operational' as string,
    title: 'Pixel Place',
    message:
      'We are shipping updates regularly. Play and account services are expected to be available. Check here if something feels off.',
    glowColor: '' as string,
    accentColor: '' as string,
    headerTitle: '' as string,
    headerSubtitle: '' as string,
    customStatusLabel: '' as string,
  },
  maintenance: {
    active: false as boolean,
    message: '' as string,
    accentColor: '' as string,
  },
  urgent: {
    active: false as boolean,
    message: '' as string,
  },
};

const STATUS_ALLOWED = new Set(['operational', 'degraded', 'maintenance', 'outage']);
const STATUS_TITLE_MAX = 200;
const STATUS_MSG_MAX = 5000;
const MAINT_MSG_MAX = 2000;
const URGENT_MSG_MAX = 400;
const HEADER_TITLE_MAX = 120;
const HEADER_SUB_MAX = 400;
const CUSTOM_LABEL_MAX = 64;

function sanitizeStatusHex(v: unknown): string {
  const x = String(v ?? '').trim();
  if (!x) return '';
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(x)) return x;
  return '';
}

function normalizeStatusPagePayload(body: any): { ok: true; data: typeof DEFAULT_STATUS_PAGE } | { ok: false; error: string } {
  const pp = body?.pixelPlace;
  const mt = body?.maintenance;
  if (!pp || typeof pp !== 'object' || !mt || typeof mt !== 'object') {
    return { ok: false, error: 'pixelPlace and maintenance objects required' };
  }
  const status = String(pp.status || 'operational').toLowerCase();
  if (!STATUS_ALLOWED.has(status)) return { ok: false, error: 'Invalid pixelPlace.status' };
  const title = String(pp.title ?? 'Pixel Place').slice(0, STATUS_TITLE_MAX);
  const message = String(pp.message ?? '').slice(0, STATUS_MSG_MAX);
  const glowColor = sanitizeStatusHex(pp.glowColor);
  const accentColor = sanitizeStatusHex(pp.accentColor);
  const headerTitle = String(pp.headerTitle ?? '').slice(0, HEADER_TITLE_MAX);
  const headerSubtitle = String(pp.headerSubtitle ?? '').slice(0, HEADER_SUB_MAX);
  const customStatusLabel = String(pp.customStatusLabel ?? '').slice(0, CUSTOM_LABEL_MAX);
  const active = mt.active === true;
  const mMsg = String(mt.message ?? '').slice(0, MAINT_MSG_MAX);
  const maintAccent = sanitizeStatusHex(mt.accentColor);
  const urgIn = body?.urgent && typeof body.urgent === 'object' ? body.urgent : {};
  const urgentActive = urgIn.active === true;
  const urgentMessage = String(urgIn.message ?? '').slice(0, URGENT_MSG_MAX).trim();
  if (urgentActive && !urgentMessage) {
    return { ok: false, error: 'Urgent banner requires a non-empty message' };
  }
  return {
    ok: true,
    data: {
      updatedAt: new Date().toISOString(),
      pixelPlace: { status, title, message, glowColor, accentColor, headerTitle, headerSubtitle, customStatusLabel },
      maintenance: { active, message: mMsg, accentColor: maintAccent },
      urgent: { active: urgentActive, message: urgentActive ? urgentMessage : '' },
    },
  };
}

function cloneDefaultStatusPage(): typeof DEFAULT_STATUS_PAGE {
  return JSON.parse(JSON.stringify(DEFAULT_STATUS_PAGE)) as typeof DEFAULT_STATUS_PAGE;
}

async function readStatusPagePayload(): Promise<typeof DEFAULT_STATUS_PAGE> {
  const snap = await db.collection(COLLECTIONS.STATUS_PAGE).doc('current').get();
  if (!snap.exists) return cloneDefaultStatusPage();
  const n = normalizeStatusPagePayload(snap.data());
  if (!n.ok) return cloneDefaultStatusPage();
  return n.data;
}

import {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin,
  getAuthFromRequest,
  extractAuthTokenFromRequest,
  isAdmin,
  getJwtSecret,
} from './authMiddleware';
import { postPpafSign, postPpafVerify } from './ppaf';
import { mountAnti67AccountRoutes } from './anti67Account';
import { mountStripeEmbeddedWebhook, mountStripeEmbeddedPayRoutes } from './stripeEmbeddedPay';

const DEVICE_ID_MAX = 128;
const LABEL_MAX = 64;
const FOUNDER_LIMIT = 100;
const FOUNDER_COIN_FLOOR = 1_000_000_000;
let sequentialUserIdsEnsured = false;
let sequentialGameIdsEnsured = false;

function sanitizeDeviceId(id: string): string {
  return String(id).slice(0, DEVICE_ID_MAX).replace(/[^a-zA-Z0-9_-]/g, '');
}

function founderRankFromTopUsers(topUsers: admin.firestore.QueryDocumentSnapshot[], usernameLower: string): number | null {
  const idx = topUsers.findIndex((d) => d.id === usernameLower);
  if (idx === -1) return null;
  return idx + 1;
}

async function getFounderRank(usernameLower: string): Promise<number | null> {
  const q = await db.collection(COLLECTIONS.USERS).orderBy('created_at', 'asc').limit(FOUNDER_LIMIT).get();
  return founderRankFromTopUsers(q.docs, usernameLower);
}

/**
 * Ensure founder reward fields are correct for top 100 users.
 * Returns latest user data and whether the one-time celebration should show this login.
 */
async function applyFounderRewardsAndConsumeCelebration(
  usernameLower: string,
  currentData: any
): Promise<{ data: any; showCelebration: boolean }> {
  let data = { ...(currentData || {}) };
  let changed = false;

  const rank = await getFounderRank(usernameLower);
  const qualifies = typeof rank === 'number' && rank >= 1 && rank <= FOUNDER_LIMIT;
  const now = Date.now();

  if (qualifies) {
    if (data.founder_lifetime_coins !== true) {
      data.founder_lifetime_coins = true;
      changed = true;
    }
    if (data.founder_ordinal !== rank) {
      data.founder_ordinal = rank;
      changed = true;
    }
    const coinsNow = Number(data.coins || 0);
    if (!Number.isFinite(coinsNow) || coinsNow < FOUNDER_COIN_FLOOR) {
      data.coins = FOUNDER_COIN_FLOOR;
      changed = true;
    }
    if (data.founder_celebration_shown_at == null && data.founder_celebration_pending !== true) {
      data.founder_celebration_pending = true;
      changed = true;
    }
  }

  const showCelebration = data.founder_celebration_pending === true;
  if (showCelebration) {
    data.founder_celebration_pending = false;
    data.founder_celebration_shown_at = data.founder_celebration_shown_at || now;
    changed = true;
  }

  if (changed) {
    await db.collection(COLLECTIONS.USERS).doc(usernameLower).set(
      {
        founder_lifetime_coins: !!data.founder_lifetime_coins,
        founder_ordinal: data.founder_ordinal ?? null,
        founder_celebration_pending: !!data.founder_celebration_pending,
        founder_celebration_shown_at: data.founder_celebration_shown_at ?? null,
        coins: data.coins ?? 0,
        updated_at: now,
      },
      { merge: true }
    );
  }

  return { data, showCelebration };
}

async function isDeviceBanned(deviceId: string): Promise<boolean> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return false;
  const doc = await db.collection(COLLECTIONS.HARDWARE_BANS).doc(id).get();
  return doc.exists;
}

/** Get hardware ban details for showing the ban screen (reason, banned_by, banned_at). */
async function getHardwareBanDetails(deviceId: string): Promise<{ reason: string; bannedBy: string; bannedAt: number } | null> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return null;
  const doc = await db.collection(COLLECTIONS.HARDWARE_BANS).doc(id).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    reason: d.reason || 'Access from this browser profile is blocked.',
    bannedBy: d.banned_by || 'Administrator',
    bannedAt: d.banned_at || Date.now(),
  };
}

async function recordDevice(username: string, deviceId: string, label: string): Promise<void> {
  const id = sanitizeDeviceId(deviceId);
  const safeLabel = String(label).slice(0, LABEL_MAX) || 'Unknown';
  if (!id) return;
  const now = Date.now();
  const usernameLower = username.toLowerCase();

  const userDevicesRef = db.collection(COLLECTIONS.USER_DEVICES).doc(usernameLower);
  const userSnap = await userDevicesRef.get();
  const devices: Array<{ deviceId: string; label: string; firstSeen: number; lastSeen: number }> =
    Array.isArray(userSnap.data()?.devices) ? userSnap.data()!.devices : [];
  const existing = devices.find((d: { deviceId: string }) => d.deviceId === id);
  if (existing) {
    existing.lastSeen = now;
    existing.label = safeLabel;
  } else {
    devices.push({ deviceId: id, label: safeLabel, firstSeen: now, lastSeen: now });
  }
  await userDevicesRef.set({ devices, updated_at: now });

  const deviceUsersRef = db.collection(COLLECTIONS.DEVICE_USERS).doc(id);
  const deviceSnap = await deviceUsersRef.get();
  const usernames: string[] = Array.isArray(deviceSnap.data()?.usernames) ? deviceSnap.data()!.usernames : [];
  if (!usernames.includes(usernameLower)) {
    usernames.push(usernameLower);
    await deviceUsersRef.set({ usernames, updated_at: now });
  }
}

/**
 * Expand from one deviceId to every device and username linked through
 * device_users ↔ user_devices (same account on multiple browsers, shared machines, etc.).
 */
async function collectLinkedHardwareNetwork(rootDeviceId: string): Promise<{ deviceIds: string[]; usernames: string[] }> {
  const root = sanitizeDeviceId(rootDeviceId);
  const deviceIds = new Set<string>();
  const usernames = new Set<string>();
  if (!root) return { deviceIds: [], usernames: [] };
  deviceIds.add(root);
  for (let round = 0; round < 32; round++) {
    const dCount = deviceIds.size;
    const uCount = usernames.size;
    for (const d of [...deviceIds]) {
      const snap = await db.collection(COLLECTIONS.DEVICE_USERS).doc(d).get();
      const list: string[] = Array.isArray(snap.data()?.usernames) ? snap.data()!.usernames : [];
      for (const u of list) {
        const ul = String(u).toLowerCase().trim();
        if (ul) usernames.add(ul);
      }
    }
    for (const u of [...usernames]) {
      const snap = await db.collection(COLLECTIONS.USER_DEVICES).doc(u).get();
      const devs: Array<{ deviceId?: string }> = Array.isArray(snap.data()?.devices) ? snap.data()!.devices : [];
      for (const row of devs) {
        const did = sanitizeDeviceId(String(row?.deviceId || ''));
        if (did) deviceIds.add(did);
      }
    }
    if (deviceIds.size === dCount && usernames.size === uCount) break;
  }
  return { deviceIds: [...deviceIds], usernames: [...usernames] };
}

const DEFAULT_SKIN_ID = 'pixel_placer';
const PIXEL_PLACER_SKIN = {
  id: DEFAULT_SKIN_ID,
  name: 'Pixel Placer',
  price: 0,
  use3d: true,
  defaultAnimation: 'idle',
  animations: [
    { name: 'Idle', type: 'idle', loop: true },
    { name: 'Walk', type: 'walk', loop: true },
    { name: 'Jump', type: 'jump', loop: true },
    { name: 'No Animation', type: 'custom', loop: true },
  ],
  colors: { head: '#f4c2a1', torso: '#4d536f', arm: '#3a3f56', legs: '#3a3f56' },
};
const FALLBACK_SKINS = [PIXEL_PLACER_SKIN];

function withPixelPlacerSkin(skins: any[]): any[] {
  if (Array.isArray(skins) && skins.some((skin) => skin?.id === DEFAULT_SKIN_ID)) return skins;
  return [PIXEL_PLACER_SKIN, ...(Array.isArray(skins) ? skins : [])];
}

/** Build user for API response. Never expose password/hash to client. */
function userFromData(id: string, d: any): any {
  if (!d) return null;
  return {
    userId: typeof d.user_id === 'number' ? d.user_id : undefined,
    username: d.username || id,
    password: '',
    gender: d.gender || '',
    role: d.role || 'user',
    coins: d.coins || 0,
    ownedSkins: d.owned_skins || [],
    equippedSkin: d.equipped_skin || '',
    ownedFaces: d.owned_faces || [],
    equippedFace: d.equipped_face || '',
    ownedAccessories: d.owned_accessories || [],
    equippedAccessories: d.equipped_accessories || {},
    ownedServers: d.owned_servers || [],
    friends: d.friends || [],
    friendRequests: d.friend_requests || [],
    sentFriendRequests: d.sent_friend_requests || [],
    favoriteGameIds: d.favorite_game_ids || [],
    chatBlockedWords: d.chat_blocked_words || [],
    email: d.email || '',
    emailVerified: isAccountEmailVerified(d),
    emailVerificationRewardedAt:
      typeof d.email_verification_rewarded_at === 'number' ? d.email_verification_rewarded_at : undefined,
    isDonor: d.is_donor === 1,
    founderLifetimeCoins: d.founder_lifetime_coins === true,
    founderOrdinal: typeof d.founder_ordinal === 'number' ? d.founder_ordinal : undefined,
    ppafLastRestoreIssuedAt:
      typeof d.ppaf_last_restore_issued_at === 'number' ? d.ppaf_last_restore_issued_at : undefined,
    setupCompleted: d.setup_completed !== false,
    accountPreferences:
      d.account_preferences && typeof d.account_preferences === 'object'
        ? d.account_preferences
        : undefined,
  };
}

function userFromDoc(doc: admin.firestore.DocumentSnapshot): any {
  const d = doc.data();
  return userFromData(doc.id, d);
}

/**
 * One-time best-effort backfill: assign sequential numeric user_id values by created_at order.
 * This keeps `/user/:id` stable and aligned with registration order.
 */
async function ensureSequentialUserIds(): Promise<void> {
  if (sequentialUserIdsEnsured) return;
  const snap = await db.collection(COLLECTIONS.USERS).get();
  if (snap.empty) {
    sequentialUserIdsEnsured = true;
    return;
  }
  const docs = [...snap.docs].sort((a, b) => {
    const ac = Number(a.data()?.created_at || 0);
    const bc = Number(b.data()?.created_at || 0);
    if (ac !== bc) return ac - bc;
    return a.id.localeCompare(b.id);
  });
  const batch = db.batch();
  let changed = 0;
  docs.forEach((doc, idx) => {
    const expected = idx + 1;
    const existing = Number(doc.data()?.user_id || 0);
    if (!Number.isFinite(existing) || existing !== expected) {
      batch.set(doc.ref, { user_id: expected, updated_at: Date.now() }, { merge: true });
      changed++;
    }
  });
  if (changed > 0) await batch.commit();
  sequentialUserIdsEnsured = true;
}

async function nextSequentialUserId(): Promise<number> {
  await ensureSequentialUserIds();
  const q = await db.collection(COLLECTIONS.USERS).orderBy('user_id', 'desc').limit(1).get();
  if (q.empty) return 1;
  const current = Number(q.docs[0].data()?.user_id || 0);
  return Number.isFinite(current) && current > 0 ? current + 1 : 1;
}

/**
 * One-time best-effort backfill: assign sequential numeric game_id values by created_at order.
 * This keeps `/game/:id` stable and aligned with creation order.
 */
async function ensureSequentialGameIds(): Promise<void> {
  if (sequentialGameIdsEnsured) return;
  const snap = await db.collection(COLLECTIONS.GAMES).get();
  if (snap.empty) {
    sequentialGameIdsEnsured = true;
    return;
  }
  const docs = [...snap.docs].sort((a, b) => {
    const ad = a.data() || {};
    const bd = b.data() || {};
    const ac = Number(ad.created_at || ad.ts || 0);
    const bc = Number(bd.created_at || bd.ts || 0);
    if (ac !== bc) return ac - bc;
    return a.id.localeCompare(b.id);
  });
  const batch = db.batch();
  let changed = 0;
  docs.forEach((doc, idx) => {
    const expected = idx + 1;
    const existing = Number(doc.data()?.game_id || 0);
    if (!Number.isFinite(existing) || existing !== expected) {
      batch.set(doc.ref, { game_id: expected, updated_at: Date.now() }, { merge: true });
      changed++;
    }
  });
  if (changed > 0) await batch.commit();
  sequentialGameIdsEnsured = true;
}

async function nextSequentialGameId(): Promise<number> {
  await ensureSequentialGameIds();
  const q = await db.collection(COLLECTIONS.GAMES).orderBy('game_id', 'desc').limit(1).get();
  if (q.empty) return 1;
  const current = Number(q.docs[0].data()?.game_id || 0);
  return Number.isFinite(current) && current > 0 ? current + 1 : 1;
}

const app = express();
app.use(cors({ origin: true }));

// Cloud Functions URL is .../api - requests to .../api/users have path /api/users
// Strip /api so our routes match /users, /skins, etc. (Hosting rewrite may leave path as /api/...)
app.use((req, res, next) => {
  const p = req.path || req.url || '';
  const pathOnly = p.split('?')[0];
  if (pathOnly.startsWith('/api/') || pathOnly === '/api') {
    req.url = pathOnly === '/api' ? '/' : pathOnly.slice(4) || '/';
  }
  next();
});

mountStripeEmbeddedWebhook(app, firestoreDb, COLLECTIONS.USERS, COLLECTIONS.STRIPE_PAYMENT_CREDITS);

app.use(express.json());

mountStripeEmbeddedPayRoutes(app, firestoreDb);

app.use(async (req, res, next) => {
  try {
    const token = getBearerTokenFromRequest(req);
    if (!token) return next();
    const payload = jwt.verify(token, getJwtSecret()) as { username?: string; iat?: number };
    if (!payload?.username || typeof payload?.iat !== 'number') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const revoked = await isJwtRevokedForUser(payload.username, payload.iat);
    if (revoked) {
      return res.status(401).json({
        error: 'Session expired. Please sign in again.',
        code: 'SESSION_REVOKED',
      });
    }
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

const storageSignedUploadHandler = async (req: any, res: any) => {
  const auth = requireAuth(req, res);
  if (!auth) return;
  try {
    const requestedPath = sanitizeStoragePath(req.body?.path);
    const objectPath =
      requestedPath ||
      `users/${String(auth.username || '').toLowerCase()}/uploads/${Date.now()}-${randomUUID()}`;
    if (!canAccessStoragePath(objectPath, auth)) {
      return res.status(403).json({ error: 'Forbidden path' });
    }
    const contentType = String(req.body?.contentType || 'application/octet-stream').slice(0, 120);
    const expiresAt = Date.now() + STORAGE_SIGNED_URL_MS;
    const [uploadUrl] = await storageBucket.file(objectPath).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresAt,
      contentType,
    });
    return res.json({ path: objectPath, uploadUrl, expiresAt });
  } catch (error) {
    console.error('Failed to create upload URL:', error);
    return res.status(500).json({ error: 'Failed to create upload URL' });
  }
};
app.post('/storage/signed-upload', storageSignedUploadHandler);
app.post('/api/storage/signed-upload', storageSignedUploadHandler);

const storageSignedDownloadHandler = async (req: any, res: any) => {
  const auth = requireAuth(req, res);
  if (!auth) return;
  try {
    const objectPath = sanitizeStoragePath(req.query.path);
    if (!objectPath) return res.status(400).json({ error: 'Invalid path' });
    if (!canAccessStoragePath(objectPath, auth)) {
      return res.status(403).json({ error: 'Forbidden path' });
    }
    const expiresAt = Date.now() + STORAGE_SIGNED_URL_MS;
    const [downloadUrl] = await storageBucket.file(objectPath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresAt,
    });
    return res.json({ path: objectPath, downloadUrl, expiresAt });
  } catch (error) {
    console.error('Failed to create download URL:', error);
    return res.status(500).json({ error: 'Failed to create download URL' });
  }
};
app.get('/storage/signed-download', storageSignedDownloadHandler);
app.get('/api/storage/signed-download', storageSignedDownloadHandler);

// Liveness only — do not expose whether JWT_SECRET is configured (reconnaissance aid).
const sendJwtCheck = (_req: any, res: any) => {
  res.json({ ok: true });
};
['/auth/check-config', '/api/auth/check-config', '/check-config', '/api/check-config'].forEach(p => app.get(p, sendJwtCheck));

// Public profile by numeric user id: GET /user/:userId or /user?userId=123
const getPublicUserProfileHandler = async (req: any, res: any) => {
  try {
    const rawUserId = req.params.userId || (req.query.userId as string) || '';
    const userId = Number(rawUserId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    await ensureSequentialUserIds();
    await ensureSequentialGameIds();
    const q = await db.collection(COLLECTIONS.USERS).where('user_id', '==', userId).limit(1).get();
    if (q.empty) return res.status(404).json({ error: 'User not found' });
    const d = q.docs[0].data() || {};
    const username = String(d.username || q.docs[0].id);
    const gamesSnap = await db.collection(COLLECTIONS.GAMES).where('owner', '==', username).get();
    const madeGames = gamesSnap.docs
      .map((g: any) => {
        const gd = g.data() || {};
        return {
          id: g.id,
          gameId: Number(gd.game_id || 0) || undefined,
          title: String(gd.title || ''),
          ts: Number(gd.ts || 0),
        };
      })
      .sort((a: any, b: any) => b.ts - a.ts)
      .slice(0, 24);
    return res.json({
      userId,
      username,
      gender: d.gender || '',
      role: d.role || 'user',
      equippedSkin: d.equipped_skin || '',
      equippedFace: d.equipped_face || '',
      coins: Number(d.coins || 0),
      favoriteGameIds: Array.isArray(d.favorite_game_ids) ? d.favorite_game_ids : [],
      madeGames,
      founderOrdinal: typeof d.founder_ordinal === 'number' ? d.founder_ordinal : undefined,
      isDonor: d.is_donor === 1,
      createdAt: Number(d.created_at || 0) || undefined,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to load public user profile' });
  }
};
app.get('/user/:userId', getPublicUserProfileHandler);
app.get('/user', getPublicUserProfileHandler);

// Public game profile by numeric game id: GET /game/:gameId or /game?gameId=123
const getPublicGameProfileHandler = async (req: any, res: any) => {
  try {
    const rawGameId = req.params.gameId || (req.query.gameId as string) || '';
    const gameId = Number(rawGameId);
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return res.status(400).json({ error: 'Invalid gameId' });
    }
    await ensureSequentialGameIds();
    const q = await db.collection(COLLECTIONS.GAMES).where('game_id', '==', gameId).limit(1).get();
    if (q.empty) return res.status(404).json({ error: 'Game not found' });
    const d = q.docs[0].data() || {};
    return res.json({
      gameId,
      id: q.docs[0].id,
      title: String(d.title || ''),
      desc: String(d.description || ''),
      owner: String(d.owner || ''),
      ts: Number(d.ts || 0) || undefined,
      createdAt: Number(d.created_at || 0) || undefined,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to load game profile' });
  }
};
app.get('/game/:gameId', getPublicGameProfileHandler);
app.get('/game', getPublicGameProfileHandler);

// GET /auth/check-device?deviceId=xxx — no auth; for app-open check so ban screen can show before login
app.get('/auth/check-device', async (req, res) => {
  try {
    const deviceId = (req.query.deviceId as string) || '';
    const id = sanitizeDeviceId(deviceId);
    if (!id) return res.json({ banned: false });
    const banned = await isDeviceBanned(deviceId);
    if (!banned) return res.json({ banned: false });
    const details = await getHardwareBanDetails(deviceId);
    const ban = details
      ? { username: 'This device', reason: details.reason, bannedBy: details.bannedBy, timestamp: details.bannedAt, permanent: true }
      : {
          username: 'This device',
          reason: 'Access from this browser profile is blocked.',
          bannedBy: 'Administrator',
          timestamp: Date.now(),
          permanent: true,
        };
    return res.json({ banned: true, ban });
  } catch (e) {
    res.json({ banned: false });
  }
});

// GET /users/devices — admin only, returns devices for a user (deviceId, label, firstSeen, lastSeen). Also /api/users/devices for Hosting rewrite.
const getUsersDevicesHandler = async (req: any, res: any) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    let username = (req.query.username as string) || '';
    if (!username.trim() && typeof req.originalUrl === 'string') {
      const match = req.originalUrl.match(/[?&]username=([^&]+)/);
      if (match) username = decodeURIComponent(match[1]);
    }
    if (!username.trim()) return res.status(400).json({ error: 'username required' });
    const doc = await db.collection(COLLECTIONS.USER_DEVICES).doc(username.trim().toLowerCase()).get();
    const devices = Array.isArray(doc.exists && doc.data()?.devices) ? doc.data()!.devices : [];
    res.json(devices);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get devices' });
  }
};
app.get('/users/devices', getUsersDevicesHandler);
app.get('/api/users/devices', getUsersDevicesHandler);

// GET /users — requires auth
const getUsersHandler = async (req: any, res: any) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const snap = await db.collection(COLLECTIONS.USERS).get();
    const users = snap.docs.map(userFromDoc).filter(Boolean);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read users' });
  }
};
app.get('/users', getUsersHandler);
app.get('/api/users', getUsersHandler);

app.post('/users', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const u = req.body;
    const id = (u.username || '').toLowerCase();
    if (!id) return res.status(400).json({ error: 'Username required' });
    const selfOnly = id === auth.username.toLowerCase();
    if (!selfOnly && !isAdmin(auth)) return res.status(403).json({ error: 'Forbidden' });
    const existing = await db.collection(COLLECTIONS.USERS).doc(id).get();
    const existingData = existing.exists ? existing.data() : null;
    const plainPassword = typeof u.password === 'string' ? u.password : '';
    const password_hash = plainPassword
      ? await bcrypt.hash(plainPassword, 10)
      : (existingData?.password_hash ?? '');
    const callerIsAdmin = isAdmin(auth);
    const safeRole = callerIsAdmin ? (u.role || existingData?.role || 'user') : (existingData?.role || 'user');
    const safeCoins = callerIsAdmin ? (u.coins ?? existingData?.coins ?? 10) : (existingData?.coins ?? u.coins ?? 10);
    const data = {
      user_id:
        typeof u.userId === 'number'
          ? u.userId
          : (typeof existingData?.user_id === 'number' ? existingData.user_id : await nextSequentialUserId()),
      username: u.username,
      username_lower: id,
      password_hash,
      gender: u.gender || '',
      role: safeRole,
      coins: safeCoins,
      owned_skins: u.ownedSkins || [DEFAULT_SKIN_ID],
      equipped_skin: u.equippedSkin || DEFAULT_SKIN_ID,
      owned_faces: u.ownedFaces || [],
      equipped_face: u.equippedFace || '',
      owned_accessories: u.ownedAccessories || [],
      equipped_accessories: u.equippedAccessories || {},
      owned_servers: u.ownedServers || [],
      friends: u.friends || [],
      friend_requests: u.friendRequests || [],
      sent_friend_requests: u.sentFriendRequests || [],
      favorite_game_ids: u.favoriteGameIds || [],
      is_donor: (safeRole === 'admin' || safeRole === 'head_admin') ? 1 : 0,
      ppaf_last_restore_issued_at:
        typeof u.ppafLastRestoreIssuedAt === 'number'
          ? u.ppafLastRestoreIssuedAt
          : (existingData?.ppaf_last_restore_issued_at ?? null),
      setup_completed:
        u.setupCompleted === false
          ? false
          : u.setupCompleted === true
            ? true
            : (existingData?.setup_completed !== false),
      account_preferences:
        u.accountPreferences && typeof u.accountPreferences === 'object'
          ? u.accountPreferences
          : (existingData?.account_preferences ?? null),
      email:
        typeof u.email === 'string' && u.email.trim()
          ? normalizeEmail(u.email)
          : existingData?.email || '',
      email_verified:
        u.emailVerified !== undefined
          ? u.emailVerified === true
          : existingData?.email_verified === true,
      updated_at: Date.now(),
    };
    if (existing.exists) {
      await db.collection(COLLECTIONS.USERS).doc(id).set(data, { merge: true });
    } else {
      (data as any).created_at = Date.now();
      await db.collection(COLLECTIONS.USERS).doc(id).set(data);
    }
    const out = { ...u, ...data };
    delete (out as any).password_hash;
    (out as any).password = '';
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

app.put('/users', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const u = req.body;
    const id = (u.username || '').toLowerCase();
    if (!id) return res.status(400).json({ error: 'Username required' });
    const selfOnly = id === auth.username.toLowerCase();
    if (!selfOnly && !isAdmin(auth)) return res.status(403).json({ error: 'Forbidden' });
    const ref = db.collection(COLLECTIONS.USERS).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'User not found' });
    const existingData = existing.data() || {};
    const plainPassword = typeof u.password === 'string' ? u.password : '';
    const password_hash = plainPassword
      ? await bcrypt.hash(plainPassword, 10)
      : (existingData.password_hash ?? '');
    const callerIsAdmin = isAdmin(auth);
    const safeRole = callerIsAdmin ? (u.role || existingData.role || 'user') : (existingData.role || 'user');
    const safeCoins = callerIsAdmin ? (u.coins ?? existingData.coins ?? 10) : (existingData.coins ?? u.coins ?? 10);
    await ref.set({
      user_id:
        typeof u.userId === 'number'
          ? u.userId
          : (typeof existingData.user_id === 'number' ? existingData.user_id : await nextSequentialUserId()),
      username: u.username,
      username_lower: id,
      password_hash,
      gender: u.gender,
      role: safeRole,
      coins: safeCoins,
      owned_skins: u.ownedSkins || [],
      equipped_skin: u.equippedSkin || '',
      owned_faces: u.ownedFaces || [],
      equipped_face: u.equippedFace || '',
      owned_accessories: u.ownedAccessories || [],
      equipped_accessories: u.equippedAccessories || {},
      friends: u.friends || [],
      friend_requests: u.friendRequests || [],
      sent_friend_requests: u.sentFriendRequests || [],
      favorite_game_ids: u.favoriteGameIds || [],
      is_donor: (safeRole === 'admin' || safeRole === 'head_admin') ? 1 : 0,
      ppaf_last_restore_issued_at:
        typeof u.ppafLastRestoreIssuedAt === 'number'
          ? u.ppafLastRestoreIssuedAt
          : (existingData.ppaf_last_restore_issued_at ?? null),
      setup_completed:
        u.setupCompleted === false
          ? false
          : u.setupCompleted === true
            ? true
            : (existingData.setup_completed !== false),
      account_preferences:
        u.accountPreferences && typeof u.accountPreferences === 'object'
          ? u.accountPreferences
          : (existingData.account_preferences ?? null),
      updated_at: Date.now(),
    }, { merge: true });
    const out = { ...u };
    delete (out as any).password;
    (out as any).password = '';
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET/POST /skins
app.get('/skins', async (_req, res) => {
  try {
    const doc = await db.collection(COLLECTIONS.SKINS_CATALOG).doc('catalog').get();
    const data = doc.data();
    const skins = data?.skins;
    if (Array.isArray(skins) && skins.length > 0) return res.json(withPixelPlacerSkin(skins));
    return res.json(FALLBACK_SKINS);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read skins' });
  }
});

app.post('/skins', async (req, res) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const skins = req.body;
    await db.collection(COLLECTIONS.SKINS_CATALOG).doc('catalog').set({ skins, updated_at: Date.now() }, { merge: true });
    res.json(skins);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save skins' });
  }
});

/** Parse admin accounts from env. Use ADMIN_ACCOUNTS_JSON or ADMIN_USERNAME + ADMIN_PASSWORD. */
function getAdminAccountsFromEnv(): { username: string; password: string }[] {
  try {
    const raw = process.env.ADMIN_ACCOUNTS_JSON;
    if (raw && typeof raw === 'string') {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const list = parsed.filter(
          (a): a is { username: string; password: string } =>
            a && typeof a === 'object' && typeof (a as any).username === 'string' && typeof (a as any).password === 'string'
        );
        if (list.length > 0) return list;
      }
    }
  } catch {
    // fall through
  }
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (u && typeof u === 'string' && p && typeof p === 'string' && u.trim() && p.trim()) {
    return [{ username: u.trim(), password: p }];
  }
  if (process.env.NODE_ENV !== 'production') {
    return [{ username: 'admin', password: 'admin' }];
  }
  return [];
}

/** Production fallback: read single admin from Firestore when env vars are not set (e.g. Firebase doesn't deploy .env). */
async function getAdminAccountsFromFirestore(): Promise<{ username: string; password: string }[]> {
  try {
    const snap = await db.collection('config').doc('admin').get();
    const d = snap?.data();
    const u = d?.admin_username ?? d?.username;
    const p = d?.admin_password ?? d?.password;
    if (u && typeof u === 'string' && p && typeof p === 'string' && u.trim() && p.trim()) {
      return [{ username: u.trim(), password: String(p) }];
    }
  } catch {
    // ignore
  }
  return [];
}

// Google Sign-In — verify Firebase ID token and issue Pixel Place JWT.
app.post('/auth/google', async (req, res) => {
  try {
    const idToken = String(req.body?.idToken || '').trim();
    if (!idToken) return res.status(400).json({ error: 'ID token is required' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decoded.uid;
    const email = String(decoded.email || '').trim().toLowerCase();
    const displayName = String(decoded.name || email.split('@')[0] || 'GoogleUser').trim();
    const photoURL = String(decoded.picture || '').trim();

    let docSnap = await firestoreDb
      .collection(COLLECTIONS.USERS)
      .where('firebase_uid', '==', firebaseUid)
      .limit(1)
      .get();
    if (docSnap.empty && email) {
      docSnap = await firestoreDb
        .collection(COLLECTIONS.USERS)
        .where('email', '==', email)
        .limit(1)
        .get();
    }

    let userDocId: string;
    let userData: Record<string, unknown>;

    if (!docSnap.empty) {
      const doc = docSnap.docs[0];
      userDocId = doc.id;
      userData = doc.data() || {};
      await doc.ref.set(
        {
          firebase_uid: firebaseUid,
          email: email || userData.email || null,
          photo_url: photoURL || userData.photo_url || null,
          updated_at: Date.now(),
        },
        { merge: true },
      );
      const refreshed = await doc.ref.get();
      userData = refreshed.data() || userData;
    } else {
      let username = displayName.replace(/[^a-zA-Z0-9]/g, '');
      if (!username || username.length < 3) {
        username = `GoogleUser${Math.random().toString(36).slice(2, 9)}`;
      }
      let finalUsername = username;
      let counter = 1;
      while ((await firestoreDb.collection(COLLECTIONS.USERS).doc(finalUsername.toLowerCase()).get()).exists) {
        finalUsername = `${username}${counter}`;
        counter += 1;
      }
      userDocId = finalUsername.toLowerCase();
      const now = Date.now();
      userData = {
        username: finalUsername,
        username_lower: userDocId,
        password_hash: '',
        gender: '',
        role: 'user',
        coins: 10,
        owned_skins: ['pixel_placer'],
        equipped_skin: 'pixel_placer',
        owned_accessories: [],
        equipped_accessories: {},
        owned_servers: [],
        friends: [],
        friend_requests: [],
        sent_friend_requests: [],
        firebase_uid: firebaseUid,
        email: email || null,
        photo_url: photoURL || null,
        is_donor: 0,
        setup_completed: false,
        account_preferences: null,
        created_at: now,
        updated_at: now,
      };
      await firestoreDb.collection(COLLECTIONS.USERS).doc(userDocId).set(userData);
    }

    const userDoc = await firestoreDb.collection(COLLECTIONS.USERS).doc(userDocId).get();
    let d = (userDoc.data() || userData) as Record<string, unknown>;
    if (decoded.email_verified === true && email) {
      d = { ...d, email: email || d.email, email_verified: true };
      await userDoc.ref.set(
        { email: email || d.email, email_verified: true, email_verified_at: d.email_verified_at || Date.now(), updated_at: Date.now() },
        { merge: true },
      );
    }
    d = await syncAccountEmailVerifiedFlag(userDoc, d);
    const loginResult = await completePasswordLoginResponse(userDoc, userDocId, d);
    if (!loginResult.success) {
      return res.status(loginResult.retryAfterMs ? 429 : 503).json(loginResult);
    }
    if (loginResult.requiresLoginCode) {
      return res.json({
        success: true,
        requiresLoginCode: true,
        challengeToken: loginResult.challengeToken,
        maskedEmail: loginResult.maskedEmail,
        user: loginResult.user,
        emailVerified: loginResult.emailVerified,
      });
    }
    return res.json({ success: true, user: loginResult.user, token: loginResult.token });
  } catch (error: any) {
    console.error('Google auth failed:', error);
    return res.status(500).json({ error: error?.message || 'Google authentication failed' });
  }
});

// Firestore-only fallback auth path for slow RTDB scenarios.
app.post('/auth/firestore-login', async (req, res) => {
  try {
    const { username, password, deviceId, deviceLabel } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const usernameLower = String(username).toLowerCase();

    if (deviceId) {
      const did = sanitizeDeviceId(deviceId);
      if (did) {
        const hwDoc = await firestoreDb.collection(COLLECTIONS.HARDWARE_BANS).doc(did).get();
        if (hwDoc.exists) {
          const bd = hwDoc.data() || {};
          return res.status(401).json({
            error: 'Access from this browser profile is blocked. You cannot sign in.',
            deviceBanned: true,
            ban: {
              username: 'This device',
              reason: bd.reason || 'Access from this browser profile is blocked.',
              bannedBy: bd.banned_by || 'Administrator',
              timestamp: bd.banned_at || Date.now(),
              permanent: true,
            },
          });
        }
      }
    }

    const doc = await firestoreDb.collection(COLLECTIONS.USERS).doc(usernameLower).get();
    if (!doc.exists) return res.status(401).json({ error: 'Invalid credentials' });
    const d = doc.data() || {};

    const storedHash = String(d.password_hash || '').trim();
    let match = false;
    if (storedHash.startsWith('$2')) {
      match = await bcrypt.compare(String(password), storedHash);
    } else if (storedHash) {
      match = String(password) === storedHash;
      if (match) {
        const hash = await bcrypt.hash(String(password), 10);
        await firestoreDb.collection(COLLECTIONS.USERS).doc(usernameLower).update({ password_hash: hash, updated_at: Date.now() });
      }
    }
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    if (deviceId) await recordDevice(String(username), String(deviceId), String(deviceLabel || 'Unknown'));

    const synced = await syncAccountEmailVerifiedFlag(doc, d);
    const result = await completePasswordLoginResponse(doc, usernameLower, synced);
    if (!result.success) {
      return res.status(result.retryAfterMs ? 429 : result.error?.includes('email address') ? 400 : 503).json(result);
    }
    if (result.requiresLoginCode) {
      return res.json({
        success: true,
        requiresLoginCode: true,
        challengeToken: result.challengeToken,
        maskedEmail: result.maskedEmail,
        user: result.user,
        emailVerified: result.emailVerified,
        source: 'firestore-fallback',
      });
    }
    return res.json({
      success: true,
      user: result.user,
      token: result.token,
      emailVerified: result.emailVerified,
      source: 'firestore-fallback',
    });
  } catch (error) {
    console.error('Firestore fallback login failed:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /auth (login, register)
app.post('/auth', async (req, res) => {
  try {
    const { username, password, action, gender, role, coins, deviceId, deviceLabel, email } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    await ensureSequentialUserIds();

    if (action === 'login') {
      if (deviceId && (await isDeviceBanned(deviceId))) {
        const details = await getHardwareBanDetails(deviceId);
        const ban = details
          ? {
              username: 'This device',
              reason: details.reason,
              bannedBy: details.bannedBy,
              timestamp: details.bannedAt,
              permanent: true,
            }
          : {
              username: 'This device',
              reason: 'Access from this browser profile is blocked.',
              bannedBy: 'Administrator',
              timestamp: Date.now(),
              permanent: true,
            };
        return res.status(401).json({
          error: 'Access from this browser profile is blocked. You cannot sign in.',
          deviceBanned: true,
          ban,
        });
      }
      let doc = await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).get();
      if (!doc.exists) {
        let adminAccounts = getAdminAccountsFromEnv();
        if (adminAccounts.length === 0) adminAccounts = await getAdminAccountsFromFirestore();
        const admin = adminAccounts.find(a => a.username.toLowerCase() === username.toLowerCase() && a.password === password);
        if (admin) {
          const hash = await bcrypt.hash(password, 10);
          const assignedUserId = await nextSequentialUserId();
          await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).set({
            user_id: assignedUserId,
            username,
            username_lower: username.toLowerCase(),
            password_hash: hash,
            gender: '',
            role: 'admin',
            coins: 99999,
            owned_skins: [DEFAULT_SKIN_ID],
            equipped_skin: DEFAULT_SKIN_ID,
            owned_faces: [],
            equipped_face: '',
            owned_accessories: [],
            equipped_accessories: {},
            owned_servers: [],
            friends: [],
            friend_requests: [],
            sent_friend_requests: [],
            favorite_game_ids: [],
            chat_blocked_words: [],
            email: '',
            email_verified: false,
            email_verification_rewarded_at: null,
            is_donor: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
          });
          doc = await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).get();
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }
      if (!doc.exists) return res.status(401).json({ error: 'Invalid credentials' });
      const d = doc.data()!;
      // Firestore: some users have blank password_hash (e.g. Google-only, legacy imports).
      const storedHash = (d.password_hash || '').trim();
      let match = false;
      if (storedHash.startsWith('$2')) {
        match = await bcrypt.compare(password, storedHash);
      } else if (storedHash) {
        // Legacy: stored value is plaintext (pre-bcrypt migration). Compare and upgrade to bcrypt.
        match = password === storedHash;
        if (match) {
          const hash = await bcrypt.hash(password, 10);
          await db.collection(COLLECTIONS.USERS).doc(username.toLowerCase()).update({ password_hash: hash, updated_at: Date.now() });
        }
      }
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      if (deviceId) await recordDevice(username, deviceId, deviceLabel || 'Unknown');
      const synced = await syncAccountEmailVerifiedFlag(doc, d);
      const result = await completePasswordLoginResponse(doc, username.toLowerCase(), synced);
      if (!result.success) {
        return res.status(result.retryAfterMs ? 429 : result.error?.includes('email address') ? 400 : 503).json(result);
      }
      if (result.requiresLoginCode) {
        return res.json({
          success: true,
          requiresLoginCode: true,
          challengeToken: result.challengeToken,
          maskedEmail: result.maskedEmail,
          user: result.user,
          emailVerified: result.emailVerified,
        });
      }
      return res.json({
        success: true,
        user: result.user,
        token: result.token,
        emailVerified: result.emailVerified,
      });
    }

    if (action === 'register') {
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      if (deviceId && (await isDeviceBanned(deviceId))) {
        const details = await getHardwareBanDetails(deviceId);
        const ban = details
          ? {
              username: 'This device',
              reason: details.reason,
              bannedBy: details.bannedBy,
              timestamp: details.bannedAt,
              permanent: true,
            }
          : {
              username: 'This device',
              reason: 'Access from this browser profile is blocked.',
              bannedBy: 'Administrator',
              timestamp: Date.now(),
              permanent: true,
            };
        return res.status(400).json({
          error: 'Access from this browser profile is blocked. You cannot create new accounts here.',
          deviceBanned: true,
          ban,
        });
      }
      const id = username.toLowerCase();
      const normalizedEmail = normalizeEmail(email);
      if (normalizedEmail && !isValidEmail(normalizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const existing = await db.collection(COLLECTIONS.USERS).doc(id).get();
      if (existing.exists) return res.status(400).json({ error: 'Username already exists' });
      const hash = await bcrypt.hash(password, 10);
      const assignedUserId = await nextSequentialUserId();
      const userData = {
        user_id: assignedUserId,
        username,
        username_lower: id,
        password_hash: hash,
        gender: gender || '',
        role: 'user',
        coins: 10,
        owned_skins: [DEFAULT_SKIN_ID],
        equipped_skin: DEFAULT_SKIN_ID,
        owned_faces: [],
        equipped_face: '',
        owned_accessories: [],
        equipped_accessories: {},
        owned_servers: [],
        friends: [],
        friend_requests: [],
        sent_friend_requests: [],
        favorite_game_ids: [],
        chat_blocked_words: [],
        email: normalizedEmail || '',
        email_verified: false,
        email_verification_rewarded_at: null,
        is_donor: 0,
        founder_lifetime_coins: false,
        founder_ordinal: null,
        founder_celebration_pending: false,
        founder_celebration_shown_at: null,
        setup_completed: false,
        account_preferences: null,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      await db.collection(COLLECTIONS.USERS).doc(id).set(userData);
      if (deviceId) await recordDevice(username, deviceId, deviceLabel || 'Unknown');
      const createdDoc = await db.collection(COLLECTIONS.USERS).doc(id).get();
      const founder = await applyFounderRewardsAndConsumeCelebration(id, createdDoc.data() || userData);
      const user = {
        ...userFromDoc(createdDoc),
        setupCompleted: false,
        coins: founder.data.coins ?? createdDoc.data()?.coins ?? 0,
        founderLifetimeCoins: founder.data.founder_lifetime_coins === true,
        founderOrdinal:
          typeof founder.data.founder_ordinal === 'number' ? founder.data.founder_ordinal : undefined,
        showFounderCelebration: founder.showCelebration,
      };
      const token = jwt.sign({ username, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
      return res.json({ success: true, user, token });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (e) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.post('/auth/signout-all', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const now = Date.now();
    await db.collection(COLLECTIONS.USERS).doc(auth.username.toLowerCase()).set(
      {
        token_revoked_before: now,
        updated_at: now,
      },
      { merge: true },
    );
    return res.json({ success: true, signedOutAt: now });
  } catch (error) {
    console.error('Failed to sign out all sessions:', error);
    return res.status(500).json({ error: 'Failed to sign out all sessions' });
  }
});

app.post('/auth/login/verify-code', async (req, res) => {
  try {
    const challengeToken = String(req.body?.challengeToken || '').trim();
    const code = String(req.body?.code || '').trim().replace(/\s+/g, '');
    if (!challengeToken || !code) {
      return res.status(400).json({ error: 'Login challenge and code are required' });
    }
    let decoded: { purpose?: string; username?: string; nonce?: string };
    try {
      decoded = jwt.verify(challengeToken, getJwtSecret()) as typeof decoded;
    } catch {
      return res.status(400).json({ error: 'Login session expired. Sign in again.' });
    }
    if (decoded?.purpose !== 'login_code' || !decoded?.username || !decoded?.nonce) {
      return res.status(400).json({ error: 'Invalid login challenge' });
    }
    const id = String(decoded.username).toLowerCase();
    const ref = db.collection(COLLECTIONS.USERS).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const d = doc.data() || {};
    const now = Date.now();
    const expiresAt = Number(d.login_code_expires_at || 0);
    if (!expiresAt || now > expiresAt) {
      return res.status(400).json({ error: 'Login code expired. Sign in again to get a new code.' });
    }
    if (String(d.login_code_nonce || '') !== String(decoded.nonce)) {
      return res.status(400).json({ error: 'Invalid login code' });
    }
    const incomingHash = hashVerificationCode(code);
    if (incomingHash !== String(d.login_code_hash || '')) {
      await ref.set(
        { login_code_attempts: Number(d.login_code_attempts || 0) + 1, updated_at: now },
        { merge: true },
      );
      return res.status(400).json({ error: 'Invalid login code' });
    }
    await ref.set(
      {
        login_code_hash: null,
        login_code_nonce: null,
        login_code_expires_at: null,
        login_code_attempts: 0,
        updated_at: now,
      },
      { merge: true },
    );
    const founder = await applyFounderRewardsAndConsumeCelebration(id, d);
    const user = {
      ...userFromDoc(doc),
      coins: founder.data.coins ?? d.coins ?? 0,
      founderLifetimeCoins: founder.data.founder_lifetime_coins === true,
      founderOrdinal:
        typeof founder.data.founder_ordinal === 'number' ? founder.data.founder_ordinal : undefined,
      showFounderCelebration: founder.showCelebration,
    };
    const token = jwt.sign({ username: user.username, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
    return res.json({
      success: true,
      user,
      token,
      emailVerified: isAccountEmailVerified(d),
    });
  } catch (error: any) {
    console.error('Failed to verify login code:', error);
    return res.status(500).json({ error: error?.message || 'Failed to verify login code' });
  }
});

app.post('/auth/login/resend-code', async (req, res) => {
  try {
    const challengeToken = String(req.body?.challengeToken || '').trim();
    if (!challengeToken) return res.status(400).json({ error: 'Login challenge is required' });
    let decoded: { purpose?: string; username?: string; nonce?: string };
    try {
      decoded = jwt.verify(challengeToken, getJwtSecret()) as typeof decoded;
    } catch {
      return res.status(400).json({ error: 'Login session expired. Sign in again.' });
    }
    if (decoded?.purpose !== 'login_code' || !decoded?.username) {
      return res.status(400).json({ error: 'Invalid login challenge' });
    }
    const id = String(decoded.username).toLowerCase();
    const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const d = doc.data() || {};
    if (!userNeedsLoginCode(d)) {
      return res.status(400).json({ error: 'Login code is not required for this account' });
    }
    const result = await completePasswordLoginResponse(doc, id, d);
    if (!result.success) {
      return res.status(result.retryAfterMs ? 429 : 503).json(result);
    }
    return res.json({
      success: true,
      requiresLoginCode: true,
      challengeToken: result.challengeToken,
      maskedEmail: result.maskedEmail,
      sent: true,
    });
  } catch (error: any) {
    console.error('Failed to resend login code:', error);
    return res.status(500).json({ error: error?.message || 'Failed to resend login code' });
  }
});

// Client must call /api/auth/email/* (Hosting rewrites /api/** only). Middleware strips /api before these routes.
app.get('/auth/email/status', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const id = auth.username.toLowerCase();
    const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const d = doc.data() || {};
    return res.json({
      email: d.email || '',
      emailVerified: isAccountEmailVerified(d),
      rewardGrantedAt:
        typeof d.email_verification_rewarded_at === 'number' ? d.email_verification_rewarded_at : null,
      pendingExpiresAt:
        typeof d.email_verification_expires_at === 'number' ? d.email_verification_expires_at : null,
    });
  } catch (error) {
    console.error('Failed to read email status:', error);
    return res.status(500).json({ error: 'Failed to read email verification status' });
  }
});

app.post('/auth/email/request-verification', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const id = auth.username.toLowerCase();
    const ref = db.collection(COLLECTIONS.USERS).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const d = doc.data() || {};
    const email = normalizeEmail(req.body?.email || d.email);
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' });

    const now = Date.now();
    const lastSent = Number(d.email_verification_last_sent_at || 0);
    if (now - lastSent < EMAIL_VERIFY_RESEND_COOLDOWN_MS) {
      return res.status(429).json({
        error: 'Please wait before requesting another code',
        retryAfterMs: EMAIL_VERIFY_RESEND_COOLDOWN_MS - (now - lastSent),
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const nonce = randomBytes(12).toString('hex');
    const token = jwt.sign(
      { purpose: 'email_verify', username: id, email, nonce },
      getEmailVerificationSecret(),
      { expiresIn: '20m' },
    );
    const base =
      process.env.EMAIL_VERIFY_MAGIC_LINK_BASE ||
      process.env.APP_PUBLIC_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://pixelplaceofficial.com';
    const magicLink = `${String(base).replace(/\/+$/, '')}/verify?token=${encodeURIComponent(token)}`;
    const delivery = await dispatchVerificationEmail({ to: email, username: auth.username, code, magicLink });
    if (!delivery.sent) {
      return res.status(503).json({
        error:
          'Verification email was not sent. Configure email in functions/.env (SMTP or Resend) and redeploy, or use the Firebase emulator preview.',
        sent: false,
        preview: delivery.preview,
      });
    }

    await ref.set(
      {
        email,
        email_verified: false,
        email_verification_code_hash: hashVerificationCode(code),
        email_verification_nonce: nonce,
        email_verification_expires_at: now + EMAIL_VERIFY_CODE_TTL_MS,
        email_verification_last_sent_at: now,
        email_verification_attempts: 0,
        updated_at: now,
      },
      { merge: true },
    );

    return res.json({
      success: true,
      sent: true,
      provider: delivery.provider,
      expiresAt: now + EMAIL_VERIFY_CODE_TTL_MS,
    });
  } catch (error: any) {
    console.error('Failed to request email verification:', error);
    const msg = String(error?.message || 'Failed to request email verification');
    const isConfig = /not configured|SMTP login failed|Resend failed|webhook failed/i.test(msg);
    return res.status(isConfig ? 503 : 500).json({ error: msg });
  }
});

app.post('/auth/email/verify', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const id = auth.username.toLowerCase();
    const ref = db.collection(COLLECTIONS.USERS).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const d = doc.data() || {};
    const now = Date.now();
    const expiresAt = Number(d.email_verification_expires_at || 0);
    if (!expiresAt || now > expiresAt) {
      return res.status(400).json({ error: 'Verification code/link expired. Request a new one.' });
    }

    const code = String(req.body?.code || '').trim();
    const token = String(req.body?.token || '').trim();
    let ok = false;

    if (code) {
      const incomingHash = hashVerificationCode(code);
      const expectedHash = String(d.email_verification_code_hash || '');
      ok = incomingHash === expectedHash;
    } else if (token) {
      try {
        const decoded = jwt.verify(token, getEmailVerificationSecret()) as {
          purpose?: string;
          username?: string;
          email?: string;
          nonce?: string;
        };
        const expectedEmail = normalizeEmail(d.email);
        ok =
          decoded?.purpose === 'email_verify' &&
          String(decoded?.username || '').toLowerCase() === id &&
          normalizeEmail(decoded?.email) === expectedEmail &&
          String(decoded?.nonce || '') === String(d.email_verification_nonce || '');
      } catch {
        ok = false;
      }
    } else {
      return res.status(400).json({ error: 'Provide verification code or magic link token' });
    }

    if (!ok) {
      await ref.set(
        {
          email_verification_attempts: Number(d.email_verification_attempts || 0) + 1,
          updated_at: now,
        },
        { merge: true },
      );
      return res.status(400).json({ error: 'Invalid verification code or magic link' });
    }

    const alreadyRewarded = typeof d.email_verification_rewarded_at === 'number' && d.email_verification_rewarded_at > 0;
    const rewardCoins = alreadyRewarded ? 0 : EMAIL_VERIFY_REWARD_COINS;
    const updatedCoins = Number(d.coins || 0) + rewardCoins;

    await ref.set(
      {
        email_verified: true,
        email_verified_at: now,
        email_verification_code_hash: null,
        email_verification_nonce: null,
        email_verification_expires_at: null,
        email_verification_attempts: 0,
        coins: updatedCoins,
        email_verification_rewarded_at: alreadyRewarded ? d.email_verification_rewarded_at : now,
        updated_at: now,
      },
      { merge: true },
    );

    return res.json({
      success: true,
      emailVerified: true,
      rewardCoins,
      rewardApplied: rewardCoins > 0,
      coins: updatedCoins,
    });
  } catch (error) {
    console.error('Failed to verify email:', error);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
});

// GET/POST /safety — identity from token only
app.get('/safety', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const username = auth.username;
    const doc = await db.collection(COLLECTIONS.USER_SAFETY).doc(username.toLowerCase()).get();
    const d = doc.data();
    return res.json({ safetyPoints: d?.safety_points ?? 0, lastBreakAt: d?.last_break_at ?? 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read safety' });
  }
});

app.post('/safety', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const username = auth.username;
    const { action, safetyPoints, playtime } = req.body;
    const id = username.toLowerCase();
    const ref = db.collection(COLLECTIONS.USER_SAFETY).doc(id);
    if (action === 'updateSafetyPoints') {
      await ref.set({ safety_points: safetyPoints, updated_at: Date.now() }, { merge: true });
    } else if (action === 'updatePlaytime' && typeof playtime === 'number') {
      const doc = await ref.get();
      const d = doc.data() || {};
      const playtimeToday = (d.playtime_today ?? 0) + playtime;
      const totalPlaytime = (d.total_playtime ?? 0) + playtime;
      await ref.set({
        playtime_today: playtimeToday,
        total_playtime: totalPlaytime,
        last_active_at: Date.now(),
        updated_at: Date.now()
      }, { merge: true });
      return res.json({ success: true, playtimeToday, totalPlaytime });
    }
    const doc = await ref.get();
    const d = doc.data();
    return res.json({ safetyPoints: d?.safety_points ?? 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update safety' });
  }
});

// Draft: GET/POST — identity from token only
app.get('/draft', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const username = auth.username;
    const doc = await db.collection(COLLECTIONS.DRAFTS).doc(username).get();
    const d = doc.data();
    if (!d) return res.json({ title: '', desc: '', owner: '' });
    res.json({
      title: d.title || '',
      desc: d.desc || '',
      owner: d.owner || '',
      gameCode: d.game_code || '',
      thumbnail: d.thumbnail,
      sceneData: d.scene_data,
      gameType: d.game_type,
      fileContent: d.file_content,
      fileType: d.file_type
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read draft' });
  }
});
app.post('/draft', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const username = auth.username;
    const draft = req.body;
    await db.collection(COLLECTIONS.DRAFTS).doc(username).set({
      username,
      title: draft.title || '',
      desc: draft.desc || '',
      owner: draft.owner || '',
      game_code: draft.gameCode || '',
      thumbnail: draft.thumbnail,
      scene_data: draft.sceneData || null,
      game_type: draft.gameType || null,
      file_content: draft.fileContent || null,
      file_type: draft.fileType || null,
      updated_at: Date.now()
    }, { merge: true });
    res.json(draft);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Scene: GET/POST — identity from token only
app.get('/scene', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const userId = auth.username.toLowerCase();
    const doc = await db.collection(COLLECTIONS.SCENES).doc(userId).get();
    const d = doc.data();
    if (!d || !d.scene_data) return res.json({ objects: [] });
    const sceneData = typeof d.scene_data === 'string' ? JSON.parse(d.scene_data) : d.scene_data;
    res.json(sceneData);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read scene' });
  }
});
app.post('/scene', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const scene = req.body;
    const userId = auth.username.toLowerCase();
    await db.collection(COLLECTIONS.SCENES).doc(userId).set({
      user_id: userId,
      scene_data: scene,
      updated_at: Date.now()
    }, { merge: true });
    res.json(scene);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save scene' });
  }
});

// Games: GET all or by owner (owner from token only when filtering)
app.get('/games', async (req, res) => {
  try {
    await ensureSequentialGameIds();
    const ownerQuery = req.query.owner as string;
    let snap;
    if (ownerQuery) {
      const auth = getAuthFromRequest(req);
      if (!auth) return res.status(401).json({ error: 'Unauthorized' });
      snap = await db.collection(COLLECTIONS.GAMES).where('owner', '==', auth.username).orderBy('ts', 'desc').get();
    } else {
      snap = await db.collection(COLLECTIONS.GAMES).orderBy('ts', 'desc').get();
    }
    const games = snap.docs.map((d: any) => {
      const data = d.data();
      return {
        id: d.id,
        gameId: Number(data.game_id || 0) || undefined,
        title: data.title,
        desc: data.description || '',
        owner: data.owner,
        ts: data.ts,
        sceneData: typeof data.scene_data === 'string' ? JSON.parse(data.scene_data) : data.scene_data,
        presetMessages: typeof data.preset_messages === 'string' ? JSON.parse(data.preset_messages) : data.preset_messages,
        controls: typeof data.controls === 'string' ? JSON.parse(data.controls) : data.controls,
        publishedBy: data.published_by,
        gameType: data.game_type,
        fileContent: data.file_content,
        fileType: data.file_type,
        gameCode: data.game_code || undefined
      };
    });
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read games' });
  }
});
app.post('/games', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const game = req.body;
    const gameId = game.id || `game_${Date.now()}`;
    const assignedGameId =
      typeof game.gameId === 'number' && game.gameId > 0 ? game.gameId : await nextSequentialGameId();
    await db.collection(COLLECTIONS.GAMES).doc(gameId).set({
      id: gameId,
      game_id: assignedGameId,
      title: game.title,
      description: game.desc || '',
      owner: auth.username,
      ts: game.ts || Date.now(),
      scene_data: game.sceneData || null,
      preset_messages: game.presetMessages || null,
      controls: game.controls || null,
      published_by: game.publishedBy || null,
      game_type: game.gameType || null,
      file_content: game.fileContent || null,
      file_type: game.fileType || null,
      game_code: game.gameCode || null,
      created_at: Date.now(),
      updated_at: Date.now()
    }, { merge: true });
    res.json({ success: true, game: { ...game, id: gameId, gameId: assignedGameId, ts: game.ts || Date.now() } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Gym Pump game API — identity from token only
app.post('/games/gym-pump/connect', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const { gameId } = req.body;
    if (!gameId) return res.status(400).json({ error: 'gameId required' });
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.collection('gym_pump_sessions').doc(sessionId).set({ sessionId, gameId, username: auth.username, timestamp: Date.now() });
    return res.json({ sessionId });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to connect' });
  }
});
app.post('/games/gym-pump/score', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const { gameId, power, coins, level } = req.body;
    if (!gameId || power === undefined || coins === undefined || level === undefined) return res.status(400).json({ error: 'Invalid request' });
    await db.collection('gym_pump_scores').add({ gameId, username: auth.username, power, coins, level: level || 1, timestamp: Date.now() });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save score' });
  }
});
app.post('/games/gym-pump/sync', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const { gameId, power, coins, level } = req.body;
    if (!gameId || power === undefined || coins === undefined || level === undefined) return res.status(400).json({ error: 'Invalid request' });
    const progressId = `${auth.username}_${gameId}`;
    const ref = db.collection('gym_pump_progress').doc(progressId);
    const existing = (await ref.get()).data();
    const merged = {
      power: Math.max(existing?.power ?? 0, power),
      coins: Math.max(existing?.coins ?? 0, coins),
      level: Math.max(existing?.level ?? 1, level ?? 1),
      lastSynced: Date.now()
    };
    await ref.set(merged, { merge: true });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to sync' });
  }
});
app.get('/games/gym-pump/sync', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const gameId = (req.query.gameId as string) || 'gym-pump';
    const progressId = `${auth.username}_${gameId}`;
    const ref = db.collection('gym_pump_progress').doc(progressId);
    const existing = (await ref.get()).data();
    if (!existing) return res.json({ power: 0, coins: 0, level: 1 });
    return res.json({
      power: existing.power ?? 0,
      coins: existing.coins ?? 0,
      level: existing.level ?? 1
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to get progress' });
  }
});
app.get('/games/gym-pump/leaderboard', async (req, res) => {
  try {
    const snap = await db.collection('gym_pump_scores').orderBy('power', 'desc').limit(parseInt(String(req.query.limit)) || 50).get();
    const leaderboard = snap.docs.map((d: any, i: any) => {
      const data = d.data();
      return { rank: i + 1, username: data.username || 'Anonymous', power: data.power ?? 0, coins: data.coins ?? 0, level: data.level ?? 1 };
    });
    return res.json(leaderboard);
  } catch (e) {
    return res.json([]);
  }
});

// Published: GET all, POST to replace all (admin)
app.get('/published', async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.PUBLISHED_GAMES).orderBy('ts', 'desc').get();
    const games = snap.docs.map((d: any) => {
      const data = d.data();
      return {
        title: data.title,
        desc: data.description || '',
        owner: data.owner,
        ts: data.ts,
        thumbnail: data.thumbnail,
        gameCode: data.game_code || '',
        playable: data.playable !== false,
        multiplayer: data.multiplayer === true,
        maxPlayers: data.max_players
      };
    });
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read published games' });
  }
});
app.post('/published', async (req, res) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const games = req.body as any[];
    const batch = db.batch();
    const existing = await db.collection(COLLECTIONS.PUBLISHED_GAMES).get();
    existing.docs.forEach((d: any) => batch.delete(d.ref));
    for (const g of games) {
      const id = `${g.owner}_${g.ts}`;
      const ref = db.collection(COLLECTIONS.PUBLISHED_GAMES).doc(id);
      batch.set(ref, {
        title: g.title,
        description: g.desc || '',
        owner: g.owner,
        ts: g.ts,
        thumbnail: g.thumbnail,
        game_code: g.gameCode || '',
        playable: g.playable !== false,
        multiplayer: g.multiplayer === true,
        max_players: g.maxPlayers,
        created_at: Date.now()
      });
    }
    await batch.commit();
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save published games' });
  }
});

// Prebuilt: GET all, POST to replace (admin)
app.get('/prebuilt', async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.PREBUILT_GAMES).orderBy('ts', 'desc').get();
    res.json(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read prebuilt games' });
  }
});
app.post('/prebuilt', async (req, res) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const games = req.body as any[];
    const batch = db.batch();
    const existing = await db.collection(COLLECTIONS.PREBUILT_GAMES).get();
    existing.docs.forEach((d: any) => batch.delete(d.ref));
    for (const g of games) {
      const ref = db.collection(COLLECTIONS.PREBUILT_GAMES).doc(g.id || `prebuilt_${Date.now()}`);
      batch.set(ref, { ...g, updated_at: Date.now() });
    }
    await batch.commit();
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save prebuilt games' });
  }
});

// Hardware bans — GET list, POST add (deviceId + reason), DELETE remove (query deviceId). Also /api/* for Hosting rewrite.
const getHardwareBansHandler = async (req: any, res: any) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const snap = await db.collection(COLLECTIONS.HARDWARE_BANS).get();
    const list = snap.docs.map((d: any) => {
      const data = d.data();
      return {
        deviceId: data.deviceId || d.id,
        bannedAt: data.banned_at || 0,
        bannedBy: data.banned_by || '',
        reason: data.reason,
        linkedUsernames: Array.isArray(data.linked_usernames) ? data.linked_usernames : [],
      };
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list hardware bans' });
  }
};
const postHardwareBansHandler = async (req: any, res: any) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    const { deviceId: rawId, reason } = req.body || {};
    const id = sanitizeDeviceId(typeof rawId === 'string' ? rawId : '');
    if (!id) return res.status(400).json({ error: 'deviceId required' });

    const { deviceIds, usernames } = await collectLinkedHardwareNetwork(id);
    const groupId = randomUUID();
    const now = Date.now();
    const linked = [...usernames];
    const reasonText = reason || '';

    let batch = db.batch();
    let n = 0;
    const flush = async () => {
      if (n === 0) return;
      await batch.commit();
      batch = db.batch();
      n = 0;
    };
    for (const devId of deviceIds) {
      batch.set(
        db.collection(COLLECTIONS.HARDWARE_BANS).doc(devId),
        {
          deviceId: devId,
          banned_at: now,
          banned_by: auth.username,
          reason: reasonText,
          linked_usernames: linked,
          group_id: groupId,
          root_device_id: id,
          created_at: now,
        },
        { merge: false }
      );
      n++;
      if (n >= 400) await flush();
    }
    await flush();

    const bannedUsernames: string[] = [];
    const deviceIdsForBan = deviceIds;
    for (const un of usernames) {
      const banRef = db.collection(COLLECTIONS.BANS).doc(un);
      const banSnap = await banRef.get();
      if (banSnap.exists) continue;
      await banRef.set({
        username: un,
        username_lower: un,
        reason: reasonText || `Hardware ban — all linked browsers/devices (${deviceIds.length} device ids)`,
        banned_by: auth.username,
        banned_at: now,
        expires_at: null,
        permanent: true,
        hardware_ban_device_id: id,
        hardware_ban_group_id: groupId,
        hardware_ban_device_ids: deviceIdsForBan,
        created_at: now,
      });
      bannedUsernames.push(un);
    }
    res.json({ success: true, bannedUsernames, bannedDeviceIds: deviceIds, groupId });
  } catch (e) {
    res.status(500).json({ error: 'Failed to add hardware ban' });
  }
};
const deleteHardwareBansHandler = async (req: any, res: any) => {
  try {
    const auth = requireAdmin(req, res);
    if (!auth) return;
    let deviceId = (req.query.deviceId as string) || '';
    if (!deviceId && typeof req.originalUrl === 'string') {
      const match = req.originalUrl.match(/[?&]deviceId=([^&]+)/);
      if (match) deviceId = decodeURIComponent(match[1]);
    }
    const id = sanitizeDeviceId(deviceId);
    if (!id) return res.status(400).json({ error: 'deviceId required' });

    const hwDoc = await db.collection(COLLECTIONS.HARDWARE_BANS).doc(id).get();
    const groupId = typeof hwDoc.data()?.group_id === 'string' ? hwDoc.data()!.group_id : null;

    const unbannedUsernames: string[] = [];

    if (groupId) {
      const hwSnap = await db.collection(COLLECTIONS.HARDWARE_BANS).where('group_id', '==', groupId).get();
      let batch = db.batch();
      let n = 0;
      for (const d of hwSnap.docs) {
        batch.delete(d.ref);
        n++;
        if (n >= 400) {
          await batch.commit();
          batch = db.batch();
          n = 0;
        }
      }
      if (n > 0) await batch.commit();

      const bansSnap = await db.collection(COLLECTIONS.BANS).where('hardware_ban_group_id', '==', groupId).get();
      for (const d of bansSnap.docs) {
        const un = d.data()?.username_lower || d.id;
        unbannedUsernames.push(un);
        await d.ref.delete();
      }
    } else {
      await db.collection(COLLECTIONS.HARDWARE_BANS).doc(id).delete();
      const bansSnap = await db.collection(COLLECTIONS.BANS).where('hardware_ban_device_id', '==', id).get();
      for (const d of bansSnap.docs) {
        const un = d.data()?.username_lower || d.id;
        unbannedUsernames.push(un);
        await d.ref.delete();
      }
    }

    res.json({ success: true, unbannedUsernames });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove hardware ban' });
  }
};
app.get('/hardware-bans', getHardwareBansHandler);
app.get('/api/hardware-bans', getHardwareBansHandler);
app.post('/hardware-bans', postHardwareBansHandler);
app.post('/api/hardware-bans', postHardwareBansHandler);
app.delete('/hardware-bans', deleteHardwareBansHandler);
app.delete('/api/hardware-bans', deleteHardwareBansHandler);

// Tab content, accessories, bans, reports, appeals (GET only)
app.get('/tabcontent', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.TAB_CONTENT).doc('content').get()).data() || {}); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/accessories', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.ACCESSORIES_CATALOG).doc('catalog').get()).data()?.accessories || []); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/bans', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.BANS).get()).docs.map((d: any) => ({ id: d.id, ...d.data() }))); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
// POST /bans — admin only, create ban (body: { username, bannedBy, reason, timestamp?, permanent?, expiresAt? })
const postBansHandler = async (req: any, res: any) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const body = req.body || {};
  const username = (body.username ?? '').toString().trim();
  if (!username) return res.status(400).json({ error: 'username required' });
  const bannedBy = (body.bannedBy ?? '').toString().trim() || 'Administrator';
  const reason = (body.reason ?? '').toString().trim() || 'No reason given';
  const permanent = body.permanent === true;
  const timestamp = typeof body.timestamp === 'number' ? body.timestamp : Date.now();
  const expiresAt = permanent ? undefined : (typeof body.expiresAt === 'number' ? body.expiresAt : undefined);
  const usernameLower = username.toLowerCase();
  try {
    const existing = await db.collection(COLLECTIONS.BANS).where('username_lower', '==', usernameLower).get();
    const batch = db.batch();
    existing.docs.forEach((d: any) => batch.delete(d.ref));
    await batch.commit();
    await db.collection(COLLECTIONS.BANS).doc(usernameLower).set({
      username,
      username_lower: usernameLower,
      reason,
      banned_by: bannedBy,
      banned_at: timestamp,
      expires_at: expiresAt ?? null,
      permanent,
      created_at: Date.now(),
    });
    res.status(200).json({
      username,
      bannedBy,
      reason,
      timestamp,
      permanent,
      expiresAt: expiresAt ?? undefined,
    });
  } catch (e) {
    console.error('Error creating ban:', e);
    res.status(500).json({ error: 'Failed to create ban' });
  }
};
app.post('/bans', postBansHandler);
app.post('/api/bans', postBansHandler);
// DELETE /bans?username=xxx — admin only, unban user
const deleteBansHandler = async (req: any, res: any) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  let username = (req.query.username as string) || '';
  if (!username.trim() && typeof req.originalUrl === 'string') {
    const match = req.originalUrl.match(/[?&]username=([^&]+)/);
    if (match) username = decodeURIComponent(match[1]);
  }
  if (!username.trim()) return res.status(400).json({ error: 'username required' });
  try {
    const snap = await db.collection(COLLECTIONS.BANS).where('username_lower', '==', username.trim().toLowerCase()).get();
    const batch = db.batch();
    snap.docs.forEach((d: any) => batch.delete(d.ref));
    await batch.commit();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to unban' });
  }
};
app.delete('/bans', deleteBansHandler);
app.delete('/api/bans', deleteBansHandler);
app.get('/reports', async (_req, res) => { try { res.json((await db.collection(COLLECTIONS.REPORTS).get()).docs.map((d: any) => ({ id: d.id, ...d.data() }))); } catch (e) { res.status(500).json({ error: 'Failed' }); } });
app.get('/appeals', async (_req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.APPEALS).orderBy('created_at', 'desc').get();
    const appeals = await Promise.all(snap.docs.map(async (d: any) => {
      const data = d.data();
      const banId = data.ban_id;
      let ban: { reason?: string; bannedBy?: string; timestamp?: number } | null = null;
      if (banId) {
        const banDoc = await db.collection(COLLECTIONS.BANS).doc(banId).get();
        if (banDoc.exists) {
          const b = banDoc.data();
          ban = { reason: b?.reason, bannedBy: b?.banned_by, timestamp: b?.banned_at ?? b?.timestamp };
        }
      }
      return {
        id: d.id,
        username: data.username,
        appealText: data.appeal_text,
        appealMessage: data.appeal_text,
        timestamp: data.created_at ?? Date.now(),
        status: data.status || 'pending',
        reviewedBy: data.reviewed_by,
        adminNotes: data.admin_notes,
        reviewedAt: data.reviewed_at,
        device_id: data.device_id,
        ban_id: data.ban_id,
        ban,
      };
    }));
    res.json(appeals);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read appeals' });
  }
});

// GET appeal messages (admin only) - for moderator chat in admin panel
app.get('/appeals/messages', async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const appealId = req.query.appealId as string;
  if (!appealId) {
    res.status(400).json({ error: 'appealId required' });
    return;
  }
  try {
    const snap = await db.collection(COLLECTIONS.APPEAL_MESSAGES)
      .where('appeal_id', '==', appealId)
      .get();
    const messages = snap.docs
      .map((d: any) => {
        const data = d.data();
        return {
          id: d.id,
          appealId: data.appeal_id,
          fromUsername: data.from_username,
          message: data.message,
          timestamp: data.created_at ?? data.timestamp ?? 0,
        };
      })
      .sort((a: any, b: any) => (a.timestamp as number) - (b.timestamp as number));
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Game submissions: GET all, POST to submit for evaluation, DELETE
app.get('/gamesubmissions', async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.GAME_SUBMISSIONS).orderBy('ts', 'desc').get();
    const submissions = snap.docs.map((d: any) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        desc: data.description || '',
        owner: data.owner,
        ts: data.ts,
        sceneData: typeof data.scene_data === 'string' ? JSON.parse(data.scene_data) : data.scene_data,
        status: data.status || 'pending',
        reviewedBy: data.reviewed_by,
        adminNotes: data.admin_notes,
        gameType: data.game_type,
        fileContent: data.file_content,
        fileType: data.file_type
      };
    });
    res.json(submissions);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read game submissions' });
  }
});
app.post('/gamesubmissions', async (req, res) => {
  try {
    const auth = requireAuth(req, res);
    if (!auth) return;
    const s = req.body;
    const id = s.id || `submission_${Date.now()}`;
    await db.collection(COLLECTIONS.GAME_SUBMISSIONS).doc(id).set({
      id,
      title: s.title,
      description: s.desc || '',
      owner: auth.username,
      ts: s.ts || Date.now(),
      scene_data: s.sceneData || null,
      status: s.status || 'pending',
      game_type: s.gameType || null,
      file_content: s.fileContent || null,
      file_type: s.fileType || null,
      created_at: Date.now()
    }, { merge: true });
    res.json({ success: true, submission: { ...s, id } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save game submission' });
  }
});
app.delete('/gamesubmissions', async (req, res) => {
  try {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const doc = await db.collection(COLLECTIONS.GAME_SUBMISSIONS).doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    const resourceOwner = (doc.data()?.owner as string) || '';
    if (!requireOwnerOrAdmin(req, res, resourceOwner)) return;
    await db.collection(COLLECTIONS.GAME_SUBMISSIONS).doc(id).delete();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete game submission' });
  }
});

// Pyx content filter - calls Pyx API (register both /pyx/* and /api/pyx/* for Hosting rewrite)
import { filterForDisplay, sendFeedback, checkForPublish, analyzeCodeForPublish, pyxCodeComplete } from './pyx';
const pyxFilter = async (req: any, res: any) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const filtered = await filterForDisplay(text);
    res.json({ filtered, score: 0 });
  } catch (e) {
    res.status(500).json({ filtered: '', error: 'Filter failed' });
  }
};
const pyxFeedback = async (req: any, res: any) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const safe = req.body?.safe === true;
    if (!text) return res.status(400).json({ error: 'text required' });
    await sendFeedback(text, safe);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Feedback failed' });
  }
};
const pyxCheck = async (req: any, res: any) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const result = await checkForPublish(text);
    res.json(result);
  } catch (e) {
    console.error('[Pyx] Check route error:', e);
    res.status(500).json({ safe: false, filtered: '', connectionError: true });
  }
};
const pyxAnalyze = async (req: any, res: any) => {
  try {
    const source = typeof req.body?.source === 'string' ? req.body.source : '';
    const result = await analyzeCodeForPublish(source);
    res.json(result);
  } catch (e) {
    console.error('[Pyx] Analyze route error:', e);
    res.status(500).json({ safe: false, connectionError: true });
  }
};
const pyxCodeCompleteHandler = async (req: any, res: any) => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt : '';
    const maxTokens = typeof req.body?.max_tokens === 'number' ? req.body.max_tokens : 256;
    const result = await pyxCodeComplete(prompt, maxTokens);
    res.json(result);
  } catch (e) {
    console.error('[Pyx] Code complete route error:', e);
    res.status(500).json({ completion: '', connectionError: true });
  }
};
['/pyx/filter', '/api/pyx/filter'].forEach((path) => app.post(path, pyxFilter));
['/pyx/feedback', '/api/pyx/feedback'].forEach((path) => app.post(path, pyxFeedback));
['/pyx/check', '/api/pyx/check'].forEach((path) => app.post(path, pyxCheck));
['/pyx/analyze', '/api/pyx/analyze'].forEach((path) => app.post(path, pyxAnalyze));
['/pyx/code/complete', '/api/pyx/code/complete'].forEach((path) => app.post(path, pyxCodeCompleteHandler));

// AI Game Generator (Groq + template fallback)
import { handleGenerateGame } from './generate-game';
import { handleChat } from './chat';
app.post('/generate-game', (req, res) => handleGenerateGame(req, res));
app.post('/api/generate-game', (req, res) => handleGenerateGame(req, res));
app.post('/chat', (req, res) => handleChat(req, res));
app.post('/api/chat', (req, res) => handleChat(req, res));

// HistoriMac Computer Use (BYOK — OpenAI Responses `computer` or Anthropic `computer_20250124`)
import { handleHistoriMacCopilotTurn } from './historimac-copilot-turn';
app.post('/historimac-copilot-turn', (req, res) => void handleHistoriMacCopilotTurn(req, res));
app.post('/api/historimac-copilot-turn', (req, res) => void handleHistoriMacCopilotTurn(req, res));

// Public status page JSON (status.pixelplaceofficial.com); admin updates via PUT
const getStatusPageHandler = async (_req: any, res: any) => {
  try {
    const payload = await readStatusPagePayload();
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read status' });
  }
};
const putStatusPageHandler = async (req: any, res: any) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const n = normalizeStatusPagePayload(req.body);
  if (!n.ok) return res.status(400).json({ error: n.error });
  try {
    await db.collection(COLLECTIONS.STATUS_PAGE).doc('current').set(n.data);
    res.json({ success: true, ...n.data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save status' });
  }
};
app.get('/status-page', getStatusPageHandler);
app.get('/api/status-page', getStatusPageHandler);
app.put('/status-page', putStatusPageHandler);
app.put('/api/status-page', putStatusPageHandler);

// Anti 67 account lock (footer easter egg)
mountAnti67AccountRoutes(app, { db, usersCollection: COLLECTIONS.USERS, requireAuth });

// Signed Pixel Place Account File (PPAF) — backup / restore
['/account/ppaf/sign', '/api/account/ppaf/sign'].forEach((path) => app.post(path, postPpafSign));
['/account/ppaf/verify', '/api/account/ppaf/verify'].forEach((path) => app.post(path, postPpafVerify));

// 404 for unknown routes (include path debug so we can see what Express received)
app.use((req: any, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
  });
});

export const api = functions.region('us-central1').https.onRequest(app);
