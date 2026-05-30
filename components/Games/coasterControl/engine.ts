import {
  ADMISSION_FEE,
  BANKRUPT_AT,
  MAP_H,
  MAP_W,
  RIDE_DEF,
  SCENERY_SCORE,
  LEGACY_RIDE_IDS,
  getBuildCost,
  isCoasterTool,
  isFlatRideTool,
  toolToRideKind,
  toolToStructure,
} from './catalog';
import { allGoalsMet, getScenario } from './scenarios';
import type { BuildTool, Cell, Guest, ParkState, Ride, RideKind, ScenarioId, Terrain } from './types';

const DAYS_PER_MONTH = 30;

function idx(x: number, y: number): number {
  return y * MAP_W + x;
}

export function cellAt(state: ParkState, x: number, y: number): Cell | null {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return null;
  return state.cells[idx(x, y)];
}

export function countPathTiles(state: ParkState): number {
  return state.cells.filter((c) => c.terrain === 'path').length;
}

function makeCell(x: number, y: number, waterBias: number): Cell {
  const edge =
    x <= 1 || x >= MAP_W - 2 || y <= 1 || y >= MAP_H - 2;
  const water = edge && Math.random() < waterBias;
  return { terrain: water ? 'water' : 'grass' };
}

export function createInitialState(): ParkState {
  return buildParkState('firstPark');
}

export function buildParkState(scenarioId: ScenarioId): ParkState {
  const scenario = getScenario(scenarioId);
  const cells: Cell[] = [];
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      cells.push(makeCell(x, y, scenario.waterBias));
    }
  }
  const cx = Math.floor(MAP_W / 2);
  const cy = Math.floor(MAP_H / 2);
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      const c = cells[idx(cx + dx, cy + dy)];
      if (c.terrain !== 'water') c.terrain = 'grass';
    }
  }

  return {
    phase: 'menu',
    scenarioId,
    sandbox: scenario.sandbox,
    paused: false,
    speed: 1,
    money: scenario.startMoney,
    loan: scenario.startLoan,
    day: 1,
    month: 3,
    year: 1,
    guestsTotal: 0,
    guestsInPark: 0,
    rating: 420,
    cleanliness: 85,
    scenery: 12,
    excitement: 0,
    mapW: MAP_W,
    mapH: MAP_H,
    cells,
    rides: [],
    guests: [],
    nextGuestId: 1,
    nextRideId: 1,
    tool: 'path',
    coasterDraft: null,
    messages: [
      scenario.sandbox
        ? 'Sandbox mode — unlimited funds, no win condition.'
        : `${scenario.name}: ${scenario.description}`,
    ],
    tutorialStep: 0,
    stats: { incomeToday: 0, upkeepToday: 0, admissionsToday: 0 },
  };
}

function pushMessage(state: ParkState, msg: string): string[] {
  return [msg, ...state.messages].slice(0, 8);
}

function canAfford(state: ParkState, cost: number): boolean {
  return state.sandbox || state.money >= cost;
}

function spend(state: ParkState, cost: number): ParkState {
  if (state.sandbox || cost <= 0) return state;
  return { ...state, money: state.money - cost };
}

function moveGuest(g: Guest, nx: number, ny: number): Guest {
  if (g.x === nx && g.y === ny) return g;
  return { ...g, animX: g.x, animY: g.y, x: nx, y: ny };
}

function hasEntrance(state: ParkState): boolean {
  return state.cells.some((c) => c.structure === 'entrance');
}

function recalcParkStats(state: ParkState): Partial<ParkState> {
  let scenery = 10;
  let excitement = 0;
  for (const c of state.cells) {
    if (c.structure && SCENERY_SCORE[c.structure]) {
      scenery += SCENERY_SCORE[c.structure];
    }
  }
  for (const r of state.rides) {
    if (r.open) {
      const def = RIDE_DEF[r.kind];
      excitement += def.excitement * (r.isCoaster ? 1 + r.cells.length * 0.04 : 1);
      scenery += def.scenery;
    }
  }
  const pathCount = state.cells.filter((c) => c.terrain === 'path').length;
  const guestHappy =
    state.guests.length > 0
      ? state.guests.reduce((s, g) => s + g.happiness, 0) / state.guests.length
      : 70;
  const variety = Math.min(35, state.rides.filter((r) => r.open).length * 6);
  const rating = Math.round(
    Math.min(999, scenery * 2 + excitement * 12 + guestHappy * 2 + variety + pathCount * 0.12)
  );
  return { scenery: Math.round(scenery), excitement: Math.round(excitement * 10) / 10, rating };
}

