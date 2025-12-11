import { User, Skin, PublishedGame, DraftGame, SceneData, TabContent, PrebuiltGame, Accessory, Report, Ban, BanAppeal, UserMadeGame, GameSubmission } from '@/types';

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
    const apiUsers = await response.json();
    
    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("pixelPlaceUsers");
      if (localData) {
        const localUsers: User[] = JSON.parse(localData);
        if (localUsers.length > 0) {
          // Check if users need to be migrated
          const apiUsernames = new Set(apiUsers.map((u: User) => u.username.toLowerCase()));
          const usersToMigrate = localUsers.filter(u => !apiUsernames.has(u.username.toLowerCase()));
          
          if (usersToMigrate.length > 0) {
            // Migrate users that don't exist in API
            for (const user of usersToMigrate) {
              await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
              }).catch(() => {});
            }
            // Remove from localStorage after successful migration
            localStorage.removeItem("pixelPlaceUsers");
            // Fetch updated list
            const updatedResponse = await fetch('/api/users');
            if (updatedResponse.ok) return await updatedResponse.json();
          }
        }
      }
    } catch (migrationError) {
      console.error('Error migrating users:', migrationError);
    }
    
    return apiUsers;
  } catch (e) {
    console.error('Error reading users from API:', e);
    // Fallback to localStorage
    try {
      const data = localStorage.getItem("pixelPlaceUsers");
      if (data) {
        const users = JSON.parse(data);
        // Try to migrate even on error
        if (users.length > 0) {
          for (const user of users) {
            await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(user)
            }).catch(() => {});
          }
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

// Skin functions - Now using API
export async function getSkins(): Promise<Skin[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/skins');
    if (!response.ok) throw new Error('Failed to fetch skins');
    const apiSkins = await response.json();
    
    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("skinsCatalog");
      if (localData && apiSkins.length === 0) {
        const localSkins: Skin[] = JSON.parse(localData);
        if (localSkins.length > 0) {
          await fetch('/api/skins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localSkins)
          }).catch(() => {});
          localStorage.removeItem("skinsCatalog");
          const updatedResponse = await fetch('/api/skins');
          if (updatedResponse.ok) return await updatedResponse.json();
        }
      }
    } catch (migrationError) {
      console.error('Error migrating skins:', migrationError);
    }
    
    return apiSkins;
  } catch (e) {
    console.error('Error reading skins from API:', e);
    try {
      const data = localStorage.getItem("skinsCatalog");
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }
}

export async function saveSkins(skins: Skin[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/skins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skins)
    });
  } catch (e) {
    console.error('Error saving skins to API:', e);
  }
}

// Tab content functions - Now using API
export async function getTabContent(): Promise<TabContent> {
  if (typeof window === 'undefined') return {} as TabContent;
  try {
    const response = await fetch('/api/tabcontent');
    if (!response.ok) throw new Error('Failed to fetch tab content');
    const apiContent = await response.json();
    
    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("tabContent");
      if (localData && Object.keys(apiContent).length === 0) {
        const localContent: TabContent = JSON.parse(localData);
        if (Object.keys(localContent).length > 0) {
          await fetch('/api/tabcontent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localContent)
          }).catch(() => {});
          localStorage.removeItem("tabContent");
          const updatedResponse = await fetch('/api/tabcontent');
          if (updatedResponse.ok) return await updatedResponse.json();
        }
      }
    } catch (migrationError) {
      console.error('Error migrating tab content:', migrationError);
    }
    
    return apiContent;
  } catch (e) {
    console.error('Error reading tab content from API:', e);
    try {
      const data = localStorage.getItem("tabContent");
      if (data) return JSON.parse(data);
    } catch {}
    return {} as TabContent;
  }
}

export async function saveTabContent(content: TabContent): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/tabcontent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
  } catch (e) {
    console.error('Error saving tab content to API:', e);
  }
}

// Draft functions - Now using API
export async function getDraft(): Promise<DraftGame> {
  if (typeof window === 'undefined') return { title: "", desc: "", owner: "" };
  try {
    const response = await fetch('/api/draft');
    if (!response.ok) throw new Error('Failed to fetch draft');
    const apiDraft = await response.json();
    
    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("draftGame");
      if (localData && (!apiDraft.title && !apiDraft.desc && !apiDraft.owner)) {
        const localDraft: DraftGame = JSON.parse(localData);
        if (localDraft.title || localDraft.desc || localDraft.owner) {
          await fetch('/api/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localDraft)
          }).catch(() => {});
          localStorage.removeItem("draftGame");
          const updatedResponse = await fetch('/api/draft');
          if (updatedResponse.ok) return await updatedResponse.json();
        }
      }
    } catch (migrationError) {
      console.error('Error migrating draft:', migrationError);
    }
    
    return apiDraft;
  } catch (e) {
    console.error('Error reading draft from API:', e);
    try {
      const data = localStorage.getItem("draftGame");
      if (data) return JSON.parse(data);
    } catch {}
    return { title: "", desc: "", owner: "" };
  }
}

