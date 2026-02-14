const PATH_TO_TAB: Record<string, string> = {
  '/': 'home',
  '/home': 'home',
  '/play': 'play',
  '/create': 'createGame',
  '/games': 'games',
  '/avatarshop': 'avatarShop',
  '/coins': 'coins',
  '/friends': 'friends',
  '/servers': 'servers',
  '/settings': 'settings',
  '/studio': 'studio',
  '/donation': 'donation',
};

const TAB_TO_PATH: Record<string, string> = {
  home: '/home',
  play: '/play',
  createGame: '/create',
  games: '/games',
  avatarShop: '/avatarshop',
  coins: '/coins',
  friends: '/friends',
  servers: '/servers',
  settings: '/settings',
  studio: '/studio',
  donation: '/donation',
};

export function pathToTab(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/';
  return PATH_TO_TAB[p] ?? 'home';
}

export function tabToPath(tab: string): string {
  return TAB_TO_PATH[tab] ?? '/home';
}

/** Navigate to a tab from anywhere in the app. Dispatches a custom event that Dashboard listens to. */
export function navigateToTab(tab: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('pixelplace-navigate', { detail: { tab } }));
}
