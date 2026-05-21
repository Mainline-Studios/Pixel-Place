const STORAGE_KEY = 'pixelplace_pending_verify_token';

export function savePendingVerifyToken(token: string): void {
  if (typeof window === 'undefined' || !token.trim()) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, token.trim());
  } catch {
    /* quota */
  }
}

export function getPendingVerifyToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function clearPendingVerifyToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
