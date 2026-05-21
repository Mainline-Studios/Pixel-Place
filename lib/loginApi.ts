import { apiUrl } from '@/lib/apiBaseUrl';

export async function verifyLoginCode(challengeToken: string, code: string) {
  const res = await fetch(apiUrl('/api/auth/login/verify-code'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeToken, code: code.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export async function resendLoginCode(challengeToken: string) {
  const res = await fetch(apiUrl('/api/auth/login/resend-code'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeToken }),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}
