import React, { useEffect, useRef, useState } from 'react';

// SuperShowdown2D.tsx
// A 2D port of InsaneShowdown powers with preserved numeric values and 500ms status tick.
// - status tick: 500ms
// - black hole: 3s until explode
// - parasite: 4.5s tick
// - lunar midnight: 10s active, 80s cooldown
// - soleil teleport: 120s cooldown
// - harmony: magnetic mechanics
// - hex: stacks behavior
// - doppelganger: persistent and invulnerable
// - whirlpool: pull fraction per tick
// - upgrades apply damage multipliers
// - localStorage persistence for owned powers, pixelcoins, upgrade levels

// LocalStorage keys
const LS_KEYS = {
  OWNED: 'ssd2_ownedPowers_v1',
  PIXELCOINS: 'ssd2_pixelcoins_v1',
  UPGRADES: 'ssd2_upgrades_v1',
};

// Tick interval in ms (preserved)
const TICK_MS = 500;

// Simple helper to read/write localStorage with fallback
const lsGet = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const lsSet = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// Types
type PowerId =
  | 'blackHole'
  | 'parasite'
  | 'lunarMidnight'
  | 'soleilTeleport'
  | 'harmony'
  | 'hex'
  | 'doppelganger'
  | 'whirlpool';

type PowerDef = {
  id: PowerId;
  name: string;
  cost: number; // pixelcoins
  baseDamage?: number; // base damage when applicable
  cooldown?: number; // ms
  activeDuration?: number; // ms
  description?: string;
};

// Define powers with numbers taken from the user's specification
const POWER_DEFS: Record<PowerId, PowerDef> = {
  blackHole: {
    id: 'blackHole',
    name: 'Black Hole',
    cost: 200,
    description: 'Creates a gravity well that explodes after 3s',
    activeDuration: 3000, // explosion timer
    baseDamage: 120,
  },
  parasite: {
    id: 'parasite',
    name: 'Parasite',
    cost: 150,
    description: 'Attach a parasite that ticks every 4.5s',
    baseDamage: 40, // per tick
  },
  lunarMidnight: {
    id: 'lunarMidnight',
    name: 'Lunar Midnight',
    cost: 300,
    description: '10s active control, 80s cooldown',
    activeDuration: 10_000,
    cooldown: 80_000,
    baseDamage: 8, // damage per tick while active
  },
  soleilTeleport: {
    id: 'soleilTeleport',
    name: 'Soleil Teleport',
    cost: 250,
    description: 'Teleport target; 120s cooldown',
    cooldown: 120_000,
    baseDamage: 0,
  },
  harmony: {
    id: 'harmony',
    name: 'Harmony',
    cost: 180,
    description: 'Magnetic pull mechanics (magnetizes enemies)',
    baseDamage: 10,
  },
  hex: {
    id: 'hex',
    name: 'Hex',
    cost: 120,
    description: 'Applies stacking hex debuff',
    baseDamage: 12, // damage per stack tick
  },
  doppelganger: {
    id: 'doppelganger',
    name: 'Doppelganger',
    cost: 400,
    description: 'Spawns a persistent, invulnerable clone that attacks',
    baseDamage: 20, // per tick from clone
  },
  whirlpool: {
    id: 'whirlpool',
    name: 'Whirlpool',
    cost: 160,
    description: 'Pulls enemies fractionally each tick',
    baseDamage: 0,
  },
};

// Upgrade multiplier function: each level gives a multiplicative bonus to damage
const upgradeMultiplier = (level: number) => 1 + level * 0.15; // 15% per level

// Enemy representation in 2D
type Enemy = {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  statuses: Record<string, any>; // arbitrary status objects
  isClone?: boolean; // doppelganger clones
  invulnerable?: boolean;
};

