/**
 * Server-side hardware (device) ban helpers.
 * - Check if a device is banned
 * - Record a device for a user (for "Account A has MacOS, Windows")
 * - Add/remove hardware bans: ban every linked device + linked accounts (same network closure)
 */

import { randomUUID } from 'crypto';
import {
  getDocument,
  setDocument,
  deleteDocument,
  getDocuments,
  COLLECTIONS,
} from './firestore';
import type { Ban } from '@/types';
import { TERMINATED_BAN_KIND, TERMINATED_FIRE_MESSAGE } from '@/lib/terminatedBan';

export type AddHardwareBanMode = 'hardware' | 'terminated';

export interface AddHardwareBanParams {
  reason?: string;
  mode?: AddHardwareBanMode;
  terminatedSubject?: string;
}

const DEVICE_ID_MAX = 128;
const LABEL_MAX = 64;

function sanitizeDeviceId(id: string): string {
  return String(id).slice(0, DEVICE_ID_MAX).replace(/[^a-zA-Z0-9_-]/g, '');
}

/** Expand device_users ↔ user_devices until no new ids (all browsers/devices tied to those accounts). */
async function collectLinkedHardwareNetwork(rootDeviceId: string): Promise<{ deviceIds: string[]; usernames: string[] }> {
  const root = sanitizeDeviceId(rootDeviceId);
  const deviceIds = new Set<string>();
  const usernames = new Set<string>();
  if (!root) return { deviceIds: [], usernames: [] };
  deviceIds.add(root);
  for (let round = 0; round < 32; round++) {
    const dBefore = deviceIds.size;
    const uBefore = usernames.size;
    for (const d of [...deviceIds]) {
      const doc = await getDocument(COLLECTIONS.DEVICE_USERS, d);
      const list: string[] = Array.isArray(doc?.usernames) ? doc.usernames : [];
      for (const u of list) {
        const ul = String(u).toLowerCase().trim();
        if (ul) usernames.add(ul);
      }
    }
    for (const u of [...usernames]) {
      const doc = await getDocument(COLLECTIONS.USER_DEVICES, u);
      const devs: Array<{ deviceId?: string }> = Array.isArray(doc?.devices) ? doc.devices : [];
      for (const row of devs) {
        const did = sanitizeDeviceId(String(row?.deviceId || ''));
        if (did) deviceIds.add(did);
      }
    }
    if (deviceIds.size === dBefore && usernames.size === uBefore) break;
  }
  return { deviceIds: [...deviceIds], usernames: [...usernames] };
}

export async function isDeviceBanned(deviceId: string): Promise<boolean> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return false;
  const doc = await getDocument(COLLECTIONS.HARDWARE_BANS, id);
  return !!doc;
}

/** Record that this user logged in from this device (for device list and hardware ban lookup) */
export async function recordDevice(
  username: string,
  deviceId: string,
  label: string
): Promise<void> {
  const id = sanitizeDeviceId(deviceId);
  const safeLabel = String(label).slice(0, LABEL_MAX) || 'Unknown';
  if (!id) return;

  const now = Date.now();
  const usernameLower = username.toLowerCase();

  const userDevicesDoc = await getDocument(COLLECTIONS.USER_DEVICES, usernameLower);
  const devices: Array<{ deviceId: string; label: string; firstSeen: number; lastSeen: number }> =
    Array.isArray(userDevicesDoc?.devices) ? userDevicesDoc.devices : [];
  const existing = devices.find((d) => d.deviceId === id);
  if (existing) {
    existing.lastSeen = now;
    existing.label = safeLabel;
  } else {
    devices.push({ deviceId: id, label: safeLabel, firstSeen: now, lastSeen: now });
  }
  await setDocument(COLLECTIONS.USER_DEVICES, usernameLower, { devices, updated_at: now });

  const deviceUsersDoc = await getDocument(COLLECTIONS.DEVICE_USERS, id);
  const usernames: string[] = Array.isArray(deviceUsersDoc?.usernames) ? deviceUsersDoc.usernames : [];
  if (!usernames.includes(usernameLower)) {
    usernames.push(usernameLower);
    await setDocument(COLLECTIONS.DEVICE_USERS, id, { usernames, updated_at: now });
  }
}

/** Get all device records for a user (for admin: "Account A has MacOS, Windows") */
export async function getDevicesForUser(username: string): Promise<
  Array<{ deviceId: string; label: string; firstSeen: number; lastSeen: number }>
> {
  const doc = await getDocument(COLLECTIONS.USER_DEVICES, username.toLowerCase());
  return Array.isArray(doc?.devices) ? doc.devices : [];
}

/** Get all usernames that have used this device */
export async function getUsernamesForDevice(deviceId: string): Promise<string[]> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return [];
  const doc = await getDocument(COLLECTIONS.DEVICE_USERS, id);
  return Array.isArray(doc?.usernames) ? doc.usernames : [];
}

