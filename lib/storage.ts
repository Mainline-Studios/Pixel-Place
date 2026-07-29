import { User, Skin, PublishedGame, DraftGame, SceneData, TabContent, GameServer, ServerPlan, FriendRequest, Message, Accessory, PrebuiltGame, Ban, BanAppeal, UserMadeGame, GameSubmission, Report, DeviceRecord, HardwareBan, AppealMessage } from '@/types';
import { NEW_SKINS, NEW_ACCESSORIES } from './newCatalog';
import { apiUrl } from './apiBaseUrl';
import { TERMINATED_BAN_KIND, TERMINATED_FIRE_MESSAGE } from './terminatedBan';
import { authenticatedFetch } from './api';
import { getDeviceFingerprint } from './deviceFingerprint';

/** Client: empty list (admin accounts are server-only via ADMIN_ACCOUNTS_JSON env). */
export const ADMIN_ACCOUNTS_LIST: { username: string; password: string }[] = [];

/** Usernames that get head_admin role (can ban anyone, including other admins) */
export const HEAD_ADMIN_USERNAMES = ['admin'];

// Initialize storage - All data now in Firebase cloud
// This function is kept for backward compatibility but doesn't use localStorage
export function initializeStorage() {
  if (typeof window === 'undefined') return;
  
  // All data is now stored in Firebase Firestore (cloud)
  // No local storage initialization needed
  console.log('Storage initialized - all data stored in Firebase cloud');
}

// User functions - Firebase only (API reads from Firestore)
export async function getUsers(): Promise<User[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await authenticatedFetch(apiUrl('/api/users'), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      console.error('Failed to fetch users:', response.status, response.statusText);
      throw new Error('Failed to fetch users');
    }
    const apiUsers = await response.json();
    if (!Array.isArray(apiUsers)) {
      console.error('API returned non-array:', apiUsers);
      return [];
    }
    return apiUsers;
  } catch (e) {
    console.error('Error reading users from Firebase API:', e);
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Save each user (API handles updates if user exists)
    for (const user of users) {
      await authenticatedFetch(apiUrl('/api/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(() => { });
    }
  } catch (e) {
    console.error('Error saving users to API:', e);
  }
}

// Skin functions - Using localStorage
// Skin functions - Using API (Firebase)
export async function getSkins(): Promise<Skin[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch(apiUrl('/api/skins'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch skins');
    return await response.json();
  } catch (e) {
    console.error('Error reading skins from API:', e);
    return [];
  }}

export async function saveSkins(skins: Skin[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl('/api/skins'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skins)
    });
  } catch (e) {
    console.error('Error saving skins to API:', e);
  }
}

// Tab content functions - Using API (Firebase)
export async function getTabContent(): Promise<TabContent> {
  if (typeof window === 'undefined') return {} as TabContent;
  try {
    const response = await fetch(apiUrl('/api/tabcontent'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch tab content');
    return await response.json();
  } catch (e) {
    console.error('Error reading tab content from API:', e);
    return {} as TabContent;
  }
}

export async function saveTabContent(content: TabContent): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl('/api/tabcontent'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
  } catch (e) {
    console.error('Error saving tab content to API:', e);
  }
}

// Draft functions — identity from token
export async function getDraft(_username?: string): Promise<DraftGame> {
  if (typeof window === 'undefined') return { title: "", desc: "", owner: "" };
  try {
    const response = await authenticatedFetch(apiUrl('/api/draft'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch draft');
    return await response.json();
  } catch (e) {
    console.error('Error reading draft from API:', e);
    return { title: "", desc: "", owner: "" };
  }
}

export async function saveDraft(draft: DraftGame): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await authenticatedFetch(apiUrl('/api/draft'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft)
    });
  } catch (e) {
    console.error('Error saving draft to API:', e);
  }
}