function neighbors4(x: number, y: number): Array<{ x: number; y: number }> {
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];
}

function isWalkable(state: ParkState, x: number, y: number): boolean {
  const c = cellAt(state, x, y);
  if (!c || c.terrain === 'water') return false;
  return c.terrain === 'path' || c.structure === 'entrance';
}

function findPath(
  state: ParkState,
  from: { x: number; y: number },
  to: { x: number; y: number }
): Array<{ x: number; y: number }> | null {
  const key = (x: number, y: number) => `${x},${y}`;
  const goalK = key(to.x, to.y);
  const q: Array<{ x: number; y: number }> = [from];
  const prev = new Map<string, string | null>();
  prev.set(key(from.x, from.y), null);
  while (q.length) {
    const cur = q.shift()!;
    const k = key(cur.x, cur.y);
    if (k === goalK) {
      const path: Array<{ x: number; y: number }> = [];
      let p: string | null = k;
      while (p) {
        const [sx, sy] = p.split(',').map(Number);
        path.unshift({ x: sx, y: sy });
        p = prev.get(p) ?? null;
      }
      return path;
    }
    for (const n of neighbors4(cur.x, cur.y)) {
      const nk = key(n.x, n.y);
      if (prev.has(nk)) continue;
      if (!isWalkable(state, n.x, n.y)) continue;
      prev.set(nk, k);
      q.push(n);
    }
  }
  return null;
}

function entranceTile(state: ParkState): { x: number; y: number } | null {
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (state.cells[idx(x, y)].structure === 'entrance') return { x, y };
    }
  }
  return null;
}

function spawnGuest(state: ParkState): ParkState {
  const ent = entranceTile(state);
  if (!ent || !hasEntrance(state)) return state;
  const spawnRate = state.rating > 600 ? 0.55 : state.rating > 400 ? 0.38 : 0.22;
  if (Math.random() > spawnRate) return state;

  const g: Guest = {
    id: state.nextGuestId,
    x: ent.x,
    y: ent.y,
    animX: ent.x,
    animY: ent.y,
    happiness: 75 + Math.random() * 15,
    hunger: 20 + Math.random() * 30,
    nausea: 5 + Math.random() * 10,
    boredom: 30 + Math.random() * 40,
    cashSpent: 0,
    targetRideId: null,
    state: 'wander',
    rideTimer: 0,
    path: [],
    pathIndex: 0,
  };

  const fee = state.sandbox ? 0 : ADMISSION_FEE;
  return {
    ...state,
    guests: [...state.guests, g],
    nextGuestId: state.nextGuestId + 1,
    guestsTotal: state.guestsTotal + 1,
    guestsInPark: state.guestsInPark + 1,
    money: state.money + fee,
    stats: {
      ...state.stats,
      incomeToday: state.stats.incomeToday + fee,
      admissionsToday: state.stats.admissionsToday + 1,
    },
  };
}

