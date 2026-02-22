/**
 * Base URL for API calls.
 * - Firebase Hosting with rewrites (e.g. custom domain): leave NEXT_PUBLIC_API_URL unset.
 *   Requests to /api/* go same-origin and Hosting rewrites them to the Cloud Function.
 * - If your app is on a different origin than the API: set NEXT_PUBLIC_API_URL to the
 *   Cloud Functions URL, e.g. https://us-central1-xxx.cloudfunctions.net/api
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
