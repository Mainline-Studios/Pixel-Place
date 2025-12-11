import { User, Skin, PublishedGame, DraftGame, SceneData, TabContent, GameServer, ServerPlan, FriendRequest, Message, Accessory } from '@/types';
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
  { username: "the goat", password: "greatest" }
];

export const ADMIN_ACCOUNTS_LIST = ADMIN_ACCOUNTS;

// Initialize localStorage data
export function initializeStorage() {
  if (typeof window === 'undefined') return;

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
  const existingSkins = JSON.parse(localStorage.getItem("skinsCatalog") || "[]");
  const existingIds = existingSkins.map((s: Skin) => s.id);
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

//  functions
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




