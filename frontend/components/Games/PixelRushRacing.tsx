'use client';

/**
 * Pixel Rush Racing — colorful 3D arcade lap racer with Firestore multiplayer (up to 200/lobby),
 * checkpoints, obstacles, WASD, crash particles, racing skins (free / race credits / Pixel Coins).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import {
  joinRacingLobby,
  leaveRacingLobby,
  pushRacingPlayerState,
  subscribeRacingLobby,
  submitRacingBestLap,
  sanitizeLobbyId,
  MAX_LOBBY_PLAYERS,
} from '@/lib/racingLobbyFirestore';

const TRACK_RADIUS = 40;
const CP_COUNT = 8;
const LAPS_TO_WIN = 2;
const NET_MS = 140;

type SkinDef = {
  id: string;
  name: string;
  kind: 'free' | 'race' | 'pixel';
  price: number;
  color: number;
  accent?: number;
};

const SKINS: SkinDef[] = [
  { id: 'citrus_free', name: 'Citrus Burst', kind: 'free', price: 0, color: 0xff6b35, accent: 0xffdd00 },
  { id: 'ocean_free', name: 'Ocean Wave', kind: 'free', price: 0, color: 0x00c8ff, accent: 0x0066ff },
  { id: 'berry_free', name: 'Berry Pop', kind: 'free', price: 0, color: 0xff2d95, accent: 0xaa00ff },
  { id: 'mint_race', name: 'Mint Racer', kind: 'race', price: 450, color: 0x2ef3a4 },
  { id: 'royal_race', name: 'Royal Violet', kind: 'race', price: 900, color: 0x7b42ff },
  { id: 'chrome_race', name: 'Chrome Comet', kind: 'race', price: 1600, color: 0xc8d2dc },
  { id: 'gold_px', name: 'Gold Pixel', kind: 'pixel', price: 320, color: 0xffcc33, accent: 0xff9500 },
  { id: 'nebula_px', name: 'Nebula Drift', kind: 'pixel', price: 650, color: 0xff55ee, accent: 0x8844ff },
  { id: 'comet_px', name: 'Comet Cyan', kind: 'pixel', price: 480, color: 0x55ffff, accent: 0x00aaff },
];

const DEFAULT_OWNED = SKINS.filter((s) => s.kind === 'free').map((s) => s.id);

function storageKey(user: string, suffix: string) {
  return `pixelRush_${suffix}_${user.toLowerCase()}`;
}

function loadOwned(username: string): string[] {
  if (typeof window === 'undefined') return [...DEFAULT_OWNED];
  try {
    const raw = localStorage.getItem(storageKey(username, 'skinsOwned'));
    if (!raw) return [...DEFAULT_OWNED];
    const arr = JSON.parse(raw) as string[];
    return Array.from(new Set([...DEFAULT_OWNED, ...arr]));
  } catch {
    return [...DEFAULT_OWNED];
  }
}

function saveOwned(username: string, ids: string[]) {
  try {
    localStorage.setItem(storageKey(username, 'skinsOwned'), JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function loadEquipped(username: string): string {
  try {
    return localStorage.getItem(storageKey(username, 'skinEquipped')) || 'citrus_free';
  } catch {
    return 'citrus_free';
  }
}

function saveEquipped(username: string, id: string) {
  try {
    localStorage.setItem(storageKey(username, 'skinEquipped'), id);
  } catch {
    /* ignore */
  }
}

