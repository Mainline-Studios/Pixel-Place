import { User, Skin, PublishedGame, DraftGame, SceneData, TabContent } from '@/types';

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


