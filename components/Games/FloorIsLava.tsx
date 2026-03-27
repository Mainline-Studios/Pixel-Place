'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMobileBeta } from '@/contexts/MobileBetaContext';

const WIDTH = 640;
const HEIGHT = 360;
const GRAVITY = 0.8;
const PLAYER_SIZE = 18;
const PLATFORM_MIN_W = 60;
const PLATFORM_MAX_W = 160;
const PLATFORM_H = 10;
const VOTE_DURATION = 15; // seconds
const GAME_DURATION = 180; // seconds

type MapKey = 'house' | 'mountain' | 'city' | 'coral' | 'hotel';

const MAPS: Record<
  MapKey,
  {
    displayName: string;
    bg: string;
    platformColor: string;
    lavaColors: [string, string];
    platformFrequencyMod?: number;
    lavaSpeedMod?: number;
  }
> = {
  house: {
    displayName: 'House',
    bg: '#1f2430',
    platformColor: '#a67c52',
    lavaColors: ['#ff6f3f', '#ff3b1f'],
    platformFrequencyMod: 1.0,
    lavaSpeedMod: 1.0,
  },
  mountain: {
    displayName: 'Mountain',
    bg: '#102027',
    platformColor: '#7f8c8d',
    lavaColors: ['#ff8c42', '#ff4b1f'],
    platformFrequencyMod: 0.9,
    lavaSpeedMod: 0.95,
  },
  city: {
    displayName: 'City',
    bg: '#0b0f16',
    platformColor: '#4db6ac',
    lavaColors: ['#ff5f1f', '#ff2e00'],
    platformFrequencyMod: 1.1,
    lavaSpeedMod: 1.1,
  },
  coral: {
    displayName: 'Coral Reef',
    bg: '#071a2f',
    platformColor: '#ff9aa2',
    lavaColors: ['#ff9f76', '#ff6b4d'],
    platformFrequencyMod: 1.15,
    lavaSpeedMod: 0.85,
  },
  hotel: {
    displayName: 'Hotel',
    bg: '#0f1724',
    platformColor: '#cbb0ff',
    lavaColors: ['#ffb267', '#ff6f3a'],
    platformFrequencyMod: 0.95,
    lavaSpeedMod: 1.0,
  },
};

// Expose WebSocket URL from NEXT_PUBLIC_VOTE_WS_URL (client-safe env var pattern)
const WS_URL =
  typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? (process.env.NEXT_PUBLIC_VOTE_WS_URL as string | undefined)
    : undefined;

type Votes = Record<MapKey, number>;

const MAP_KEYS: MapKey[] = ['house', 'mountain', 'city', 'coral', 'hotel'];

type PadKeys = { left: boolean; right: boolean; up: boolean };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
  // Optional per-map modifiers (used for “city slide” and “hotel drop”).
  baseX?: number;
  cityPhase?: number;
  hotelPhase?: number;
};

