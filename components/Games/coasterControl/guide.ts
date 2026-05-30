export const GUIDE_STORAGE_KEY = 'coasterControlGuideSeen';

export type GuideStep = {
  title: string;
  body: string;
};

export const HOW_TO_PLAY_STEPS: GuideStep[] = [
  {
    title: 'Park entrance',
    body: 'Open Build → Paths & scenery → Entrance, then click the map. Guests spawn at the red IN tile.',
  },
  {
    title: 'Paths',
    body: 'Build → Path, then click tiles to draw walkways. Guests only walk on paths — connect the entrance to your rides.',
  },
  {
    title: 'Flat rides',
    body: 'Build → Gentle, Thrill, Transport, or Water. Pick a ride and click one tile on grass or path. You pay the build cost from cash.',
  },
  {
    title: 'Roller coasters',
    body: 'Build → Roller coasters. Pick a coaster, click to place the station, click adjacent tiles for track, then press Finish in the bottom dock.',
  },
  {
    title: 'Ride management',
    body: 'Open Rides in the dock. Select a ride to Open / Close, Test ride, or Demolish — like RCT2 ride controls.',
  },
  {
    title: 'Time and money',
    body: 'Use Pause and 1×/2×/3× in the top bar. Yellow peeps are guests. Watch Cash and objectives under Park.',
  },
  {
    title: 'Win the scenario',
    body: 'Open Park to see goals (guests, rating, coasters, etc.). Sandbox has no win condition — experiment freely.',
  },
];

export function isGuideSeen(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(GUIDE_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

export function markGuideSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUIDE_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export const TUTORIAL_OBJECTIVES: Record<number, string> = {
  1: 'Click the map to place your park entrance (Build is open — Entrance selected)',
  3: 'Draw paths from the entrance — place at least 4 path tiles',
  4: 'Build any flat ride: Build → Gentle, Thrill, Transport, or Water',
  5: 'Open the Rides panel below to see your operating rides',
};

export function getTutorialObjective(step: number): string | null {
  if (step <= 0 || step > 5) return null;
  return TUTORIAL_OBJECTIVES[step] ?? null;
}
