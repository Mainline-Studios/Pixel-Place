/**
 * Pyx content filter - calls YOUR Pyx Python app via HTTP.
 * Set PYX_SERVICE_URL to your Pyx service (optional; defaults to shared Pyx API).
 *
 * Endpoints:
 * - POST /score — Decision only, no training. Use for chat, messages.
 * - POST /ai-decide — Decision + training. Use for game AI content.
 * - POST /feedback — Moderator override: {text, safe}. Trains Pyx.
 */

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

async function callPyx(base: string, path: string, body: object): Promise<PyxResponse> {
  const res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

/** POST /score — decision only, no training. Use for chat, messages. */
export async function filterForDisplay(text: string): Promise<string> {
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

/** Check content for publish — returns { safe, filtered, connectionError? }. */
export async function checkForPublish(text: string): Promise<{ safe: boolean; filtered: string; connectionError?: boolean }> {
  if (!text || typeof text !== 'string') return { safe: true, filtered: text };
  const url = getPyxBaseUrl();
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return { safe: false, filtered: '', connectionError: true };
    const data = (await res.json()) as { score?: number; bad?: boolean; censored?: string };
    const bad = data.bad === true || (typeof data.score === 'number' && data.score >= BAN_LINE);
    const filtered = bad && typeof data.censored === 'string' ? data.censored : text;
    return { safe: !bad, filtered };
  } catch (e) {
    console.error('[Pyx] Check failed:', e);
    return { safe: false, filtered: '', connectionError: true };
  }
}

/** Analyze code for inappropriate content — returns { safe, connectionError?, flagged? }. */
export async function analyzeCodeForPublish(source: string): Promise<{ safe: boolean; connectionError?: boolean; flagged?: unknown[] }> {
  if (!source || typeof source !== 'string') return { safe: true };
  const url = getPyxBaseUrl();
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/analyze/three`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    });
    if (!res.ok) return { safe: false, connectionError: true };
    const data = (await res.json()) as { safe?: boolean; flagged?: unknown[] };
    return { safe: data.safe !== false, flagged: data.flagged };
  } catch (e) {
    console.error('[Pyx] Analyze failed:', e);
    return { safe: false, connectionError: true };
  }
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
