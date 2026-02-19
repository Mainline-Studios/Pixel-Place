/**
 * Pyx content filter - calls YOUR Pyx Python app via HTTP.
 * Set PYX_SERVICE_URL to your Pyx service URL (optional; defaults to shared Pyx API).
 *
 * Endpoints:
 * - POST /score — Decision only, no training. Use for normal checks (chat, messages).
 * - POST /ai-decide — Decision + training. Use for game AI content (AI chat, prompts).
 * - POST /feedback — Moderator override: {text, safe}. Trains Pyx.
 */
const PYX_DEFAULT_URL = 'https://pyxaiapi-574247481583.us-central1.run.app';

function getPyxBaseUrl(): string {
  return process.env.PYX_SERVICE_URL || PYX_DEFAULT_URL;
}

/** Replace every letter (A-Z, a-z) with ~. Leaves spaces, numbers, symbols. */
export function censorLetters(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/[A-Za-z]/g, '~');
}

/** BAN_LINE from Pyx - score >= this means inappropriate. */
export const BAN_LINE = 0.7;

type PyxResponse = { score?: number; bad?: boolean; censored?: string };

function applyPyxResponse(data: PyxResponse, original: string): string {
  if (data.bad === true && typeof data.censored === 'string') return data.censored;
  const score = typeof data.score === 'number' ? data.score : 0;
  return score >= BAN_LINE ? censorLetters(original) : original;
}

async function callPyx(base: string, path: string, body: object): Promise<PyxResponse> {
  const res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`[Pyx] ${path} error:`, res.status);
    throw new Error(`Pyx ${path} failed: ${res.status}`);
  }
  return (await res.json()) as PyxResponse;
}

/** Server-side: POST /score — decision only, no training. Use for chat, messages. */
export async function filterForDisplayServer(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  const url = getPyxBaseUrl();
  try {
    const data = await callPyx(url, '/score', { text });
    return applyPyxResponse(data, text);
  } catch (e) {
    console.error('[Pyx] Call failed:', e);
    return censorLetters(text);
  }
}

/** Server-side: POST /ai-decide — decision + training. Use for game AI content (AI chat, prompts). */
export async function filterForDisplayAIDecideServer(text: string): Promise<string> {
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

/** Send moderator feedback to train Pyx. Call when a moderator overrides a decision. */
export async function sendFeedbackServer(text: string, safe: boolean): Promise<void> {
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

/** Client: send moderator feedback. Use when a moderator overrides a decision. */
export async function sendFeedback(text: string, safe: boolean): Promise<void> {
  if (!text || typeof text !== 'string') return;
  try {
    const { apiUrl } = await import('@/lib/apiBaseUrl');
    await fetch(apiUrl('/api/pyx/feedback'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, safe }),
    });
  } catch (e) {
    console.warn('[Pyx] Feedback failed:', e);
  }
}

/** Client: check content for publish — returns { safe, filtered, connectionError? }. Calls Pyx directly (no proxy). */
export async function checkForPublish(text: string): Promise<{ safe: boolean; filtered: string; connectionError?: boolean }> {
  if (!text || typeof text !== 'string') return { safe: true, filtered: text };
  const url = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_PYX_SERVICE_URL) || PYX_DEFAULT_URL;
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      return { safe: false, filtered: '', connectionError: true };
    }
    const data = (await res.json()) as { score?: number; bad?: boolean; censored?: string };
    const bad = data.bad === true || (typeof data.score === 'number' && data.score >= BAN_LINE);
    const filtered = bad && typeof data.censored === 'string' ? data.censored : text;
    return { safe: !bad, filtered };
  } catch (e) {
    console.warn('[Pyx] Check failed:', e);
    return { safe: false, filtered: '', connectionError: true };
  }
}

/** Client: Pyx Analyze — scan code for inappropriate content. Calls Pyx directly (no proxy). */
export async function analyzeCodeForPublish(source: string): Promise<{
  safe: boolean;
  connectionError?: boolean;
  flagged?: Array<{ snippet: string; score: number; reason?: string }>;
}> {
  if (!source || typeof source !== 'string') return { safe: true };
  const url = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_PYX_SERVICE_URL) || PYX_DEFAULT_URL;
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/analyze/three`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    });
    if (!res.ok) {
      return { safe: false, connectionError: true };
    }
    const data = (await res.json()) as { safe?: boolean; flagged?: Array<{ snippet: string; score: number; reason?: string }> };
    return { safe: data.safe !== false, flagged: data.flagged };
  } catch (e) {
    console.warn('[Pyx] Analyze failed:', e);
    return { safe: false, connectionError: true };
  }
}

/** Client: Pyx Code — code completion. Free option for AI Coder. */
export async function pyxCodeComplete(prompt: string, maxTokens: number = 256): Promise<{ completion: string; connectionError?: boolean }> {
  if (!prompt || typeof prompt !== 'string') return { completion: '' };
  try {
    const { apiUrl } = await import('@/lib/apiBaseUrl');
    const res = await fetch(apiUrl('/api/pyx/code/complete'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, max_tokens: maxTokens }),
    });
    const data = (await res.json()) as { completion?: string; connectionError?: boolean };
    if (!res.ok || data.connectionError) {
      return { completion: '', connectionError: true };
    }
    return { completion: typeof data.completion === 'string' ? data.completion : '' };
  } catch (e) {
    console.warn('[Pyx] Code complete failed:', e);
    return { completion: '', connectionError: true };
  }
}

/** Client: calls /api/pyx/filter which proxies to your Pyx app (/score). */
export async function filterForDisplay(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  try {
    const { apiUrl } = await import('@/lib/apiBaseUrl');
    const res = await fetch(apiUrl('/api/pyx/filter'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.warn('[Pyx] Filter API error:', res.status);
      return text;
    }
    const data = await res.json();
    return typeof data.filtered === 'string' ? data.filtered : text;
  } catch (e) {
    console.warn('[Pyx] Filter failed:', e);
    return text;
  }
}
