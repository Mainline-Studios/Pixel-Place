/**
 * Showdown game storage - localStorage + BroadcastChannel (tab sync) + stats API (cross-device when logged in).
 * Keeps data in sync across tabs and devices (when user is logged in).
 */

import { loadLocal, saveLocal, subscribeToStorage } from './sharedStorage';
import { apiUrl } from './apiBaseUrl';

export type Power = 'fire' | 'ice' | 'lightning' | 'poison' | 'earth' | 'wind' | 'solar' | 'shadow';

export interface ShowdownData {
  pixelcoins: number;
  wins: number;
  ownedPowers: Record<Power, boolean>;
}

const KEYS = {
  pixelcoins: 'showdown_pixelcoins',
  wins: 'showdown_wins',
  ownedPowers: 'showdown_ownedPowers',
} as const;

const POWERS: Power[] = ['fire', 'ice', 'lightning', 'poison', 'earth', 'wind', 'solar', 'shadow'];

const POWER_COSTS: Record<Power, number> = {
  fire: 0,
  ice: 25,
  lightning: 0,
  poison: 35,
  earth: 30,
  wind: 20,
  solar: 50,
  shadow: 45,
};

function defaultOwnedPowers(): Record<Power, boolean> {
  const out = {} as Record<Power, boolean>;
  for (const p of POWERS) out[p] = POWER_COSTS[p] === 0;
  return out;
}

export function loadShowdownData(
  _user?: { username?: string } | null
): ShowdownData {
  try {
    const pixelcoins = loadLocal(KEYS.pixelcoins, 150);
    const wins = loadLocal(KEYS.wins, 0);
    const base = loadLocal<Record<string, boolean>>(KEYS.ownedPowers, {});
    const ownedPowers: Record<Power, boolean> = {} as Record<Power, boolean>;
    for (const p of POWERS) {
      ownedPowers[p] = Boolean(base[p]) || POWER_COSTS[p] === 0;
    }
    return { pixelcoins, wins, ownedPowers };
  } catch {
    return {
      pixelcoins: 150,
      wins: 0,
      ownedPowers: defaultOwnedPowers(),
    };
  }
}

export async function loadShowdownDataWithSync(
  user?: { username?: string } | null
): Promise<ShowdownData> {
  let local = loadShowdownData(user);

  if (user?.username) {
    try {
      const res = await fetch(apiUrl(`/api/stats?username=${encodeURIComponent(user.username)}`));
      if (res.ok) {
        const { stats } = await res.json();
        if (stats) {
          const remoteWins = typeof stats.showdownWins === 'number' ? stats.showdownWins : 0;
          const remotePixelcoins = typeof stats.showdownPixelcoins === 'number' ? stats.showdownPixelcoins : 150;
          const remotePowers = stats.showdownOwnedPowers;
          // Merge: take max for wins/pixelcoins, union for powers
          const mergedWins = Math.max(local.wins, remoteWins);
          const mergedPixelcoins = Math.max(local.pixelcoins, remotePixelcoins);
          const mergedOwned: Record<Power, boolean> = { ...local.ownedPowers };
          if (remotePowers && typeof remotePowers === 'object') {
            for (const p of POWERS) {
              if (remotePowers[p]) mergedOwned[p] = true;
            }
          }
          local = {
            wins: mergedWins,
            pixelcoins: mergedPixelcoins,
            ownedPowers: mergedOwned,
          };
          // Write merged back to localStorage so future loads use it
          saveLocal(KEYS.wins, mergedWins);
          saveLocal(KEYS.pixelcoins, mergedPixelcoins);
          saveLocal(KEYS.ownedPowers, mergedOwned);
        }
      }
    } catch {
      // Use local on network error
    }
  }

  return local;
}

export function saveShowdownData(
  data: Partial<ShowdownData>,
  user?: { username?: string } | null
): void {
  if (data.pixelcoins !== undefined) {
    saveLocal(KEYS.pixelcoins, data.pixelcoins);
  }
  if (data.wins !== undefined) {
    saveLocal(KEYS.wins, data.wins);
  }
  if (data.ownedPowers !== undefined) {
    saveLocal(KEYS.ownedPowers, data.ownedPowers);
  }

  if (user?.username) {
    const stats: Record<string, unknown> = {};
    if (data.pixelcoins !== undefined) stats.showdownPixelcoins = data.pixelcoins;
    if (data.wins !== undefined) stats.showdownWins = data.wins;
    if (data.ownedPowers !== undefined) stats.showdownOwnedPowers = data.ownedPowers;
    if (Object.keys(stats).length > 0) {
      fetch(apiUrl('/api/stats'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, stats }),
      }).catch(() => {});
    }
  }
}

export { subscribeToStorage };
