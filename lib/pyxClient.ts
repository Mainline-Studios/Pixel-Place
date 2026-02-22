/**
 * Client-side PyxClient wrapper.
 * Load /pyx-client.js in the app (done in layout), then use getPyxClient() to get an instance.
 *
 * Set in .env:
 *   NEXT_PUBLIC_PYX_SERVICE_URL=https://your-pyx-api.run.app
 *   NEXT_PUBLIC_PYX_API_KEY=your-key   (optional; omit if Pyx doesn't require a key)
 *
 * Usage:
 *   const pyx = getPyxClient();
 *   const res = await pyx.score("hello");       // { score, bad, censored }
 *   const res = await pyx.aiDecide("message");  // for chat / AI content
 */

const PYX_DEFAULT_URL = 'https://pyxaiapi-574247481583.us-central1.run.app';

export interface PyxScoreResult {
  score?: number;
  bad?: boolean;
  censored?: string;
}

export interface PyxClientInstance {
  score(text: string): Promise<PyxScoreResult>;
  aiDecide(text: string, category?: string): Promise<PyxScoreResult>;
  feedback(text: string, safe: boolean, category?: string): Promise<unknown>;
  complete(prompt: string, maxTokens?: number): Promise<string>;
  explain(snippet: string): Promise<string>;
  refactor(snippet: string, instruction?: string): Promise<string>;
  check(source: string, language?: string): Promise<unknown>;
  checkThree(source: string): Promise<unknown>;
  analyze(source: string, language?: string): Promise<unknown>;
  analyzeThree(source: string): Promise<unknown>;
  health(): Promise<unknown>;
}

declare global {
  interface Window {
    PyxClient?: new (options: { baseUrl: string; apiKey?: string | null }) => PyxClientInstance;
  }
}

function getBaseUrl(): string {
  if (typeof window === 'undefined') return PYX_DEFAULT_URL;
  const url = (window as any).__NEXT_DATA__?.runtimeConfig?.PYX_SERVICE_URL
    || process.env.NEXT_PUBLIC_PYX_SERVICE_URL
    || PYX_DEFAULT_URL;
  return (url || '').replace(/\/$/, '') || PYX_DEFAULT_URL;
}

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  const key = process.env.NEXT_PUBLIC_PYX_API_KEY;
  return (key && typeof key === 'string' && key.trim()) ? key.trim() : null;
}

let cachedClient: PyxClientInstance | null = null;

/**
 * Returns a PyxClient instance (baseUrl + optional apiKey). Uses window.PyxClient from /pyx-client.js.
 * Call after the script has loaded (e.g. in useEffect or on user action).
 */
export function getPyxClient(): PyxClientInstance {
  if (cachedClient) return cachedClient;
  const Ctor = typeof window !== 'undefined' ? window.PyxClient : null;
  if (!Ctor) {
    throw new Error('PyxClient not loaded. Ensure /pyx-client.js is loaded (e.g. in layout).');
  }
  cachedClient = new Ctor({
    baseUrl: getBaseUrl(),
    apiKey: getApiKey(),
  });
  return cachedClient;
}

/**
 * Safe version: returns null if PyxClient isn't loaded yet. Use when script may load later.
 */
export function getPyxClientIfAvailable(): PyxClientInstance | null {
  if (cachedClient) return cachedClient;
  const Ctor = typeof window !== 'undefined' ? window.PyxClient : null;
  if (!Ctor) return null;
  cachedClient = new Ctor({ baseUrl: getBaseUrl(), apiKey: getApiKey() });
  return cachedClient;
}