// Published games functions - Now using API
export async function getPublished(): Promise<PublishedGame[]> {
  if (typeof window === 'undefined') return [];

  try {
    const response = await fetch(apiUrl('/api/published'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch published games');
    const games = await response.json();

    // Remove duplicates - keep only the most recent version of each System game
    const seen = new Map<string, PublishedGame>();
    games.forEach((game: PublishedGame) => {
      const key = `${game.title}_${game.owner}`;
      if (!seen.has(key) || (seen.get(key)?.ts || 0) < (game.ts || 0)) {
        seen.set(key, game);
      }
    });

    // Convert back to array
    const uniqueGames = Array.from(seen.values());

    // Filter out Tic Tac Toe and Capture the Flag games permanently
    const filtered = uniqueGames.filter(g =>
      !((g.title === 'Tic Ti Toe' || g.title === 'Tic Tac Toe' || g.title === 'Capture de Flag') && g.owner === 'System')
    );

    return filtered.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } catch (e) {
    console.error('Error reading published games from API:', e);
    return [];
  }
}

export async function savePublished(games: PublishedGame[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl('/api/published'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(games)
    });
  } catch (e) {
    console.error('Error saving published games to API:', e);
  }
}

// Scene functions — identity from token
export async function getSceneData(_userId?: string): Promise<SceneData> {
  if (typeof window === 'undefined') return { objects: [] };
  try {
    const response = await authenticatedFetch(apiUrl('/api/scene'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch scene');
    return await response.json();
  } catch (e) {
    console.error('Error reading scene from API:', e);
    return { objects: [] };
  }
}

export async function saveSceneData(data: SceneData, _userId?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await authenticatedFetch(apiUrl('/api/scene'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error('Error saving scene to API:', e);
  }
}

// Prebuilt games functions - Now using API
export async function getPrebuiltGames(): Promise<PrebuiltGame[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch(apiUrl('/api/prebuilt'));
    if (!response.ok) throw new Error('Failed to fetch prebuilt games');
    const apiGames = await response.json();

    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("prebuiltGames");
      if (localData && apiGames.length === 0) {
        const localGames: PrebuiltGame[] = JSON.parse(localData);
        if (localGames.length > 0) {
          await fetch(apiUrl('/api/prebuilt'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localGames)
          }).catch(() => { });
          localStorage.removeItem("prebuiltGames");
          const updatedResponse = await fetch(apiUrl('/api/prebuilt'));
          if (updatedResponse.ok) return await updatedResponse.json();
        }
      }
    } catch (migrationError) {
      console.error('Error migrating prebuilt games:', migrationError);
    }

    return apiGames;
  } catch (e) {
    console.error('Error reading prebuilt games from API:', e);
    try {
      const data = localStorage.getItem("prebuiltGames");
      if (data) return JSON.parse(data);
    } catch { }
    return [];
  }
}

export async function savePrebuiltGames(games: PrebuiltGame[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl('/api/prebuilt'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(games)
    });
  } catch (e) {
    console.error('Error saving prebuilt games to API:', e);
  }
}

// Accessories functions - Using localStorage (removed duplicate API version)

// Ban functions - Now using API
export async function getBannedUsers(): Promise<Ban[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch(apiUrl('/api/bans'));
    if (!response.ok) throw new Error('Failed to fetch bans');
    const bans = await response.json();
    // Filter out expired bans
    const now = Date.now();
    const activeBans = bans.filter((ban: Ban) => {
      if (ban.permanent) return true;
      if (ban.expiresAt && ban.expiresAt > now) return true;
      return false;
    });
    // Remove expired bans
    if (activeBans.length !== bans.length) {
      await saveBannedUsers(activeBans);
    }
    return activeBans;
  } catch (e) {
    console.error('Error reading bans from API:', e);
    // Fallback to localStorage
    try {
      const data = localStorage.getItem("bannedUsers");
      if (data) return JSON.parse(data);
    } catch { }
    return [];
  }
}

export async function saveBannedUsers(bans: Ban[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Save each ban
    for (const ban of bans) {
      await fetch(apiUrl('/api/bans'), {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ban)
      }).catch(() => { });
    }
  } catch (e) {
    console.error('Error saving bans to API:', e);
  }
}

