import type { Accessory, Skin } from '@/types';
import type { PixelPlaceMode } from '@/components/ModeSelection';

export type ModeEventChallenge = {
  id: string;
  title: string;
  description: string;
  rewardLabel: string;
};

export type ModeEvent = {
  id: string;
  mode: PixelPlaceMode;
  title: string;
  tagline: string;
  accent: string;
  /** Limited-time themed drop — items stay purchasable forever */
  alwaysAvailable: true;
  challenge: ModeEventChallenge;
  skins: Skin[];
  accessories: Accessory[];
};

const baseBody = (overrides: Partial<Skin> & Pick<Skin, 'id' | 'name' | 'price' | 'colors'>): Skin => ({
  img: '',
  use3d: true,
  defaultAnimation: 'idle',
  rarity: 'rare',
  ...overrides,
});

/** Mode event catalogs — always listed in the shop with a Limited badge. */
export const MODE_EVENTS: ModeEvent[] = [
  {
    id: 'kids-fair',
    mode: 'kids',
    title: 'Kids Fair',
    tagline: 'Bright booths, soft adventures, and candy-colored looks.',
    accent: '#38bdf8',
    alwaysAvailable: true,
    challenge: {
      id: 'kids-fair-friendly',
      title: 'Friendly Finder',
      description: 'Play any Kids-friendly built-in game, then grab a Fair exclusive from the shop.',
      rewardLabel: 'Unlock spotlight on Fair skins',
    },
    skins: [
      baseBody({
        id: 'event_kids_balloon_buddy',
        name: 'Balloon Buddy',
        price: 45,
        colors: { head: '#F4C2A1', torso: '#FF6B9D', arm: '#F4C2A1', legs: '#7DD3FC' },
        materials: {
          torso: { type: 'cloth', roughness: 0.7, metalness: 0, emissive: '#FF6B9D', emissiveIntensity: 0.15 },
        },
      }),
      baseBody({
        id: 'event_kids_star_catcher',
        name: 'Star Catcher Kit',
        price: 55,
        colors: { head: '#F4C2A1', torso: '#FDE047', arm: '#F4C2A1', legs: '#A78BFA' },
      }),
      baseBody({
        id: 'event_kids_bubble_bounce',
        name: 'Bubble Bounce',
        price: 40,
        colors: { head: '#F4C2A1', torso: '#67E8F9', arm: '#F4C2A1', legs: '#F9A8D4' },
      }),
    ],
    accessories: [
      {
        id: 'event_kids_party_hat',
        type: 'hat',
        name: 'Party Cone Hat',
        price: 25,
        color: '#FB7185',
        rarity: 'rare',
      },
      {
        id: 'event_kids_plush_pet',
        type: 'pet',
        name: 'Plush Buddy',
        price: 35,
        color: '#FBBF24',
        rarity: 'rare',
      },
    ],
  },
  {
    id: 'now-pulse',
    mode: 'now',
    title: 'Now Pulse',
    tagline: 'Clean lines, fast fits, and pulse-neon accents.',
    accent: '#34d399',
    alwaysAvailable: true,
    challenge: {
      id: 'now-pulse-streak',
      title: 'Pulse Streak',
      description: 'Jump into a Now catalog game, then pick up a Pulse limited from the shop anytime.',
      rewardLabel: 'Featured on the Pulse shelf',
    },
    skins: [
      baseBody({
        id: 'event_now_pulse_runner',
        name: 'Pulse Runner',
        price: 75,
        colors: { head: '#F4C2A1', torso: '#10B981', arm: '#F4C2A1', legs: '#064E3B' },
        materials: {
          torso: { type: 'cloth', roughness: 0.45, metalness: 0.2, emissive: '#34D399', emissiveIntensity: 0.25 },
        },
      }),
      baseBody({
        id: 'event_now_city_glide',
        name: 'City Glide',
        price: 85,
        colors: { head: '#F4C2A1', torso: '#64748B', arm: '#F4C2A1', legs: '#0F172A' },
      }),
      baseBody({
        id: 'event_now_arcade_spark',
        name: 'Arcade Spark',
        price: 95,
        colors: { head: '#F4C2A1', torso: '#22D3EE', arm: '#F4C2A1', legs: '#312E81' },
      }),
    ],
    accessories: [
      {
        id: 'event_now_visor',
        type: 'glasses',
        name: 'Pulse Visor',
        price: 40,
        color: '#34D399',
        rarity: 'rare',
      },
      {
        id: 'event_now_daypack',
        type: 'backpack',
        name: 'Daypack Pulse',
        price: 50,
        color: '#059669',
        rarity: 'rare',
      },
    ],
  },
  {
    id: 'unlimited-after-dark',
    mode: 'unlimited',
    title: 'Unlimited After Dark',
    tagline: 'Night markets, neon shadows, and high-stakes style.',
    accent: '#f472b6',
    alwaysAvailable: true,
    challenge: {
      id: 'unlimited-midnight-run',
      title: 'Midnight Run',
      description: 'Hit an Unlimited-listed title, then claim After Dark limiteds whenever you want.',
      rewardLabel: 'After Dark shelf spotlight',
    },
    skins: [
      baseBody({
        id: 'event_ul_neon_shadow',
        name: 'Neon Shadow',
        price: 120,
        rarity: 'legendary',
        colors: { head: '#E8D5B7', torso: '#1F2937', arm: '#E8D5B7', legs: '#111827' },
        materials: {
          torso: { type: 'leather', roughness: 0.35, metalness: 0.4, emissive: '#F472B6', emissiveIntensity: 0.35 },
        },
      }),
      baseBody({
        id: 'event_ul_night_racer',
        name: 'Night Racer',
        price: 140,
        rarity: 'legendary',
        colors: { head: '#F4C2A1', torso: '#7C3AED', arm: '#F4C2A1', legs: '#0B1020' },
      }),
      baseBody({
        id: 'event_ul_heist_protocol',
        name: 'Heist Protocol',
        price: 160,
        rarity: 'legendary',
        colors: { head: '#F4C2A1', torso: '#334155', arm: '#F4C2A1', legs: '#020617' },
      }),
    ],
    accessories: [
      {
        id: 'event_ul_shades',
        type: 'glasses',
        name: 'After Dark Shades',
        price: 70,
        color: '#F472B6',
        rarity: 'legendary',
      },
      {
        id: 'event_ul_drone',
        type: 'drone',
        name: 'Night Scout Drone',
        price: 110,
        color: '#A855F7',
        rarity: 'legendary',
      },
    ],
  },
];

