/**
 * Base URL for API calls. When using static export + Firebase Cloud Functions,
 * set NEXT_PUBLIC_API_URL to your Cloud Functions URL, e.g.:
 * https://us-central1-pixel-place-823b1.cloudfunctions.net/api
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.NEXT_PUBLIC_API_URL || '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base.replace(/\/$/, '')}${p}` : p;
}
