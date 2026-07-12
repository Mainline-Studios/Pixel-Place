const PATH_TO_TAB: Record<string, string> = {
  '/': 'games',
  '/home': 'games',
  '/play': 'games',
  '/games': 'games',
  '/avatarshop': 'avatarShop',
  '/coins': 'coins',
  '/friends': 'friends',
  '/settings': 'settings',
  '/report': 'report',
  '/safety': 'report',
  '/studio': 'games',
  '/donation': 'donation',
};

const TAB_TO_PATH: Record<string, string> = {
  games: '/games',
  avatarShop: '/avatarshop',
  coins: '/coins',
  friends: '/friends',
  settings: '/settings',
  report: '/report',
  donation: '/donation',
};

export function pathToTab(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/';
  return PATH_TO_TAB[p] ?? 'games';
}

export function tabToPath(tab: string): string {
  return TAB_TO_PATH[tab] ?? '/games';
}

/** Navigate to a tab from anywhere in the app. Dispatches a custom event that Dashboard listens to. */
export function navigateToTab(tab: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('pixelplace-navigate', { detail: { tab } }));
}

/** Open Settings → Release notes for a specific log slug (e.g. 3-0-safehouse). */
export function navigateToReleaseNote(slug: string): void {
  if (typeof window === 'undefined') return;
  navigateToTab('settings');
  window.dispatchEvent(new CustomEvent('pixelplace-open-release-note', { detail: { slug } }));
}