export async function isUserBanned(username: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!username || !username.trim()) return false;

  const usernameLower = username.trim().toLowerCase();
  const bans = await getBannedUsers();
  const now = Date.now();
  const ban = bans.find(b => {
    if (b.username.toLowerCase() !== usernameLower) return false;
    // Check if ban is still active
    if (b.permanent) return true;
    if (b.expiresAt && b.expiresAt > now) return true;
    return false;
  });
  return !!ban;
}

export async function getBanForUser(username: string): Promise<Ban | null> {
  if (typeof window === 'undefined') return null;
  if (!username || !username.trim()) return null;

  const usernameLower = username.trim().toLowerCase();
  const bans = await getBannedUsers();
  const now = Date.now();
  return bans.find(b => {
    if (b.username.toLowerCase() !== usernameLower) return false;
    // Check if ban is still active
    if (b.permanent) return true;
    if (b.expiresAt && b.expiresAt > now) return true;
    return false;
  }) || null;}

// Sync versions for compatibility
export function getBannedUsersSync(): Ban[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem("bannedUsers");
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export async function banUser(
  username: string,
  bannedBy: string,
  reason: string,
  permanent: boolean = true,
  days?: number,
  canBanAdmins = false,
  options?: { banKind?: typeof TERMINATED_BAN_KIND; terminatedSubject?: string }
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const usernameLower = username.trim().toLowerCase();

  // Cannot ban yourself
  if (usernameLower === bannedBy.trim().toLowerCase()) {
    return false;
  }

  // Check if trying to ban an admin (head_admin can bypass this)
  if (!canBanAdmins) {
    const users = await getUsers();
    const targetUser = users.find(u => u.username.toLowerCase() === usernameLower);
    if (targetUser && (targetUser.role === 'admin' || targetUser.role === 'head_admin')) {
      return false;
    }

    const isAdminAccount = ADMIN_ACCOUNTS_LIST.some(a => a.username.toLowerCase() === usernameLower);
    if (isAdminAccount) {
      return false;
    }
  }

  const newBan: Ban = {
    username: username.trim(),
    bannedBy,
    reason,
    timestamp: Date.now(),
    permanent,
    expiresAt: permanent ? undefined : (days ? Date.now() + (days * 24 * 60 * 60 * 1000) : undefined),
    banKind: options?.banKind,
    terminatedSubject: options?.terminatedSubject,
    appealsBlocked: options?.banKind === TERMINATED_BAN_KIND,
  };

  try {
    const response = await authenticatedFetch(apiUrl('/api/bans'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBan),
    });
    return response.ok;
  } catch (e) {
    console.error('Error banning user:', e);
    return false;
  }
}

export async function unbanUser(username: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await authenticatedFetch(apiUrl(`/api/bans?username=${encodeURIComponent(username)}`), {
      method: 'DELETE',
    });
  } catch (e) {
    console.error('Error unbanning user:', e);
  }
}

// Hardware (device) bans — admin only, use authenticatedFetch
export async function getHardwareBans(): Promise<HardwareBan[]> {
  if (typeof window === 'undefined') return [];
  try {
    const res = await authenticatedFetch(apiUrl('/api/hardware-bans'));
    if (!res.ok) throw new Error('Failed to fetch hardware bans');
    return await res.json();
  } catch (e) {
    console.error('Error fetching hardware bans:', e);
    return [];
  }
}

export type AddHardwareBanClientOptions = {
  /** `hardware` = normal ban screen; `terminated` = fiery fired screen */
  mode?: 'hardware' | 'terminated';
  reason?: string;
  /** Shown on terminated screen (e.g. person's name) */
  terminatedSubject?: string;
};

