/**
 * Versioned REST API (Express + PostgreSQL). Optional — legacy Firebase routes stay on Next `/api/*`.
 * Set `NEXT_PUBLIC_BACKEND_URL` (e.g. http://localhost:4000) to call `/api/v1/*` on the Node backend.
 */
export function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
  }
  return (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_INTERNAL_URL || '').replace(/\/$/, '');
}

export function backendV1Url(path: string): string {
  const base = getBackendBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return `/api/v1${p}`; // same-origin only works if you proxy in dev; prefer env in production
  return `${base}/api/v1${p}`;
}

export function isBackendConfigured(): boolean {
  return !!getBackendBaseUrl();
}