function pickTargetRide(state: ParkState, guest: Guest): number | null {
  const open = state.rides.filter((r) => {
    if (!r.open) return false;
    if (r.isCoaster) return r.cells.length >= RIDE_DEF[r.kind].minTiles;
    return true;
  });
  if (!open.length) return null;
  const weights = open.map((r) => RIDE_DEF[r.kind].excitement + (guest.boredom > 50 ? 2 : 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * sum;
  for (let i = 0; i < open.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return open[i].id;
  }
  return open[0].id;
}

function tickGuests(state: ParkState): ParkState {
  let next = { ...state, guests: [...state.guests], rides: state.rides.map((r) => ({ ...r })) };
  const toRemove: number[] = [];

  for (let i = 0; i < next.guests.length; i++) {
    let g = { ...next.guests[i] };

    g.hunger = Math.min(100, g.hunger + 0.08);
    g.boredom = Math.min(100, g.boredom + 0.12);
    g.nausea = Math.max(0, g.nausea - 0.03);

    if (g.state === 'riding') {
      g.rideTimer -= 1;
      if (g.rideTimer <= 0) {
        const ride = next.rides.find((r) => r.id === g.targetRideId);
        if (ride) {
          ride.running = Math.max(0, ride.running - 1);
          const def = RIDE_DEF[ride.kind];
          const pay = state.sandbox ? 0 : def.ticket;
          g.cashSpent += pay;
          g.happiness = Math.min(100, g.happiness + def.excitement * 4);
          g.boredom = Math.max(0, g.boredom - 35);
          g.nausea = Math.min(100, g.nausea + def.excitement * 2.5);
          next.money += pay;
          next.stats = { ...next.stats, incomeToday: next.stats.incomeToday + pay };
        }
        g.state = 'wander';
        g.targetRideId = null;
        g.path = [];
      }
      next.guests[i] = g;
      continue;
    }

    if (g.state === 'queue') {
      const ride = next.rides.find((r) => r.id === g.targetRideId);
      if (!ride) {
        g.state = 'wander';
        g.targetRideId = null;
      } else {
        const def = RIDE_DEF[ride.kind];
        if (ride.running < def.capacity && ride.queue > 0) {
          ride.running += 1;
          ride.queue -= 1;
          g.state = 'riding';
          g.rideTimer = def.rideTicks;
        }
      }
      next.guests[i] = g;
      if (ride) next.rides = next.rides.map((r) => (r.id === ride.id ? ride : r));
      continue;
    }

    if (g.state === 'leaving') {
      const ent = entranceTile(next);
      if (ent) {
        if (!g.path.length) {
          g.path = findPath(next, { x: g.x, y: g.y }, ent) ?? [];
          g.pathIndex = 0;
        }
        if (g.path.length && g.pathIndex < g.path.length - 1) {
          g.pathIndex += 1;
          const p = g.path[g.pathIndex];
          g = moveGuest(g, p.x, p.y);
        } else if (g.x === ent.x && g.y === ent.y) {
          toRemove.push(g.id);
        }
      } else {
        toRemove.push(g.id);
      }
      next.guests[i] = g;
      continue;
    }

    if (g.hunger > 75) {
      for (const n of neighbors4(g.x, g.y)) {
        const c = cellAt(next, n.x, n.y);
        if (c?.structure === 'food') {
          g.hunger = 20;
          g.happiness = Math.min(100, g.happiness + 8);
          const cost = state.sandbox ? 0 : 6;
          next.money += cost;
          g.cashSpent += cost;
          next.stats = { ...next.stats, incomeToday: next.stats.incomeToday + cost };
          break;
        }
      }
    }

    if (g.nausea > 60) {
      for (const n of neighbors4(g.x, g.y)) {
        const c = cellAt(next, n.x, n.y);
        if (c?.structure === 'toilet') {
          g.nausea = 15;
          g.happiness = Math.min(100, g.happiness + 5);
          break;
        }
      }
    }

    if (!g.targetRideId && g.boredom > 55) {
      g.targetRideId = pickTargetRide(next, g);
    }

    if (g.targetRideId) {
      const ride = next.rides.find((r) => r.id === g.targetRideId);
      if (ride) {
        const st = ride.station;
        const dist = Math.abs(g.x - st.x) + Math.abs(g.y - st.y);
        if (dist <= 1) {
          ride.queue += 1;
          g.state = 'queue';
          g.path = [];
          next.rides = next.rides.map((r) => (r.id === ride.id ? ride : r));
        } else if (!g.path.length) {
          const path = findPath(next, { x: g.x, y: g.y }, st);
          if (path) {
            g.path = path;
            g.pathIndex = 0;
          } else {
            g.targetRideId = null;
          }
        }
      } else {
        g.targetRideId = null;
      }
    }

    if (g.state === 'wander') {
      if (g.path.length && g.pathIndex < g.path.length - 1) {
        g.pathIndex += 1;
        const p = g.path[g.pathIndex];
        g = moveGuest(g, p.x, p.y);
      } else {
        g.path = [];
        const dirs = neighbors4(g.x, g.y).filter((n) => isWalkable(next, n.x, n.y));
        if (dirs.length) {
          const d = dirs[Math.floor(Math.random() * dirs.length)];
          g = moveGuest(g, d.x, d.y);
        }
      }
    }

    if (g.happiness < 25 || (g.nausea > 90 && g.happiness < 40)) {
      g.state = 'leaving';
      g.path = [];
    }

    g.happiness = Math.max(
      0,
      Math.min(
        100,
        g.happiness -
          g.hunger * 0.02 -
          g.boredom * 0.015 -
          g.nausea * 0.025 +
          (cellAt(next, g.x, g.y)?.structure === 'bench' ? 0.5 : 0)
      )
    );

    next.guests[i] = g;
  }

  if (toRemove.length) {
    next.guests = next.guests.filter((g) => !toRemove.includes(g.id));
    next.guestsInPark = next.guests.length;
  }

  return next;
}

function dailyUpkeep(state: ParkState): ParkState {
  if (state.sandbox) {
    return { ...state, cleanliness: Math.min(100, state.cleanliness + 1) };
  }
  let upkeep = 0;
  for (const c of state.cells) {
    if (c.structure === 'food') upkeep += 5;
    if (c.structure === 'toilet') upkeep += 8;
    if (c.structure === 'fountain') upkeep += 12;
    if (c.structure === 'tree' || c.structure === 'bush') upkeep += 1;
  }
  for (const r of state.rides) {
    if (r.open) upkeep += RIDE_DEF[r.kind].upkeep;
  }
  upkeep += 25;
  const cleanliness = Math.max(40, state.cleanliness - upkeep * 0.02 + 2);
  return {
    ...state,
    money: state.money - upkeep,
    cleanliness,
    stats: { ...state.stats, upkeepToday: state.stats.upkeepToday + upkeep },
    messages: upkeep > 0 ? pushMessage(state, `Daily upkeep: -$${upkeep}.`) : state.messages,
  };
}

function advanceCalendar(state: ParkState): ParkState {
  let next = dailyUpkeep(state);
  let { day, month, year } = next;
  day += 1;
  if (day > DAYS_PER_MONTH) {
    day = 1;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const loanPayment =
      next.sandbox || next.loan <= 0 ? 0 : Math.min(400, Math.floor(next.loan * 0.08));
    return {
      ...next,
      day,
      month,
      year,
      money: next.money - loanPayment,
      loan: Math.max(0, next.loan - loanPayment),
      stats: { incomeToday: 0, upkeepToday: 0, admissionsToday: 0 },
      messages: pushMessage(
        next,
        loanPayment > 0 ? `Loan payment: -$${loanPayment}.` : 'New month — fresh stats!'
      ),
    };
  }
  return { ...next, day, month, year };
}

export function tickSimulation(state: ParkState): ParkState {
  if (state.phase !== 'playing' || state.paused) return state;

  let next = state;
  const ticks = state.speed;
  for (let t = 0; t < ticks; t++) {
    next = spawnGuest(next);
    next = tickGuests(next);
  }

  if (Math.random() < 0.04 * next.speed) {
    next = advanceCalendar(next);
  }

  next = { ...next, ...recalcParkStats(next) };

  if (!next.sandbox && next.money <= BANKRUPT_AT) {
    next = { ...next, phase: 'bankrupt', paused: true };
  } else if (allGoalsMet(next)) {
    next = { ...next, phase: 'won', paused: true, messages: pushMessage(next, 'Scenario complete!') };
  }

  return next;
}

function canBuildOn(c: Cell): boolean {
  return c.terrain !== 'water' && !c.rideId && !c.structure;
}

function clearCell(c: Cell): Cell {
  return { terrain: c.terrain === 'water' ? 'water' : 'grass' };
}

export function placeFlatRide(state: ParkState, x: number, y: number, kind: RideKind): ParkState {
  const c = cellAt(state, x, y);
  if (!c || c.terrain === 'water' || c.rideId || c.structure) {
    return { ...state, messages: pushMessage(state, 'Place flat rides on empty grass or path.') };
  }
  const def = RIDE_DEF[kind];
  const cost = def.baseCost;
  if (!canAfford(state, cost)) {
    return { ...state, messages: pushMessage(state, `Need $${cost}.`) };
  }

  const rideId = state.nextRideId;
  const cells = [...state.cells];
  const i = idx(x, y);
  cells[i] = {
    terrain: cells[i].terrain === 'grass' ? 'path' : cells[i].terrain,
    rideId,
    ridePart: 'station',
  };

  const ride: Ride = {
    id: rideId,
    kind,
    isCoaster: false,
    cells: [],
    station: { x, y },
    open: true,
    queue: 0,
    running: 0,
  };

  let next: ParkState = {
    ...spend(state, cost),
    cells,
    rides: [...state.rides, ride],
    nextRideId: rideId + 1,
    tool: 'select',
    messages: pushMessage(state, `${def.label} opened!${state.sandbox ? '' : ` -$${cost}`}`),
  };
  if (!state.sandbox && next.tutorialStep === 4) {
    next = { ...next, tutorialStep: 5 };
  }
  return { ...next, ...recalcParkStats(next) };
}

export function finishCoaster(state: ParkState): ParkState {
  const draft = state.coasterDraft;
  if (!draft || !draft.station || draft.cells.length < RIDE_DEF[draft.kind].minTiles) {
    return {
      ...state,
      messages: pushMessage(
        state,
        `Coaster needs a station and at least ${draft ? RIDE_DEF[draft.kind].minTiles : 5} track tiles.`
      ),
    };
  }

  const def = RIDE_DEF[draft.kind];
  const total = def.baseCost + draft.cells.length * def.tileCost;
  if (!canAfford(state, total)) {
    return { ...state, messages: pushMessage(state, `Need $${total} to open this coaster.`) };
  }

  const rideId = state.nextRideId;
  const cells = [...state.cells];
  const trackCells = [{ ...draft.station }, ...draft.cells];

  for (const p of trackCells) {
    const ci = idx(p.x, p.y);
    cells[ci] = {
      ...cells[ci],
      terrain: cells[ci].terrain === 'water' ? 'grass' : cells[ci].terrain,
      rideId,
      ridePart: p.x === draft.station!.x && p.y === draft.station!.y ? 'station' : 'track',
      structure: undefined,
    };
  }

  const ride: Ride = {
    id: rideId,
    kind: draft.kind,
    isCoaster: true,
    cells: draft.cells,
    station: draft.station,
    open: true,
    queue: 0,
    running: 0,
  };

  let next: ParkState = {
    ...spend(state, total),
    cells,
    rides: [...state.rides, ride],
    nextRideId: rideId + 1,
    coasterDraft: null,
    tool: 'select',
    messages: pushMessage(state, `${def.label} opened!${state.sandbox ? '' : ` -$${total}`}`),
  };
  return { ...next, ...recalcParkStats(next) };
}

export function cancelCoaster(state: ParkState): ParkState {
  return { ...state, coasterDraft: null, tool: 'select' };
}

export function handleTileClick(state: ParkState, x: number, y: number): ParkState {
  const c = cellAt(state, x, y);
  if (!c) return state;

  const rideKind = toolToRideKind(state.tool);
  if (rideKind && isFlatRideTool(state.tool)) {
    return placeFlatRide(state, x, y, rideKind);
  }

  if (rideKind && isCoasterTool(state.tool)) {
    let draft = state.coasterDraft ?? { kind: rideKind, cells: [], station: null };
    if (draft.kind !== rideKind) {
      draft = { kind: rideKind, cells: [], station: null };
    }

    if (!draft.station) {
      if (c.terrain === 'water' || c.rideId) {
        return { ...state, messages: pushMessage(state, 'Place the station on grass or path.') };
      }
      const cost = Math.round(RIDE_DEF[rideKind].baseCost * 0.15);
      if (!canAfford(state, cost)) {
        return { ...state, messages: pushMessage(state, 'Not enough cash for station.') };
      }
      return {
        ...spend(state, cost),
        coasterDraft: { ...draft, station: { x, y } },
        messages: pushMessage(state, 'Station placed. Click adjacent tiles for track, then Finish.'),
      };
    }

    const last = draft.cells[draft.cells.length - 1] ?? draft.station;
    const adj = Math.abs(last.x - x) + Math.abs(last.y - y) === 1;
    if (!adj) {
      return { ...state, messages: pushMessage(state, 'Track must connect to the last piece.') };
    }
    if (c.terrain === 'water') {
      return { ...state, messages: pushMessage(state, 'Cannot build on water.') };
    }
    const dup = draft.cells.some((p) => p.x === x && p.y === y);
    if ((draft.station.x === x && draft.station.y === y) || dup) return state;

    const tileCost = RIDE_DEF[rideKind].tileCost;
    if (!canAfford(state, tileCost)) {
      return { ...state, messages: pushMessage(state, `Each track tile costs $${tileCost}.`) };
    }

    return {
      ...spend(state, tileCost),
      coasterDraft: { ...draft, cells: [...draft.cells, { x, y }] },
    };
  }

  if (state.tool === 'select') return state;

  if (state.tool === 'bulldoze') {
    const i = idx(x, y);
    const cells = [...state.cells];
    if (cells[i].rideId) {
      const rid = cells[i].rideId!;
      for (let j = 0; j < cells.length; j++) {
        if (cells[j].rideId === rid) cells[j] = clearCell(cells[j]);
      }
      const rides = state.rides.filter((r) => r.id !== rid);
      return {
        ...state,
        cells,
        rides,
        messages: pushMessage(state, 'Ride demolished.'),
        ...recalcParkStats({ ...state, cells, rides }),
      };
    }
    cells[i] = clearCell(cells[i]);
    return { ...state, cells, ...recalcParkStats({ ...state, cells }) };
  }

  if (state.tool === 'path') {
    if (c.terrain === 'water') return state;
    const cost = getBuildCost('path') ?? 18;
    if (!canAfford(state, cost)) {
      return { ...state, messages: pushMessage(state, 'Need more money for paths.') };
    }
    const cells = [...state.cells];
    cells[idx(x, y)] = { ...c, terrain: 'path' };
    let next = { ...spend({ ...state, cells }, cost), ...recalcParkStats({ ...state, cells }) };
    if (!state.sandbox && next.tutorialStep === 3 && countPathTiles(next) >= 4) {
      next = { ...next, tutorialStep: 4 };
    }
    return next;
  }

  const structure = toolToStructure(state.tool);
  if (structure) {
    if (!canBuildOn(c) && structure !== 'entrance') {
      return { ...state, messages: pushMessage(state, 'Cannot build here.') };
    }
    const cost = getBuildCost(state.tool) ?? 0;
    if (!canAfford(state, cost)) {
      return { ...state, messages: pushMessage(state, `Need $${cost}.`) };
    }
    const cells = [...state.cells];
    const terrain: Terrain =
      c.terrain === 'water' ? 'grass' : structure === 'entrance' ? 'path' : c.terrain;
    cells[idx(x, y)] = {
      terrain: structure === 'entrance' ? 'path' : terrain === 'grass' ? 'grass' : terrain,
      structure,
    };
    let next: ParkState = {
      ...spend(state, cost),
      cells,
      messages: pushMessage(state, `Built ${structure}.`),
    };
    if (structure === 'entrance' && !state.sandbox && next.tutorialStep <= 2) {
      next = { ...next, tutorialStep: 3 };
    }
    return { ...next, ...recalcParkStats(next) };
  }

  return state;
}

export function startGame(scenarioId: ScenarioId): ParkState {
  const scenario = getScenario(scenarioId);
  return {
    ...buildParkState(scenarioId),
    phase: 'playing',
    tool: 'entrance',
    tutorialStep: scenario.sandbox ? 0 : 1,
    messages: scenario.sandbox
      ? ['Sandbox — unlimited money. Experiment with every ride and scenery piece!']
      : [`${scenario.name}: place your entrance to begin.`],
  };
}

export function setTool(state: ParkState, tool: BuildTool): ParkState {
  const kind = toolToRideKind(tool);
  const coaster = kind && isCoasterTool(tool);
  return {
    ...state,
    tool,
    coasterDraft: coaster
      ? state.coasterDraft?.kind === kind
        ? state.coasterDraft
        : { kind, cells: [], station: null }
      : null,
  };
}

export function toggleRideOpen(state: ParkState, rideId: number): ParkState {
  const ride = state.rides.find((r) => r.id === rideId);
  if (!ride) return state;
  const def = RIDE_DEF[ride.kind];
  const open = !ride.open;
  const rides = state.rides.map((r) =>
    r.id === rideId ? { ...r, open, running: open ? r.running : 0 } : r
  );
  let next: ParkState = {
    ...state,
    rides,
    messages: pushMessage(state, `${def.label} ${open ? 'opened' : 'closed'}.`),
  };
  return { ...next, ...recalcParkStats(next) };
}

export function setAllRidesOpen(state: ParkState, open: boolean): ParkState {
  const rides = state.rides.map((r) => ({ ...r, open, running: open ? r.running : 0 }));
  let next: ParkState = {
    ...state,
    rides,
    messages: pushMessage(state, open ? 'All rides opened.' : 'All rides closed.'),
  };
  return { ...next, ...recalcParkStats(next) };
}

export function testRide(state: ParkState, rideId: number): ParkState {
  const ride = state.rides.find((r) => r.id === rideId);
  if (!ride || !ride.open) {
    return { ...state, messages: pushMessage(state, 'Open the ride before testing.') };
  }
  const def = RIDE_DEF[ride.kind];
  const rides = state.rides.map((r) =>
    r.id === rideId ? { ...r, running: def.capacity, queue: 0 } : r
  );
  return {
    ...state,
    rides,
    messages: pushMessage(state, `Test run: ${def.label}.`),
  };
}

export function demolishRide(state: ParkState, rideId: number): ParkState {
  const ride = state.rides.find((r) => r.id === rideId);
  if (!ride) return state;
  const cells = [...state.cells];
  for (let j = 0; j < cells.length; j++) {
    if (cells[j].rideId === rideId) cells[j] = clearCell(cells[j]);
  }
  const rides = state.rides.filter((r) => r.id !== rideId);
  const def = RIDE_DEF[ride.kind];
  let next: ParkState = {
    ...state,
    cells,
    rides,
    messages: pushMessage(state, `${def.label} demolished.`),
  };
  return { ...next, ...recalcParkStats(next) };
}

export function payLoan(state: ParkState, amount: number): ParkState {
  if (state.sandbox) return state;
  const pay = Math.min(amount, state.loan, state.money);
  if (pay <= 0) return state;
  return {
    ...state,
    money: state.money - pay,
    loan: state.loan - pay,
    messages: pushMessage(state, `Paid $${pay} toward loan.`),
  };
}

export const SAVE_KEY = 'pixel-place-coaster-control-v2';

function migratePark(parsed: Partial<ParkState>): ParkState | null {
  if (!parsed.cells?.length) return null;
  const scenarioId = (parsed.scenarioId as ScenarioId) ?? 'firstPark';
  const scenario = getScenario(scenarioId);
  const guests = (parsed.guests ?? []).map((g) => ({
    ...g,
    animX: g.animX ?? g.x,
    animY: g.animY ?? g.y,
  }));
  const rides = (parsed.rides ?? []).map((r) => {
    const kind = (LEGACY_RIDE_IDS[r.kind as string] ?? r.kind) as keyof typeof RIDE_DEF;
    const def = RIDE_DEF[kind];
    if (!def) return null;
    return {
      ...r,
      kind,
      isCoaster: r.isCoaster ?? def.category === 'coaster',
    };
  }).filter((r): r is Ride => r != null);
  return {
    ...(buildParkState(scenarioId) as ParkState),
    ...parsed,
    scenarioId,
    sandbox: parsed.sandbox ?? scenario.sandbox,
    phase: 'playing',
    guests,
    rides,
    cells: parsed.cells,
  };
}

export function loadSave(): ParkState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem('pixel-place-coaster-control-v1');
    if (!raw) return null;
    return migratePark(JSON.parse(raw) as Partial<ParkState>);
  } catch {
    return null;
  }
}

export function saveGame(state: ParkState): void {
  if (typeof window === 'undefined' || state.phase !== 'playing') return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