function createInitialPlatforms(mapKey: MapKey): Platform[] {
  // y increases downward; platforms are the “solid” surfaces the player can land on.
  // Each map starts with a different “path” so it actually feels different.
  let list: Platform[];
  switch (mapKey) {
    case 'house':
      list = [
        { x: 0, y: HEIGHT - 80, w: WIDTH, h: PLATFORM_H },
        { x: 140, y: HEIGHT - 145, w: 160, h: PLATFORM_H },
        { x: 300, y: HEIGHT - 185, w: 180, h: PLATFORM_H },
        { x: 460, y: HEIGHT - 220, w: 120, h: PLATFORM_H },
      ];
      break;
    case 'mountain':
      list = [
        { x: 0, y: HEIGHT - 80, w: WIDTH, h: PLATFORM_H },
        { x: 150, y: HEIGHT - 150, w: 140, h: PLATFORM_H },
        { x: 250, y: HEIGHT - 185, w: 120, h: PLATFORM_H },
        { x: 310, y: HEIGHT - 220, w: 130, h: PLATFORM_H },
        { x: 395, y: HEIGHT - 250, w: 90, h: PLATFORM_H },
      ];
      break;
    case 'city':
      list = [
        { x: 0, y: HEIGHT - 80, w: WIDTH, h: PLATFORM_H },
        { x: 70, y: HEIGHT - 150, w: 200, h: PLATFORM_H },
        { x: 300, y: HEIGHT - 180, w: 140, h: PLATFORM_H },
        { x: 420, y: HEIGHT - 230, w: 130, h: PLATFORM_H },
        { x: 180, y: HEIGHT - 230, w: 150, h: PLATFORM_H },
      ];
      break;
    case 'coral':
      list = [
        { x: 0, y: HEIGHT - 80, w: WIDTH, h: PLATFORM_H },
        { x: 120, y: HEIGHT - 150, w: 200, h: PLATFORM_H },
        { x: 330, y: HEIGHT - 190, w: 150, h: PLATFORM_H },
        { x: 480, y: HEIGHT - 230, w: 120, h: PLATFORM_H },
        { x: 210, y: HEIGHT - 230, w: 130, h: PLATFORM_H },
      ];
      break;
    case 'hotel':
      list = [
        { x: 0, y: HEIGHT - 80, w: WIDTH, h: PLATFORM_H },
        { x: 110, y: HEIGHT - 155, w: 160, h: PLATFORM_H },
        { x: 260, y: HEIGHT - 210, w: 180, h: PLATFORM_H },
        { x: 420, y: HEIGHT - 240, w: 120, h: PLATFORM_H },
      ];
      break;
    default:
      list = [
        { x: 0, y: HEIGHT - 80, w: WIDTH, h: PLATFORM_H },
        { x: 120, y: HEIGHT - 150, w: 120, h: PLATFORM_H },
        { x: 380, y: HEIGHT - 220, w: 120, h: PLATFORM_H },
      ];
      break;
  }

  // Attach stable per-platform modifier seeds.
  return list.map((pl, idx) => ({
    ...pl,
    baseX: pl.x,
    cityPhase: mapKey === 'city' && idx !== 0 ? idx * 0.9 + Math.random() * 0.25 : undefined,
    hotelPhase: mapKey === 'hotel' && idx !== 0 ? idx * 1.1 + Math.random() * 0.35 : undefined,
  }));
}

type EffectivePlatform = { x: number; y: number; w: number; h: number; dropped?: boolean };

function getEffectivePlatform(pl: Platform, idx: number, mapKey: MapKey, tSec: number): EffectivePlatform {
  let x = pl.x;
  let y = pl.y;
  let w = pl.w;
  let h = pl.h;
  let dropped = false;

  if (mapKey === 'city' && idx !== 0) {
    const baseX = pl.baseX ?? pl.x;
    const phase = pl.cityPhase ?? 0;
    const amp = 14;
    const speed = 1.1;
    x = baseX + Math.sin(tSec * speed + phase) * amp;
  }

  if (mapKey === 'hotel' && idx !== 0) {
    const phase = pl.hotelPhase ?? 0;
    const period = 6; // seconds
    const t = (tSec + phase) % period;
    const isDropped = t < 2.2;
    if (isDropped) {
      y = y + 22;
      dropped = true;
    }
  }

  return { x, y, w, h, dropped };
}

function mapControlHint(mapKey: MapKey): string {
  switch (mapKey) {
    case 'mountain':
      return 'Mountain: click/tap rocks to climb up.';
    case 'city':
      return 'City: rooftops slide sideways—aim for the landing spot.';
    case 'coral':
      return 'Coral Reef: landing bounces you (use it to reach higher ledges).';
    case 'hotel':
      return 'Hotel: balconies periodically “drop” (don’t jump when they’re falling).';
    default:
      return 'Jump between platforms. Don\'t touch the lava!';
  }
}