// Component
const SuperShowdown2D: React.FC = () => {
  // persistence
  const [ownedPowers, setOwnedPowers] = useState<Record<PowerId, boolean>>(() =>
    lsGet<Record<PowerId, boolean>>(LS_KEYS.OWNED, {})
  );
  const [pixelcoins, setPixelcoins] = useState<number>(() =>
    lsGet<number>(LS_KEYS.PIXELCOINS, 500)
  );
  const [upgrades, setUpgrades] = useState<Record<PowerId, number>>(() =>
    lsGet<Record<PowerId, number>>(LS_KEYS.UPGRADES, {})
  );

  // Game state
  const [enemies, setEnemies] = useState<Enemy[]>(() => {
    // Initialize some sample enemies
    const arr: Enemy[] = [];
    for (let i = 0; i < 6; i++) {
      arr.push({
        id: `e${i}`,
        x: 50 + i * 80,
        y: 120 + (i % 2) * 40,
        hp: 200 + i * 20,
        maxHp: 200 + i * 20,
        statuses: {},
      });
    }
    return arr;
  });

  // cooldowns/actives per power
  const [powerState, setPowerState] = useState<Record<PowerId, { cooldownUntil?: number; activeUntil?: number }>>(() => ({}));

  const tickRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Save persistence on change
  useEffect(() => {
    lsSet(LS_KEYS.OWNED, ownedPowers);
  }, [ownedPowers]);
  useEffect(() => {
    lsSet(LS_KEYS.PIXELCOINS, pixelcoins);
  }, [pixelcoins]);
  useEffect(() => {
    lsSet(LS_KEYS.UPGRADES, upgrades);
  }, [upgrades]);

  // Utility to modify enemies safely
  const updateEnemies = (updater: (arr: Enemy[]) => Enemy[]) => {
    setEnemies((prev) => {
      const next = updater(prev.map((e) => ({ ...e, statuses: { ...e.statuses } }))); // shallow copy
      return next;
    });
  };

  // Buy power
  const buyPower = (id: PowerId) => {
    const def = POWER_DEFS[id];
    if (ownedPowers[id]) return;
    if (pixelcoins < def.cost) return;
    setPixelcoins((p) => p - def.cost);
    setOwnedPowers((o) => ({ ...o, [id]: true }));
  };

  // Upgrade power
  const upgradePower = (id: PowerId) => {
    const cost = 100 + (upgrades[id] || 0) * 75;
    if (pixelcoins < cost) return;
    setPixelcoins((p) => p - cost);
    setUpgrades((u) => ({ ...u, [id]: (u[id] || 0) + 1 }));
  };

  // Activate power
  const activatePower = (id: PowerId, targetEnemyId?: string) => {
    if (!ownedPowers[id]) return;
    const now = Date.now();
    const def = POWER_DEFS[id];
    const pState = powerState[id] || {};
    if (pState.cooldownUntil && pState.cooldownUntil > now) return; // still cooling

    if (id === 'blackHole') {
      // Place a black hole at a random point or target
      const center = targetEnemyId
        ? enemies.find((e) => e.id === targetEnemyId)
        : enemies[Math.floor(Math.random() * enemies.length)];
      if (!center) return;
      const bhId = `bh_${now}`;
      // Add a status on enemies referencing this black hole and timer
      updateEnemies((arr) =>
        arr.map((e) => ({
          ...e,
          statuses: {
            ...e.statuses,
            [bhId]: {
              type: 'blackHole',
              centerX: center.x,
              centerY: center.y,
              remaining: def.activeDuration, // 3s
              pullStrength: 0.12, // fraction per tick
            },
          },
        }))
      );
      // black hole explosion will be handled in tick when remaining <= 0
    } else if (id === 'parasite') {
      // Attach parasite to a random enemy (or target)
      const target = targetEnemyId ? enemies.find((e) => e.id === targetEnemyId) : enemies[Math.floor(Math.random() * enemies.length)];
      if (!target) return;
      const parasiteId = `parasite_${target.id}_${now}`;
      updateEnemies((arr) =>
        arr.map((e) =>
          e.id === target.id
            ? {
                ...e,
                statuses: {
                  ...e.statuses,
                  [parasiteId]: {
                    type: 'parasite',
                    tickEvery: 4500, // 4.5s
                    tickCountdown: 4500,
                    damage: def.baseDamage, // base
                    sourcePower: id,
                  },
                },
              }
            : e
        )
      );
    } else if (id === 'lunarMidnight') {
      // Activate global lunar effect for activeDuration, then set cooldown
      setPowerState((ps) => ({ ...ps, [id]: { activeUntil: now + (def.activeDuration || 0), cooldownUntil: now + (def.cooldown || 0) } }));
    } else if (id === 'soleilTeleport') {
      // Teleport a target enemy to a random safe location (simulate by moving coordinates)
      const target = targetEnemyId ? enemies.find((e) => e.id === targetEnemyId) : enemies[Math.floor(Math.random() * enemies.length)];
      if (!target) return;
      updateEnemies((arr) =>
        arr.map((e) =>
          e.id === target.id
            ? { ...e, x: Math.random() * 600 + 20, y: Math.random() * 300 + 20 } // teleport position
            : e
        )
      );
      setPowerState((ps) => ({ ...ps, [id]: { cooldownUntil: now + (def.cooldown || 0) } }));
    } else if (id === 'harmony') {
      // Apply magnetize status to all enemies for some seconds
      const magId = `harmony_${now}`;
      updateEnemies((arr) =>
        arr.map((e) => ({
          ...e,
          statuses: {
            ...e.statuses,
            [magId]: {
              type: 'magnet',
              centerX: 320,
              centerY: 200,
              remaining: 6000, // 6s magnet
              pullStrength: 0.08, // per tick fraction
            },
          },
        }))
      );
    } else if (id === 'hex') {
      // Apply a hex stack to a target enemy
      const target = targetEnemyId ? enemies.find((e) => e.id === targetEnemyId) : enemies[Math.floor(Math.random() * enemies.length)];
      if (!target) return;
      updateEnemies((arr) =>
        arr.map((e) => {
          if (e.id !== target.id) return e;
          const stacks = (e.statuses.hex_stacks || { count: 0 }).count || 0;
          const newCount = Math.min(6, stacks + 1); // cap at 6 stacks
          return {
            ...e,
            statuses: {
              ...e.statuses,
              hex_stacks: {
                type: 'hex',
                count: newCount,
                tickEvery: 1000,
                tickCountdown: 1000,
                damagePerStack: def.baseDamage,
              },
            },
          };
        })
      );
    } else if (id === 'doppelganger') {
      // Spawn a persistent, invulnerable clone that deals damage each tick
      const clone: Enemy = {
        id: `clone_${now}`,
        x: 320,
        y: 200,
        hp: 99999,
        maxHp: 99999,
        statuses: { doppel: { type: 'doppel', tickEvery: 1000, tickCountdown: 1000, damage: def.baseDamage } },
        isClone: true,
        invulnerable: true,
      };
      setEnemies((prev) => [...prev, clone]);
    } else if (id === 'whirlpool') {
      // Create a whirlpool center that pulls enemies fractionally
      const center = targetEnemyId
        ? enemies.find((e) => e.id === targetEnemyId)
        : enemies[Math.floor(Math.random() * enemies.length)];
      if (!center) return;
      const wpId = `whirlpool_${now}`;
      updateEnemies((arr) =>
        arr.map((e) => ({
          ...e,
          statuses: {
            ...e.statuses,
            [wpId]: {
              type: 'whirlpool',
              centerX: center.x,
              centerY: center.y,
              remaining: 7000,
              pullFraction: 0.06, // fraction per tick
            },
          },
        }))
      );
    }

    // Set cooldown if defined and not lunar active (handled above)
    if (def.cooldown && id !== 'lunarMidnight') {
      setPowerState((ps) => ({ ...ps, [id]: { ...(ps[id] || {}), cooldownUntil: now + def.cooldown } }));
    }
  };

  // Tick loop: handles status updates every 500ms
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      // Run logic for each enemy
      updateEnemies((arr) =>
        arr
          .map((e) => {
            let newE = { ...e, statuses: { ...e.statuses } };
            // iterate statuses
            for (const [sid, s] of Object.entries(newE.statuses)) {
              if (!s || !s.type) continue;
              // reduce timers if present
              if (typeof s.remaining === 'number') {
                s.remaining = Math.max(0, s.remaining - dt);
              }
              if (s.type === 'blackHole') {
                // pull fraction towards center
                const dx = s.centerX - newE.x;
                const dy = s.centerY - newE.y;
                newE.x += dx * (s.pullStrength || 0.12);
                newE.y += dy * (s.pullStrength || 0.12);
                // explode when remaining <= 0
                if (s.remaining <= 0) {
                  const powerId: PowerId = 'blackHole';
                  const base = POWER_DEFS[powerId].baseDamage || 0;
                  const mult = upgradeMultiplier(upgrades[powerId] || 0);
                  const damage = Math.round(base * mult);
                  if (!newE.invulnerable) newE.hp = Math.max(0, newE.hp - damage);
                  // remove this particular black hole status
                  delete newE.statuses[sid];
                }
              } else if (s.type === 'parasite') {
                // countdown parasite tick
                s.tickCountdown = (s.tickCountdown || s.tickEvery) - dt;
                if (s.tickCountdown <= 0) {
                  const damage = Math.round((s.damage || 0) * upgradeMultiplier(upgrades['parasite'] || 0));
                  if (!newE.invulnerable) newE.hp = Math.max(0, newE.hp - damage);
                  s.tickCountdown = s.tickEvery; // reset
                }
              } else if (s.type === 'magnet') {
                // harmony magnetic pull
                const dx = s.centerX - newE.x;
                const dy = s.centerY - newE.y;
                newE.x += dx * (s.pullStrength || 0.08);
                newE.y += dy * (s.pullStrength || 0.08);
                if (typeof s.remaining === 'number' && s.remaining <= 0) delete newE.statuses[sid];
              } else if (s.type === 'hex') {
                // hex stacking ticks
                s.tickCountdown = (s.tickCountdown || s.tickEvery) - dt;
                if (s.tickCountdown <= 0) {
                  const stacks = s.count || 0;
                  const base = s.damagePerStack || POWER_DEFS.hex.baseDamage || 0;
                  const mult = upgradeMultiplier(upgrades['hex'] || 0);
                  const damage = Math.round(base * stacks * mult);
                  if (!newE.invulnerable) newE.hp = Math.max(0, newE.hp - damage);
                  s.tickCountdown = s.tickEvery;
                }
              } else if (s.type === 'doppel') {
                // doppelganger's attack tick (clones are separate enemies, but we run here too)
                s.tickCountdown = (s.tickCountdown || s.tickEvery) - dt;
                if (s.tickCountdown <= 0) {
                  // pick a random non-invulnerable enemy to damage
                  const victims = enemies.filter((ev) => !ev.isClone && !ev.invulnerable && ev.hp > 0);
                  if (victims.length > 0) {
                    const victim = victims[Math.floor(Math.random() * victims.length)];
                    const dmg = Math.round((s.damage || 0) * upgradeMultiplier(upgrades['doppelganger'] || 0));
                    updateEnemies((arr2) =>
                      arr2.map((ev) => (ev.id === victim.id ? { ...ev, hp: Math.max(0, ev.hp - dmg) } : ev))
                    );
                  }
                  s.tickCountdown = s.tickEvery;
                }
              } else if (s.type === 'whirlpool') {
                // fractional pull per tick
                const dx = s.centerX - newE.x;
                const dy = s.centerY - newE.y;
                newE.x += dx * (s.pullFraction || 0.06);
                newE.y += dy * (s.pullFraction || 0.06);
                if (typeof s.remaining === 'number' && s.remaining <= 0) delete newE.statuses[sid];
              }
            }
            return newE;
          })
          .map((e) => ({
            ...e,
            // natural regenerate or decay could be added here
          }))
      );

      // Handle lunar midnight effect: while active, deal periodic control/damage per tick
      const lunar = powerState['lunarMidnight'];
      if (lunar && lunar.activeUntil && lunar.activeUntil > Date.now()) {
        // every second (2 ticks) do small damage/control
        // We'll apply base damage per tick (TICK_MS) multiplied by upgrade
        updateEnemies((arr) =>
          arr.map((e) => {
            if (e.invulnerable) return e;
            const basePerSec = POWER_DEFS.lunarMidnight.baseDamage || 0; // per second
            const damageThisTick = Math.round((basePerSec * (TICK_MS / 1000)) * upgradeMultiplier(upgrades['lunarMidnight'] || 0));
            return { ...e, hp: Math.max(0, e.hp - damageThisTick) };
          })
        );
      }

      // Clean up dead enemies (except clones persist unless cleared manually)
      setEnemies((prev) => prev.filter((e) => e.hp > 0 || e.isClone));

      // Re-schedule
      tickRef.current = window.setTimeout(tick, TICK_MS);
    };

    lastTickRef.current = Date.now();
    tickRef.current = window.setTimeout(tick, TICK_MS);
    return () => {
      if (tickRef.current) clearTimeout(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgrades, powerState, enemies]);

  // Helper to get cooldown/active remaining
  const getPowerTimers = (id: PowerId) => {
    const st = powerState[id];
    const now = Date.now();
    return {
      cooldown: st && st.cooldownUntil && st.cooldownUntil > now ? st.cooldownUntil - now : 0,
      active: st && st.activeUntil && st.activeUntil > now ? st.activeUntil - now : 0,
    };
  };

  // add pixelcoins (simulating earnings)
  const addCoins = (n: number) => setPixelcoins((p) => p + n);

  // Reset game state
  const resetGame = () => {
    setEnemies(() => {
      const arr: Enemy[] = [];
      for (let i = 0; i < 6; i++) {
        arr.push({ id: `e${i}`, x: 50 + i * 80, y: 120 + (i % 2) * 40, hp: 200 + i * 20, maxHp: 200 + i * 20, statuses: {} });
      }
      return arr;
    });
    setPowerState({});
    setOwnedPowers({});
    setUpgrades({});
    setPixelcoins(500);
    lsSet(LS_KEYS.OWNED, {});
    lsSet(LS_KEYS.UPGRADES, {});
    lsSet(LS_KEYS.PIXELCOINS, 500);
  };

  // UI helpers
  const canActivate = (id: PowerId) => {
    const now = Date.now();
    const st = powerState[id];
    if (st && st.cooldownUntil && st.cooldownUntil > now) return false;
    return !!ownedPowers[id];
  };

  return (
    <div style={{ padding: 12, fontFamily: 'Arial, sans-serif' }}>
      <h2>SuperShowdown 2D (InsaneShowdown port)</h2>
      <div style={{ marginBottom: 8 }}>Pixelcoins: {pixelcoins}</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {Object.values(POWER_DEFS).map((p) => {
          const timers = getPowerTimers(p.id);
          return (
            <div key={p.id} style={{ border: '1px solid #ccc', padding: 8, width: 220, borderRadius: 6 }}>
              <strong>{p.name}</strong>
              <div style={{ fontSize: 12, marginBottom: 6 }}>{p.description}</div>
              <div>Cost: {p.cost} coins</div>
              <div>Upgrade level: {upgrades[p.id] || 0}</div>
              <div style={{ marginTop: 6 }}>
                {!ownedPowers[p.id] ? (
                  <button onClick={() => buyPower(p.id)} disabled={pixelcoins < p.cost}>
                    Buy
                  </button>
                ) : (
                  <>
                    <button onClick={() => activatePower(p.id)} disabled={!canActivate(p.id)}>
                      Activate
                    </button>{' '}
                    <button onClick={() => upgradePower(p.id)} disabled={pixelcoins < 100}>
                      Upgrade (100+)
                    </button>
                  </>
                )}
              </div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                Cooldown: {Math.ceil((timers.cooldown || 0) / 1000)}s Active: {Math.ceil((timers.active || 0) / 1000)}s
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => addCoins(50)}>+50 coins</button>{' '}
        <button onClick={() => addCoins(200)}>+200 coins</button>{' '}
        <button onClick={resetGame}>Reset Game</button>
      </div>

      <h3 style={{ marginTop: 16 }}>Arena</h3>
      <div style={{ width: 760, height: 420, border: '1px solid #999', position: 'relative', background: '#0b1220' }}>
        {/* Render enemies */}
        {enemies.map((e) => (
          <div
            key={e.id}
            title={`${e.id} HP: ${e.hp}/${e.maxHp}`}
            style={{
              position: 'absolute',
              left: e.x,
              top: e.y,
              transform: 'translate(-50%,-50%)',
              width: 36,
              height: 36,
              borderRadius: 18,
              background: e.isClone ? '#ffd86b' : '#ff6b6b',
              border: e.invulnerable ? '2px solid #fff' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111',
              fontWeight: 'bold',
            }}
          >
            <div style={{ fontSize: 11 }}>{Math.max(0, Math.round(e.hp))}</div>
            {/* statuses compact */}
            <div style={{ position: 'absolute', top: 40, left: -8, width: 60, fontSize: 10, color: '#ddd' }}>
              {Object.entries(e.statuses).map(([sid, s]) => (
                <div key={sid}>
                  {s.type}
                  {s.count ? ` x${s.count}` : ''}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 12 }}>
        Notes:
        <ul>
          <li>All status ticks run on a 500ms internal tick (preserved from original).</li>
          <li>Black Hole: 3s until explode. Parasite: 4.5s tick. Lunar Midnight: 10s active, 80s cooldown. Soleil: 120s
            cooldown.</li>
          <li>Harmony applies magnet mechanics; Whirlpool applies fractional pull each tick.</li>
          <li>Hex stacks: stacking up to 6; damage scales with stacks. Doppelganger spawns a persistent, invulnerable
            clone that attacks every second.</li>
          <li>Upgrades increase damage multiplicatively by 15% per level.</li>
          <li>Owned powers, pixelcoins, and upgrade levels persist to localStorage.</li>
        </ul>
      </div>
    </div>
  );
};

export default SuperShowdown2D;
