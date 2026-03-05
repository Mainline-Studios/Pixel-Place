/**
 * Server-side hardware (device) ban helpers.
 * - Check if a device is banned
 * - Record a device for a user (for "Account A has MacOS, Windows")
 * - Add/remove hardware bans and sync account bans
 */

import {
  getDocument,
  setDocument,
  deleteDocument,
  getDocuments,
  queryDocuments,
  COLLECTIONS,
} from './firestore';
import type { Ban } from '@/types';

const DEVICE_ID_MAX = 128;
const LABEL_MAX = 64;

function sanitizeDeviceId(id: string): string {
  return String(id).slice(0, DEVICE_ID_MAX).replace(/[^a-zA-Z0-9_-]/g, '');
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

  // user_devices: doc id = username_lower, { devices: [{ deviceId, label, firstSeen, lastSeen }] }
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

  // device_users: doc id = deviceId, { usernames: string[] }
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

/** Add a hardware ban: ban this device and ban all accounts that have used it. Reversible. */
export async function addHardwareBan(
  deviceId: string,
  bannedBy: string,
  reason?: string
): Promise<{ bannedUsernames: string[] }> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return { bannedUsernames: [] };

  const usernames = await getUsernamesForDevice(id);
  const now = Date.now();

  await setDocument(COLLECTIONS.HARDWARE_BANS, id, {
    deviceId: id,
    banned_at: now,
    banned_by: bannedBy,
    reason: reason || '',
    linked_usernames: usernames,
    created_at: now,
  });

  const bannedUsernames: string[] = [];
  for (const un of usernames) {
    const existingBans = await queryDocuments(COLLECTIONS.BANS, 'username_lower', '==', un);
    if (existingBans.length > 0) continue; // already banned
    await setDocument(COLLECTIONS.BANS, un, {
      username: un,
      username_lower: un,
      reason: reason || `Hardware ban (device ${id.slice(0, 8)}…)`,
      banned_by: bannedBy,
      banned_at: now,
      expires_at: null,
      permanent: true,
      hardware_ban_device_id: id,
      created_at: now,
    });
    bannedUsernames.push(un);
  }

  return { bannedUsernames };
}

/** Remove a hardware ban: unban the device and remove account bans that were only due to this device. */
export async function removeHardwareBan(deviceId: string): Promise<{ unbannedUsernames: string[] }> {
  const id = sanitizeDeviceId(deviceId);
  if (!id) return { unbannedUsernames: [] };

  await deleteDocument(COLLECTIONS.HARDWARE_BANS, id);

  const unbannedUsernames: string[] = [];
  const bans = await getDocuments(COLLECTIONS.BANS, (ref) =>
    ref.where('hardware_ban_device_id', '==', id)
  );
  for (const ban of bans) {
    await deleteDocument(COLLECTIONS.BANS, ban.id);
    if (ban.username_lower) unbannedUsernames.push(ban.username_lower);
  }

  return { unbannedUsernames };
}

/** List all hardware bans */
export async function listHardwareBans(): Promise<
  Array<{ deviceId: string; bannedAt: number; bannedBy: string; reason?: string; linkedUsernames?: string[] }>
> {
  const docs = await getDocuments(COLLECTIONS.HARDWARE_BANS);
  return docs.map((d) => ({
    deviceId: d.deviceId || d.id,
    bannedAt: d.banned_at || 0,
    bannedBy: d.banned_by || '',
    reason: d.reason,
    linkedUsernames: Array.isArray(d.linked_usernames) ? d.linked_usernames : [],
  }));
}
