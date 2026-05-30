import { apiUrl } from '@/lib/apiBaseUrl';
import {
  clearWebDeployAuthToken,
  getWebDeployAuthToken,
  setWebDeployAuthToken,
  type WebDeploySession,
} from '@/lib/webDeployAuth';

export async function exchangeWebDeployGoogleIdToken(idToken: string): Promise<{
  token: string;
  session: WebDeploySession;
}> {
  const res = await fetch(apiUrl('/api/web-deploy-auth/google'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Web Deploy sign-in failed');
  }
  const token = String(data.token || '');
  const session = data.session as WebDeploySession;
  if (!token || !session?.deployUid) {
    throw new Error('Invalid sign-in response');
  }
  setWebDeployAuthToken(token);
  return { token, session };
}

export async function webDeployAuthenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getWebDeployAuthToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Auth-Token', token);
    let body = options.body;
    if (body && typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          body = JSON.stringify({ ...parsed, authToken: token });
        }
      } catch {
        /* not json */
      }
    }
    return fetch(url, { ...options, headers, body });
  }
  return fetch(url, options);
}

export function signOutWebDeploy(): void {
  clearWebDeployAuthToken();
}
