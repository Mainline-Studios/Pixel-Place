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

/** Server-only: Claude moderation backup when Pyx is down. Returns filtered text. */
async function moderateWithClaudeServer(text: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return censorLetters(text);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `Is this text appropriate for a family-friendly game? If YES, reply with the exact same text. If NO, reply with a censored version (replace inappropriate parts with ~). Reply with ONLY the final text, nothing else.\n\nText: ${text}`,
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

/** Server-only: Claude check backup for publish. Returns { safe, filtered }. */
export async function checkWithClaudeServer(text: string): Promise<{ safe: boolean; filtered: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
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
          content: `Is this text appropriate for a family-friendly game (yes/no)? If no, provide a censored version. Reply on one line: YES or NO, then a space, then the filtered text (or original if YES).\n\nText: ${text}`,
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

/** Server-only: Claude code analyze backup. Returns { safe }. */
export async function analyzeCodeWithClaudeServer(source: string): Promise<{ safe: boolean }> {
  const key = process.env.ANTHROPIC_API_KEY;
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
          content: `Does this game code contain inappropriate content (profanity, hate, adult content)? Reply with only YES or NO.\n\nCode (excerpt): ${source.slice(0, 4000)}`,
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

/** Server-side: POST /score — decision only, no training. Use for chat, messages. Falls back to Claude when Pyx is down. */
export async function filterForDisplayServer(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  const url = getPyxBaseUrl();
  try {
    const data = await callPyx(url, '/score', { text });
    return applyPyxResponse(data, text);
  } catch (e) {
    console.error('[Pyx] Call failed:', e);
    return moderateWithClaudeServer(text);
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

/** Client: check content for publish — returns { safe, filtered, connectionError? }. Uses API (Pyx with Claude backup). */
export async function checkForPublish(text: string): Promise<{ safe: boolean; filtered: string; connectionError?: boolean }> {
  if (!text || typeof text !== 'string') return { safe: true, filtered: text };
  try {
    const { apiUrl } = await import('@/lib/apiBaseUrl');
    const res = await fetch(apiUrl('/api/pyx/check'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = (await res.json()) as { safe?: boolean; filtered?: string; connectionError?: boolean };
    if (!res.ok || data.connectionError) {
      return { safe: false, filtered: '', connectionError: true };
    }
    const safe = data.safe !== false;
    const filtered = typeof data.filtered === 'string' ? data.filtered : censorLetters(text);
    return { safe, filtered };
  } catch (e) {
    console.warn('[Pyx] Check failed:', e);
    return { safe: false, filtered: '', connectionError: true };
  }
}

/** Client: Pyx Analyze — scan code for inappropriate content. Uses API (Pyx with Claude backup). */
export async function analyzeCodeForPublish(source: string): Promise<{
  safe: boolean;
  connectionError?: boolean;
  flagged?: Array<{ snippet: string; score: number; reason?: string }>;
}> {
  if (!source || typeof source !== 'string') return { safe: true };
  try {
    const { apiUrl } = await import('@/lib/apiBaseUrl');
    const res = await fetch(apiUrl('/api/pyx/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    });
    const data = (await res.json()) as { safe?: boolean; connectionError?: boolean; flagged?: Array<{ snippet: string; score: number; reason?: string }> };
    if (!res.ok || data.connectionError) {
      return { safe: false, connectionError: true };
    }
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

// Client-only: Pyx availability for username display (when down, censor others' usernames until retry succeeds)
let pyxAvailable = true;
let pyxRetryTimerId: ReturnType<typeof setInterval> | null = null;
const PYX_RETRY_MS = 60 * 60 * 1000; // 1 hour

export function getPyxAvailable(): boolean {
  if (typeof window === 'undefined') return true;
  return pyxAvailable;
}

function setPyxAvailable(v: boolean): void {
  if (typeof window === 'undefined') return;
  if (pyxAvailable === v) return;
  pyxAvailable = v;
  if (v && pyxRetryTimerId !== null) {
    clearInterval(pyxRetryTimerId);
    pyxRetryTimerId = null;
  }
  pyxListeners.forEach((fn) => fn());
}

const pyxListeners: Array<() => void> = [];
/** Subscribe to Pyx availability changes (e.g. when hourly retry succeeds). */
export function subscribePyxAvailability(fn: () => void): () => void {
  pyxListeners.push(fn);
  return () => {
    const i = pyxListeners.indexOf(fn);
    if (i !== -1) pyxListeners.splice(i, 1);
  };
}

/** Client: check Pyx connection (for hourly retry). */
export async function checkPyxConnection(): Promise<boolean> {
  const url = (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_PYX_SERVICE_URL) || PYX_DEFAULT_URL;
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'ok' }),
    });
    if (res.ok) {
      setPyxAvailable(true);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function startPyxRetryTimer(): void {
  if (typeof window === 'undefined' || pyxRetryTimerId !== null) return;
  pyxRetryTimerId = setInterval(async () => {
    const ok = await checkPyxConnection();
    if (ok) setPyxAvailable(true);
  }, PYX_RETRY_MS);
}

/** Client: filter text (Pyx). Uses pyx-client.js when loaded, else API. On failure, marks Pyx unavailable and retries later. */
export async function filterForDisplay(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return text;
  try {
    const pyx = (await import('@/lib/pyxClient')).getPyxClientIfAvailable();
    if (pyx) {
      const data = await pyx.score(text);
      if (data.bad === true && typeof data.censored === 'string') return data.censored;
      const score = typeof data.score === 'number' ? data.score : 0;
      return score >= BAN_LINE ? censorLetters(text) : text;
    }
  } catch (_e) {
    // Pyx client failed or not loaded; fall back to API
  }
  try {
    const { apiUrl } = await import('@/lib/apiBaseUrl');
    const res = await fetch(apiUrl('/api/pyx/filter'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      setPyxAvailable(false);
      startPyxRetryTimer();
      return censorLetters(text);
    }
    const data = (await res.json()) as { filtered?: string };
    return typeof data.filtered === 'string' ? data.filtered : text;
  } catch (e) {
    console.warn('[Pyx] Filter failed:', e);
    setPyxAvailable(false);
    startPyxRetryTimer();
    return censorLetters(text);
  }
}