export async function addHardwareBan(
  deviceId: string,
  reason?: string,
  options?: AddHardwareBanClientOptions
): Promise<{ bannedUsernames: string[] }> {
  if (typeof window === 'undefined') return { bannedUsernames: [] };
  const mode = options?.mode ?? 'hardware';
  const body: Record<string, unknown> = {
    deviceId,
    reason: options?.reason ?? reason ?? '',
  };
  if (mode === 'terminated') {
    body.terminated = true;
    body.banKind = 'terminated';
    if (options?.terminatedSubject?.trim()) {
      body.terminatedSubject = options.terminatedSubject.trim();
    }
  }
  const res = await authenticatedFetch(apiUrl('/api/hardware-bans'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to add hardware ban');
  return await res.json();
}

/** Terminate all devices linked to a user (fiery site block). Uses first known device to seed the network. */
export async function terminateUserAccess(
  username: string,
  bannedBy: string,
  terminatedSubject?: string
): Promise<{ bannedUsernames: string[] }> {
  const devices = await getDevicesForUser(username);
  const subject = terminatedSubject?.trim() || username.trim();
  if (devices.length > 0) {
    return addHardwareBan(devices[0].deviceId, undefined, { mode: 'terminated', terminatedSubject: subject });
  }
  const ok = await banUser(username, bannedBy, TERMINATED_FIRE_MESSAGE, true, undefined, true, {
    banKind: TERMINATED_BAN_KIND,
    terminatedSubject: subject,
  });
  if (!ok) throw new Error('Could not terminate user (no devices on file and account ban failed)');
  return { bannedUsernames: [username.toLowerCase()] };
}

export async function removeHardwareBan(deviceId: string): Promise<{ unbannedUsernames: string[] }> {
  if (typeof window === 'undefined') return { unbannedUsernames: [] };
  const res = await authenticatedFetch(apiUrl(`/api/hardware-bans?deviceId=${encodeURIComponent(deviceId)}`), {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to remove hardware ban');
  return await res.json();
}

export async function getDevicesForUser(username: string): Promise<DeviceRecord[]> {
  if (typeof window === 'undefined') return [];
  const res = await authenticatedFetch(apiUrl(`/api/users/devices?username=${encodeURIComponent(username)}`));
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err?.error || `Failed to load devices (${res.status})`);
  }
  return await res.json();
}

/** Check if current device is hardware-banned (for app-open check, no auth). */
export async function checkDeviceBanStatus(): Promise<{ banned: boolean; ban?: Ban }> {
  if (typeof window === 'undefined') return { banned: false };
  try {
    const { deviceId } = typeof getDeviceFingerprint === 'function' ? getDeviceFingerprint() : { deviceId: '' };
    if (!deviceId) return { banned: false };
    const res = await fetch(apiUrl(`/api/auth/check-device?deviceId=${encodeURIComponent(deviceId)}`), { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (data.banned && data.ban) {
      const b = data.ban as Record<string, unknown>;
      return {
        banned: true,
        ban: {
          username: (b.username as string) || 'This device',
          reason: (b.reason as string) || '',
          bannedBy: (b.bannedBy as string) ?? (b.banned_by as string) ?? 'Administrator',
          timestamp: (b.timestamp as number) ?? (b.banned_at as number) ?? Date.now(),
          permanent: (b.permanent as boolean) ?? true,
          banKind: (b.banKind as string) ?? (b.ban_kind as string),
          terminatedSubject: (b.terminatedSubject as string) ?? (b.terminated_subject as string),
          appealsBlocked:
            (b.appealsBlocked as boolean) ??
            (b.banKind === 'terminated' || b.ban_kind === 'terminated'),
        },
      };
    }
    return { banned: false };
  } catch {
    return { banned: false };
  }
}

// Report functions - Now using API
export async function getReports(): Promise<Report[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await authenticatedFetch(apiUrl('/api/reports'));
    if (!response.ok) throw new Error('Failed to fetch reports');
    return await response.json();
  } catch (e) {
    console.error('Error reading reports from API:', e);
    try {
      const data = localStorage.getItem("reports");
      if (data) return JSON.parse(data);
    } catch { }
    return [];
  }
}

export async function saveReports(reports: Report[]): Promise<void> {
  if (typeof window === 'undefined') return;
  // Reports are managed individually via API
}

export async function createReport(reportedUsername: string, reporterUsername: string, reason: string, description: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  const newReport: Report = {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    reportedUsername,
    reporterUsername,
    reason,
    description,
    timestamp: Date.now(),
    status: 'pending'
  };

  try {
    const { authenticatedFetch } = await import('@/lib/api');
    const response = await authenticatedFetch(apiUrl('/api/reports'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    });
    if (response.ok) {
      const saved = await response.json();
      return saved.id;
    }
  } catch (e) {
    console.error('Error creating report:', e);
  }
  return newReport.id;
}

export async function updateReportStatus(reportId: string, status: Report['status'], _adminUsername: string, notes?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await authenticatedFetch(apiUrl('/api/reports'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reportId, status, adminNotes: notes })
    });
  } catch (e) {
    console.error('Error updating report:', e);
  }
}