/** Add hardware bans for every device linked to this device’s accounts, and ban those accounts. */
export async function addHardwareBan(
  deviceId: string,
  bannedBy: string,
  reasonOrParams?: string | AddHardwareBanParams
): Promise<{ bannedUsernames: string[]; bannedDeviceIds: string[]; groupId: string }> {
  const params: AddHardwareBanParams =
    typeof reasonOrParams === 'string' ? { reason: reasonOrParams, mode: 'hardware' } : { mode: 'hardware', ...reasonOrParams };
  const mode = params.mode === 'terminated' ? 'terminated' : 'hardware';
  const banKind = mode === 'terminated' ? TERMINATED_BAN_KIND : undefined;
  const terminatedSubject =
    typeof params.terminatedSubject === 'string' && params.terminatedSubject.trim()
      ? params.terminatedSubject.trim().slice(0, 120)
      : undefined;

  const id = sanitizeDeviceId(deviceId);
  if (!id) return { bannedUsernames: [], bannedDeviceIds: [], groupId: '' };

  const { deviceIds, usernames } = await collectLinkedHardwareNetwork(id);
  const groupId = randomUUID();
  const now = Date.now();
  const reasonText =
    (params.reason && params.reason.trim()) ||
    (mode === 'terminated' ? TERMINATED_FIRE_MESSAGE : '');
  const linked = [...usernames];

  for (const devId of deviceIds) {
    await setDocument(COLLECTIONS.HARDWARE_BANS, devId, {
      deviceId: devId,
      banned_at: now,
      banned_by: bannedBy,
      reason: reasonText,
      ...(banKind ? { ban_kind: banKind } : {}),
      ...(terminatedSubject ? { terminated_subject: terminatedSubject } : {}),
      linked_usernames: linked,
      group_id: groupId,
      root_device_id: id,
      created_at: now,
    });
  }

  const bannedUsernames: string[] = [];
  for (const un of usernames) {
    const existing = await getDocument(COLLECTIONS.BANS, un);
    if (existing && mode !== 'terminated') continue;
    await setDocument(COLLECTIONS.BANS, un, {
      username: un,
      username_lower: un,
      reason: reasonText || `Hardware ban — all linked browsers/devices (${deviceIds.length} device ids)`,
      banned_by: bannedBy,
      banned_at: now,
      expires_at: null,
      permanent: true,
      ...(banKind ? { ban_kind: banKind } : {}),
      ...(terminatedSubject ? { terminated_subject: terminatedSubject } : {}),
      hardware_ban_device_id: id,
      hardware_ban_group_id: groupId,
      hardware_ban_device_ids: deviceIds,
      created_at: now,
    });
    bannedUsernames.push(un);
  }

  return { bannedUsernames, bannedDeviceIds: deviceIds, groupId };
}

/** Remove hardware ban wave (or legacy single device) and related account bans. */
export async function removeHardwareBan(deviceId: string): Promise<{ unbannedUsernames: string[] }> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return { unbannedUsernames: [] };

  const hwDoc = await getDocument(COLLECTIONS.HARDWARE_BANS, id);
  const groupId = typeof hwDoc?.group_id === 'string' ? hwDoc.group_id : null;

  const unbannedUsernames: string[] = [];

  if (groupId) {
    const hwDocs = await getDocuments(COLLECTIONS.HARDWARE_BANS, (ref) => ref.where('group_id', '==', groupId));
    for (const d of hwDocs) {
      await deleteDocument(COLLECTIONS.HARDWARE_BANS, d.id);
    }
    const banDocs = await getDocuments(COLLECTIONS.BANS, (ref) => ref.where('hardware_ban_group_id', '==', groupId));
    for (const ban of banDocs) {
      await deleteDocument(COLLECTIONS.BANS, ban.id);
      if (ban.username_lower) unbannedUsernames.push(ban.username_lower);
    }
  } else {
    await deleteDocument(COLLECTIONS.HARDWARE_BANS, id);
    const bans = await getDocuments(COLLECTIONS.BANS, (ref) => ref.where('hardware_ban_device_id', '==', id));
    for (const ban of bans) {
      await deleteDocument(COLLECTIONS.BANS, ban.id);
      if (ban.username_lower) unbannedUsernames.push(ban.username_lower);
    }
  }

  return { unbannedUsernames };
}

/** List all hardware bans */
export async function listHardwareBans(): Promise<
  Array<{
    deviceId: string;
    bannedAt: number;
    bannedBy: string;
    reason?: string;
    banKind?: string;
    terminatedSubject?: string;
    linkedUsernames?: string[];
    groupId?: string;
    rootDeviceId?: string;
  }>
> {
  const docs = await getDocuments(COLLECTIONS.HARDWARE_BANS);
  return docs.map((d) => ({
    deviceId: d.deviceId || d.id,
    bannedAt: d.banned_at || 0,
    bannedBy: d.banned_by || '',
    reason: d.reason,
    banKind: d.ban_kind,
    terminatedSubject: d.terminated_subject,
    linkedUsernames: Array.isArray(d.linked_usernames) ? d.linked_usernames : [],
    groupId: d.group_id,
    rootDeviceId: d.root_device_id,
  }));
}
