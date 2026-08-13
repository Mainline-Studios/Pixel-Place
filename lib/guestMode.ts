import type { Skin, User } from '@/types';

export const GUEST_DISPLAY_NAME = 'Guest';
export const GUEST_SESSION_KEY = 'pixelPlaceGuestSession';
export const GUEST_CHAT_REJECT_MSG = 'Guests can only use simple preset words.';
export const GUEST_SKIN_ID = 'guest_skin';

export const GUEST_SKIN: Skin = {
  id: GUEST_SKIN_ID,
  name: 'Guest',
  price: 0,
  img: '',
  use3d: true,
  defaultAnimation: 'idle',
  rarity: 'common',
  animations: [
    { name: 'Idle', type: 'idle', loop: true },
    { name: 'Walk', type: 'walk', loop: true },
    { name: 'Jump', type: 'jump', loop: true },
    { name: 'No Animation', type: 'custom', loop: true },
  ],
  colors: {
    head: '#b8bcc4',
    torso: '#7d828c',
    arm: '#9aa0aa',
    legs: '#5c616a',
  },
  materials: {
    head: { type: 'skin', roughness: 0.85, metalness: 0 },
    torso: { type: 'cloth', roughness: 0.9, metalness: 0 },
    arm: { type: 'skin', roughness: 0.85, metalness: 0 },
    legs: { type: 'cloth', roughness: 0.9, metalness: 0 },
  },
  textures: {
    head: { base: 'smooth' },
    torso: { base: 'fabric' },
    arm: { base: 'smooth' },
    legs: { base: 'fabric' },
  },
};

const GUEST_CHAT_WORD_LIST = [
  'hi', 'hello', 'hey', 'yo', 'hiya', 'sup',
  'yes', 'yeah', 'yep', 'yup', 'no', 'nope', 'nah', 'ok', 'okay', 'k',
  'please', 'pls', 'thanks', 'thank', 'thx', 'welcome',
  'sorry', 'oops', 'my', 'bad',
  'wait', 'go', 'come', 'here', 'there', 'this', 'that',
  'ready', 'start', 'stop', 'play', 'game', 'games', 'fun', 'cool', 'nice', 'wow',
  'good', 'great', 'awesome', 'amazing', 'epic', 'gg', 'wp', 'gl', 'hf',
  'lol', 'haha', 'hehe', 'lmao', 'omg',
  'bye', 'goodbye', 'later', 'see', 'ya', 'cya',
  'friend', 'friends', 'team', 'help', 'me', 'you', 'i', 'we', 'us', 'them',
  'up', 'down', 'left', 'right', 'jump', 'run', 'walk', 'follow',
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'love', 'like', 'want', 'need', 'can', 'cant', 'dont', 'im', 'youre', 'lets',
  'what', 'who', 'where', 'when', 'why', 'how',
  'today', 'now', 'soon', 'more', 'less', 'big', 'small', 'fast', 'slow',
  'safe', 'kind', 'sure', 'maybe', 'try', 'again', 'back',
  'join', 'leave', 'server', 'world', 'plaza', 'open', 'private',
  'pet', 'habitat', 'animal', 'food', 'shop',
  'brb', 'afk', 'np', 'ty', 'yw',
  'and', 'or', 'but', 'the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'for', 'with',
  'is', 'are', 'am', 'be', 'it', 'its', 'too', 'very', 'so', 'just',
  'look', 'over', 'near', 'far',
  'pixel', 'place', 'avatar', 'skin', 'coin', 'coins',
  'win', 'lose', 'lost', 'won', 'map', 'spawn', 'home',
] as const;

export const GUEST_CHAT_WORDS = new Set(
  GUEST_CHAT_WORD_LIST.map((w) => w.toLowerCase()),
);

/** Tap chips shown above guest chat (must be in the allowlist). */
export const GUEST_CHAT_QUICK = [
  'hi',
  'hello',
  'yes',
  'no',
  'ok',
  'thanks',
  'sorry',
  'wait',
  'ready',
  'come here',
  'follow me',
  'nice',
  'wow',
  'gg',
  'brb',
  'bye',
] as const;

type GuestSessionPayload = {
  username: string;
  createdAt: number;
};

export function isReservedUsername(username: string): boolean {
  const id = String(username || '').trim().toLowerCase();
  return id === 'guest' || id === 'system' || id.startsWith('guest_');
}

export function isGuestUsername(name?: string | null): boolean {
  const s = String(name || '').trim().toLowerCase();
  return s === 'guest' || /^guest_[a-z0-9]+$/i.test(s);
}

export function isGuestUser(user?: Pick<User, 'username' | 'isGuest'> | null): boolean {
  return Boolean(user?.isGuest || isGuestUsername(user?.username));
}