// Ban Appeal functions - Now using API
export async function getBanAppeals(): Promise<BanAppeal[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch(apiUrl('/api/appeals'));
    if (!response.ok) throw new Error('Failed to fetch appeals');
    return await response.json();
  } catch (e) {
    console.error('Error reading appeals from API:', e);
    try {
      const data = localStorage.getItem("banAppeals");
      if (data) return JSON.parse(data);
    } catch { }
    return [];
  }
}

export async function saveBanAppeals(appeals: BanAppeal[]): Promise<void> {
  if (typeof window === 'undefined') return;
  // Appeals are managed individually via API
}

export async function createBanAppeal(username: string, ban: Ban, appealMessage: string, deviceId?: string): Promise<string> {
  if (typeof window === 'undefined') return '';

  // Check if user/device already has a pending appeal
  const existingAppeal = await getMyAppeal(username, deviceId);
  if (existingAppeal && existingAppeal.status === 'pending') {
    return existingAppeal.id;
  }

  const newAppeal: BanAppeal = {
    id: `appeal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    ban,
    appealMessage,
    timestamp: Date.now(),
    status: 'pending'
  };

  try {
    const body: Record<string, unknown> = {
      ...newAppeal,
      appealText: appealMessage,
    };
    if (deviceId) body.deviceId = deviceId;
    const response = await fetch(apiUrl('/api/appeals'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const saved = await response.json();
      return saved.id;
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create appeal');
  } catch (e) {
    console.error('Error creating appeal:', e);
    throw e;
  }
}

export async function updateBanAppealStatus(appealId: string, status: BanAppeal['status'], adminUsername: string, notes?: string, shouldUnban?: boolean): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl('/api/appeals'), {      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: appealId, status, reviewedBy: adminUsername, adminNotes: notes, shouldUnban })
    });
  } catch (e) {
    console.error('Error updating appeal:', e);
  }
}

/** Get the appeal thread for a user (by username, or by deviceId for "This device"). For "This device", only returns an appeal when deviceId is provided so we never show another device's appeal. */
export async function getMyAppeal(username: string, deviceId?: string): Promise<BanAppeal | null> {
  if (typeof window === 'undefined') return null;
  if (username.toLowerCase() === 'this device' && !deviceId) return null;
  try {
    let url = `/api/appeals?username=${encodeURIComponent(username)}`;
    if (deviceId) url += `&deviceId=${encodeURIComponent(deviceId)}`;
    const res = await fetch(apiUrl(url));
    if (!res.ok) return null;
    const list: BanAppeal[] = await res.json();
    return list.find((a) => a.status === 'pending') || list[0] || null;
  } catch (e) {
    console.error('Error fetching my appeal:', e);
    return null;
  }
}

/** Get messages for an appeal thread (appeal owner: pass username; for device ban pass deviceId). */
export async function getAppealMessages(appealId: string, username: string, deviceId?: string): Promise<AppealMessage[]> {
  if (typeof window === 'undefined') return [];
  try {
    let url = `/api/appeals/messages?appealId=${encodeURIComponent(appealId)}&username=${encodeURIComponent(username)}`;
    if (deviceId) url += `&deviceId=${encodeURIComponent(deviceId)}`;
    const res = await fetch(apiUrl(url));
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Error fetching appeal messages:', e);
    return [];
  }
}

/** Get appeal thread as admin (uses auth token). */
export async function getAppealMessagesAdmin(appealId: string): Promise<AppealMessage[]> {
  if (typeof window === 'undefined') return [];
  try {
    const res = await authenticatedFetch(apiUrl(`/api/appeals/messages?appealId=${encodeURIComponent(appealId)}`));
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Error fetching appeal messages (admin):', e);
    return [];
  }
}

/** Send a message in an appeal thread; returns updated messages (including AI reply). */
export async function sendAppealMessage(appealId: string, username: string, message: string): Promise<AppealMessage[]> {
  if (typeof window === 'undefined') return [];
  const res = await fetch(apiUrl('/api/appeals/messages'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appealId, username, message: message.trim() }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to send message');
  return await res.json();
}

// Server functions
export function getServers(): GameServer[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("gameServers") || "[]");
}

export function saveServers(servers: GameServer[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("gameServers", JSON.stringify(servers));
}

export function getServerPlans(): ServerPlan[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("serverPlans") || "[]");
}

// All data now stored in Firebase - these functions are deprecated
// Use API functions instead (getMessagesAPI, etc.)

// Accessory functions - Using API (Firebase)
export async function getAccessories(): Promise<Accessory[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch(apiUrl('/api/accessories'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch accessories');
    return await response.json();
  } catch (e) {
    console.error('Error reading accessories from API:', e);
    return [];
  }
}

export async function saveAccessories(accessories: Accessory[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl('/api/accessories'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accessories)
    });
  } catch (e) {
    console.error('Error saving accessories to API:', e);
  }
}






// Message functions - Using API (renamed to avoid conflict)
export async function getMessagesAPI(username: string, withUsername?: string): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    const url = withUsername
      ? `/api/messages?username=${encodeURIComponent(username)}&with=${encodeURIComponent(withUsername)}`
      : `/api/messages?username=${encodeURIComponent(username)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (e) {
    console.error('Error reading messages from API:', e);
    return [];
  }
}

export async function sendMessage(fromUsername: string, toUsername: string, message: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    const response = await fetch(apiUrl('/api/messages'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUsername, toUsername, message })
    });
    if (response.ok) {
      const saved = await response.json();
      return saved.id;
    }
  } catch (e) {
    console.error('Error sending message:', e);
  }
  return '';
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl('/api/messages'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: messageId, read: true })
    });
  } catch (e) {
    console.error('Error marking message as read:', e);
  }
}


