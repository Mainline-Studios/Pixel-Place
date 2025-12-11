import { User, Skin, PublishedGame, DraftGame, SceneData, TabContent, PrebuiltGame, Accessory, Report, Ban, BanAppeal } from '@/types';

const ADMIN_ACCOUNTS = [
  { username: "admin", password: "456" },
  { username: "admin2", password: "password" },
  { username: "345", password: "345" },
  { username: "6767kid", password: "67676767" },
  { username: "usernotfound", password: "user67" },
  { username: "number5", password: "number" },
  { username: "67", password: "67" },
  { username: "yoUr 8", password: "password" },
  { username: "number 9", password: "9" },
  { username: "the goat", password: "greatest" },
  { username: "BDawgsAwesome1", password: "20Minecraft15" }
];

export const ADMIN_ACCOUNTS_LIST = ADMIN_ACCOUNTS;

// Initialize localStorage data
export function initializeStorage() {
  if (typeof window === 'undefined') return;
  
  // Ensure localStorage is available
  try {
    if (!window.localStorage) {
      console.error('localStorage is not available');
      return;
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return;
  }

  if (!localStorage.getItem("skinsCatalog")) {
    const initialSkins: Skin[] = [
      {
        id: "starter_classic",
        name: "Starter Classic",
        rarity: "common",
        price: 0,
        img: "Classic",
        colors: {
          head: "#4a4f66",
          torso: "#4d536f",
          arm: "#3a3f56",
          legs: "#3a3f56"
        }
      },
      {
        id: "neon_runner",
        name: "Neon Runner",
        rarity: "rare",
        price: 250,
        img: "Neon",
        colors: {
          head: "#3d4bff",
          torso: "#1a1d29",
          arm: "#3d4bff",
          legs: "#1a1d29"
        }
      },
      {
        id: "crimson_bot",
        name: "Crimson Bot",
        rarity: "rare",
        price: 500,
        img: "Crimson",
        colors: {
          head: "#5c1f1f",
          torso: "#8b2d2d",
          arm: "#5c1f1f",
          legs: "#5c1f1f"
        }
      },
      {
        id: "galaxy_guard",
        name: "Galaxy Guard",
        rarity: "legendary",
        price: 1200,
        img: "Galaxy",
        colors: {
          head: "#2e1f4f",
          torso: "#442a6d",
          arm: "#2e1f4f",
          legs: "#2e1f4f"
        }
      },
      {
        id: "urban_shadow",
        name: "Urban Shadow",
        rarity: "common",
        price: 75,
        img: "Shadow",
        colors: {
          head: "#1f1f27",
          torso: "#2a2a33",
          arm: "#1f1f27",
          legs: "#1f1f27"
        }
      },
      {
        id: "desert_operative",
        name: "Desert Operative",
        rarity: "rare",
        price: 400,
        img: "Desert",
        colors: {
          head: "#5a4a2f",
          torso: "#7a653e",
          arm: "#5a4a2f",
          legs: "#5a4a2f"
        }
      }
    ];
    localStorage.setItem("skinsCatalog", JSON.stringify(initialSkins));
  }

  if (!localStorage.getItem("tabContent")) {
    const tabContent: TabContent = {
      home: "Welcome to Pixel Place. This is your activity hub.",
      discover: "Discover live published games from creators.",
      avatarShop: "Buy and equip skins here. Rarer skins cost more Pixel Coins.",
      createGame: "Start building a new world or experience.",
      studio: "Use the 3D Studio to build, move, and save objects in your world.",
      coins: "Get Pixel Coins to spend on skins.",
      friends: "Add friends, party up, and message each other.",
      settings: "Account details, admin tools."
    };
    localStorage.setItem("tabContent", JSON.stringify(tabContent));
  }

  if (!localStorage.getItem("pixelPlaceUsers")) {
    localStorage.setItem("pixelPlaceUsers", JSON.stringify([]));
  }

  if (!localStorage.getItem("sceneStore")) {
    localStorage.setItem("sceneStore", JSON.stringify({ objects: [] }));
  }

  if (!localStorage.getItem("draftGame")) {
    localStorage.setItem("draftGame", JSON.stringify({ title: "", desc: "", owner: "" }));
  }

  if (!localStorage.getItem("publishedGames")) {
    localStorage.setItem("publishedGames", JSON.stringify([]));
  }

  if (!localStorage.getItem("prebuiltGames")) {
    const prebuiltGames: PrebuiltGame[] = [
      {
        id: 'prebuilt_platformer',
        title: 'Classic Platformer',
        desc: 'Jump and collect coins in this classic platformer template',
        category: 'Platformer',
        thumbnail: 'platformer',
        sceneData: {
          objects: [
            { id: 'obj_1', type: 'cube', position: { x: 0, y: 0.5, z: 0 } },
            { id: 'obj_2', type: 'cube', position: { x: 3, y: 0.5, z: 0 } },
            { id: 'obj_3', type: 'cube', position: { x: 6, y: 0.5, z: 0 } },
            { id: 'obj_4', type: 'sphere', position: { x: 1.5, y: 2, z: 0 } },
            { id: 'obj_5', type: 'light', position: { x: 0, y: 5, z: 0 } }
          ]
        },
        tags: ['platformer', 'jump', 'collect']
      },
      {
        id: 'prebuilt_race',
        title: 'Racing Track',
        desc: 'Build your own racing game with this track template',
        category: 'Racing',
        thumbnail: 'race',
        sceneData: {
          objects: [
            { id: 'obj_1', type: 'cube', position: { x: 0, y: 0.5, z: 0 } },
            { id: 'obj_2', type: 'cube', position: { x: 0, y: 0.5, z: 5 } },
            { id: 'obj_3', type: 'cube', position: { x: 0, y: 0.5, z: 10 } },
            { id: 'obj_4', type: 'light', position: { x: 0, y: 8, z: 5 } }
          ]
        },
        tags: ['racing', 'speed', 'track']
      },
      {
        id: 'prebuilt_puzzle',
        title: 'Puzzle Chamber',
        desc: 'A mysterious puzzle room template to build your own challenges',
        category: 'Puzzle',
        thumbnail: 'puzzle',
        sceneData: {
          objects: [
            { id: 'obj_1', type: 'cube', position: { x: -2, y: 0.5, z: 0 } },
            { id: 'obj_2', type: 'cube', position: { x: 2, y: 0.5, z: 0 } },
            { id: 'obj_3', type: 'sphere', position: { x: 0, y: 2, z: 0 } },
            { id: 'obj_4', type: 'light', position: { x: 0, y: 5, z: 0 } }
          ]
        },
        tags: ['puzzle', 'mystery', 'brain']
      },
      {
        id: 'prebuilt_adventure',
        title: 'Adventure World',
        desc: 'Start your epic adventure with this open world template',
        category: 'Adventure',
        thumbnail: 'adventure',
        sceneData: {
          objects: [
            { id: 'obj_1', type: 'cube', position: { x: 0, y: 0.5, z: 0 } },
            { id: 'obj_2', type: 'cube', position: { x: 4, y: 0.5, z: -4 } },
            { id: 'obj_3', type: 'cube', position: { x: -4, y: 0.5, z: 4 } },
            { id: 'obj_4', type: 'sphere', position: { x: 0, y: 3, z: 0 } },
            { id: 'obj_5', type: 'light', position: { x: 5, y: 10, z: 5 } }
          ]
        },
        tags: ['adventure', 'open-world', 'explore']
      }
    ];
    localStorage.setItem("prebuiltGames", JSON.stringify(prebuiltGames));
  }

  if (!localStorage.getItem("accessoriesCatalog")) {
    const initialAccessories: Accessory[] = [
      {
        id: 'hat_cap',
        name: 'Baseball Cap',
        type: 'hat',
        rarity: 'common',
        price: 50,
        img: 'cap',
        color: '#3a3f57',
        position: { x: 0, y: 1.8, z: 0 },
        scale: 0.7
      },
      {
        id: 'hat_crown',
        name: 'Golden Crown',
        type: 'hat',
        rarity: 'legendary',
        price: 500,
        img: 'crown',
        color: '#ffd76a',
        position: { x: 0, y: 1.9, z: 0 },
        scale: 0.6
      },
      {
        id: 'glasses_sun',
        name: 'Sunglasses',
        type: 'glasses',
        rarity: 'common',
        price: 75,
        img: 'sunglasses',
        color: '#1a1a1a',
        position: { x: 0, y: 1.6, z: 0.3 },
        scale: 0.5
      },
      {
        id: 'glasses_tech',
        name: 'Tech Goggles',
        type: 'glasses',
        rarity: 'rare',
        price: 200,
        img: 'goggles',
        color: '#4a90e2',
        position: { x: 0, y: 1.6, z: 0.3 },
        scale: 0.6
      },
      {
        id: 'mask_ninja',
        name: 'Ninja Mask',
        type: 'mask',
        rarity: 'rare',
        price: 150,
        img: 'ninja',
        color: '#1a1a1a',
        position: { x: 0, y: 1.5, z: 0.3 },
        scale: 0.7
      }
    ];
    localStorage.setItem("accessoriesCatalog", JSON.stringify(initialAccessories));
  }

  if (!localStorage.getItem("bannedUsers")) {
    localStorage.setItem("bannedUsers", JSON.stringify([]));
  }

  if (!localStorage.getItem("reports")) {
    localStorage.setItem("reports", JSON.stringify([]));
  }

  if (!localStorage.getItem("banAppeals")) {
    localStorage.setItem("banAppeals", JSON.stringify([]));
  }
}

// User functions - Now using API
export async function getUsers(): Promise<User[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (e) {
    console.error('Error reading users from API:', e);
    // Fallback to localStorage for migration
    try {
      const data = localStorage.getItem("pixelPlaceUsers");
      if (data) {
        const users = JSON.parse(data);
        // Migrate to API
        if (users.length > 0) {
          users.forEach((user: User) => {
            fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(user)
            }).catch(() => {});
          });
        }
        return users;
      }
    } catch {}
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Save each user (API handles updates if user exists)
    for (const user of users) {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error saving users to API:', e);
  }
}

