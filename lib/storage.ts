import { User, Skin, PublishedGame, DraftGame, SceneData, TabContent, PrebuiltGame, Accessory, Report, Ban } from '@/types';

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
}

// User functions
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("pixelPlaceUsers") || "[]");
}

export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("pixelPlaceUsers", JSON.stringify(users));
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

// Ban functions
export function getBannedUsers(): Ban[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("bannedUsers") || "[]");
}

export function saveBannedUsers(bans: Ban[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("bannedUsers", JSON.stringify(bans));
}

export function isUserBanned(username: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!username || !username.trim()) return false;
  
  const usernameLower = username.trim().toLowerCase();
  const bans = getBannedUsers();
  const ban = bans.find(b => b.username.toLowerCase() === usernameLower);
  if (!ban) return false;
  
  if (ban.permanent) return true;
  if (ban.expiresAt && ban.expiresAt > Date.now()) return true;
  
  // Ban expired, remove it
  const updatedBans = bans.filter(b => b.username.toLowerCase() !== usernameLower);
  saveBannedUsers(updatedBans);
  return false;
}

export function banUser(username: string, bannedBy: string, reason: string, permanent: boolean = true, days?: number): boolean {
  if (typeof window === 'undefined') return false;
  
  const usernameLower = username.trim().toLowerCase();
  
  // Check if trying to ban an admin
  const users = getUsers();
  const targetUser = users.find(u => u.username.toLowerCase() === usernameLower);
  if (targetUser && targetUser.role === 'admin') {
    return false;
  }
  
  const isAdminAccount = ADMIN_ACCOUNTS_LIST.some(a => a.username.toLowerCase() === usernameLower);
  if (isAdminAccount) {
    return false;
  }
  
  const bans = getBannedUsers();
  // Remove existing ban if any (case-insensitive)
  const filteredBans = bans.filter(b => b.username.toLowerCase() !== usernameLower);
  
  // Store the original username (not lowercased) for display, but we check case-insensitively
  const newBan: Ban = {
    username: username.trim(), // Store original case
    bannedBy,
    reason,
    timestamp: Date.now(),
    permanent,
    expiresAt: permanent ? undefined : (days ? Date.now() + (days * 24 * 60 * 60 * 1000) : undefined)
  };
  filteredBans.push(newBan);
  saveBannedUsers(filteredBans);
  
  // Force localStorage sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
  
  return true;
}

export function unbanUser(username: string): void {
  if (typeof window === 'undefined') return;
  const bans = getBannedUsers();
  const filteredBans = bans.filter(b => b.username.toLowerCase() !== username.toLowerCase());
  saveBannedUsers(filteredBans);
}

// Report functions
export function getReports(): Report[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("reports") || "[]");
}

export function saveReports(reports: Report[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("reports", JSON.stringify(reports));
}

export function createReport(reportedUsername: string, reporterUsername: string, reason: string, description: string): string {
  if (typeof window === 'undefined') return '';
  const reports = getReports();
  const newReport: Report = {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    reportedUsername,
    reporterUsername,
    reason,
    description,
    timestamp: Date.now(),
    status: 'pending'
  };
  reports.push(newReport);
  saveReports(reports);
  return newReport.id;
}

export function updateReportStatus(reportId: string, status: Report['status'], adminUsername: string, notes?: string): void {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  const report = reports.find(r => r.id === reportId);
  if (report) {
    report.status = status;
    report.reviewedBy = adminUsername;
    if (notes) report.adminNotes = notes;
  }
  saveReports(reports);
}




