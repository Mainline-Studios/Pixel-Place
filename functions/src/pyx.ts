/**
 * Pyx content filter - calls YOUR Pyx Python app via HTTP.
 * Set PYX_SERVICE_URL to your Pyx service (optional; defaults to shared Pyx API).
 *
 * Endpoints:
 * - POST /score — Decision only, no training. Use for chat, messages.
 * - POST /ai-decide — Decision + training. Use for game AI content.
 * - POST /feedback — Moderator override: {text, safe}. Trains Pyx.
 */

import { getAnthropicApiKey } from './config';

const PYX_DEFAULT_URL = 'https://pyxaiapi-574247481583.us-central1.run.app';
const BAN_LINE = 0.7;

function getPyxBaseUrl(): string {
  return process.env.PYX_SERVICE_URL || PYX_DEFAULT_URL;
}

type PyxResponse = { score?: number; bad?: boolean; censored?: string };

function applyPyxResponse(data: PyxResponse, original: string): string {
  if (data.bad === true && typeof data.censored === 'string') return data.censored;
  const score = typeof data.score === 'number' ? data.score : 0;
  return score >= BAN_LINE ? censorLetters(original) : original;
}

function getPyxHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = (process.env.PYX_API_KEY || '').trim();
  if (key) {
    h['X-API-Key'] = key;
    h['Authorization'] = `Bearer ${key}`;
  }
  return h;
}

async function callPyx(base: string, path: string, body: object): Promise<PyxResponse> {
  const res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: getPyxHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`[Pyx] ${path} error:`, res.status, await res.text());
    throw new Error(`Pyx ${path} failed: ${res.status}`);
  }
  return (await res.json()) as PyxResponse;
}

/** Replace every letter (A-Z, a-z) with ~ */
export function censorLetters(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/[A-Za-z]/g, '~');
}

async function moderateWithClaude(text: string): Promise<string> {
  const key = getAnthropicApiKey();
  if (!key) return censorLetters(text);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `Is this text appropriate for a family-friendly game? If YES, reply with the exact same text. If NO, reply with a censored version (replace inappropriate parts with ~). Reply with ONLY the final text.\n\nText: ${text}`,
        }],
      }),
    });
    if (!res.ok) return censorLetters(text);
    const data = await res.json();
    const out = (data.content?.[0] as { text?: string })?.text?.trim() ?? '';
    return out || censorLetters(text);
  } catch (e) {
    console.warn('[Pyx] Claude backup failed:', e);
    return censorLetters(text);
  }
}

async function checkWithClaude(text: string): Promise<{ safe: boolean; filtered: string }> {
  const key = getAnthropicApiKey();
  if (!key) return { safe: false, filtered: censorLetters(text) };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `Is this text appropriate for a family-friendly game (yes/no)? If no, provide a censored version. Reply: YES or NO, then space, then the filtered text.\n\nText: ${text}`,
        }],
      }),
    });
    if (!res.ok) return { safe: false, filtered: censorLetters(text) };
    const data = await res.json();
    const reply = ((data.content?.[0] as { text?: string })?.text ?? '').trim();
    const safe = reply.toUpperCase().startsWith('YES');
    const filtered = reply.includes(' ') ? reply.replace(/^(YES|NO)\s+/i, '').trim() : text;
    return { safe, filtered: filtered || censorLetters(text) };
  } catch (e) {
    console.warn('[Pyx] Claude check backup failed:', e);
    return { safe: false, filtered: censorLetters(text) };
  }
}

async function analyzeCodeWithClaude(source: string): Promise<{ safe: boolean }> {
  const key = getAnthropicApiKey();
  if (!key) return { safe: false };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 64,
        messages: [{
          role: 'user',
          content: `Does this game code contain inappropriate content? Reply only YES or NO.\n\nCode: ${source.slice(0, 4000)}`,
        }],
      }),
    });
    if (!res.ok) return { safe: false };
    const data = await res.json();
    const reply = ((data.content?.[0] as { text?: string })?.text ?? '').trim().toUpperCase();
    return { safe: reply.startsWith('NO') };
  } catch (e) {
    console.warn('[Pyx] Claude analyze backup failed:', e);
    return { safe: false };
  }
}

/** POST /score — decision only. Falls back to Claude when Pyx is down. */
export async function filterForDisplay(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  const url = getPyxBaseUrl();
  try {
    const data = await callPyx(url, '/score', { text });
    return applyPyxResponse(data, text);
  } catch (e) {
    console.error('[Pyx] Call failed:', e);
    return moderateWithClaude(text);
  }
}

/** POST /ai-decide — decision + training. Use for game AI content (AI chat, prompts). */
export async function filterForDisplayAIDecide(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  const url = getPyxBaseUrl();
  try {
    const data = await callPyx(url, '/ai-decide', { text });
    return applyPyxResponse(data, text);
  } catch (e) {
    console.error('[Pyx] ai-decide failed:', e);
    return censorLetters(text);
  }
}

/** POST /feedback — moderator override. Trains Pyx. */
export async function sendFeedback(text: string, safe: boolean): Promise<void> {
  if (!text || typeof text !== 'string') return;
  const url = getPyxBaseUrl();
  try {
    await fetch(`${url.replace(/\/$/, '')}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, safe }),
    });
  } catch (e) {
    console.error('[Pyx] feedback failed:', e);
  }
}

/** Check content for publish. Uses Claude backup when Pyx is down. */
export async function checkForPublish(text: string): Promise<{ safe: boolean; filtered: string; connectionError?: boolean }> {
  if (!text || typeof text !== 'string') return { safe: true, filtered: text };
  const url = getPyxBaseUrl();
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = (await res.json()) as { score?: number; bad?: boolean; censored?: string };
      const bad = data.bad === true || (typeof data.score === 'number' && data.score >= BAN_LINE);
      const filtered = bad && typeof data.censored === 'string' ? data.censored : text;
      return { safe: !bad, filtered };
    }
  } catch (e) {
    console.error('[Pyx] Check failed:', e);
  }
  const backup = await checkWithClaude(text);
  return backup;
}

/** Analyze code for inappropriate content. Uses Claude backup when Pyx is down. */
export async function analyzeCodeForPublish(source: string): Promise<{ safe: boolean; connectionError?: boolean; flagged?: unknown[] }> {
  if (!source || typeof source !== 'string') return { safe: true };
  const url = getPyxBaseUrl();
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/analyze/three`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    });
    if (res.ok) {
      const data = (await res.json()) as { safe?: boolean; flagged?: unknown[] };
      return { safe: data.safe !== false, flagged: data.flagged };
    }
  } catch (e) {
    console.error('[Pyx] Analyze failed:', e);
  }
  const backup = await analyzeCodeWithClaude(source);
  return backup;
}

/** Pyx Code completion — returns { completion, connectionError? }. */
export async function pyxCodeComplete(prompt: string, maxTokens: number = 256): Promise<{ completion: string; connectionError?: boolean }> {
  if (!prompt || typeof prompt !== 'string') return { completion: '' };
  const url = getPyxBaseUrl();
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/code/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, max_tokens: maxTokens }),
    });
    if (!res.ok) return { completion: '', connectionError: true };
    const data = (await res.json()) as { completion?: string };
    return { completion: typeof data.completion === 'string' ? data.completion : '' };
  } catch (e) {
    console.error('[Pyx] Code complete failed:', e);
    return { completion: '', connectionError: true };
  }
}

export { BAN_LINE };
