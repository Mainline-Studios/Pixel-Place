/** Web Deploy Services auth — separate from Pixel Place accounts and tokens. */

export const WEB_DEPLOY_AUTH_STORAGE_KEY = 'ppWebDeployAuthToken';
export const WEB_DEPLOY_JWT_AUD = 'pp_web_deploy';

export type WebDeploySession = {
  deployUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
};

export function getWebDeployAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(WEB_DEPLOY_AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setWebDeployAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WEB_DEPLOY_AUTH_STORAGE_KEY, token);
}

export function clearWebDeployAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WEB_DEPLOY_AUTH_STORAGE_KEY);
}

export function decodeWebDeploySession(token: string): WebDeploySession | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(b64)) as {
      aud?: string;
      deployUid?: string;
      email?: string;
      displayName?: string;
      photoURL?: string;
      exp?: number;
    };
    if (json.aud !== WEB_DEPLOY_JWT_AUD) return null;
    if (typeof json.exp === 'number' && Date.now() / 1000 >= json.exp) return null;
    if (!json.deployUid || !json.email) return null;
    return {
      deployUid: json.deployUid,
      email: json.email,
      displayName: json.displayName || json.email.split('@')[0] || 'User',
      photoURL: json.photoURL,
    };
  } catch {
    return null;
  }
}

export function getWebDeploySession(): WebDeploySession | null {
  const t = getWebDeployAuthToken();
  if (!t) return null;
  return decodeWebDeploySession(t);
}
