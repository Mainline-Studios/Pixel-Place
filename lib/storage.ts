import { User, Skin, PublishedGame, DraftGame, SceneData, TabContent, GameServer, ServerPlan, FriendRequest, Message, Accessory } from '@/types';
import { NEW_SKINS, NEW_ACCESSORIES } from './newCatalog';

const ADMIN_ACCOUNTS = [
  { username: "admin", password: "extra" },
  { username: "TicTAK", password: "Thomas" },
  { username: "IDon'tKnow", password: "Titan" },
  { username: "6767kid", password: "67676767" },
  { username: "Billibob", password: "Luca" },
  { username: "Daniello1", password: "Daniel" },
  { username: "FunBoy", password: "Simon" },
  { username: "BelloBoy1", password: "Zac" },
  { username: "Bob", password: "Henry" },
  { username: "Mr.Noob", password: "Tyson" },
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

  // Replace ALL skins with new collection based on images - DELETE EVERYTHING FIRST
  const initialSkins: Skin[] = [...NEW_SKINS];
  
  // REPLACE ALL skins - completely delete old ones, no merging
  localStorage.setItem("skinsCatalog", JSON.stringify(initialSkins));
  console.log(`Deleted all old skins and replaced with ${initialSkins.length} new skins.`);

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

  if (!localStorage.getItem("gameServers")) {
    localStorage.setItem("gameServers", JSON.stringify([]));
  }

  if (!localStorage.getItem("serverPlans")) {
    const defaultPlans: ServerPlan[] = [
      {
        id: 'plan_small',
        name: 'Small Server',
        maxPlayers: 10,
        price: 500,
        description: 'Perfect for small groups',
        features: ['10 max players', 'Basic support', 'Standard performance']
      },
      {
        id: 'plan_medium',
        name: 'Medium Server',
        maxPlayers: 25,
        price: 1500,
        description: 'Great for medium communities',
        features: ['25 max players', 'Priority support', 'Enhanced performance']
      },
      {
        id: 'plan_large',
        name: 'Large Server',
        maxPlayers: 50,
        price: 3000,
        description: 'For large communities',
        features: ['50 max players', 'Premium support', 'Maximum performance']
      }
    ];
    localStorage.setItem("serverPlans", JSON.stringify(defaultPlans));
  }

  if (!localStorage.getItem("friendRequests")) {
    localStorage.setItem("friendRequests", JSON.stringify([]));
  }

  if (!localStorage.getItem("messages")) {
    localStorage.setItem("messages", JSON.stringify([]));
  }

  // DELETE ALL GAMES - Start completely fresh
  const existingGames: PublishedGame[] = [];
  
  localStorage.setItem("publishedGames", JSON.stringify(existingGames));
  console.log('Deleted all games.');

  // REPLACE ALL accessories with new collection - DELETE EVERYTHING FIRST
  const initialAccessories: Accessory[] = [...NEW_ACCESSORIES];
  
  // Always replace accessories - completely delete old ones, no merging
  localStorage.setItem("accessoriesCatalog", JSON.stringify(initialAccessories));
  console.log(`Deleted all old accessories and replaced with ${initialAccessories.length} new accessories.`);
}

// User functions - Now using API
export async function getUsers(): Promise<User[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/users', {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    if (!response.ok) {
      console.error('Failed to fetch users:', response.status, response.statusText);
      throw new Error('Failed to fetch users');
    }
    const apiUsers = await response.json();
    
    // Ensure we got an array
    if (!Array.isArray(apiUsers)) {
      console.error('API returned non-array:', apiUsers);
      return [];
    }
    
    console.log(`getUsers: Fetched ${apiUsers.length} users from API`);
    
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
            console.log(`Migrating ${usersToMigrate.length} users from localStorage to API`);
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
            const updatedResponse = await fetch('/api/users', { cache: 'no-store' });
            if (updatedResponse.ok) {
              const updatedUsers = await updatedResponse.json();
              console.log(`getUsers: After migration, fetched ${updatedUsers.length} users`);
              return Array.isArray(updatedUsers) ? updatedUsers : [];
            }
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
        return Array.isArray(users) ? users : [];
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

// Skin functions - Using localStorage
export function getSkins(): Skin[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("skinsCatalog") || "[]");
}

export function saveSkins(skins: Skin[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("skinsCatalog", JSON.stringify(skins));
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
  // Get all games from localStorage
  let games = JSON.parse(localStorage.getItem("publishedGames") || "[]");
  
  // Remove duplicates - keep only the most recent version of each System game
  const seen = new Map<string, PublishedGame>();
  games.forEach((game: PublishedGame) => {
    const key = `${game.title}_${game.owner}`;
    if (!seen.has(key) || (seen.get(key)?.ts || 0) < (game.ts || 0)) {
      seen.set(key, game);
    }
  });
  
  // Convert back to array and remove any Tic Ti Toe duplicates
  const uniqueGames = Array.from(seen.values());
  
  // Filter out Tic Tac Toe and Capture the Flag games permanently
  const filtered = uniqueGames.filter(g => 
    !((g.title === 'Tic Ti Toe' || g.title === 'Tic Tac Toe' || g.title === 'Capture de Flag') && g.owner === 'System')
  );
  
  // Save the cleaned list back to localStorage
  localStorage.setItem("publishedGames", JSON.stringify(filtered));
  return filtered;
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

// Accessories functions - Using localStorage (removed duplicate API version)

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

export function saveServerPlans(plans: ServerPlan[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("serverPlans", JSON.stringify(plans));
}

// Friend request functions
export function getFriendRequests(): FriendRequest[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("friendRequests") || "[]");
}

export function saveFriendRequests(requests: FriendRequest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("friendRequests", JSON.stringify(requests));
}

// Message functions
export function getMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("messages") || "[]");
}

export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("messages", JSON.stringify(messages));
}

// Accessory functions
export function getAccessories(): Accessory[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("accessoriesCatalog") || "[]");
}

export function saveAccessories(accessories: Accessory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("accessoriesCatalog", JSON.stringify(accessories));
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