export async function saveDraft(draft: DraftGame): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/draft', {
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
    const response = await fetch('/api/published');
    if (!response.ok) throw new Error('Failed to fetch published games');
    const apiGames = await response.json();
    
    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("publishedGames");
      if (localData && apiGames.length === 0) {
        const localGames: PublishedGame[] = JSON.parse(localData);
        if (localGames.length > 0) {
          await fetch('/api/published', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localGames)
          }).catch(() => {});
          localStorage.removeItem("publishedGames");
          const updatedResponse = await fetch('/api/published');
          if (updatedResponse.ok) return await updatedResponse.json();
        }
      }
    } catch (migrationError) {
      console.error('Error migrating published games:', migrationError);
    }
    
    return apiGames;
  } catch (e) {
    console.error('Error reading published games from API:', e);
    try {
      const data = localStorage.getItem("publishedGames");
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }
}

export async function savePublished(games: PublishedGame[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/published', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(games)
    });
  } catch (e) {
    console.error('Error saving published games to API:', e);
  }
}

// Scene functions - Now using API
export async function getSceneData(): Promise<SceneData> {
  if (typeof window === 'undefined') return { objects: [] };
  try {
    const response = await fetch('/api/scene');
    if (!response.ok) throw new Error('Failed to fetch scene');
    const apiScene = await response.json();
    
    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("sceneStore");
      if (localData && (!apiScene.objects || apiScene.objects.length === 0)) {
        const localScene: SceneData = JSON.parse(localData);
        if (localScene.objects && localScene.objects.length > 0) {
          await fetch('/api/scene', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localScene)
          }).catch(() => {});
          localStorage.removeItem("sceneStore");
          const updatedResponse = await fetch('/api/scene');
          if (updatedResponse.ok) return await updatedResponse.json();
        }
      }
    } catch (migrationError) {
      console.error('Error migrating scene:', migrationError);
    }
    
    return apiScene;
  } catch (e) {
    console.error('Error reading scene from API:', e);
    try {
      const data = localStorage.getItem("sceneStore");
      if (data) return JSON.parse(data);
    } catch {}
    return { objects: [] };
  }
}

export async function saveSceneData(data: SceneData): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/scene', {
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
    const response = await fetch('/api/prebuilt');
    if (!response.ok) throw new Error('Failed to fetch prebuilt games');
    const apiGames = await response.json();
    
    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("prebuiltGames");
      if (localData && apiGames.length === 0) {
        const localGames: PrebuiltGame[] = JSON.parse(localData);
        if (localGames.length > 0) {
          await fetch('/api/prebuilt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localGames)
          }).catch(() => {});
          localStorage.removeItem("prebuiltGames");
          const updatedResponse = await fetch('/api/prebuilt');
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
    } catch {}
    return [];
  }
}

export async function savePrebuiltGames(games: PrebuiltGame[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/prebuilt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(games)
    });
  } catch (e) {
    console.error('Error saving prebuilt games to API:', e);
  }
}

// Accessories functions - Now using API
export async function getAccessories(): Promise<Accessory[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/accessories');
    if (!response.ok) throw new Error('Failed to fetch accessories');
    const apiAccessories = await response.json();
    
    // Migration: Move localStorage data to API if it exists
    try {
      const localData = localStorage.getItem("accessoriesCatalog");
      if (localData && apiAccessories.length === 0) {
        const localAccessories: Accessory[] = JSON.parse(localData);
        if (localAccessories.length > 0) {
          await fetch('/api/accessories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localAccessories)
          }).catch(() => {});
          localStorage.removeItem("accessoriesCatalog");
          const updatedResponse = await fetch('/api/accessories');
          if (updatedResponse.ok) return await updatedResponse.json();
        }
      }
    } catch (migrationError) {
      console.error('Error migrating accessories:', migrationError);
    }
    
    return apiAccessories;
  } catch (e) {
    console.error('Error reading accessories from API:', e);
    try {
      const data = localStorage.getItem("accessoriesCatalog");
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }
}

export async function saveAccessories(accessories: Accessory[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/accessories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accessories)
    });
  } catch (e) {
    console.error('Error saving accessories to API:', e);
  }
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






// Message functions - Using API
export async function getMessages(username: string, withUsername?: string): Promise<any[]> {
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
    const response = await fetch('/api/messages', {
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
    await fetch('/api/messages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: messageId, read: true })
    });
  } catch (e) {
    console.error('Error marking message as read:', e);
  }
}


// User-made games functions - Using API
export async function getUserMadeGames(): Promise<UserMadeGame[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/usermadegamefiles');
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
    await fetch('/api/usermadegamefiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
  } catch (e) {
    console.error('Error saving user-made game to API:', e);
  }
}

export async function deleteUserMadeGame(gameId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`/api/usermadegamefiles?id=${encodeURIComponent(gameId)}`, {
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
    const response = await fetch('/api/gamesubmissions');
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
    await fetch('/api/gamesubmissions', {
      method: 'POST',
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
    await fetch(`/api/gamesubmissions?id=${encodeURIComponent(submissionId)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.error('Error deleting game submission:', e);
  }
}