function loadRaceCredits(username: string): number {
  try {
    const v = localStorage.getItem(storageKey(username, 'raceCredits'));
    return v ? Math.max(0, parseInt(v, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

function saveRaceCredits(username: string, n: number) {
  try {
    localStorage.setItem(storageKey(username, 'raceCredits'), String(Math.max(0, Math.floor(n))));
  } catch {
    /* ignore */
  }
}

function payoutForPlace(place: number): { race: number } {
  const table = [520, 380, 280, 200, 140, 100, 70, 50];
  const idx = Math.min(Math.max(place, 1), table.length) - 1;
  return { race: table[idx] ?? 40 };
}

function rankFromBestLaps(best: Record<string, number>, selfKey: string): number {
  const selfT = best[selfKey];
  if (selfT === undefined) return 999;
  const sorted = Object.entries(best).sort((a, b) => a[1] - b[1]);
  const i = sorted.findIndex(([k]) => k === selfKey);
  return i === -1 ? 999 : i + 1;
}

function checkpointWorld(i: number): { x: number; z: number } {
  const a = (i / CP_COUNT) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(a) * TRACK_RADIUS, z: Math.sin(a) * TRACK_RADIUS };
}

interface PixelRushRacingProps {
  user?: User;
}

export default function PixelRushRacing({ user: userProp }: PixelRushRacingProps) {
  const { user: ctx, updateUser } = useUser();
  const user = userProp || ctx;
  const username = user?.username || 'Guest';
  const playerKey = username.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40) || 'guest';

  const mountRef = useRef<HTMLDivElement>(null);
  const startLockRef = useRef(false);
  const sceneRef = useRef<{
    destroy: () => void;
  } | null>(null);

  const [phase, setPhase] = useState<'menu' | 'race'>('menu');
  const [lobbyInput, setLobbyInput] = useState('GLOBAL');
  const [lobbyActive, setLobbyActive] = useState('GLOBAL');
  const [status, setStatus] = useState('');
  const [hud, setHud] = useState({ lap: 0, cp: 0, time: 0, speed: 0 });
  const [garageOpen, setGarageOpen] = useState(false);
  const [owned, setOwned] = useState<string[]>(DEFAULT_OWNED);
  const [equipped, setEquipped] = useState('citrus_free');
  const [raceCredits, setRaceCredits] = useState(0);
  const [lastReward, setLastReward] = useState<string | null>(null);
  const [driverCount, setDriverCount] = useState(0);

  useEffect(() => {
    if (!user?.username) return;
    setOwned(loadOwned(user.username));
    setEquipped(loadEquipped(user.username));
    setRaceCredits(loadRaceCredits(user.username));
  }, [user?.username]);

  const skinColor = (id: string) => SKINS.find((s) => s.id === id)?.color ?? 0xff6b35;

  const buySkin = (def: SkinDef) => {
    if (!user?.username) return;
    if (owned.includes(def.id)) return;
    if (def.kind === 'race') {
      if (raceCredits < def.price) {
        setStatus(`Need ${def.price} race credits (win laps / place well).`);
        return;
      }
      const next = raceCredits - def.price;
      setRaceCredits(next);
      saveRaceCredits(user.username, next);
      const o = [...owned, def.id];
      setOwned(o);
      saveOwned(user.username, o);
      setStatus(`Unlocked ${def.name}!`);
      return;
    }
    if (def.kind === 'pixel') {
      const bal = typeof user.coins === 'number' ? user.coins : 0;
      if (bal < def.price) {
        setStatus(`Need ${def.price} Pixel Coins.`);
        return;
      }
      void updateUser({ coins: bal - def.price });
      const o = [...owned, def.id];
      setOwned(o);
      saveOwned(user.username, o);
      setStatus(`Unlocked ${def.name} with Pixel Coins!`);
    }
  };

  const equipSkin = (id: string) => {
    if (!user?.username) return;
    if (!owned.includes(id)) return;
    setEquipped(id);
    saveEquipped(user.username, id);
  };

  const startRace = useCallback(async () => {
    if (!mountRef.current || !user?.username) return;
    if (startLockRef.current) return;
    startLockRef.current = true;
    const lid = sanitizeLobbyId(lobbyInput);
    setStatus('Joining lobby…');
    const spawnA = Math.random() * Math.PI * 2;
    const sx = Math.cos(spawnA) * (TRACK_RADIUS - 4);
    const sz = Math.sin(spawnA) * (TRACK_RADIUS - 4);
    const j = await joinRacingLobby(lid, playerKey, username, equipped, { x: sx, y: 0.45, z: sz, ry: -spawnA });
    if (!j.ok) {
      setStatus(j.error || 'Could not join.');
      return;
    }
    try {
    setLobbyActive(lid);
    setPhase('race');
    setStatus(`Lobby ${lid} — up to ${MAX_LOBBY_PLAYERS} drivers`);
    setLastReward(null);

    const THREE = await import('three');
    const container = mountRef.current;
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x12082a);
    scene.fog = new THREE.Fog(0x12082a, 30, 220);

    const camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0x6688ff, 0.55);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0xffeecc, 1.05);
    sun.position.set(40, 80, 20);
    sun.castShadow = true;
    scene.add(sun);
    const pink = new THREE.PointLight(0xff66ff, 0.8, 120);
    pink.position.set(-30, 20, -10);
    scene.add(pink);
    const cyan = new THREE.PointLight(0x00ffff, 0.7, 120);
    cyan.position.set(30, 15, 40);
    scene.add(cyan);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 420),
      new THREE.MeshStandardMaterial({ color: 0x1a0f3d, roughness: 0.9, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(TRACK_RADIUS - 7, TRACK_RADIUS + 7, 64),
      new THREE.MeshStandardMaterial({
        color: 0x2a1f55,
        roughness: 0.45,
        metalness: 0.25,
        side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    ring.receiveShadow = true;
    scene.add(ring);

    const stripeGroup = new THREE.Group();
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.08, 0.35),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xff00aa : 0x00ffcc,
          emissive: i % 2 === 0 ? 0x440022 : 0x002222,
          emissiveIntensity: 0.4,
        })
      );
      mesh.position.set(Math.cos(a) * TRACK_RADIUS, 0.06, Math.sin(a) * TRACK_RADIUS);
      mesh.rotation.y = -a;
      stripeGroup.add(mesh);
    }
    scene.add(stripeGroup);

    const cpMeshes: THREE.Group[] = [];
    for (let i = 0; i < CP_COUNT; i++) {
      const g = new THREE.Group();
      const p = checkpointWorld(i);
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(3.2, 0.22, 10, 24, Math.PI * 1.1),
        new THREE.MeshStandardMaterial({
          color: 0x00ffaa,
          emissive: 0x004433,
          emissiveIntensity: 0.6,
          metalness: 0.4,
          roughness: 0.25,
        })
      );
      arch.rotation.y = Math.atan2(p.x, p.z);
      arch.position.set(p.x, 2.2, p.z);
      g.add(arch);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xff66ff, emissive: 0x330022, emissiveIntensity: 0.5 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4.2, 8), poleMat);
      pole.position.set(p.x + 2.4, 2.1, p.z);
      g.add(pole);
      scene.add(g);
      cpMeshes.push(g);
    }

    const obstacles: THREE.Mesh[] = [];
    const obsPositions: { x: number; z: number; r: number }[] = [
      { x: 18, z: 12, r: 1.4 },
      { x: -10, z: 28, r: 1.2 },
      { x: -26, z: -8, r: 1.5 },
      { x: 8, z: -32, r: 1.3 },
      { x: 30, z: -18, r: 1.25 },
    ];
    for (const o of obsPositions) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(o.r * 2, o.r * 2.2, o.r * 2),
        new THREE.MeshStandardMaterial({
          color: 0xff3355,
          emissive: 0x440011,
          emissiveIntensity: 0.35,
          metalness: 0.2,
          roughness: 0.5,
        })
      );
      m.position.set(o.x, o.r * 1.1, o.z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.userData = { ox: o.x, oz: o.z, or: o.r * 1.15 };
      scene.add(m);
      obstacles.push(m);
    }

    function makeCar(color: number): THREE.Group {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.52, 2.35),
        new THREE.MeshStandardMaterial({ color, metalness: 0.45, roughness: 0.35 })
      );
      body.position.y = 0.35;
      body.castShadow = true;
      g.add(body);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.35, 1.15),
        new THREE.MeshStandardMaterial({ color: color ^ 0x222222, metalness: 0.5, roughness: 0.3 })
      );
      roof.position.set(0, 0.78, -0.15);
      roof.castShadow = true;
      g.add(roof);
      const glow = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.1, 2.4),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: color,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.85,
        })
      );
      glow.position.set(0, 0.05, 0);
      g.add(glow);
      return g;
    }

    const localCar = makeCar(skinColor(equipped));
    localCar.position.set(sx, 0, sz);
    localCar.rotation.y = -spawnA;
    scene.add(localCar);

    const others = new Map<string, THREE.Group>();

    const unsub = subscribeRacingLobby(lid, (snap) => {
      const players = snap.players || {};
      setDriverCount(Object.keys(players).length);
      for (const [k, p] of Object.entries(players)) {
        if (k === playerKey) continue;
        let grp = others.get(k);
        if (!grp) {
          const c = SKINS.find((s) => s.id === p.skin)?.color ?? 0x88ff00;
          grp = makeCar(c);
          scene.add(grp);
          others.set(k, grp);
        }
        grp.position.set(p.x, 0, p.z);
        grp.rotation.y = p.ry;
      }
      for (const k of others.keys()) {
        if (!players[k]) {
          const grp = others.get(k)!;
          scene.remove(grp);
          others.delete(k);
        }
      }
    });

    const keys = { w: false, a: false, s: false, d: false };
    const onDown = (e: KeyboardEvent) => {
      const x = e.key.toLowerCase();
      if (x === 'w') keys.w = true;
      if (x === 'a') keys.a = true;
      if (x === 's') keys.s = true;
      if (x === 'd') keys.d = true;
    };
    const onUp = (e: KeyboardEvent) => {
      const x = e.key.toLowerCase();
      if (x === 'w') keys.w = false;
      if (x === 'a') keys.a = false;
      if (x === 's') keys.s = false;
      if (x === 'd') keys.d = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);

    let speed = 0;
    let lap = 0;
    let nextCp = 0;
    let raceMs = 0;
    let lapStart = performance.now();
    let lastNet = 0;
    let alive = true;
    let cpPrimed = false;
    let raceArmed = false;
    let lastHudPush = 0;

    const particles: { mesh: THREE.Points; life: number; vel: Float32Array }[] = [];

    function burst(at: THREE.Vector3, color: number) {
      const n = 48;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      const vel = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = at.x;
        pos[i * 3 + 1] = at.y + 0.3;
        pos[i * 3 + 2] = at.z;
        vel[i * 3] = (Math.random() - 0.5) * 10;
        vel[i * 3 + 1] = Math.random() * 8;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: 0.35,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Points(geo, mat);
      scene.add(mesh);
      particles.push({ mesh, life: 1, vel });
    }

    function checkObstacleHit(px: number, pz: number): boolean {
      for (const m of obstacles) {
        const u = m.userData as { ox: number; oz: number; or: number };
        const dx = px - u.ox;
        const dz = pz - u.oz;
        if (dx * dx + dz * dz < u.or * u.or) return true;
      }
      return false;
    }

    const clock = new THREE.Clock();
    let lastCrash = 0;

    const loop = () => {
      if (!alive) return;
      requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      raceMs += dt * 1000;

      const rot = localCar.rotation.y;
      const accel = 26;
      const brake = 32;
      const maxSp = 38;
      const steer = 2.4;
      if (keys.w) {
        speed += accel * dt;
        raceArmed = true;
      }
      if (keys.s) speed -= (speed > 0 ? brake : accel * 0.6) * dt;
      if (keys.a) localCar.rotation.y += steer * dt * Math.min(1, 0.35 + Math.abs(speed) / maxSp);
      if (keys.d) localCar.rotation.y -= steer * dt * Math.min(1, 0.35 + Math.abs(speed) / maxSp);
      speed *= 1 - Math.min(1.2 * dt, 0.08);
      speed = Math.max(-9, Math.min(maxSp, speed));
      localCar.position.x += Math.sin(rot) * speed * dt;
      localCar.position.z += Math.cos(rot) * speed * dt;

      if (checkObstacleHit(localCar.position.x, localCar.position.z)) {
        const now = performance.now();
        if (now - lastCrash > 900) {
          lastCrash = now;
          burst(localCar.position.clone(), 0xff4400);
          burst(localCar.position.clone(), 0xffdd00);
          speed *= -0.35;
        }
      }

      const cp = checkpointWorld(nextCp);
      const dx = localCar.position.x - cp.x;
      const dz = localCar.position.z - cp.z;
      const inCp = dx * dx + dz * dz < 6.5 * 6.5 && Math.abs(speed) > 0.4 && raceArmed;
      if (!inCp) cpPrimed = false;
      else if (!cpPrimed && inCp) {
        cpPrimed = true;
        const prev = nextCp;
        nextCp = (nextCp + 1) % CP_COUNT;
        if (prev === CP_COUNT - 1 && nextCp === 0) {
          const lapTime = performance.now() - lapStart;
          lapStart = performance.now();
          lap += 1;
          void (async () => {
            const merged = await submitRacingBestLap(lid, playerKey, lapTime);
            const place = rankFromBestLaps(merged, playerKey);
            const { race } = payoutForPlace(place);
            const rc = loadRaceCredits(username);
            const nextRc = rc + race;
            saveRaceCredits(username, nextRc);
            setRaceCredits(nextRc);
            const fin = lap >= LAPS_TO_WIN ? ' — Race complete! 🏁' : '';
            setLastReward(`Lap ${lap}! Leaderboard place ${place}. +${race} race credits${fin}`);
          })();
        }
      }

      const camDist = 11;
      const camH = 5.2;
      const bx = localCar.position.x - Math.sin(rot) * camDist;
      const bz = localCar.position.z - Math.cos(rot) * camDist;
      camera.position.lerp(new THREE.Vector3(bx, camH, bz), 0.12);
      camera.lookAt(localCar.position.x, 1.2, localCar.position.z);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt * 1.1;
        const pos = p.mesh.geometry.attributes.position as THREE.BufferAttribute;
        for (let j = 0; j < pos.count; j++) {
          pos.setXYZ(
            j,
            pos.getX(j) + p.vel[j * 3] * dt,
            pos.getY(j) + p.vel[j * 3 + 1] * dt,
            pos.getZ(j) + p.vel[j * 3 + 2] * dt
          );
          p.vel[j * 3 + 1] -= 18 * dt;
        }
        pos.needsUpdate = true;
        (p.mesh.material as THREE.PointsMaterial).opacity = Math.max(0, p.life);
        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
          particles.splice(i, 1);
        }
      }

      const t = performance.now();
      if (t - lastNet > NET_MS) {
        lastNet = t;
        void pushRacingPlayerState(lid, playerKey, {
          x: localCar.position.x,
          y: 0,
          z: localCar.position.z,
          ry: localCar.rotation.y,
          skin: equipped,
          name: username,
        });
      }

      const nowHud = performance.now();
      if (nowHud - lastHudPush > 120) {
        lastHudPush = nowHud;
        setHud({
          lap,
          cp: nextCp,
          time: raceMs / 1000,
          speed: Math.abs(speed) * 2.2,
        });
      }

      const pulse = (performance.now() / 500) % (CP_COUNT * 2);
      cpMeshes.forEach((g, i) => {
        const arch = g.children[0] as THREE.Mesh;
        if (arch?.material) {
          const m = arch.material as THREE.MeshStandardMaterial;
          m.emissiveIntensity = i === nextCp ? 0.9 + Math.sin(pulse + i) * 0.25 : 0.35;
        }
      });

      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      if (!mountRef.current) return;
      const rw = mountRef.current.clientWidth || 800;
      const rh = mountRef.current.clientHeight || 520;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh);
    };
    window.addEventListener('resize', onResize);

    sceneRef.current = {
      destroy: () => {
        alive = false;
        window.removeEventListener('keydown', onDown);
        window.removeEventListener('keyup', onUp);
        window.removeEventListener('resize', onResize);
        unsub();
        void leaveRacingLobby(lid, playerKey);
        for (const p of particles) {
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
        }
        renderer.dispose();
        if (renderer.domElement.parentElement === container) {
          container.removeChild(renderer.domElement);
        }
      },
    };
    } catch (e) {
      console.error(e);
      setStatus('Could not start the 3D engine. Try again.');
      setPhase('menu');
      void leaveRacingLobby(lid, playerKey);
    } finally {
      startLockRef.current = false;
    }
  }, [user?.username, username, playerKey, equipped, lobbyInput]);

  const endRace = () => {
    sceneRef.current?.destroy();
    sceneRef.current = null;
    startLockRef.current = false;
    setPhase('menu');
  };

  useEffect(() => {
    return () => {
      sceneRef.current?.destroy();
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #0f0524 0%, #1a0a3a 40%, #12082a 100%)',
        color: '#f0e8ff',
        padding: '16px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {phase === 'menu' && (
        <>
          <div
            style={{
              maxWidth: 560,
              margin: '0 auto 20px',
              padding: 24,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(255,0,170,0.12), rgba(0,255,220,0.08))',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
            }}
          >
            <h1 style={{ fontSize: 28, margin: '0 0 8px', fontWeight: 800, letterSpacing: -0.5 }}>
              <span style={{ color: '#ff66cc' }}>Pixel</span> Rush{' '}
              <span style={{ color: '#55ffff' }}>Racing</span>
            </h1>
            <p style={{ opacity: 0.88, lineHeight: 1.6, marginBottom: 16 }}>
              Neon laps, bouncy obstacles, live rivals ({MAX_LOBBY_PLAYERS} per lobby), and sparkly crash particles.
              <strong> WASD</strong> drive — W gas, S brake / reverse, A/D steer. Hit every checkpoint arch in order!
            </p>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, opacity: 0.85 }}>Lobby code</label>
            <input
              value={lobbyInput}
              onChange={(e) => setLobbyInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                marginBottom: 12,
                fontSize: 16,
              }}
              placeholder="GLOBAL"
            />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <button
                type="button"
                className="btn"
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: '14px 20px',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #ff00aa, #ff8800)',
                  border: 'none',
                  borderRadius: 14,
                  cursor: 'pointer',
                  color: '#fff',
                }}
                onClick={() => void startRace()}
              >
                Enter track
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  padding: '14px 20px',
                  fontWeight: 700,
                  borderRadius: 14,
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
                onClick={() => setGarageOpen((v) => !v)}
              >
                Racing skins
              </button>
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Race credits: <strong style={{ color: '#66ffcc' }}>{raceCredits}</strong>
              {user && (
                <>
                  {' · '}
                  Pixel Coins: <strong style={{ color: '#ffdd66' }}>{(user.coins ?? 0).toLocaleString()}</strong>
                </>
              )}
            </div>
            {status && <p style={{ marginTop: 12, color: '#ffaa66' }}>{status}</p>}
          </div>

          {garageOpen && user?.username && (
            <div
              style={{
                maxWidth: 720,
                margin: '0 auto',
                padding: 20,
                borderRadius: 18,
                background: 'rgba(20,10,45,0.92)',
                border: '1px solid rgba(120,200,255,0.2)',
              }}
            >
              <h2 style={{ marginTop: 0 }}>Garage</h2>
              <p style={{ fontSize: 14, opacity: 0.85 }}>
                Free paints for everyone. Win <strong>race credits</strong> by placing well on the best-lap board after
                each lap. Spend Pixel Coins (your global balance) on premium metallic wraps.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {SKINS.map((s) => {
                  const has = owned.includes(s.id);
                  const eq = equipped === s.id;
                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: eq ? '2px solid #55ffff' : '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(0,0,0,0.25)',
                      }}
                    >
                      <div
                        style={{
                          height: 48,
                          borderRadius: 10,
                          marginBottom: 8,
                          background: `#${s.color.toString(16).padStart(6, '0')}`,
                          boxShadow: `0 0 20px #${s.color.toString(16).padStart(6, '0')}55`,
                        }}
                      />
                      <div style={{ fontWeight: 700 }}>{s.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
                        {s.kind === 'free' && 'Free'}
                        {s.kind === 'race' && `${s.price} race credits`}
                        {s.kind === 'pixel' && `${s.price} Pixel Coins`}
                      </div>
                      {has ? (
                        <button type="button" className="btn" style={{ width: '100%' }} onClick={() => equipSkin(s.id)}>
                          {eq ? 'Equipped' : 'Equip'}
                        </button>
                      ) : (
                        <button type="button" className="btn" style={{ width: '100%' }} onClick={() => buySkin(s)}>
                          Unlock
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {phase === 'race' && (
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 32px)' }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }} />
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.55)',
              fontSize: 14,
              lineHeight: 1.6,
              pointerEvents: 'none',
            }}
          >
            <div>
              Time <strong>{hud.time.toFixed(1)}</strong>s
            </div>
            <div>
              Speed <strong>{hud.speed.toFixed(0)}</strong> km/h
            </div>
            <div>
              Lap <strong>{hud.lap + 1}</strong> / {LAPS_TO_WIN} · Next CP <strong>{hud.cp + 1}</strong>
            </div>
            <div style={{ opacity: 0.85 }}>Drivers online: {driverCount}</div>
          </div>
          {lastReward && (
            <div
              style={{
                position: 'absolute',
                bottom: 56,
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '90%',
                padding: '10px 16px',
                borderRadius: 12,
                background: 'rgba(0,80,60,0.85)',
                border: '1px solid #44ffcc',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {lastReward}
            </div>
          )}
          <button
            type="button"
            onClick={endRace}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              zIndex: 10,
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #00a2ff, #6644ff)',
              color: '#fff',
            }}
          >
            Leave race
          </button>
        </div>
      )}
    </div>
  );
}
