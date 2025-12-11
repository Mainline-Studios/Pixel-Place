export interface User {
  username: string;
  password: string;
  gender: string;
  role: 'admin' | 'user';
  coins: number;
  ownedSkins: string[];
  equippedSkin: string;
  ownedAccessories?: string[]; // Accessory IDs owned by user
  equippedAccessories?: string[]; // Currently equipped accessory IDs
  ownedServers?: string[]; // Server IDs owned by user
  friends?: string[]; // Array of friend usernames
  friendRequests?: FriendRequest[]; // Incoming friend requests
  sentFriendRequests?: string[]; // Outgoing friend requests
}

export interface FriendRequest {
  from: string; // Username who sent the request
  to: string; // Username who received the request
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Message {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface Accessory {
  id: string;
  type: 'hat' | 'chain' | 'glasses' | 'shirt' | 'pants' | 'shoes' | 'backpack' | 'wings' | 'pet' | 'other';
  name: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  model?: string; // URL or identifier for 3D model
  color?: string;
  price?: number; // Price if sold separately
  rarity?: 'common' | 'rare' | 'legendary';
}

export interface Animation {
  name: string;
  type: 'idle' | 'walk' | 'jump' | 'wave' | 'dance' | 'custom';
  loop?: boolean;
  duration?: number;
}

export interface SkinMaterial {
  type: 'cloth' | 'metal' | 'plastic' | 'skin' | 'fabric' | 'leather' | 'denim' | 'rubber';
  roughness?: number; // 0-1, lower = shinier
  metalness?: number; // 0-1, higher = more metallic
  emissive?: string; // Hex color for glow
  emissiveIntensity?: number; // 0-1
}

export interface SkinTexture {
  base?: string; // Base texture path/URL
  normal?: string; // Normal map path/URL
  roughness?: string; // Roughness map path/URL
  emissive?: string; // Emissive map path/URL
}

export interface SkinAccessory {
  type: 'hat' | 'goggles' | 'armor' | 'backpack' | 'belt' | 'shirt' | 'pattern' | 'metallic' | 'themed';
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  material?: SkinMaterial;
  color?: string;
  texture?: SkinTexture;
}

export interface Skin {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
  price: number;
  img: string;
  colors: {
    head: string;
    torso: string;
    arm: string;
    legs: string;
  };
  // Enhanced 3D properties
  model3d?: string; // URL or identifier for 3D model
  use3d?: boolean; // Whether to use 3D rendering
  animations?: Animation[];
  accessories?: Accessory[];
  defaultAnimation?: string; // Name of default animation

  // Roblox-style enhancements
  materials?: {
    head?: SkinMaterial;
    torso?: SkinMaterial;
    arm?: SkinMaterial;
    legs?: SkinMaterial;
  };
  textures?: {
    head?: SkinTexture;
    torso?: SkinTexture;
    arm?: SkinTexture;
    legs?: SkinTexture;
  };
  skinAccessories?: SkinAccessory[]; // Built-in accessories for this skin
  theme?: string; // Theme like 'futuristic', 'cowboy', 'scientist', etc.
  highlights?: {
    head?: string; // Highlight color
    torso?: string;
    arm?: string;
    legs?: string;
  };
}

export interface PublishedGame {
  title: string;
  desc: string;
  owner: string;
  ts: number;
  thumbnail?: string; // Base64 image or URL
  gameCode?: string; // JavaScript/TypeScript code for the game
  playable?: boolean; // Whether the game can be played
  sceneData?: SceneData; // 3D scene data
  multiplayer?: boolean; // Whether game supports multiplayer
  maxPlayers?: number; // Maximum players for multiplayer games
  serverId?: string; // Server ID if hosted on a server
}

export interface GameServer {
  id: string;
  name: string;
  owner: string;
  gameId: string; // PublishedGame ts
  status: 'active' | 'inactive' | 'full';
  maxPlayers: number;
  currentPlayers: number;
  price: number; // Price in coins to purchase
  purchased: boolean;
  purchasedBy?: string; // Username who purchased
  purchasedAt?: number; // Timestamp
  region?: string; // Server region
  createdAt: number;
}

export interface ServerPlan {
  id: string;
  name: string;
  maxPlayers: number;
  price: number; // One-time purchase price in coins
  description: string;
  features: string[];
}

export interface DraftGame {
  title: string;
  desc: string;
  owner: string;
  thumbnail?: string;
  gameCode?: string;
  sceneData?: SceneData;
}

export interface SceneObject {
  id: string;
  type: 'cube' | 'sphere' | 'light';
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface SceneData {
  objects: SceneObject[];
}

export interface CoinPack {
  coins: number;
  priceLabel: string;
  stripePriceId: string;
}

export type TabType = 'home' | 'avatarShop' | 'createGame' | 'coins' | 'friends' | 'settings' | 'servers';

export interface TabContent {
  home?: string;
  discover?: string;
  avatarShop?: string;
  createGame?: string;
  studio?: string;
  coins?: string;
  friends?: string;
  settings?: string;
}

