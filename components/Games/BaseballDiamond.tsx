'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type HalfInning = 'top' | 'bottom';

type PitchState = {
  active: boolean;
  startMs: number;
  durationMs: number;
  inZone: boolean;
  resolved: boolean;
};

type TeamProfile = {
  id: string;
  name: string;
  city: string;
  primary: string;
  secondary: string;
  mascot: string;
  starPlayer: string;
  archetype: string;
  power: number;
  speed: number;
  defense: number;
};

const TEAMS: TeamProfile[] = [
  { id: 'nyc-comets', name: 'Comets', city: 'New York', primary: '#1D4ED8', secondary: '#93C5FD', mascot: '☄️', starPlayer: 'Jax Orion', archetype: 'Power Hitter', power: 92, speed: 71, defense: 76 },
  { id: 'la-suns', name: 'Suns', city: 'Los Angeles', primary: '#F97316', secondary: '#FDBA74', mascot: '☀️', starPlayer: 'Milo Ray', archetype: 'Contact Specialist', power: 78, speed: 88, defense: 79 },
  { id: 'chi-rails', name: 'Rails', city: 'Chicago', primary: '#0F172A', secondary: '#94A3B8', mascot: '🚂', starPlayer: 'Duke Porter', archetype: 'Ace Pitcher', power: 75, speed: 73, defense: 91 },
  { id: 'mia-tide', name: 'Tide', city: 'Miami', primary: '#0EA5E9', secondary: '#67E8F9', mascot: '🌊', starPlayer: 'Kai Marlow', archetype: 'Speedster', power: 70, speed: 96, defense: 81 },
  { id: 'sea-aurora', name: 'Aurora', city: 'Seattle', primary: '#065F46', secondary: '#6EE7B7', mascot: '🌌', starPlayer: 'Niko Frost', archetype: 'Two-Way Star', power: 84, speed: 83, defense: 87 },
  { id: 'dal-bisons', name: 'Bisons', city: 'Dallas', primary: '#7C2D12', secondary: '#FDBA74', mascot: '🦬', starPlayer: 'Cole Maverick', archetype: 'Slugger', power: 95, speed: 64, defense: 74 },
  { id: 'bos-harbor', name: 'Harbor', city: 'Boston', primary: '#7F1D1D', secondary: '#FCA5A5', mascot: '⚓', starPlayer: 'Eli Cutter', archetype: 'Clutch Veteran', power: 82, speed: 76, defense: 85 },
  { id: 'phx-scorpions', name: 'Scorpions', city: 'Phoenix', primary: '#6D28D9', secondary: '#C4B5FD', mascot: '🦂', starPlayer: 'Rex Viper', archetype: 'Closer', power: 80, speed: 79, defense: 89 },
  { id: 'sf-redwoods', name: 'Redwoods', city: 'San Francisco', primary: '#166534', secondary: '#86EFAC', mascot: '🌲', starPlayer: 'Noah Grove', archetype: 'Defensive Wall', power: 76, speed: 77, defense: 94 },
  { id: 'atl-thunder', name: 'Thunder', city: 'Atlanta', primary: '#1E293B', secondary: '#FDE047', mascot: '⚡', starPlayer: 'Zane Bolt', archetype: 'All-Rounder', power: 86, speed: 84, defense: 86 },
];

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function cloneBases(bases: boolean[]) {
  return [bases[0], bases[1], bases[2]];
}

