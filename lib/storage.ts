import { User, Skin, PublishedGame, DraftGame, SceneData, TabContent, GameServer, ServerPlan, FriendRequest, Message, Accessory, PrebuiltGame } from '@/types';
import { TIC_TAC_TOE_PRELOADED_GAME, CAPTURE_DE_FLAG_PRELOADED_GAME } from '@/lib/preloadedGames';

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
  try {

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

    // Always ensure the 6 original skins are present
    const originalSkinIds = [
      "starter_classic",
      "neon_runner",
      "crimson_bot",
      "galaxy_guard",
      "urban_shadow",
      "desert_operative"
    ];

    // Check existing skins - NEVER replace, only merge to preserve user data
    let existingSkins: Skin[] = [];
    let existingIds: string[] = [];
    try {
      existingSkins = JSON.parse(localStorage.getItem("skinsCatalog") || "[]");
      existingIds = existingSkins.map((s: Skin) => s.id);
    } catch (e) {
      console.error('Error parsing skinsCatalog:', e);
      existingSkins = [];
      existingIds = [];
    }
    const hasAllOriginals = originalSkinIds.every(id => existingIds.includes(id));

    // Define the 6 original skins
    const initialSkins: Skin[] = [
        {
          id: "starter_classic",
          name: "Starter Classic",
          rarity: "common",
          price: 0,
          img: "Classic",
          use3d: true,
          defaultAnimation: 'idle',
          theme: "classic",
          colors: {
            head: "#F2C2C2", // Light skin tone
            torso: "#FF0000", // Red shirt
            arm: "#F2C2C2", // Light skin tone
            legs: "#0000FF" // Blue pants
          },
          materials: {
            head: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            torso: { type: 'cloth', roughness: 0.8, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            legs: { type: 'cloth', roughness: 0.8, metalness: 0.0 }
          },
          textures: {
            head: { base: 'dots' },
            torso: { base: 'stripes' },
            arm: { base: 'dots' },
            legs: { base: 'grid' }
          },
          highlights: {
            head: "#FFE5E5",
            torso: "#FF3333",
            legs: "#3333FF"
          }
        },
        {
          id: "neon_runner",
          name: "Neon Runner",
          rarity: "rare",
          price: 250,
          img: "Neon",
          use3d: true,
          defaultAnimation: 'idle',
          theme: "futuristic",
          colors: {
            head: "#808080", // Grey head (original)
            torso: "#0080FF", // Blue torso (original)
            arm: "#808080", // Grey arms (original)
            legs: "#0080FF" // Blue legs (original)
          },
          materials: {
            head: { type: 'plastic', roughness: 0.3, metalness: 0.0 },
            torso: { type: 'plastic', roughness: 0.2, metalness: 0.1, emissive: "#0080FF", emissiveIntensity: 0.3 },
            arm: { type: 'plastic', roughness: 0.3, metalness: 0.0 },
            legs: { type: 'plastic', roughness: 0.2, metalness: 0.1, emissive: "#0080FF", emissiveIntensity: 0.3 }
          },
          textures: {
            head: { base: 'grid' }, // Futuristic grid pattern
            torso: { base: 'grid' },
            arm: { base: 'grid' },
            legs: { base: 'grid' }
          },
          highlights: {
            head: "#999999",
            torso: "#3399FF",
            arm: "#999999",
            legs: "#3399FF"
          },
          skinAccessories: [
            {
              type: 'goggles',
              position: { x: 0, y: 0, z: 0 },
              color: "#000000",
              material: { type: 'plastic', roughness: 0.1, metalness: 0.8 },
              texture: { base: 'grid' }
            }
          ]
        },
        {
          id: "crimson_bot",
          name: "Crimson Bot",
          rarity: "rare",
          price: 500,
          img: "Crimson",
          use3d: true,
          defaultAnimation: 'idle',
          theme: "robot",
          colors: {
            head: "#FF8000", // Orange head
            torso: "#FF0000", // Red torso
            arm: "#FF8000", // Orange arms
            legs: "#8000FF" // Purple legs
          },
          materials: {
            head: { type: 'metal', roughness: 0.2, metalness: 0.9 },
            torso: { type: 'metal', roughness: 0.2, metalness: 0.9 },
            arm: { type: 'metal', roughness: 0.2, metalness: 0.9 },
            legs: { type: 'metal', roughness: 0.2, metalness: 0.9 }
          },
          textures: {
            head: { base: 'grid' },
            torso: { base: 'grid' },
            arm: { base: 'grid' },
            legs: { base: 'grid' }
          },
          highlights: {
            head: "#FFB366",
            torso: "#FF3333",
            arm: "#FFB366",
            legs: "#B366FF"
          },
          skinAccessories: [
            {
              type: 'armor',
              position: { x: 0, y: 0, z: 0 },
              color: "#CC0000",
              material: { type: 'metal', roughness: 0.1, metalness: 0.95 }
            },
            {
              type: 'goggles',
              position: { x: 0, y: 0, z: 0 },
              color: "#FF0000",
              material: { type: 'plastic', roughness: 0.1, metalness: 0.8 }
            }
          ]
        },
        {
          id: "galaxy_guard",
          name: "Galaxy Guard",
          rarity: "legendary",
          price: 1200,
          img: "Galaxy",
          use3d: true,
          defaultAnimation: 'idle',
          theme: "cosmic",
          colors: {
            head: "#BF00FF", // Magenta head
            torso: "#8000FF", // Purple torso
            arm: "#0000FF", // Blue arms
            legs: "#0080FF" // Light blue legs
          },
          materials: {
            head: { type: 'plastic', roughness: 0.1, metalness: 0.3, emissive: "#BF00FF", emissiveIntensity: 0.4 },
            torso: { type: 'metal', roughness: 0.1, metalness: 0.8, emissive: "#8000FF", emissiveIntensity: 0.4 },
            arm: { type: 'plastic', roughness: 0.1, metalness: 0.3, emissive: "#0000FF", emissiveIntensity: 0.4 },
            legs: { type: 'metal', roughness: 0.1, metalness: 0.8, emissive: "#0080FF", emissiveIntensity: 0.4 }
          },
          highlights: {
            head: "#FF33FF",
            torso: "#B366FF",
            arm: "#3366FF",
            legs: "#66B3FF"
          },
          skinAccessories: [
            {
              type: 'hat',
              position: { x: 0, y: 0, z: 0 },
              color: "#4A0080",
              material: { type: 'metal', roughness: 0.1, metalness: 0.9, emissive: "#8000FF", emissiveIntensity: 0.3 }
            },
            {
              type: 'armor',
              position: { x: 0, y: 0, z: 0 },
              color: "#400080",
              material: { type: 'metal', roughness: 0.1, metalness: 0.9 }
            }
          ]
        },
        {
          id: "urban_shadow",
          name: "Urban Shadow",
          rarity: "common",
          price: 75,
          img: "Shadow",
          use3d: true,
          defaultAnimation: 'idle',
          theme: "urban",
          colors: {
            head: "#4D4D4D", // Dark gray head
            torso: "#000000", // Black torso
            arm: "#4D4D4D", // Dark gray arms
            legs: "#808080" // Medium gray legs
          },
          materials: {
            head: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            torso: { type: 'cloth', roughness: 0.9, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            legs: { type: 'cloth', roughness: 0.8, metalness: 0.0 }
          },
          highlights: {
            head: "#666666",
            torso: "#1A1A1A",
            legs: "#999999"
          },
          skinAccessories: [
            {
              type: 'hat',
              position: { x: 0, y: 0, z: 0 },
              color: "#1A1A1A",
              material: { type: 'cloth', roughness: 0.9, metalness: 0.0 }
            }
          ]
        },
        {
          id: "desert_operative",
          name: "Desert Operative",
          rarity: "rare",
          price: 400,
          img: "Desert",
          use3d: true,
          defaultAnimation: 'idle',
          theme: "adventurer",
          colors: {
            head: "#FFBF00", // Gold head
            torso: "#FF8000", // Orange torso
            arm: "#FFBF00", // Gold arms
            legs: "#8B4513" // Brown legs
          },
          materials: {
            head: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            torso: { type: 'cloth', roughness: 0.8, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            legs: { type: 'leather', roughness: 0.7, metalness: 0.1 }
          },
          highlights: {
            head: "#FFD966",
            torso: "#FF9933",
            legs: "#A0522D"
          },
          skinAccessories: [
            {
              type: 'hat',
              position: { x: 0, y: 0, z: 0 },
              color: "#8B4513",
              material: { type: 'cloth', roughness: 0.8, metalness: 0.0 }
            },
            {
              type: 'backpack',
              position: { x: 0, y: 0, z: 0 },
              color: "#654321",
              material: { type: 'leather', roughness: 0.7, metalness: 0.1 }
            }
          ]
        }
      ];

    // Always merge: preserve ALL existing skins, ensure 6 originals are present
    if (existingSkins.length === 0) {
      // First time - just set the originals
      localStorage.setItem("skinsCatalog", JSON.stringify(initialSkins));
      console.log(`Initialized ${initialSkins.length} original skins.`);
    } else {
      // Existing skins - merge to preserve ALL user data
      const existingSkinsData = JSON.parse(localStorage.getItem("skinsCatalog") || "[]");
      const existingIdsData = existingSkinsData.map((s: Skin) => s.id);
      const originalSkinIdsData = [
        "starter_classic",
        "neon_runner",
        "crimson_bot",
        "galaxy_guard",
        "urban_shadow",
        "desert_operative"
      ];

      // Use the same initialSkins array defined above
      const initialSkinsData: Skin[] = initialSkins;

      // Merge: preserve ALL existing skins, only add originals if missing
      const mergedSkinsData: Skin[] = [...existingSkinsData]; // Start with ALL existing skins
      const existingIdsSet = new Set(existingSkinsData.map((s: Skin) => s.id));

      // Only add original skins if they're missing (don't overwrite user's custom versions)
      originalSkinIdsData.forEach(id => {
        if (!existingIdsSet.has(id)) {
          const originalSkin = initialSkinsData.find(s => s.id === id);
          if (originalSkin) {
            mergedSkinsData.push(originalSkin);
          }
        }
      });

      // Only update if we added missing originals
      if (mergedSkinsData.length > existingSkinsData.length) {
        localStorage.setItem("skinsCatalog", JSON.stringify(mergedSkinsData));
        console.log(`Added missing original skins. Total: ${mergedSkinsData.length} skins.`);
      } else {
        console.log(`All skins preserved. Total: ${existingSkinsData.length} skins.`);
      }
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

    // Initialize published games - NEVER delete existing games, preserve all user data
    let existingGames = JSON.parse(localStorage.getItem("publishedGames") || "[]");
  
    // Remove ALL Tic Ti Toe duplicates (both old and new versions) - be aggressive
    existingGames = existingGames.filter((g: PublishedGame) => 
      !(g.title === 'Tic Ti Toe' && g.owner === 'System')
    );
  
    // Also remove any "Tic Tac Toe" variants (with different spelling)
    existingGames = existingGames.filter((g: PublishedGame) => 
      !(g.title === 'Tic Tac Toe' && g.owner === 'System')
    );
  
    // Add Tic Ti Toe (only one, latest version)
    existingGames.push(TIC_TAC_TOE_PRELOADED_GAME);
  
    // Add Capture de Flag if it doesn't exist
    const hasCaptureDeFlag = existingGames.some((g: PublishedGame) => 
      g.title === 'Capture de Flag' && g.owner === 'System'
    );
    if (!hasCaptureDeFlag) {
      existingGames.push(CAPTURE_DE_FLAG_PRELOADED_GAME);
    }
  
    localStorage.setItem("publishedGames", JSON.stringify(existingGames));

    if (!localStorage.getItem("accessoriesCatalog")) {
      const initialAccessories: Accessory[] = [
        {
          id: 'acc_gold_chain',
          type: 'chain',
          name: 'Gold Chain',
          color: '#FFD700',
          price: 150,
          rarity: 'rare'
        },
        {
          id: 'acc_silver_chain',
          type: 'chain',
          name: 'Silver Chain',
          color: '#C0C0C0',
          price: 100,
          rarity: 'common'
        },
        {
          id: 'acc_red_cap',
          type: 'hat',
          name: 'Red Cap',
          color: '#FF0000',
          price: 75,
          rarity: 'common'
        },
        {
          id: 'acc_blue_cap',
          type: 'hat',
          name: 'Blue Cap',
          color: '#0000FF',
          price: 75,
          rarity: 'common'
        },
        {
          id: 'acc_sunglasses',
          type: 'glasses',
          name: 'Sunglasses',
          color: '#000000',
          price: 120,
          rarity: 'common'
        },
        {
          id: 'acc_red_shirt',
          type: 'shirt',
          name: 'Red T-Shirt',
          color: '#FF0000',
          price: 80,
          rarity: 'common'
        },
        {
          id: 'acc_blue_shirt',
          type: 'shirt',
          name: 'Blue T-Shirt',
          color: '#0000FF',
          price: 80,
          rarity: 'common'
        },
        {
          id: 'acc_jeans',
          type: 'pants',
          name: 'Blue Jeans',
          color: '#191970',
          price: 100,
          rarity: 'common'
        },
        {
          id: 'acc_sneakers',
          type: 'shoes',
          name: 'White Sneakers',
          color: '#FFFFFF',
          price: 90,
          rarity: 'common'
        },
        {
          id: 'acc_backpack',
          type: 'backpack',
          name: 'School Backpack',
          color: '#8B4513',
          price: 110,
          rarity: 'common'
        },
        {
          id: 'acc_angel_wings',
          type: 'wings',
          name: 'Angel Wings',
          color: '#FFFFFF',
          price: 500,
          rarity: 'legendary'
        },
        {
          id: 'acc_demon_wings',
          type: 'wings',
          name: 'Demon Wings',
          color: '#8B0000',
          price: 500,
          rarity: 'legendary'
        },
        {
          id: 'acc_dog_pet',
          type: 'pet',
          name: 'Dog Pet',
          color: '#8B4513',
          price: 300,
          rarity: 'rare'
        },
        {
          id: 'acc_cat_pet',
          type: 'pet',
          name: 'Cat Pet',
          color: '#FFA500',
          price: 300,
          rarity: 'rare'
        },
        {
          id: 'acc_robot_pet',
          type: 'pet',
          name: 'Robot Pet',
          color: '#808080',
          price: 400,
          rarity: 'rare'
        }
      ];
      localStorage.setItem("accessoriesCatalog", JSON.stringify(initialAccessories));
    }

  } catch (e) {
    console.error('Error in initializeStorage:', e);
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

// Helper function to find a skin by ID with fallback
export function findSkin(skins: Skin[] | any, skinId?: string | null): Skin | null {
  // Handle non-array inputs (Promises, null, undefined, etc.)
  if (!skins || !Array.isArray(skins) || skins.length === 0) return null;
  if (!skinId) {
    // Fallback to starter_classic or first skin
    return skins.find((s: Skin) => s.id === 'starter_classic') || skins[0] || null;
  }
  return skins.find((s: Skin) => s.id === skinId) || skins.find((s: Skin) => s.id === 'starter_classic') || skins[0] || null;
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
  
  // Remove ALL Tic Ti Toe and Tic Tac Toe duplicates (any spelling)
  const ticTacToeGames = uniqueGames.filter(g => 
    (g.title === 'Tic Ti Toe' || g.title === 'Tic Tac Toe') && g.owner === 'System'
  );
  
  if (ticTacToeGames.length > 0) {
    // Always prefer "Tic Ti Toe" over "Tic Tac Toe" (correct spelling)
    const ticTiToeGames = ticTacToeGames.filter(g => g.title === 'Tic Ti Toe');
    const ticTacToeVariants = ticTacToeGames.filter(g => g.title === 'Tic Tac Toe');
    
    let latest;
    if (ticTiToeGames.length > 0) {
      // If we have "Tic Ti Toe", use the most recent one
      ticTiToeGames.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      latest = ticTiToeGames[0];
    } else if (ticTacToeVariants.length > 0) {
      // Otherwise use the most recent "Tic Tac Toe" variant
      ticTacToeVariants.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      latest = ticTacToeVariants[0];
    }
    
    if (latest) {
      // Remove all Tic Ti Toe/Tic Tac Toe games
      const filtered = uniqueGames.filter(g => 
        !((g.title === 'Tic Ti Toe' || g.title === 'Tic Tac Toe') && g.owner === 'System')
      );
      // Add back only the latest one (preferring "Tic Ti Toe")
      filtered.push(latest);
      
      // Save the cleaned list back to localStorage
      localStorage.setItem("publishedGames", JSON.stringify(filtered));
      return filtered;
    }
  }
  
  return uniqueGames;
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

// Message functions (for BanScreen compatibility)
export async function getMessages(username: string, withUsername?: string): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]");
    if (withUsername) {
      return allMessages.filter((m: any) => 
        (m.from === username && m.to === withUsername) || 
        (m.from === withUsername && m.to === username)
      );
    }
    return allMessages.filter((m: any) => m.to === username || m.from === username);
  } catch (e) {
    return [];
  }
}

export async function sendMessage(from: string, to: string, message: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      message,
      timestamp: Date.now(),
      read: false
    };
    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));
    return newMessage.id;
  } catch (e) {
    console.error('Error sending message:', e);
    return '';
  }
}

