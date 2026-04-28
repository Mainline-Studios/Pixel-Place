import { env } from '../config/env.js';

/** Verifies Cloudflare Turnstile token. Fails closed if secret not configured. */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string | undefined
): Promise<boolean> {
  if (!token?.trim()) return false;
  if (!env.TURNSTILE_SECRET_KEY) return false;

  const body = new URLSearchParams();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', token.trim());
  if (remoteIp) body.set('remoteip', remoteIp);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}