export default function FloorIsLava(): JSX.Element {
  const { isMobileBeta } = useMobileBeta();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Render refs (avoid stale closures and heavy state updates)
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const gameOverRef = useRef(false);
  const timeUpRef = useRef(false);
  const mapRef = useRef(MAPS.house);
  const selectedMapRef = useRef<MapKey>('house');

  // HUD / game state exposed to UI
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const [selectedMap, setSelectedMap] = useState<MapKey>('house');
  const [votes, setVotes] = useState<Votes>({
    house: 0,
    mountain: 0,
    city: 0,
    coral: 0,
    hotel: 0,
  });
  const votesRef = useRef(votes);
  useEffect(() => {
    votesRef.current = votes;
  }, [votes]);

  const [votingActive, setVotingActive] = useState(false);
  const [voteTimeLeft, setVoteTimeLeft] = useState(0);
  const [voted, setVoted] = useState(false);
  const voteEndAtRef = useRef<number | null>(null);

  // WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Player & world refs
  const playerRef = useRef({
    pos: { x: WIDTH / 2 - PLAYER_SIZE / 2, y: 60 },
    vel: { x: 0, y: 0 },
    onGround: false,
  });
  const platformsRef = useRef<Platform[]>([]);
  const lavaYRef = useRef(HEIGHT - 24);
  const baseLavaSpeedRef = useRef(15);
  const elapsedRef = useRef(0);
  const lavaBoostedRef = useRef(false);

  // Controls
  const keysRef = useRef<PadKeys>({ left: false, right: false, up: false });

  // Score rate limiting (canvas physics runs ~60fps)
  const scoreRef = useRef(0);
  const lastScoreSetRef = useRef(0);

  useEffect(() => {
    selectedMapRef.current = selectedMap;
    mapRef.current = MAPS[selectedMap];
  }, [selectedMap]);

  const syncFlags = useCallback(() => {
    runningRef.current = running;
    pausedRef.current = paused;
    gameOverRef.current = gameOver;
    timeUpRef.current = timeUp;
  }, [running, paused, gameOver, timeUp]);
  useEffect(() => {
    syncFlags();
  }, [syncFlags]);

  const resetGame = useCallback(() => {
    const key = selectedMapRef.current;
    const map = MAPS[key];

    const p = playerRef.current;
    p.pos.x = WIDTH / 2 - PLAYER_SIZE / 2;
    p.pos.y = 40;
    p.vel.x = 0;
    p.vel.y = 0;
    p.onGround = false;

    platformsRef.current = createInitialPlatforms(key);

    lavaYRef.current = HEIGHT - 24;
    baseLavaSpeedRef.current = 15 * (map.lavaSpeedMod ?? 1);
    elapsedRef.current = 0;
    lavaBoostedRef.current = false;

    scoreRef.current = 0;
    lastScoreSetRef.current = 0;
    setScore(0);

    setGameOver(false);
    setTimeUp(false);

    // If reset is called, ensure game isn't paused/over internally.
    runningRef.current = false;
    pausedRef.current = false;
    gameOverRef.current = false;
    timeUpRef.current = false;
    setRunning(false);
    setPaused(false);
  }, []);

  // Keyboard + focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ')
        keysRef.current.up = true;
      if (e.key === 'p' || e.key === 'P') {
        setPaused((p) => {
          const next = !p;
          pausedRef.current = next;
          return next;
        });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') keysRef.current.up = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    resetGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetGame]);

  // Main canvas loop
  const render = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const map = mapRef.current;
    const p = playerRef.current;

    // Background
    ctx.fillStyle = map.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Platforms
    const mapKey = selectedMapRef.current;
    const tSec = elapsedRef.current;
    for (let i = 0; i < platformsRef.current.length; i++) {
      const pl = platformsRef.current[i];
      const rect = getEffectivePlatform(pl, i, mapKey, tSec);

      if (mapKey === 'city') {
        // Rooftops: base + highlight + small “window” slits.
        ctx.fillStyle = map.platformColor;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(rect.x + 6, rect.y + 3, Math.max(0, rect.w - 12), 2);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        for (let wi = 0; wi < 3; wi++) {
          const wx = rect.x + 10 + wi * ((rect.w - 20) / 3);
          ctx.fillRect(wx, rect.y + 4, Math.max(2, rect.w / 12), rect.h - 6);
        }
      } else if (mapKey === 'mountain') {
        // Rocks: outline + slight internal glow.
        ctx.fillStyle = map.platformColor;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fillRect(rect.x + 4, rect.y + 2, Math.max(0, rect.w - 8), Math.max(0, rect.h - 4));
      } else if (mapKey === 'hotel') {
        ctx.fillStyle = map.platformColor;
        ctx.globalAlpha = rect.dropped ? 0.35 : 1;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
        if (!rect.dropped) {
          // Little “balcony rail” highlight.
          ctx.fillStyle = 'rgba(255,255,255,0.10)';
          ctx.fillRect(rect.x + 4, rect.y + 2, Math.max(0, rect.w - 8), Math.max(0, rect.h - 4));
        }
      } else if (mapKey === 'coral') {
        ctx.fillStyle = map.platformColor;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        // Coral sparkle on top.
        const sparkle = 0.6 + Math.sin(tSec * 2 + i) * 0.4;
        ctx.fillStyle = `rgba(255,255,255,${0.10 * sparkle})`;
        ctx.fillRect(rect.x + 3, rect.y + 2, Math.max(2, rect.w - 6), 2);
      } else {
        ctx.fillStyle = map.platformColor;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }
    }

    // Player
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(p.pos.x, p.pos.y, PLAYER_SIZE, PLAYER_SIZE);

    // Lava gradient
    const lavaY = lavaYRef.current;
    const grd = ctx.createLinearGradient(0, lavaY, 0, HEIGHT);
    const [c1, c2] = map.lavaColors;
    grd.addColorStop(0, c1);
    grd.addColorStop(1, c2);
    ctx.fillStyle = grd;
    ctx.fillRect(0, lavaY, WIDTH, HEIGHT - lavaY);
  }, []);

  const step = useCallback((dtMs: number) => {
    if (!runningRef.current || pausedRef.current || gameOverRef.current || timeUpRef.current) return;

    const p = playerRef.current;
    const plats = platformsRef.current;
    const dt = dtMs / (1000 / 60); // normalize-ish to original feel
    const mapKey = selectedMapRef.current;

    // Controls
    const accel =
      mapKey === 'city' ? 1.15 : mapKey === 'hotel' ? 0.78 : mapKey === 'coral' ? 0.95 : 0.9;
    const friction =
      mapKey === 'city' ? 0.84 : mapKey === 'hotel' ? 0.92 : mapKey === 'coral' ? 0.87 : 0.88;

    if (keysRef.current.left) p.vel.x -= accel;
    if (keysRef.current.right) p.vel.x += accel;
    // Mountain is “climb by clicking rocks” — ignore jump input.
    if (mapKey !== 'mountain' && keysRef.current.up && p.onGround) {
      p.vel.y = -14.5;
      p.onGround = false;
    }

    // physics
    p.vel.y += GRAVITY * dt;
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.vel.x *= friction;

    // bounds
    if (p.pos.x < 0) {
      p.pos.x = 0;
      p.vel.x = 0;
    }
    if (p.pos.x + PLAYER_SIZE > WIDTH) {
      p.pos.x = WIDTH - PLAYER_SIZE;
      p.vel.x = 0;
    }

    // collisions
    p.onGround = false;
    for (let i = 0; i < plats.length; i++) {
      const pl = plats[i];
      const rect = getEffectivePlatform(pl, i, mapKey, elapsedRef.current);
      if (
        p.pos.x + PLAYER_SIZE > rect.x &&
        p.pos.x < rect.x + rect.w &&
        p.pos.y + PLAYER_SIZE > rect.y &&
        p.pos.y + PLAYER_SIZE - p.vel.y <= rect.y
      ) {
        const impactVelY = p.vel.y;
        p.pos.y = rect.y - PLAYER_SIZE;
        p.vel.y = 0;
        p.onGround = true;

        // Coral: “bouncy reef” platforms.
        if (mapKey === 'coral' && impactVelY > 2.5) {
          p.vel.y = -11;
          p.onGround = false;
        }
      }
    }

    // Hotel: heavier control “grip” when grounded.
    if (p.onGround && mapKey === 'hotel') {
      p.vel.x *= 0.72;
    }

    // lava + difficulty
    lavaYRef.current -= (baseLavaSpeedRef.current * dtMs) / 1000;
    elapsedRef.current += dtMs / 1000;

    if (!lavaBoostedRef.current && elapsedRef.current >= 30) {
      lavaBoostedRef.current = true;
      baseLavaSpeedRef.current = baseLavaSpeedRef.current * 1.4;
    }

    // win condition (time survived)
    if (elapsedRef.current >= GAME_DURATION) {
      timeUpRef.current = true;
      runningRef.current = false;
      setTimeUp(true);
      setRunning(false);
      return;
    }

    // gradual scaling
    if (elapsedRef.current > 120) {
      baseLavaSpeedRef.current = Math.max(
        baseLavaSpeedRef.current,
        48 * (mapRef.current.lavaSpeedMod ?? 1),
      );
    } else if (elapsedRef.current > 40) {
      baseLavaSpeedRef.current = Math.max(
        baseLavaSpeedRef.current,
        36 * (mapRef.current.lavaSpeedMod ?? 1),
      );
    } else if (elapsedRef.current > 20) {
      baseLavaSpeedRef.current = Math.max(
        baseLavaSpeedRef.current,
        24 * (mapRef.current.lavaSpeedMod ?? 1),
      );
    }

    const riseDelta = (baseLavaSpeedRef.current * dtMs) / 1000;
    for (let i = 0; i < plats.length; i++) plats[i].y += riseDelta;
    p.pos.y += riseDelta;

    platformsRef.current = plats.filter((pl) => pl.y < HEIGHT + 100);

    // spawn platforms with map frequency modifier
    const freqMod = mapRef.current.platformFrequencyMod ?? 1;
    if (Math.random() < 0.02 * freqMod) {
      const w = Math.round(PLATFORM_MIN_W + Math.random() * (PLATFORM_MAX_W - PLATFORM_MIN_W));
      const x = Math.round(Math.random() * (WIDTH - w));
      const y = -20 - Math.random() * 80;
      plats.push({
        x,
        y,
        w,
        h: PLATFORM_H,
        baseX: x,
        cityPhase: Math.random() * Math.PI * 2,
        hotelPhase: Math.random() * 10,
      });
    }

    // score
    const currentScore = Math.max(0, Math.floor((HEIGHT - lavaYRef.current) * 2));
    scoreRef.current = currentScore;
    const now = Date.now();
    if (now - lastScoreSetRef.current > 180) {
      lastScoreSetRef.current = now;
      setScore(currentScore);
    }

    // game over
    if (p.pos.y + PLAYER_SIZE >= lavaYRef.current) {
      gameOverRef.current = true;
      runningRef.current = false;
      setGameOver(true);
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(WIDTH * dpr);
    canvas.height = Math.floor(HEIGHT * dpr);
    canvas.style.width = `${WIDTH}px`;
    canvas.style.height = `${HEIGHT}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let lastTs: number | null = null;

    const loop = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;
      step(dt);
      render();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [render, step]);

  // WebSocket vote server
  useEffect(() => {
    if (!WS_URL) return;

    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch (e) {
      console.warn('Failed to create WebSocket to', WS_URL, e);
      return;
    }

    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: 'request_status' }));
    });

    ws.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (!data?.type) return;

        switch (data.type) {
          case 'status': {
            setVotingActive(Boolean(data.votingActive));
            setVoteTimeLeft(Number(data.voteTimeLeft) || 0);
            if (data.votes) setVotes(data.votes as Votes);
            if (data.selectedMap) {
              const next = data.selectedMap as MapKey;
              selectedMapRef.current = next;
              setSelectedMap(next);
            }
            break;
          }
          case 'vote_started': {
            setVotingActive(true);
            setVoteTimeLeft(Number(data.duration) || VOTE_DURATION);
            setVoted(false);
            setVotes({ house: 0, mountain: 0, city: 0, coral: 0, hotel: 0 });
            break;
          }
          case 'vote_update': {
            if (data.votes) setVotes(data.votes as Votes);
            if (typeof data.voteTimeLeft === 'number') setVoteTimeLeft(data.voteTimeLeft);
            break;
          }
          case 'vote_ended': {
            setVotingActive(false);
            setVoteTimeLeft(0);
            if (data.votes) setVotes(data.votes as Votes);
            if (data.selectedMap) {
              const next = data.selectedMap as MapKey;
              selectedMapRef.current = next;
              setSelectedMap(next);
              setTimeout(() => resetGame(), 80);
            }
            break;
          }
          case 'selected_map': {
            if (data.selectedMap) {
              const next = data.selectedMap as MapKey;
              selectedMapRef.current = next;
              setSelectedMap(next);
              setTimeout(() => resetGame(), 80);
            }
            break;
          }
          case 'error': {
            console.warn('Vote server error:', data.message);
            break;
          }
          default:
            break;
        }
      } catch {
        // ignore invalid messages
      }
    });

    ws.addEventListener('close', () => {
      setWsConnected(false);
      wsRef.current = null;
    });
    ws.addEventListener('error', () => {
      setWsConnected(false);
    });

    return () => {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
    };
  }, [resetGame]);

  // Local fallback voting (only if WS not configured)
  useEffect(() => {
    if (WS_URL) return;
    if (!votingActive) return;

    const interval = window.setInterval(() => {
      const endAt = voteEndAtRef.current;
      if (!endAt) return;

      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setVoteTimeLeft(remaining);

      if (remaining > 0) return;

      window.clearInterval(interval);
          setVotingActive(false);
      setVoteTimeLeft(0);

      const currentVotes = votesRef.current;
      const entries = Object.entries(currentVotes) as [MapKey, number][];
            let max = -1;
      for (const [, v] of entries) max = Math.max(max, v);
      const winners = entries.filter(([, v]) => v === max).map(([k]) => k);
      const pick = winners.length ? winners[Math.floor(Math.random() * winners.length)] : 'house';

      selectedMapRef.current = pick as MapKey;
            setSelectedMap(pick as MapKey);
      resetGame();
    }, 250);

    return () => window.clearInterval(interval);
  }, [votingActive, resetGame]);

  const startVoting = useCallback(
    (duration = VOTE_DURATION) => {
      if (WS_URL && wsRef.current && wsConnected) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'start_vote', duration }));
        } catch {
          /* ignore */
      }
      return;
    }

    setVotes({ house: 0, mountain: 0, city: 0, coral: 0, hotel: 0 });
      votesRef.current = { house: 0, mountain: 0, city: 0, coral: 0, hotel: 0 };
    setVoted(false);
    setVotingActive(true);
    setVoteTimeLeft(duration);
      voteEndAtRef.current = Date.now() + duration * 1000;
    },
    [wsConnected],
  );

  const castVote = useCallback(
    (key: MapKey) => {
    if (!votingActive || voted) return;
      if (WS_URL && wsRef.current && wsConnected) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'cast_vote', map: key }));
        setVoted(true);
        } catch {
          /* ignore */
      }
      return;
    }

      setVotes((prev) => {
        const next = { ...prev, [key]: (prev[key] ?? 0) + 1 };
        votesRef.current = next;
        return next;
      });
    setVoted(true);
    },
    [votingActive, voted, wsConnected],
  );

  const startGame = useCallback(() => {
    resetGame();
    setRunning(true);
    setPaused(false);
    runningRef.current = true;
    pausedRef.current = false;
  }, [resetGame]);

  const stopGame = useCallback(() => {
    setRunning(false);
    setPaused(false);
    runningRef.current = false;
    pausedRef.current = false;
  }, []);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const next = !p;
      pausedRef.current = next;
      return next;
    });
  }, []);

  const overlay = useMemo(() => {
    if (gameOver) {
      return (
        <>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ff6b6b', marginBottom: 8 }}>
            💀 You fell in the lava
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>
            Final score: <strong>{score}</strong>
          </div>
          <button
            onClick={startGame}
            style={{
              padding: '12px 28px',
              fontSize: 16,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ff4d4d, #991b1b)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255,77,77,0.25)',
            }}
          >
            Play Again
          </button>
        </>
      );
    }
    if (timeUp) {
      return (
        <>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#a6f0a6', marginBottom: 8 }}>
            🌋 You survived!
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>
            Final score: <strong>{score}</strong>
          </div>
          <button
            onClick={startGame}
            style={{
              padding: '12px 28px',
              fontSize: 16,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00f5d4, #0099cc)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,245,212,0.22)',
            }}
          >
            Play Again
          </button>
        </>
      );
    }
    if (paused && running) {
      return (
        <>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#ffd166', marginBottom: 8 }}>Paused</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', marginBottom: 18 }}>
            Press Pause again or use the `P` key.
          </div>
          <button
            onClick={togglePause}
            style={{
              padding: '12px 28px',
              fontSize: 16,
              fontWeight: 800,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.95), rgba(247,37,133,0.75))',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,212,255,0.22)',
            }}
          >
            Resume
          </button>
        </>
      );
    }
    return null;
  }, [gameOver, running, score, startGame, timeUp, paused, togglePause]);

  const mapVotingCard = useMemo(() => {
    return (
      <div
        style={{
          background: 'rgba(15,22,41,0.9)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Map Voting</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12, lineHeight: 1.3 }}>
          Vote for the next map, then start the game.
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => startVoting(VOTE_DURATION)}
            disabled={votingActive}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none',
              fontWeight: 800,
              cursor: votingActive ? 'default' : 'pointer',
              background: votingActive
                ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(135deg, rgba(255,107,53,0.95), rgba(247,37,133,0.75))',
              color: '#fff',
            }}
          >
            {votingActive ? 'Voting…' : `Start Vote (${VOTE_DURATION}s)`}
          </button>
        </div>

        {votingActive ? (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 10 }}>
            Ends in <strong style={{ color: '#ffd166' }}>{voteTimeLeft}s</strong>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>
            {WS_URL ? (wsConnected ? 'Connected to vote server.' : 'Vote server disconnected.') : 'Local vote mode.'}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          {MAP_KEYS.map((k) => {
            const isSelected = selectedMap === k;
            const votedClass = voted && isSelected ? '#ffd166' : '#00f5d4';
            return (
              <button
                key={k}
                type="button"
                onClick={() => castVote(k)}
                disabled={!votingActive || voted}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${isSelected ? 'rgba(255,209,102,0.65)' : 'rgba(255,255,255,0.10)'}`,
                  background: isSelected ? 'rgba(255, 209, 102, 0.12)' : 'rgba(0,0,0,0.18)',
                  color: '#fff',
                  cursor: !votingActive || voted ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontWeight: 900 }}>{MAPS[k].displayName}</div>
                  <div style={{ fontWeight: 800, color: votedClass }}>
                    {votes[k]} vote{votes[k] !== 1 ? 's' : ''}
                  </div>
                </div>
                {isSelected && <div style={{ marginTop: 2, fontSize: 12, color: '#ffd166' }}>(current)</div>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [castVote, selectedMap, startVoting, voted, votingActive, votes, voteTimeLeft, wsConnected]);

  const controlsCard = useMemo(() => {
    return (
      <div
        style={{
          background: 'rgba(15,22,41,0.9)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Game Controls</div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            type="button"
            onClick={startGame}
            disabled={running}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              fontWeight: 900,
              cursor: running ? 'default' : 'pointer',
              background: running ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: '#fff',
            }}
          >
            {running ? 'Running' : 'Start'}
          </button>
          <button
            type="button"
            onClick={stopGame}
            disabled={!running}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              fontWeight: 900,
              cursor: !running ? 'default' : 'pointer',
              background: 'rgba(0,0,0,0.20)',
              color: '#fff',
            }}
          >
            Stop
          </button>
          <button
            type="button"
            onClick={togglePause}
            disabled={!running}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              fontWeight: 900,
              cursor: !running ? 'default' : 'pointer',
              background: paused ? 'rgba(255, 209, 102, 0.18)' : 'rgba(0,0,0,0.20)',
              color: '#fff',
            }}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              resetGame();
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              fontWeight: 900,
              cursor: 'pointer',
              background: 'rgba(0,0,0,0.20)',
              color: '#fff',
            }}
          >
            Reset
          </button>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Score</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#ffd166' }}>{score}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Status</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>
              {gameOver ? 'Game Over' : timeUp ? 'Survived' : running ? (paused ? 'Paused' : 'Running') : 'Stopped'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.35 }}>
          Map: <strong style={{ color: '#fff' }}>{MAPS[selectedMap].displayName}</strong> • Game duration:{' '}
          <strong style={{ color: '#fff' }}>{GAME_DURATION}s</strong>
          <div style={{ marginTop: 6 }}>{mapControlHint(selectedMap)}</div>
        </div>
      </div>
    );
  }, [gameOver, paused, resetGame, running, score, startGame, stopGame, timeUp, selectedMap, togglePause]);

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (selectedMapRef.current !== 'mountain') return;
      if (!runningRef.current || pausedRef.current || gameOverRef.current || timeUpRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Convert client coords to canvas logical coords.
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * WIDTH;

      // “Climb by clicking rocks”: if you click a platform above you, snap onto it and give an upward impulse.
      const p = playerRef.current;
      const candidates = platformsRef.current.filter((pl) => {
        const inX = x >= pl.x && x <= pl.x + pl.w;
        const above = pl.y < p.pos.y + 10;
        const reachable = p.pos.y - pl.y <= 160;
        return inX && above && reachable;
      });
      if (!candidates.length) return;

      // Choose the closest platform above the player.
      let best = candidates[0];
      let bestDy = p.pos.y - best.y;
      for (const pl of candidates) {
        const dy = p.pos.y - pl.y;
        if (dy >= 0 && dy < bestDy) {
          best = pl;
          bestDy = dy;
        }
      }

      p.pos.x = clamp(x - PLAYER_SIZE / 2, 0, WIDTH - PLAYER_SIZE);
      p.pos.y = best.y - PLAYER_SIZE;
      p.vel.x = 0;
      p.vel.y = -16;
      p.onGround = false;
    },
    [],
  );

  const overlayVisible = Boolean(overlay);

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100%',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)',
        padding: isMobileBeta ? 12 : 24,
        position: 'relative',
      }}
    >
      <h2
        style={{
          margin: '0 0 16px 0',
          fontSize: 28,
          fontWeight: 900,
          background: 'linear-gradient(90deg, #ff6b35, #f72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
        }}
      >
        🔥 Floor Is Lava
      </h2>
      <p style={{ margin: '0 0 20px 0', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
        {mapControlHint(selectedMap)}
      </p>

      <div
        style={{
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          flexDirection: isMobileBeta ? 'column' : 'row',
          alignItems: isMobileBeta ? 'stretch' : undefined,
        }}
      >
        <div
          style={{
            padding: 4,
            background: 'linear-gradient(135deg, rgba(255,107,53,0.28), rgba(247,37,133,0.18))',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
            {overlayVisible && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100,
                  padding: 16,
                }}
              >
                {overlay}
        </div>
            )}
            <canvas
              ref={canvasRef}
              onPointerDown={handleCanvasPointerDown}
              style={{
                display: 'block',
                background: '#000',
                width: WIDTH,
                height: HEIGHT,
                imageRendering: 'pixelated',
                cursor: selectedMap === 'mountain' ? 'crosshair' : 'default',
              }}
            />
        </div>
        </div>

        <div
          style={{
            width: isMobileBeta ? '100%' : 280,
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {mapVotingCard}
          {controlsCard}
          </div>
        </div>

      {isMobileBeta && (
        <div
          role="group"
          aria-label="Move"
          style={{
            position: 'fixed',
            bottom: 'max(20px, env(safe-area-inset-bottom, 12px))',
            left: 14,
            zIndex: 400,
            display: 'grid',
            gridTemplateColumns: '52px 52px 52px',
            gap: 8,
            filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))',
          }}
        >
          <span style={{ width: 52, height: 52 }} aria-hidden />
          <PadBtn
            label="↑"
            onDown={() => (keysRef.current.up = true)}
            onUp={() => (keysRef.current.up = false)}
          />
          <span style={{ width: 52, height: 52 }} aria-hidden />
          <PadBtn
            label="←"
            onDown={() => (keysRef.current.left = true)}
            onUp={() => (keysRef.current.left = false)}
          />
          <span style={{ width: 52, height: 52 }} aria-hidden />
          <PadBtn
            label="→"
            onDown={() => (keysRef.current.right = true)}
            onUp={() => (keysRef.current.right = false)}
          />
          <span style={{ width: 52, height: 52 }} aria-hidden />
          <PadBtn
            label="↓"
            onDown={() => {
              /* no-op (reserved) */
            }}
            onUp={() => {
              /* no-op */
            }}
          />
          <span style={{ width: 52, height: 52 }} aria-hidden />
        </div>
      )}
    </div>
  );
}

function PadBtn({
  label,
  onDown,
  onUp,
}: {
  label: string;
  onDown: () => void;
  onUp: () => void;
}) {
  const padCell: React.CSSProperties = {
    width: 52,
    height: 52,
    borderRadius: 12,
    border: '2px solid rgba(0,212,255,0.45)',
    background: 'rgba(8,16,32,0.92)',
    color: '#e8f4ff',
    fontSize: 20,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    cursor: 'pointer',
    padding: 0,
  };

  return (
    <button
      type="button"
      style={padCell}
      aria-label={
        label === '↑' ? 'Jump' : label === '↓' ? 'Down (no action)' : label === '←' ? 'Left' : 'Right'
      }
      onPointerDown={(e) => {
        e.preventDefault();
        onDown();
        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        onUp();
        try {
          (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }}
      onPointerCancel={() => onUp()}
      onLostPointerCapture={() => onUp()}
    >
      {label}
    </button>
  );
}

