import React, { useRef, useEffect, useState, useCallback } from 'react';

// "Floor Is Lava" canvas mini-game with server-synced voting via WebSocket
// - If NEXT_PUBLIC_VOTE_WS_URL is provided the component will connect to that WebSocket server
//   and use it as the authoritative vote source (one vote per connection enforced server-side).
// - If no WS URL is provided the component falls back to local (client-only) voting.
// - The WebSocket protocol is JSON messages with types:
//   request_status, status, start_vote, vote_started, cast_vote, vote_update, vote_ended, selected_map, error

const WIDTH = 640;
const HEIGHT = 360;
const GRAVITY = 0.8;
const PLAYER_SIZE = 18;
const PLATFORM_MIN_W = 60;
const PLATFORM_MAX_W = 160;
const PLATFORM_H = 10;
const VOTE_DURATION = 15; // seconds (voting window)
const GAME_DURATION = 180; // seconds (3 minutes)

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

// Expose WebSocket URL from NEXT_PUBLIC_VOTE_WS_URL (Next.js style env var for client)
const WS_URL =
  typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? (process.env.NEXT_PUBLIC_VOTE_WS_URL as string | undefined)
    : undefined;

export default function FloorIsLava(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Game state
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  // Voting state (client view)
  const [votes, setVotes] = useState<Record<MapKey, number>>({
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

  const [voted, setVoted] = useState<boolean>(false); // prevents repeated cast attempts from same client
  const [votingActive, setVotingActive] = useState(false);
  const [voteTimeLeft, setVoteTimeLeft] = useState(0);
  const voteTimerRef = useRef<number | null>(null);

  const [selectedMap, setSelectedMap] = useState<MapKey>('house');

  // WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Player & world
  const playerRef = useRef({
    pos: { x: WIDTH / 2 - PLAYER_SIZE / 2, y: 60 },
    vel: { x: 0, y: 0 },
    onGround: false,
  });
  const platformsRef = useRef<Array<{ x: number; y: number; w: number; h: number }>>([]);
  const lavaYRef = useRef(HEIGHT - 24);
  const baseLavaSpeedRef = useRef(15);
  const elapsedRef = useRef(0);
  const lavaBoostedRef = useRef(false);

  const keys = useRef<{ left: boolean; right: boolean; up: boolean }>({
    left: false,
    right: false,
    up: false,
  });

  // Reset game and apply selected map modifiers
  const resetGame = useCallback(() => {
    const p = playerRef.current;
    p.pos.x = WIDTH / 2 - PLAYER_SIZE / 2;
    p.pos.y = 40;
    p.vel.x = 0;
    p.vel.y = 0;
    p.onGround = false;

    platformsRef.current = [
      { x: 0, y: HEIGHT - 80, w: WIDTH, h: PLATFORM_H },
      { x: 120, y: HEIGHT - 150, w: 120, h: PLATFORM_H },
      { x: 380, y: HEIGHT - 220, w: 120, h: PLATFORM_H },
    ];

    lavaYRef.current = HEIGHT - 24;
    baseLavaSpeedRef.current = 15 * (MAPS[selectedMap].lavaSpeedMod ?? 1);
    elapsedRef.current = 0;
    lavaBoostedRef.current = false;
    setScore(0);
    setGameOver(false);
    setTimeUp(false);
  }, [selectedMap]);

  useEffect(() => {
    // keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') keys.current.up = true;
      if (e.key === 'p' || e.key === 'P') setPaused((p) => !p);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') keys.current.up = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    resetGame();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetGame]);

  // WebSocket connection & handlers
  useEffect(() => {
    if (!WS_URL) return; // skip if not configured

    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch (err) {
      console.warn('Failed to create WebSocket to', WS_URL, err);
      return;
    }
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setWsConnected(true);
      // ask server for current votes/status
      ws.send(JSON.stringify({ type: 'request_status' }));
    });

    ws.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (!data || !data.type) return;
        switch (data.type) {
          case 'status': {
            setVotingActive(Boolean(data.votingActive));
            setVoteTimeLeft(Number(data.voteTimeLeft) || 0);
            if (data.votes) setVotes((prev) => ({ ...prev, ...(data.votes as any) }));
            if (data.selectedMap) setSelectedMap(data.selectedMap);
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
            if (data.votes) setVotes(data.votes);
            if (typeof data.voteTimeLeft === 'number') setVoteTimeLeft(data.voteTimeLeft);
            break;
          }
          case 'vote_ended': {
            setVotingActive(false);
            setVoteTimeLeft(0);
            if (data.votes) setVotes(data.votes);
            if (data.selectedMap) {
              setSelectedMap(data.selectedMap);
              setTimeout(() => resetGame(), 80);
            }
            break;
          }
          case 'selected_map': {
            if (data.selectedMap) {
              setSelectedMap(data.selectedMap);
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
      } catch (err) {
        console.warn('Failed to parse ws message', err);
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
      } catch (e) {
        /* ignore */
      }
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Local fallback voting timer (only if WS not configured)
  useEffect(() => {
    if (WS_URL) return; // skip local timer when using server
    if (!votingActive) return;
    if (voteTimerRef.current) window.clearInterval(voteTimerRef.current);
    voteTimerRef.current = window.setInterval(() => {
      setVoteTimeLeft((t) => {
        if (t <= 1) {
          if (voteTimerRef.current) {
            window.clearInterval(voteTimerRef.current);
            voteTimerRef.current = null;
          }
          setVotingActive(false);
          // decide winner locally
          setVotes((prev) => {
            const arr = Object.entries(prev) as [MapKey, number][];
            let max = -1;
            arr.forEach(([k, v]) => {
              if (v > max) max = v;
            });
            const winners = arr.filter(([k, v]) => v === max).map((a) => a[0]);
            const pick = winners.length > 0 ? winners[Math.floor(Math.random() * winners.length)] : 'house';
            setSelectedMap(pick as MapKey);
            setTimeout(() => resetGame(), 80);
            return prev;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000) as unknown as number;

    return () => {
      if (voteTimerRef.current) {
        window.clearInterval(voteTimerRef.current);
        voteTimerRef.current = null;
      }
    };
  }, [votingActive, resetGame]);

  const startVoting = (duration = VOTE_DURATION) => {
    if (wsRef.current && wsConnected) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'start_vote', duration }));
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    // local fallback
    setVotes({ house: 0, mountain: 0, city: 0, coral: 0, hotel: 0 });
    setVoted(false);
    setVotingActive(true);
    setVoteTimeLeft(duration);
  };

  const castVote = (key: MapKey) => {
    if (!votingActive || voted) return;
    if (wsRef.current && wsConnected) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'cast_vote', map: key }));
        setVoted(true);
      } catch (e) {
        console.warn(e);
      }
      return;
    }
    // local fallback
    setVotes((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    setVoted(true);
  };

  // Game loop logic
  const step = useCallback(
    (dt: number) => {
      const p = playerRef.current;
      const plats = platformsRef.current;

      // Controls
      if (keys.current.left) p.vel.x -= 0.9;
      if (keys.current.right) p.vel.x += 0.9;
      if (keys.current.up && p.onGround) {
        p.vel.y = -14.5;
        p.onGround = false;
      }

      // physics
      p.vel.y += GRAVITY * (dt / (1000 / 60));
      p.pos.x += p.vel.x * (dt / (1000 / 60));
      p.pos.y += p.vel.y * (dt / (1000 / 60));

      p.vel.x *= 0.88;

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
        if (
          p.pos.x + PLAYER_SIZE > pl.x &&
          p.pos.x < pl.x + pl.w &&
          p.pos.y + PLAYER_SIZE > pl.y &&
          p.pos.y + PLAYER_SIZE - p.vel.y <= pl.y
        ) {
          p.pos.y = pl.y - PLAYER_SIZE;
          p.vel.y = 0;
          p.onGround = true;
        }
      }

      // lava
      lavaYRef.current -= (baseLavaSpeedRef.current * dt) / 1000;
      elapsedRef.current += dt / 1000;

      // One-time 30s difficulty increase
      if (!lavaBoostedRef.current && elapsedRef.current >= 30) {
        lavaBoostedRef.current = true;
        baseLavaSpeedRef.current = baseLavaSpeedRef.current * 1.4;
      }

      // Check for game duration win
      if (!timeUp && elapsedRef.current >= GAME_DURATION) {
        setTimeUp(true);
        setRunning(false);
        return; // stop further physics for this frame
      }

      // Gradual difficulty scaling
      if (elapsedRef.current > 120)
        baseLavaSpeedRef.current = Math.max(
          baseLavaSpeedRef.current,
          48 * (MAPS[selectedMap].lavaSpeedMod ?? 1)
        );
      else if (elapsedRef.current > 40)
        baseLavaSpeedRef.current = Math.max(
          baseLavaSpeedRef.current,
          36 * (MAPS[selectedMap].lavaSpeedMod ?? 1)
        );
      else if (elapsedRef.current > 20)
        baseLavaSpeedRef.current = Math.max(
          baseLavaSpeedRef.current,
          24 * (MAPS[selectedMap].lavaSpeedMod ?? 1)
        );

      const riseDelta = (baseLavaSpeedRef.current * dt) / 1000;
      for (let i = 0; i < plats.length; i++) plats[i].y += riseDelta;
      p.pos.y += riseDelta;

      platformsRef.current = plats.filter((pl) => pl.y < HEIGHT + 100);

      // spawn platforms with map frequency modifier
      const freqMod = MAPS[selectedMap].platformFrequencyMod ?? 1;
      if (Math.random() < 0.02 * freqMod) {
        const w = Math.round(PLATFORM_MIN_W + Math.random() * (PLATFORM_MAX_W - PLATFORM_MIN_W));
        const x = Math.round(Math.random() * (WIDTH - w));
        const y = -20 - Math.random() * 80;
        platformsRef.current.push({ x, y, w, h: PLATFORM_H });
      }

      const currentScore = Math.max(0, Math.floor((HEIGHT - lavaYRef.current) * 2));
      setScore(currentScore);

      if (p.pos.y + PLAYER_SIZE >= lavaYRef.current) {
        setGameOver(true);
        setRunning(false);
      }
    },
    // selectedMap and timeUp are dependencies used in the step function
    [selectedMap, timeUp]
  );

  const render = useCallback(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background based on selected map
      ctx.fillStyle = MAPS[selectedMap].bg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw platforms
      ctx.fillStyle = MAPS[selectedMap].platformColor;
      platformsRef.current.forEach((pl) => ctx.fillRect(pl.x, pl.y, pl.w, pl.h));

      // Player
      const p = playerRef.current;
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(p.pos.x, p.pos.y, PLAYER_SIZE, PLAYER_SIZE);

      // Lava gradient from selected map
      const lavaY = lavaYRef.current;
      const grd = ctx.createLinearGradient(0, lavaY, 0, HEIGHT);
      const [c1, c2] = MAPS[selectedMap].lavaColors;
      grd.addColorStop(0, c1);
      grd.addColorStop(1, c2);
      ctx.fillStyle = grd;
      ctx.fillRect(0, lavaY, WIDTH, HEIGHT - lavaY);

      // HUD
      ctx.fillStyle = 'white';
      ctx.font = '14px monospace';
      ctx.fillText('Floor is Lava - ' + MAPS[selectedMap].displayName, 10, 20);
      ctx.fillText('Score: ' + score, 10, 40);

      if (paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = '28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', WIDTH / 2, HEIGHT / 2);
        ctx.textAlign = 'left';
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = '22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('You fell in the lava!', WIDTH / 2, HEIGHT / 2 - 10);
        ctx.fillText('Final score: ' + score, WIDTH / 2, HEIGHT / 2 + 24);
        ctx.textAlign = 'left';
      }

      if (timeUp) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#a6f0a6';
        ctx.font = '22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('You survived!', WIDTH / 2, HEIGHT / 2 - 10);
        ctx.fillStyle = 'white';
        ctx.fillText('Final score: ' + score, WIDTH / 2, HEIGHT / 2 + 24);
        ctx.textAlign = 'left';
      }
    },
    [score, paused, gameOver, selectedMap, timeUp]
  );

  const gameLoop = useCallback(
    (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      if (!paused && running && !gameOver && !timeUp) step(dt);
      render();
      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [paused, running, gameOver, step, render, timeUp]
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop]);

  const start = () => {
    resetGame();
    setRunning(true);
    setPaused(false);
  };
  const stop = () => {
    setRunning(false);
    setPaused(false);
  };
  const togglePause = () => setPaused((p) => !p);

  return (
    <div style={{ display: 'flex', gap: 12, color: '#fff', fontFamily: 'monospace' }}>
      <div style={{ border: '2px solid #333', width: WIDTH, height: HEIGHT, background: '#000' }}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
      </div>

      <div style={{ minWidth: 320 }}>
        <h3>Floor is Lava</h3>
        <p>Vote for the next map, then press Start to play the selected map.</p>

        <div style={{ marginBottom: 8 }}>
          <button onClick={() => start()} disabled={running} style={{ padding: '8px 12px', marginRight: 6 }}>
            Start
          </button>
          <button onClick={() => stop()} disabled={!running} style={{ padding: '8px 12px', marginRight: 6 }}>
            Stop
          </button>
          <button onClick={() => { resetGame(); }} style={{ padding: '8px 12px' }}>
            Reset
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <button onClick={() => togglePause()} style={{ padding: '6px 10px' }}>
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Selected map:</strong> {MAPS[selectedMap].displayName}
        </div>

        <div style={{ marginBottom: 8 }}>
          <strong>Map voting</strong>
          <div style={{ marginTop: 6 }}>
            {(['house', 'mountain', 'city', 'coral', 'hotel'] as MapKey[]).map((k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <button onClick={() => castVote(k)} disabled={!votingActive || voted} style={{ padding: '6px 10px' }}>
                  {MAPS[k].displayName}
                </button>
                <div style={{ minWidth: 60 }}>
                  {votes[k]} vote{votes[k] !== 1 ? 's' : ''}
                </div>
                {selectedMap === k && <div style={{ color: '#ffd166' }}>(current)</div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 6 }}>
            <button
              onClick={() => startVoting(VOTE_DURATION)}
              disabled={votingActive}
              style={{ padding: '6px 10px', marginRight: 6 }}
            >
              {`Start Vote (${VOTE_DURATION}s)`}
            </button>
            {votingActive && <span>Voting ends in {voteTimeLeft}s</span>}
            {!votingActive && (
              <small style={{ marginLeft: 6 }}>{WS_URL ? 'Connects to vote server' : 'Local vote (no server configured)'}</small>
            )}
          </div>
          <div style={{ marginTop: 6 }}>
            <small>Vote server: {WS_URL ? (wsConnected ? 'connected' : 'disconnected') : 'not configured'}</small>
          </div>
        </div>

        <div>
          <strong>Score:</strong> {score}
        </div>
        <div>
          <strong>Status:</strong>{' '}
          {gameOver ? 'Game Over' : timeUp ? 'Finished (Survived)' : running ? (paused ? 'Paused' : 'Running') : 'Stopped'}
        </div>
        <div style={{ marginTop: 6 }}>
          <small>Game duration: {GAME_DURATION}s</small>
        </div>
      </div>
    </div>
  );
}