export function displayUsername(nameOrUser?: string | Pick<User, 'username' | 'isGuest'> | null): string {
  if (!nameOrUser) return GUEST_DISPLAY_NAME;
  if (typeof nameOrUser === 'object') {
    if (isGuestUser(nameOrUser)) return GUEST_DISPLAY_NAME;
    return nameOrUser.username || GUEST_DISPLAY_NAME;
  }
  if (isGuestUsername(nameOrUser)) return GUEST_DISPLAY_NAME;
  return nameOrUser;
}

function randomGuestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`.slice(0, 12);
}

export function createGuestUser(existingUsername?: string): User {
  const username =
    existingUsername && isGuestUsername(existingUsername)
      ? existingUsername
      : `guest_${randomGuestId()}`;
  return {
    username,
    password: '',
    gender: '',
    role: 'user',
    coins: 0,
    ownedSkins: [GUEST_SKIN_ID],
    equippedSkin: GUEST_SKIN_ID,
    ownedFaces: [],
    ownedAccessories: [],
    equippedAccessories: [],
    friends: [],
    setupCompleted: true,
    isGuest: true,
  };
}

export function writeGuestSession(user: User): void {
  if (typeof window === 'undefined' || !isGuestUser(user)) return;
  try {
    const payload: GuestSessionPayload = { username: user.username, createdAt: Date.now() };
    sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function readGuestSessionUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestSessionPayload;
    if (!parsed?.username || !isGuestUsername(parsed.username)) return null;
    return createGuestUser(parsed.username);
  } catch {
    return null;
  }
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function filterGuestChat(text: string): { ok: true; text: string } | { ok: false } {
  const trimmed = String(text || '').trim().slice(0, 80);
  if (!trimmed) return { ok: false };
  const tokens = trimmed
    .toLowerCase()
    .replace(/['’]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (!tokens.length) return { ok: false };
  for (const token of tokens) {
    if (!GUEST_CHAT_WORDS.has(token)) return { ok: false };
  }
  return { ok: true, text: tokens.join(' ') };
}

/** Offline 2D games guests can always play. */
export const GUEST_OFFLINE_2D_GAME_IDS = [
  'hypnosia',
  'underwaterOdyssey',
  'oceanlifePro',
  'showdown',
  'baseballDiamond',
  'celestialSeries',
  'jungleJourney',
  'voidArcade',
  'ecoHero',
  'coasterControl',
  'squishBubbles',
  'squishSlime',
] as const;

/** Shared 3D online arenas that rotate in Guest Game of the Day. */
export const GUEST_ARENA_GAME_IDS = [
  'skyTag',
  'crystalRush',
  'kingHill',
  'neonRace',
  'balloonBrawl',
  'laserDome',
  'parkourPeak',
  'snowballSiege',
] as const;

/** 3D online games that rotate as Guest Game of the Day. */
export const GUEST_GAME_OF_THE_DAY_POOL = [
  'openWorldPlaza',
  'petHabitat',
  'gymPump',
  ...GUEST_ARENA_GAME_IDS,
] as const;

export const GUEST_FUNDAY_FAVORITE_KEY = 'pixelPlaceGuestFundayFavorite';

export function utcDayIndex(now = new Date()): number {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
}

export function guestGameOfTheDayDateKey(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

/** UTC Friday — Guest Friday Funday unlocks every game. */
export function isGuestFridayFunday(now = new Date()): boolean {
  return now.getUTCDay() === 5;
}

export function getGuestFundayFavorite(now = new Date()): string | null {
  if (typeof window === 'undefined' || !isGuestFridayFunday(now)) return null;
  try {
    const raw = sessionStorage.getItem(GUEST_FUNDAY_FAVORITE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { date?: string; gameId?: string };
    if (parsed.date !== guestGameOfTheDayDateKey(now) || typeof parsed.gameId !== 'string' || !parsed.gameId) {
      return null;
    }
    return parsed.gameId;
  } catch {
    return null;
  }
}

export function setGuestFundayFavorite(gameId: string, now = new Date()): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      GUEST_FUNDAY_FAVORITE_KEY,
      JSON.stringify({ date: guestGameOfTheDayDateKey(now), gameId }),
    );
  } catch {
    // ignore
  }
}

export function getGuestGameOfTheDayId(now = new Date()): string {
  const pool = GUEST_GAME_OF_THE_DAY_POOL;
  const idx = ((utcDayIndex(now) % pool.length) + pool.length) % pool.length;
  return pool[idx]!;
}

export function isGuestOffline2DGameId(gameId: string): boolean {
  return (GUEST_OFFLINE_2D_GAME_IDS as readonly string[]).includes(gameId);
}

export function isGuestArenaGameId(gameId: string): boolean {
  return (GUEST_ARENA_GAME_IDS as readonly string[]).includes(gameId);
}

export function isGuestPlayableGameId(gameId: string, now = new Date()): boolean {
  if (isGuestFridayFunday(now)) return true;
  return isGuestOffline2DGameId(gameId) || gameId === getGuestGameOfTheDayId(now);
}
