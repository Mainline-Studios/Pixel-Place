const STORAGE_KEY = 'pixelplace_cookie_consent_v2';

export type StoredCookieConsent = {
  v: 2;
  /** Strictly necessary — always true */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

export function readCookieConsent(): StoredCookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCookieConsent;
    if (parsed?.v !== 2 || parsed.necessary !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCookieConsent(partial: Pick<StoredCookieConsent, 'analytics' | 'marketing'>): StoredCookieConsent {
  const full: StoredCookieConsent = {
    v: 2,
    necessary: true,
    analytics: partial.analytics,
    marketing: partial.marketing,
    decidedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    /* ignore */
  }
  return full;
}

export function hasCookieDecision(): boolean {
  return readCookieConsent() !== null;
}
