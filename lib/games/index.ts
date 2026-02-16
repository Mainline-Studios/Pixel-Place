import type { GameInfo } from './types';
import { gymPump } from './gymPump';
import { hypnosia } from './hypnosia';
import { underwaterOdyssey } from './underwaterOdyssey';
import { oceanlifePro } from './oceanlifePro';
import { superShowdown2 } from './superShowdown2';
import { superShowdown } from './superShowdown';
import { showdown } from './showdown';
import { redRover } from './redRover';
import { jungleJourney } from './jungleJourney';
import { chess } from './chess';
import { floorIsLava } from './floorIsLava';
import { insaneShowdown } from './insaneShowdown';
import { celestialSeries } from './celestialSeries';
import { superShowdown2D } from './superShowdown2D';
import { hideAndSeek } from './hideAndSeek';
import { ghostInTheDark } from './ghostInTheDark';
import { cityLife } from './cityLife';

export type { GameInfo } from './types';

export const BUILT_IN_GAMES: GameInfo[] = [
  gymPump,
  hypnosia,
  underwaterOdyssey,
  oceanlifePro,
  superShowdown2,
  superShowdown,
  showdown,
  redRover,
  jungleJourney,
  chess,
  floorIsLava,
  insaneShowdown,
  celestialSeries,
  superShowdown2D,
  hideAndSeek,
  ghostInTheDark,
  cityLife,
];

export function getGameBackground(gameTitle: string, gameId?: string): string {
  const title = (gameTitle || '').toLowerCase();
  const id = (gameId || '').toLowerCase();
  if (title.includes('showdown') || id.includes('showdown')) return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)';
  if (title.includes('chess') || id.includes('chess')) return 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)';
  if (title.includes('lava') || id.includes('lava')) return 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%)';
  if (title.includes('underwater') || title.includes('odyssey') || id.includes('underwater')) return 'linear-gradient(135deg, #00d4ff 0%, #0099cc 50%, #006699 100%)';
  if (title.includes('jungle') || id.includes('jungle')) return 'linear-gradient(135deg, #2d5016 0%, #3d6b1f 50%, #4a7c23 100%)';
  if (title.includes('rover') || id.includes('rover')) return 'linear-gradient(135deg, #ff4757 0%, #ff6348 50%, #ff4757 100%)';
  if (title.includes('hypnosia') || id.includes('hypnosia')) return 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #6c5ce7 100%)';
  if (title.includes('studio') || id.includes('studio')) return 'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #00b894 100%)';
  if (title.includes('gym') || id.includes('gym')) return 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #fd79a8 100%)';
  const firstChar = title.charAt(0);
  const gradients: Record<string, string> = {
    a: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', b: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', c: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', d: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', e: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', f: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', g: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', h: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', i: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', j: 'linear-gradient(135deg, #ff8a80 0%, #ea6100 100%)', k: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', l: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)', m: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', n: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', o: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', p: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', q: 'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)', r: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', s: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', t: 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)', u: 'linear-gradient(135deg, #30e3eb 0%, #b721ff 100%)', v: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', w: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', x: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', y: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', z: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  };
  return gradients[firstChar] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}
