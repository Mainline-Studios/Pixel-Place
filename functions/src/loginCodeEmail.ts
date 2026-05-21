import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const LOGIN_CODE_IMAGE_PATH = '/email/8e3c46b33ffb18295b1f117b2369011d.png';

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

function appPublicOrigin(): string {
  return String(
    process.env.APP_PUBLIC_URL || process.env.EMAIL_VERIFY_MAGIC_LINK_BASE || 'https://pixelplaceofficial.com',
  ).replace(/\/+$/, '');
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
    'Reply-To': support,
    ...(to ? { 'X-Entity-Ref-ID': `pixelplace-login-${Date.now()}` } : {}),
  };
}

function readTemplate(relPath: string): string {
  return fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
}

export function buildLoginCodeMessage(params: {
  code: string;
  username: string;
}): { subject: string; text: string; html: string } {
  const origin = appPublicOrigin();
  const imageUrl = `${origin}${LOGIN_CODE_IMAGE_PATH}`;
  const signoutUrl = `${origin}/signoutall`;
  const subject = `Secret Code: ${params.code}`;
  let text = readTemplate('email/login-code.txt');
  let html = readTemplate('email/login-code.html');
  const vars: Record<string, string> = {
    CODE: params.code,
    SIGNOUT_URL: signoutUrl,
    IMAGE_URL: imageUrl,
    USERNAME: params.username,
  };
  for (const [key, value] of Object.entries(vars)) {
    const token = `{{${key}}}`;
    text = text.split(token).join(value);
    html = html.split(token).join(value);
  }
  html = html.replace(
    'href="images/8e3c46b33ffb18295b1f117b2369011d.png"',
    `href="${imageUrl}"`,
  );
  return { subject, text, html };
}

export async function dispatchLoginCodeEmail(payload: {
  to: string;
  username: string;
  code: string;
}): Promise<{ sent: boolean; provider?: string }> {
  const webhookUrl = String(process.env.EMAIL_VERIFICATION_WEBHOOK_URL || '').trim();
  const resendApiKey = String(process.env.RESEND_API_KEY || process.env.EMAIL_VERIFICATION_RESEND_API_KEY || '').trim();
  const { from, fromEmail } = getVerificationMailFrom();
  const smtpUser = String(process.env.EMAIL_VERIFICATION_SMTP_USER || fromEmail || '').trim();
  const smtpPass = String(
    process.env.EMAIL_VERIFICATION_SMTP_PASS || process.env.EMAIL_VERIFICATION_FROM_APP_PASSWORD || '',
  )
    .trim()
    .replace(/\s+/g, '');
  const message = buildLoginCodeMessage({ code: payload.code, username: payload.username });
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
        template: 'login_code',
        vars: { username: payload.username, code: payload.code },
      }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`Email webhook failed (${resp.status})${body ? `: ${body.slice(0, 200)}` : ''}`);
    }
    return { sent: true, provider: 'webhook' };
  }

  if (resendApiKey) {
    const resendFrom = String(process.env.EMAIL_VERIFICATION_RESEND_FROM || '').trim() || from;
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
    await transport.verify().catch(() => {
      throw new Error(
        'SMTP login failed. Check EMAIL_VERIFICATION_SMTP_PASS (Gmail App Password) in functions/.env.',
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
    console.warn('[login-code] No delivery configured — allowing preview challenge (emulator/local).');
    return { sent: true, provider: 'preview' };
  }

  throw new Error(
    'Login code email is not configured. Set EMAIL_VERIFICATION_SMTP_PASS or RESEND_API_KEY in functions/.env.',
  );
}

export function maskEmailForDisplay(email: string): string {
  const normalized = String(email || '').trim().toLowerCase();
  const at = normalized.indexOf('@');
  if (at <= 1) return normalized || 'your email';
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const maskedLocal = `${local[0]}${'*'.repeat(Math.min(6, Math.max(2, local.length - 1)))}${local.length > 1 ? local[local.length - 1] : ''}`;
  return `${maskedLocal}@${domain}`;
}