export function getModeEvent(mode: PixelPlaceMode | null | undefined): ModeEvent | null {
  if (!mode) return null;
  return MODE_EVENTS.find((e) => e.mode === mode) ?? null;
}

export function getAllModeEventSkins(): Skin[] {
  return MODE_EVENTS.flatMap((e) => e.skins);
}

export function getAllModeEventAccessories(): Accessory[] {
  return MODE_EVENTS.flatMap((e) => e.accessories);
}

export function isModeEventItemId(id: string): boolean {
  return id.startsWith('event_');
}

/** Coins-only price: map legacy Safety Points exclusives onto Pixel Coins. */
export function coinPriceForSkin(skin: Skin): number {
  if (typeof skin.price === 'number' && skin.price > 0) return skin.price;
  if (skin.price === 0 && !skin.isSpecial && !skin.safetyPointsPrice) return 0; // free starter / default
  if (skin.safetyPointsPrice && skin.safetyPointsPrice > 0) {
    return Math.max(50, Math.round(skin.safetyPointsPrice * 2));
  }
  if (skin.isSpecial) return 100;
  return Math.max(10, skin.price || 10);
}

export function coinPriceForAccessory(accessory: Accessory): number {
  if (typeof accessory.price === 'number') return Math.max(0, accessory.price);
  return 25;
}