// User-made games functions - Using API (writes go to Firestore instantly)
export async function getUserMadeGames(): Promise<UserMadeGame[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch(apiUrl('/api/games'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch user-made games');
    return await response.json();
  } catch (e) {
    console.error('Error reading user-made games from API:', e);
    return [];
  }
}

export async function saveUserMadeGame(game: UserMadeGame): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const res = await authenticatedFetch(apiUrl('/api/games'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to save game: ${res.status}`);
    }
  } catch (e) {
    console.error('Error saving user-made game to API:', e);
    throw e;
  }
}

export async function deleteUserMadeGame(gameId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await authenticatedFetch(apiUrl(`/api/games?id=${encodeURIComponent(gameId)}`), {
      method: 'DELETE'
    });
  } catch (e) {
    console.error('Error deleting user-made game:', e);
  }
}

// Game submissions functions - Using API
export async function getGameSubmissions(): Promise<GameSubmission[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch(apiUrl('/api/gamesubmissions'));
    if (!response.ok) throw new Error('Failed to fetch game submissions');
    return await response.json();
  } catch (e) {
    console.error('Error reading game submissions from API:', e);
    return [];
  }
}

export async function saveGameSubmission(submission: GameSubmission): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl('/api/gamesubmissions'), {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
  } catch (e) {
    console.error('Error saving game submission to API:', e);
  }
}

export async function deleteGameSubmission(submissionId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(apiUrl(`/api/gamesubmissions?id=${encodeURIComponent(submissionId)}`), {      method: 'DELETE'
    });
  } catch (e) {
    console.error('Error deleting game submission:', e);
  }
}
