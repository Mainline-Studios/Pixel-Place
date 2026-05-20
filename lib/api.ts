const AUTH_STORAGE_KEY = 'pixelPlaceAuthToken';

/** Cookie shared across *.pixelplaceofficial.com so pay.* can use the same session as the main app. */
function getSharedAuthCookieDomain(): string | null {
  if (typeof window === 'undefined') return null;
  const h = window.location.hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.localhost')) return null;
  if (h.endsWith('pixelplaceofficial.com')) return '.pixelplaceofficial.com';
  return null;
}

function readAuthTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${AUTH_STORAGE_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

/** Decode username from JWT payload (client-only; server still verifies). */
export function decodeJwtUsernameFromToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(b64)) as { username?: string; exp?: number };
    if (typeof json.exp === 'number' && Date.now() / 1000 >= json.exp) return null;
    return typeof json.username === 'string' ? json.username : null;
  } catch {
    return null;
  }
}

// Helper function to get auth token from localStorage or shared cookie (pay subdomain)
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const ls = localStorage.getItem(AUTH_STORAGE_KEY);
  if (ls) return ls;
  const fromCookie = readAuthTokenFromCookie();
  if (fromCookie) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, fromCookie);
    } catch {
      /* quota / private mode */
    }
    return fromCookie;
  }
  return null;
}

// Helper function to save auth token
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, token);
  const domain = getSharedAuthCookieDomain();
  const maxAge = 60 * 60 * 24 * 7;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  if (domain) {
    document.cookie = `${AUTH_STORAGE_KEY}=${encodeURIComponent(token)}; Path=/; Domain=${domain}; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  }
}

// Helper function to remove auth token
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AUTH_STORAGE_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  document.cookie = `${AUTH_STORAGE_KEY}=; Path=/; Domain=.pixelplaceofficial.com; Max-Age=0; SameSite=Lax${secure}`;
}

/**
 * True if we have a non-expired JWT (decode `exp` only — server still verifies signature).
 * Used so features like Pixel Monkey can explain "Unauthorized" before calling the API.
 */
export function hasUsableAuthToken(): boolean {
  const t = getAuthToken();
  if (!t) return false;
  const parts = t.split('.');
  if (parts.length !== 3) return false;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(b64)) as { exp?: number };
    if (typeof json.exp === 'number' && Date.now() / 1000 >= json.exp) return false;
    return true;
  } catch {
    return false;
  }
}

// Helper function to make authenticated fetch requests
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  let body = options.body;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    // Firebase Hosting rewrites may strip Authorization; server also reads this header / body.authToken.
    headers.set('X-Auth-Token', token);
    if (body && typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          body = JSON.stringify({ ...parsed, authToken: token });
        }
      } catch {
        /* not JSON */
      }
    }
  }

  return fetch(url, {
    ...options,
    headers,
    body,
  });
}

export function authErrorMessage(status: number, data: { error?: string; code?: string }): string {
  if (status === 401) {
    if (data?.code === 'SESSION_REVOKED') {
      return data.error || 'Session expired. Please sign in again.';
    }
    return 'Session expired or missing. Sign out, sign in again, then retry.';
  }
  return data?.error || 'Request failed';
}