export default function BaseballDiamond() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [inning, setInning] = useState(1);
  const [half, setHalf] = useState<HalfInning>('top');
  const [outs, setOuts] = useState(0);
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [bases, setBases] = useState<boolean[]>([false, false, false]);
  const [awayScore, setAwayScore] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [log, setLog] = useState<string>('Welcome to Baseball Diamond. Press Pitch then Swing!');
  const [gameOver, setGameOver] = useState(false);
  const [pitch, setPitch] = useState<PitchState>({
    active: false,
    startMs: 0,
    durationMs: 1200,
    inZone: true,
    resolved: false,
  });
  const [progress, setProgress] = useState(0);
  const [userTeamId, setUserTeamId] = useState<string>(TEAMS[0].id);
  const [cpuTeamId, setCpuTeamId] = useState<string>(TEAMS[1].id);

  const userTeam = useMemo(() => TEAMS.find((t) => t.id === userTeamId) ?? TEAMS[0], [userTeamId]);
  const cpuTeam = useMemo(() => TEAMS.find((t) => t.id === cpuTeamId) ?? TEAMS[1], [cpuTeamId]);

  const battingTeam = half === 'top' ? cpuTeam.name : userTeam.name;

  const strikeZone = useMemo(
    () => ({ x: 0.5, y: 0.66, w: 0.14, h: 0.18 }),
    []
  );

  const addRuns = (runs: number) => {
    if (runs <= 0) return;
    if (half === 'top') setAwayScore((s) => s + runs);
    else setHomeScore((s) => s + runs);
  };

  const resetCount = () => {
    setBalls(0);
    setStrikes(0);
  };

  const nextBatter = () => {
    if (outs >= 3) return;
    resetCount();
  };

  const switchHalfInning = () => {
    const toBottom = half === 'top';
    const nextHalf: HalfInning = toBottom ? 'bottom' : 'top';
    const nextInning = toBottom ? inning : inning + 1;

    setHalf(nextHalf);
    setInning(nextInning);
    setOuts(0);
    setBalls(0);
    setStrikes(0);
    setBases([false, false, false]);
    setPitch((p) => ({ ...p, active: false, resolved: true }));
    setProgress(0);

    // End-game checks (official-style core flow: 9 innings, extras if tied)
    if (!toBottom) {
      if (nextInning > 9 && homeScore !== awayScore) {
        setGameOver(true);
        setLog(homeScore > awayScore ? 'Final: Home wins!' : 'Final: Away wins!');
      }
    } else if (inning >= 9 && homeScore > awayScore) {
      setGameOver(true);
      setLog('Final: Home wins by walk-off lead after top 9+.');
    }
  };

  const recordOut = (reason: string) => {
    setOuts((o) => {
      const no = o + 1;
      if (no >= 3) {
        setLog(`${reason} Third out! Switching sides.`);
        // Defer switching until state updates settle.
        setTimeout(() => switchHalfInning(), 0);
      } else {
        setLog(`${reason} ${no} out${no > 1 ? 's' : ''}.`);
      }
      return no;
    });
    resetCount();
  };

  const applyWalk = () => {
    const b = cloneBases(bases);
    let runs = 0;
    if (b[0] && b[1] && b[2]) runs += 1;
    b[2] = b[2] || (b[1] && b[0]);
    b[1] = b[1] || b[0];
    b[0] = true;
    setBases(b);
    addRuns(runs);
    setLog(runs > 0 ? `Ball four. Walk with bases loaded! ${runs} run scores.` : 'Ball four. Batter walks.');
    nextBatter();
  };

  const advanceRunners = (basesToAdvance: number) => {
    if (basesToAdvance >= 4) {
      const existing = bases.filter(Boolean).length;
      addRuns(existing + 1);
      setBases([false, false, false]);
      setLog(`Home run! ${existing + 1} run${existing ? 's' : ''} scored.`);
      nextBatter();
      return;
    }

    const b = cloneBases(bases);
    let runs = 0;
    for (let i = 2; i >= 0; i--) {
      if (!b[i]) continue;
      b[i] = false;
      const next = i + basesToAdvance;
      if (next >= 3) runs += 1;
      else b[next] = true;
    }
    b[basesToAdvance - 1] = true; // batter to base
    setBases(b);
    addRuns(runs);

    const name = basesToAdvance === 1 ? 'Single' : basesToAdvance === 2 ? 'Double' : 'Triple';
    setLog(runs > 0 ? `${name}! ${runs} run${runs > 1 ? 's' : ''} scored.` : `${name}!`);
    nextBatter();
  };

  const resolveCalledPitch = () => {
    if (!pitch.active || pitch.resolved) return;
    setPitch((p) => ({ ...p, resolved: true, active: false }));
    setProgress(1);

    if (pitch.inZone) {
      setStrikes((s) => {
        const ns = s + 1;
        if (ns >= 3) {
          setLog('Called strike three.');
          recordOut('Strikeout looking.');
          return 0;
        }
        setLog(`Strike ${ns}.`);
        return ns;
      });
    } else {
      setBalls((b) => {
        const nb = b + 1;
        if (nb >= 4) {
          applyWalk();
          return 0;
        }
        setLog(`Ball ${nb}.`);
        return nb;
      });
    }
  };

  const swing = () => {
    if (!pitch.active || pitch.resolved || gameOver) return;
    const now = performance.now();
    const p = clamp((now - pitch.startMs) / pitch.durationMs, 0, 1);
    const ideal = 0.83;
    const timingError = Math.abs(p - ideal);
    const timingQuality = 1 - clamp(timingError / 0.38, 0, 1);

    setPitch((prev) => ({ ...prev, resolved: true, active: false }));
    setProgress(p);

    // Contact tuned to timing + strike zone status
    const baseContact = pitch.inZone ? 0.72 : 0.42;
    const contactChance = clamp(baseContact * (0.45 + timingQuality * 0.9), 0.08, 0.95);
    const didContact = Math.random() < contactChance;

    if (!didContact) {
      setStrikes((s) => {
        const ns = s + 1;
        if (ns >= 3) {
          setLog('Swing and miss. Strike three!');
          recordOut('Strikeout swinging.');
          return 0;
        }
        setLog(`Swing and miss. Strike ${ns}.`);
        return ns;
      });
      return;
    }

    // Contact outcomes. Foul with two strikes does not produce strikeout.
    const power = timingQuality;
    const roll = Math.random();
    if (roll < 0.23) {
      if (strikes < 2) setStrikes((s) => s + 1);
      setLog(strikes < 2 ? 'Foul ball (strike).' : 'Foul ball.');
      return;
    }
    if (roll < 0.53) {
      recordOut('Ball in play: out.');
      return;
    }

    // Hits
    if (power > 0.86 && roll > 0.93) {
      advanceRunners(4);
      return;
    }
    if (power > 0.72 && roll > 0.84) {
      advanceRunners(3);
      return;
    }
    if (power > 0.58 && roll > 0.72) {
      advanceRunners(2);
      return;
    }
    advanceRunners(1);
  };

  const startPitch = () => {
    if (pitch.active || gameOver || outs >= 3) return;
    const inZone = Math.random() < 0.58;
    const durationMs = 1000 + Math.random() * 450;
    const startMs = performance.now();
    setPitch({ active: true, startMs, durationMs, inZone, resolved: false });
    setProgress(0);
    setLog(`${battingTeam} batting: pitch on the way...`);
  };

  const resetGame = () => {
    setInning(1);
    setHalf('top');
    setOuts(0);
    setBalls(0);
    setStrikes(0);
    setBases([false, false, false]);
    setAwayScore(0);
    setHomeScore(0);
    setGameOver(false);
    setPitch({ active: false, startMs: 0, durationMs: 1200, inZone: true, resolved: false });
    setProgress(0);
    setLog('New game started.');
  };

  const pickTeam = (teamId: string) => {
    if (teamId === userTeamId) return;
    setUserTeamId(teamId);
    const pool = TEAMS.filter((t) => t.id !== teamId);
    const opp = pool[Math.floor(Math.random() * pool.length)];
    setCpuTeamId(opp.id);
    setLog(`Team selected: ${TEAMS.find((t) => t.id === teamId)?.city} ${TEAMS.find((t) => t.id === teamId)?.name}. Opponent: ${opp.city} ${opp.name}.`);
    resetGame();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        swing();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        startPitch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const w = 880;
      const h = 500;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#173f1f';
      ctx.fillRect(0, 0, w, h);

      // Infield diamond
      const cx = w * 0.5;
      const cy = h * 0.68;
      const r = 130;
      const basesPos = [
        { x: cx, y: cy - r }, // 2nd
        { x: cx + r, y: cy }, // 1st
        { x: cx, y: cy + r }, // home (visual anchor)
        { x: cx - r, y: cy }, // 3rd
      ];
      ctx.fillStyle = '#b6854d';
      ctx.beginPath();
      ctx.moveTo(basesPos[0].x, basesPos[0].y);
      ctx.lineTo(basesPos[1].x, basesPos[1].y);
      ctx.lineTo(basesPos[2].x, basesPos[2].y);
      ctx.lineTo(basesPos[3].x, basesPos[3].y);
      ctx.closePath();
      ctx.fill();

      // Bases
      const renderBase = (x: number, y: number, lit: boolean) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = lit ? '#fff7b3' : '#ffffff';
        ctx.fillRect(-9, -9, 18, 18);
        ctx.strokeStyle = '#111';
        ctx.strokeRect(-9, -9, 18, 18);
        ctx.restore();
      };
      renderBase(basesPos[1].x, basesPos[1].y, bases[0]);
      renderBase(basesPos[0].x, basesPos[0].y, bases[1]);
      renderBase(basesPos[3].x, basesPos[3].y, bases[2]);

      // Mound and plate
      ctx.fillStyle = '#c99d66';
      ctx.beginPath();
      ctx.arc(cx, cy - 52, 18, 0, Math.PI * 2);
      ctx.fill();
      renderBase(cx, cy + 108, false);

      // Strike zone
      const szW = strikeZone.w * w;
      const szH = strikeZone.h * h;
      const szX = strikeZone.x * w - szW / 2;
      const szY = strikeZone.y * h - szH / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(szX, szY, szW, szH);

      // Pitch path ball
      if (pitch.active || pitch.resolved) {
        const prog = pitch.active
          ? clamp((performance.now() - pitch.startMs) / pitch.durationMs, 0, 1)
          : progress;
        const from = { x: cx, y: cy - 52 };
        const tx = pitch.inZone ? szX + szW * 0.5 : szX + szW * (Math.random() < 0.5 ? -0.35 : 1.35);
        const ty = pitch.inZone ? szY + szH * 0.55 : szY + szH * (Math.random() < 0.5 ? -0.35 : 1.35);
        const x = from.x + (tx - from.x) * prog;
        const y = from.y + (ty - from.y) * prog;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      if (pitch.active && !pitch.resolved) {
        const p = (performance.now() - pitch.startMs) / pitch.durationMs;
        if (p >= 1) resolveCalledPitch();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [bases, pitch, progress, strikeZone, outs, balls, strikes, inning, half]);

  return (
    <div style={{ width: '100%', maxWidth: 980, margin: '0 auto', paddingBottom: 16 }}>
      <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 12, background: 'rgba(0,0,0,0.15)', marginBottom: 10 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Pick Your Team</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(110px, 1fr))', gap: 8, marginBottom: 10 }}>
          {TEAMS.map((team) => {
            const selected = team.id === userTeamId;
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => pickTeam(team.id)}
                style={{
                  border: selected ? `2px solid ${team.secondary}` : '1px solid rgba(255,255,255,0.18)',
                  background: `linear-gradient(180deg, ${team.primary}, ${team.secondary})`,
                  color: '#fff',
                  borderRadius: 8,
                  padding: '8px 6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 2 }}>{team.mascot}</div>
                <div>{team.city}</div>
                <div>{team.name}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ border: `1px solid ${userTeam.secondary}`, borderRadius: 8, padding: 10 }}>
            <div style={{ fontWeight: 800 }}>{userTeam.city} {userTeam.name} {userTeam.mascot}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Player Preview: <strong>{userTeam.starPlayer}</strong></div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{userTeam.archetype}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              PWR {userTeam.power} · SPD {userTeam.speed} · DEF {userTeam.defense}
            </div>
          </div>
          <div style={{ border: `1px solid ${cpuTeam.secondary}`, borderRadius: 8, padding: 10 }}>
            <div style={{ fontWeight: 800 }}>Opponent: {cpuTeam.city} {cpuTeam.name} {cpuTeam.mascot}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Ace: <strong>{cpuTeam.starPlayer}</strong></div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{cpuTeam.archetype}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              PWR {cpuTeam.power} · SPD {cpuTeam.speed} · DEF {cpuTeam.defense}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Baseball Diamond</div>
          <div style={{ opacity: 0.82, fontSize: 13 }}>
            Core official flow: 3 strikes/4 balls, 3 outs per half-inning, 9 innings + extras.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pixel-button" type="button" onClick={startPitch} disabled={pitch.active || gameOver}>
            Pitch (P)
          </button>
          <button className="pixel-button" type="button" onClick={swing} disabled={!pitch.active || gameOver}>
            Swing (Space)
          </button>
          <button className="pixel-button" type="button" onClick={resetGame}>
            New Game
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, alignItems: 'start' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 10, background: 'rgba(0,0,0,0.15)' }}>
          <canvas ref={canvasRef} />
        </div>

        <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 12, background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Scoreboard</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '6px 10px', fontSize: 14 }}>
            <div>{cpuTeam.city} {cpuTeam.name}</div><div>{awayScore}</div>
            <div>{userTeam.city} {userTeam.name}</div><div>{homeScore}</div>
            <div>Inning</div><div>{inning} ({half})</div>
            <div>Batting</div><div>{battingTeam}</div>
            <div>Outs</div><div>{outs}</div>
            <div>Count</div><div>{balls}-{strikes}</div>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.92 }}>{log}</div>
          {gameOver && <div style={{ marginTop: 10, color: '#ffd27d', fontWeight: 700 }}>Game Over</div>}
        </div>
      </div>
    </div>
  );
}

