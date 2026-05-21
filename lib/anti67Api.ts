import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch } from '@/lib/api';
import type { Anti67State } from '@/lib/anti67';

export async function startAnti67Lock(
  vote: 'no' | 'yes',
): Promise<{ ok: boolean; anti67?: Anti67State; error?: string }> {
  const res = await authenticatedFetch(apiUrl('/api/account/anti67/start'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error || 'Could not start Anti 67' };
  return { ok: true, anti67: data.anti67 };
}

export async function recordAnti67PlayComplete(): Promise<{
  ok: boolean;
  anti67?: Anti67State;
  error?: string;
}> {
  const res = await authenticatedFetch(apiUrl('/api/account/anti67/play-complete'), { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error || 'Could not save progress' };
  return { ok: true, anti67: data.anti67 };
}

export async function recordAnti67SkipPenalty(): Promise<{
  ok: boolean;
  anti67?: Anti67State;
  error?: string;
}> {
  const res = await authenticatedFetch(apiUrl('/api/account/anti67/skip-penalty'), { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error || 'Could not apply skip penalty' };
  return { ok: true, anti67: data.anti67 };
}

export async function dismissAnti67Lock(): Promise<{ ok: boolean; anti67?: Anti67State; error?: string }> {
  const res = await authenticatedFetch(apiUrl('/api/account/anti67/dismiss'), { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error || 'Could not close' };
  return { ok: true, anti67: data.anti67 };
}

export async function fetchAnti67Status(): Promise<{ ok: boolean; anti67?: Anti67State; error?: string }> {
  const res = await authenticatedFetch(apiUrl('/api/account/anti67/status'), {
    method: 'GET',
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error || 'Could not load Anti 67 status' };
  return { ok: true, anti67: data.anti67 };
}
