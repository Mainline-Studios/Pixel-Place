import type { ScenarioGoal, ScenarioId } from './types';

export type ScenarioDef = {
  id: ScenarioId;
  name: string;
  description: string;
  icon: string;
  startMoney: number;
  startLoan: number;
  sandbox: boolean;
  /** 0–1 extra water on map edges */
  waterBias: number;
  goals: ScenarioGoal[];
};

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'sandbox',
    name: 'Sandbox',
    description: 'Unlimited money, no goals — pure creative park building.',
    icon: '🏖️',
    startMoney: 999_999,
    startLoan: 0,
    sandbox: true,
    waterBias: 0.25,
    goals: [{ type: 'none' }],
  },
  {
    id: 'firstPark',
    name: 'First Park',
    description: 'Classic challenge: grow attendance and park prestige.',
    icon: '🌱',
    startMoney: 12_000,
    startLoan: 5_000,
    sandbox: false,
    waterBias: 0.35,
    goals: [
      { type: 'guests', count: 500 },
      { type: 'rating', min: 720 },
    ],
  },
  {
    id: 'coasterRush',
    name: 'Coaster Rush',
    description: 'Open at least 3 different coaster types and welcome 250 guests.',
    icon: '🎢',
    startMoney: 18_000,
    startLoan: 3_000,
    sandbox: false,
    waterBias: 0.3,
    goals: [
      { type: 'coasters', count: 3, minKinds: 3 },
      { type: 'guests', count: 250 },
    ],
  },
  {
    id: 'sceneryDream',
    name: 'Scenery Dream',
    description: 'Beautify the park — high scenery score and a solid rating.',
    icon: '🌸',
    startMoney: 15_000,
    startLoan: 2_000,
    sandbox: false,
    waterBias: 0.2,
    goals: [
      { type: 'scenery', min: 85 },
      { type: 'rating', min: 650 },
      { type: 'structures', structure: 'fountain', count: 2 },
    ],
  },
  {
    id: 'profitPush',
    name: 'Profit Push',
    description: 'Reach $30,000 cash before the end of Year 1.',
    icon: '💰',
    startMoney: 8_000,
    startLoan: 6_000,
    sandbox: false,
    waterBias: 0.35,
    goals: [{ type: 'money', amount: 30_000, byYear: 1 }],
  },
  {
    id: 'thrillSeeker',
    name: 'Thrill Seeker',
    description: 'Max out excitement with multiple intense rides.',
    icon: '⚡',
    startMoney: 22_000,
    startLoan: 4_000,
    sandbox: false,
    waterBias: 0.28,
    goals: [
      { type: 'excitement', min: 55 },
      { type: 'ridesOpen', count: 5 },
    ],
  },
  {
    id: 'familyFair',
    name: 'Family Fair',
    description: 'A gentle fair: flat rides, food, and happy families.',
    icon: '🎠',
    startMoney: 14_000,
    startLoan: 2_500,
    sandbox: false,
    waterBias: 0.22,
    goals: [
      { type: 'flatRides', count: 4 },
      { type: 'guests', count: 180 },
      { type: 'avgHappiness', min: 68 },
    ],
  },
  {
    id: 'lakeResort',
    name: 'Lake Resort',
    description: 'Build around the waterfront — trees, décor, and guests.',
    icon: '🌊',
    startMoney: 11_000,
    startLoan: 3_500,
    sandbox: false,
    waterBias: 0.55,
    goals: [
      { type: 'structures', structure: 'tree', count: 12 },
      { type: 'guests', count: 120 },
      { type: 'rating', min: 550 },
    ],
  },
];

export function getScenario(id: ScenarioId): ScenarioDef {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[1];
}

export function formatGoal(goal: ScenarioGoal): string {
  switch (goal.type) {
    case 'none':
      return 'No objectives — build freely';
    case 'guests':
      return `Host ${goal.count} guests`;
    case 'rating':
      return `Park rating ${goal.min}+`;
    case 'money':
      return goal.byYear
        ? `Reach $${goal.amount.toLocaleString()} by end of Year ${goal.byYear}`
        : `Reach $${goal.amount.toLocaleString()}`;
    case 'scenery':
      return `Scenery score ${goal.min}+`;
    case 'excitement':
      return `Excitement ${goal.min}+`;
    case 'coasters':
      return goal.minKinds
        ? `Open ${goal.count} coasters (${goal.minKinds} different types)`
        : `Open ${goal.count} coasters`;
    case 'flatRides':
      return `Open ${goal.count} flat rides`;
    case 'ridesOpen':
      return `${goal.count} rides operating`;
    case 'avgHappiness':
      return `Average guest happiness ${goal.min}%+`;
    case 'structures':
      return `Place ${goal.count} ${goal.structure}s`;
    default:
      return '';
  }
}

export function isGoalMet(goal: ScenarioGoal, state: import('./types').ParkState): boolean {
  switch (goal.type) {
    case 'none':
      return true;
    case 'guests':
      return state.guestsTotal >= goal.count;
    case 'rating':
      return state.rating >= goal.min;
    case 'money':
      if (goal.byYear && state.year > goal.byYear) return false;
      if (goal.byYear && state.year === goal.byYear && state.month > 12) return state.money >= goal.amount;
      return state.money >= goal.amount;
    case 'scenery':
      return state.scenery >= goal.min;
    case 'excitement':
      return state.excitement >= goal.min;
    case 'coasters': {
      const open = state.rides.filter((r) => r.open && r.isCoaster);
      const kinds = new Set(open.map((r) => r.kind));
      if (goal.minKinds) return open.length >= goal.count && kinds.size >= goal.minKinds;
      return open.length >= goal.count;
    }
    case 'flatRides':
      return state.rides.filter((r) => r.open && !r.isCoaster).length >= goal.count;
    case 'ridesOpen':
      return state.rides.filter((r) => r.open).length >= goal.count;
    case 'avgHappiness': {
      if (!state.guests.length) return false;
      const avg = state.guests.reduce((s, g) => s + g.happiness, 0) / state.guests.length;
      return avg >= goal.min;
    }
    case 'structures':
      return state.cells.filter((c) => c.structure === goal.structure).length >= goal.count;
    default:
      return false;
  }
}

export function allGoalsMet(state: import('./types').ParkState): boolean {
  if (state.sandbox) return false;
  const scenario = getScenario(state.scenarioId);
  return scenario.goals.every((g) => isGoalMet(g, state));
}
