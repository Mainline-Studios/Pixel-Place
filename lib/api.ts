// Helper function to get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pixelPlaceAuthToken');
}

// Helper function to save auth token
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pixelPlaceAuthToken', token);
}

// Helper function to remove auth token
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pixelPlaceAuthToken');
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
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}