// Sync function for compatibility
export function getUsersSync(): User[] {
  if (typeof window === 'undefined') return [];
  // This is a fallback - should use async getUsers() instead
  try {
    const data = localStorage.getItem("pixelPlaceUsers");
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Skin functions
export function getSkins(): Skin[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("skinsCatalog") || "[]");
}

export function saveSkins(skins: Skin[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("skinsCatalog", JSON.stringify(skins));
}

// Tab content functions
export function getTabContent(): TabContent {
  if (typeof window === 'undefined') return {} as TabContent;
  return JSON.parse(localStorage.getItem("tabContent") || "{}");
}

export function saveTabContent(content: TabContent): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("tabContent", JSON.stringify(content));
}

// Draft functions
export function getDraft(): DraftGame {
  if (typeof window === 'undefined') return { title: "", desc: "", owner: "" };
  return JSON.parse(localStorage.getItem("draftGame") || '{"title":"","desc":"","owner":""}');
}

export function saveDraft(draft: DraftGame): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("draftGame", JSON.stringify(draft));
}

// Published games functions
export function getPublished(): PublishedGame[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("publishedGames") || "[]");
}

export function savePublished(games: PublishedGame[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("publishedGames", JSON.stringify(games));
}

// Scene functions
export function getSceneData(): SceneData {
  if (typeof window === 'undefined') return { objects: [] };
  return JSON.parse(localStorage.getItem("sceneStore") || '{"objects":[]}');
}

export function saveSceneData(data: SceneData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("sceneStore", JSON.stringify(data));
}

// Prebuilt games functions
export function getPrebuiltGames(): PrebuiltGame[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("prebuiltGames") || "[]");
}

