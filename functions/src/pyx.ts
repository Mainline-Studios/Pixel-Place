/**
 * Pyx content filter - calls YOUR Pyx Python app via HTTP.
 * Set PYX_SERVICE_URL to your Pyx service.
 *
 * Endpoints:
 * - POST /score — Decision only, no training. Use for chat, messages.
 * - POST /ai-decide — Decision + training. Use for game AI content.
 * - POST /feedback — Moderator override: {text, safe}. Trains Pyx.
 */

const BAN_LINE = 0.7;

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
  const url = process.env.PYX_SERVICE_URL;
  if (!url) {
    console.error('[Pyx] PYX_SERVICE_URL not set! Set it in Firebase config.');
    return censorLetters(text);
  }
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
  const url = process.env.PYX_SERVICE_URL;
  if (!url) {
    console.error('[Pyx] PYX_SERVICE_URL not set!');
    return censorLetters(text);
  }
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
  const url = process.env.PYX_SERVICE_URL;
  if (!url) return;
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

export { BAN_LINE };