// Ban appeal function (stub for compatibility)
export async function createBanAppeal(username: string, ban: any, appealMessage: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    // Store appeal in localStorage for now
    const appeals = JSON.parse(localStorage.getItem("banAppeals") || "[]");
    const appeal = {
      id: `appeal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      ban,
      appealMessage,
      timestamp: Date.now(),
      status: 'pending'
    };
    appeals.push(appeal);
    localStorage.setItem("banAppeals", JSON.stringify(appeals));
    return appeal.id;
  } catch (e) {
    console.error('Error creating ban appeal:', e);
    return '';
  }
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

// Ban functions (stubs for compatibility)
export async function isUserBanned(username: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const bans = JSON.parse(localStorage.getItem("bannedUsers") || "[]");
    return bans.some((b: any) => b.username === username);
  } catch (e) {
    return false;
  }
}

export async function getBanForUser(username: string): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  try {
    const bans = JSON.parse(localStorage.getItem("bannedUsers") || "[]");
    return bans.find((b: any) => b.username === username) || null;
  } catch (e) {
    return null;
  }
}

export async function getBanAppeals(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem("banAppeals") || "[]");
  } catch (e) {
    return [];
  }
}

// Admin panel functions (stubs for compatibility)
export async function getBannedUsers(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem("bannedUsers") || "[]");
  } catch (e) {
    return [];
  }
}

export async function getReports(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem("reports") || "[]");
  } catch (e) {
    return [];
  }
}

export async function getGameSubmissions(): Promise<any[]> {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem("gameSubmissions") || "[]");
  } catch (e) {
    return [];
  }
}

export async function saveUserMadeGame(game: any): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const games = JSON.parse(localStorage.getItem("userMadeGames") || "[]");
    const index = games.findIndex((g: any) => g.id === game.id);
    if (index >= 0) {
      games[index] = game;
    } else {
      games.push(game);
    }
    localStorage.setItem("userMadeGames", JSON.stringify(games));
  } catch (e) {
    console.error('Error saving user made game:', e);
  }
}

export async function deleteGameSubmission(submissionId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const submissions = JSON.parse(localStorage.getItem("gameSubmissions") || "[]");
    const filtered = submissions.filter((s: any) => s.id !== submissionId);
    localStorage.setItem("gameSubmissions", JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting game submission:', e);
  }
}

export async function banUser(username: string, bannedBy: string, reason: string, permanent: boolean = false, expiresAt?: number): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const bans = JSON.parse(localStorage.getItem("bannedUsers") || "[]");
    const ban = {
      username,
      bannedBy,
      reason,
      timestamp: Date.now(),
      permanent,
      expiresAt
    };
    bans.push(ban);
    localStorage.setItem("bannedUsers", JSON.stringify(bans));
  } catch (e) {
    console.error('Error banning user:', e);
  }
}

export async function unbanUser(username: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const bans = JSON.parse(localStorage.getItem("bannedUsers") || "[]");
    const filtered = bans.filter((b: any) => b.username !== username);
    localStorage.setItem("bannedUsers", JSON.stringify(filtered));
  } catch (e) {
    console.error('Error unbanning user:', e);
  }
}

export async function updateReportStatus(reportId: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    const report = reports.find((r: any) => r.id === reportId);
    if (report) {
      report.status = status;
      if (adminNotes) report.adminNotes = adminNotes;
      if (reviewedBy) report.reviewedBy = reviewedBy;
      localStorage.setItem("reports", JSON.stringify(reports));
    }
  } catch (e) {
    console.error('Error updating report status:', e);
  }
}

export async function updateBanAppealStatus(appealId: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const appeals = JSON.parse(localStorage.getItem("banAppeals") || "[]");
    const appeal = appeals.find((a: any) => a.id === appealId);
    if (appeal) {
      appeal.status = status;
      if (adminNotes) appeal.adminNotes = adminNotes;
      if (reviewedBy) appeal.reviewedBy = reviewedBy;
      localStorage.setItem("banAppeals", JSON.stringify(appeals));
    }
  } catch (e) {
    console.error('Error updating ban appeal status:', e);
  }
}

// Friend request functions (already defined earlier, but ensure they're exported)
// These should already exist, but adding here for safety

export function saveMessages(messages: any[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("messages", JSON.stringify(messages));
}

export async function createReport(report: any): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    const newReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending'
    };
    reports.push(newReport);
    localStorage.setItem("reports", JSON.stringify(reports));
    return newReport.id;
  } catch (e) {
    console.error('Error creating report:', e);
    return '';
  }
}
