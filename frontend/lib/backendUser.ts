import type { User } from '@/types';
import type { BackendUserPayload } from '@/types/backend';
import { isListedHeadAdmin, isListedAdminAccount } from '@/lib/storage';

function trustFromApi(api: BackendUserPayload): User['trust'] {
  const t = api.trust;
  if (!t) return undefined;
  return {
    safeModeEnabled: t.safeModeEnabled,
    educationalModeEnabled: t.educationalModeEnabled,
    verifiedCreator: t.verifiedCreator,
    verifiedCreatorLabel: t.verifiedCreatorLabel,
    linkedToParent: t.linkedToParent,
    familyCodeActive: t.familyCodeActive,
  };
}
import { backendV1Url } from '@/lib/backendV1';
import { clearBackendToken, getBackendToken } from '@/lib/backendSession';

export type { BackendUserPayload };

export function mapBackendUserToAppUser(api: BackendUserPayload): User {
  const baseRole = (['user', 'mod', 'admin', 'head_admin'].includes(api.role) ? api.role : 'user') as User['role'];
  const elevated: User['role'] | null = isListedHeadAdmin(api.username)
    ? 'head_admin'
    : isListedAdminAccount(api.username)
      ? 'admin'
      : null;
  const role = elevated ?? baseRole;
  return {
    username: api.username,
    password: '',
    gender: api.gender || 'N/A',
    role,
    coins: api.coins,
    safetyPoints: api.safetyPoints ?? 0,
    ownedSkins: Array.isArray(api.ownedSkins) ? (api.ownedSkins as string[]) : ['starter_classic'],
    equippedSkin: api.equippedSkin || 'starter_classic',
    ownedFaces: Array.isArray(api.ownedFaces) ? (api.ownedFaces as string[]) : [],
    equippedFace: api.equippedFace ?? undefined,
    ownedAccessories: Array.isArray(api.ownedAccessories) ? (api.ownedAccessories as string[]) : [],
    equippedAccessories: Array.isArray(api.equippedAccessories)
      ? (api.equippedAccessories as string[])
      : [],
    friends: Array.isArray(api.friends) ? (api.friends as string[]) : [],
    email: api.email ?? undefined,
    photoURL: api.profile.avatarUrl ?? undefined,
    authBackend: 'postgres',
    backendUserId: api.id,
    backendPayload: api,
    trust: trustFromApi(api),
  };
}

export async function fetchBackendMe(token: string): Promise<BackendUserPayload | null> {
  const res = await fetch(backendV1Url('/users/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.user ?? null;
}

export async function refreshBackendSession(): Promise<User | null> {
  const token = getBackendToken();
  if (!token) return null;
  const raw = await fetchBackendMe(token);
  if (!raw) {
    clearBackendToken();
    return null;
  }
  return mapBackendUserToAppUser(raw);
}

export function clearBackendSession(): void {
  clearBackendToken();
}
