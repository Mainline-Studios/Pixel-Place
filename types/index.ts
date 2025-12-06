export interface User {
  username: string;
  password: string;
  gender: string;
  role: 'admin' | 'user';
  coins: number;
  ownedSkins: string[];
  equippedSkin: string;
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

export interface PublishedGame {
  title: string;
  desc: string;
  owner: string;
  ts: number;
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

export type TabType = 'home' | 'discover' | 'avatarShop' | 'createGame' | 'studio' | 'coins' | 'friends' | 'settings';

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

