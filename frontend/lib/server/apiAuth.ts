import type { NextRequest } from 'next/server';
import { getAuthUser, getUserFromDb } from '@/lib/auth';
import type { User } from '@/types';
import { getBackendBaseUrl } from '@/lib/backendV1';
import { mapBackendUserToAppUser } from '@/lib/backendUser';

/** Resolved user from Bearer JWT + Firestore (roles, moderation flags). */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  const auth = getAuthUser(request as unknown as Request);
  if (!auth?.username) return null;
  return getUserFromDb(auth.username);
}

/**
 * Firestore JWT session first, then PostgreSQL backend `/api/v1/users/me` with the same Bearer token.
 * Used for moderation routes when most players authenticate via the Express backend.
 */
export async function getAuthenticatedUserOrBackend(request: NextRequest): Promise<User | null> {
  const primary = await getAuthenticatedUser(request);
  if (primary) return primary;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const base = getBackendBaseUrl();
  if (!base) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const api = json?.data?.user;
    if (!api?.username) return null;
    const fromFs = await getUserFromDb(String(api.username).toLowerCase());
    if (fromFs) return fromFs;
    return mapBackendUserToAppUser(api);
  } catch {
    return null;
  }
}
