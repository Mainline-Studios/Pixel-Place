export interface User {
  username: string;
  password: string;
  gender: string;
  role: 'admin' | 'user';
  coins: number;
  ownedSkins: string[];
  equippedSkin: string;
  isDonor?: boolean;
  donationAmount?: number;
  ownedAccessories?: string[];
  equippedAccessories?: { [key: string]: string };
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
}

export interface Accessory {
  id: string;
  name: string;
  type: 'hat' | 'glasses' | 'mask' | 'backpack' | 'weapon';
  rarity: 'common' | 'rare' | 'legendary';
  price: number;
  img: string;
  color?: string;
  position?: { x: number; y: number; z: number };
  scale?: number;
}

export interface PublishedGame {
  title: string;
  desc: string;
  owner: string;
  ts: number;
  isPrebuilt?: boolean;
  sceneData?: SceneData;
}

export interface PrebuiltGame {
  id: string;
  title: string;
  desc: string;
  category: string;
  thumbnail: string;
  sceneData: SceneData;
  tags: string[];
}

export interface DraftGame {
  title: string;
  desc: string;
  owner: string;
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

export type TabType = 'home' | 'discover' | 'avatarShop' | 'createGame' | 'studio' | 'games' | 'coins' | 'friends' | 'settings' | 'donation' | 'aiCoder' | 'adminPanel' | 'report';

export interface Report {
  id: string;
  reportedUsername: string;
  reporterUsername: string;
  reason: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  reviewedBy?: string;
}

export interface Ban {
  username: string;
  bannedBy: string;
  reason: string;
  timestamp: number;
  permanent: boolean;
  expiresAt?: number;
}

export interface BanAppeal {
  id: string;
  username: string;
  ban: Ban;
  appealMessage: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: string;
  adminNotes?: string;
}

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