export function savePrebuiltGames(games: PrebuiltGame[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("prebuiltGames", JSON.stringify(games));
}

// Accessories functions
export function getAccessories(): Accessory[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("accessoriesCatalog") || "[]");
}

export function saveAccessories(accessories: Accessory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("accessoriesCatalog", JSON.stringify(accessories));
}

// Ban functions - Now using API
export async function getBannedUsers(): Promise<Ban[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/bans');
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
    } catch {}
    return [];
  }
}

export async function saveBannedUsers(bans: Ban[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    // Save each ban
    for (const ban of bans) {
      await fetch('/api/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ban)
      }).catch(() => {});
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
  const ban = bans.find(b => b.username.toLowerCase() === usernameLower);
  return !!ban;
}

export async function getBanForUser(username: string): Promise<Ban | null> {
  if (typeof window === 'undefined') return null;
  if (!username || !username.trim()) return null;
  
  const usernameLower = username.trim().toLowerCase();
  const bans = await getBannedUsers();
  return bans.find(b => b.username.toLowerCase() === usernameLower) || null;
}

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

export async function banUser(username: string, bannedBy: string, reason: string, permanent: boolean = true, days?: number): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  const usernameLower = username.trim().toLowerCase();
  
  // Check if trying to ban an admin
  const users = await getUsers();
  const targetUser = users.find(u => u.username.toLowerCase() === usernameLower);
  if (targetUser && targetUser.role === 'admin') {
    return false;
  }
  
  const isAdminAccount = ADMIN_ACCOUNTS_LIST.some(a => a.username.toLowerCase() === usernameLower);
  if (isAdminAccount) {
    return false;
  }
  
  const newBan: Ban = {
    username: username.trim(),
    bannedBy,
    reason,
    timestamp: Date.now(),
    permanent,
    expiresAt: permanent ? undefined : (days ? Date.now() + (days * 24 * 60 * 60 * 1000) : undefined)
  };
  
  try {
    const response = await fetch('/api/bans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBan)
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
    await fetch(`/api/bans?username=${encodeURIComponent(username)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.error('Error unbanning user:', e);
  }
}

// Report functions - Now using API
export async function getReports(): Promise<Report[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/reports');
    if (!response.ok) throw new Error('Failed to fetch reports');
    return await response.json();
  } catch (e) {
    console.error('Error reading reports from API:', e);
    try {
      const data = localStorage.getItem("reports");
      if (data) return JSON.parse(data);
    } catch {}
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
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport)
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

export async function updateReportStatus(reportId: string, status: Report['status'], adminUsername: string, notes?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/reports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reportId, status, reviewedBy: adminUsername, adminNotes: notes })
    });
  } catch (e) {
    console.error('Error updating report:', e);
  }
}

// Ban Appeal functions - Now using API
export async function getBanAppeals(): Promise<BanAppeal[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/appeals');
    if (!response.ok) throw new Error('Failed to fetch appeals');
    return await response.json();
  } catch (e) {
    console.error('Error reading appeals from API:', e);
    try {
      const data = localStorage.getItem("banAppeals");
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }
}

export async function saveBanAppeals(appeals: BanAppeal[]): Promise<void> {
  if (typeof window === 'undefined') return;
  // Appeals are managed individually via API
}

export async function createBanAppeal(username: string, ban: Ban, appealMessage: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  
  // Check if user already has a pending appeal
  const existingAppeals = await getBanAppeals();
  const existingAppeal = existingAppeals.find(
    a => a.username.toLowerCase() === username.toLowerCase() && 
         a.status === 'pending' &&
         a.ban.username.toLowerCase() === ban.username.toLowerCase()
  );
  
  if (existingAppeal) {
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
    const response = await fetch('/api/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppeal)
    });
    if (response.ok) {
      const saved = await response.json();
      return saved.id;
    }
  } catch (e) {
    console.error('Error creating appeal:', e);
  }
  return newAppeal.id;
}

export async function updateBanAppealStatus(appealId: string, status: BanAppeal['status'], adminUsername: string, notes?: string, shouldUnban?: boolean): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/appeals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: appealId, status, reviewedBy: adminUsername, adminNotes: notes, shouldUnban })
    });
  } catch (e) {
    console.error('Error updating appeal:', e);
  }
}




