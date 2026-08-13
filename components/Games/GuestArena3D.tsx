'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@/types';
import { GUEST_SKIN } from '@/lib/guestMode';
import {
  leaveArena,
  publishArenaMeta,
  publishArenaPlayer,
  subscribeArenaMeta,
  subscribeArenaPlayers,
  type ArenaMeta,
  type ArenaPlayerState,
} from '@/lib/guestArenaRtdb';

export type GuestArenaMode =
  | 'skyTag'
  | 'crystalRush'
  | 'kingHill'
  | 'neonRace'
  | 'balloonBrawl'
  | 'laserDome'
  | 'parkourPeak'
  | 'snowballSiege';

const MODE_INFO: Record<
  GuestArenaMode,
  { title: string; hint: string; accent: string }
> = {
  skyTag: {
    title: 'Sky Tag',
    hint: 'Tag the player who is It. WASD move/turn, Space jump.',
    accent: '#7dd3fc',
  },
  crystalRush: {
    title: 'Crystal Rush',
    hint: 'Grab glowing crystals before everyone else. WASD + Space.',
    accent: '#c084fc',
  },
  kingHill: {
    title: 'King of the Hill',
    hint: 'Stand on the gold hill to score. WASD + Space.',
    accent: '#fbbf24',
  },
  neonRace: {
    title: 'Neon Circuit',
    hint: 'Hit checkpoints in order and finish laps. WASD + Space.',
    accent: '#22d3ee',
  },
  balloonBrawl: {
    title: 'Balloon Brawl',
    hint: 'Bump other players off the platforms. WASD + Space.',
    accent: '#fb7185',
  },
  laserDome: {
    title: 'Laser Dome',
    hint: 'Aim with A/D and tap F or click to fire. WASD + Space.',
    accent: '#4ade80',
  },
  parkourPeak: {
    title: 'Parkour Peak',
    hint: 'Race to the summit. Highest climb wins. WASD + Space.',
    accent: '#a3e635',
  },
  snowballSiege: {
    title: 'Snowball Siege',
    hint: 'Pelt rivals with snowballs (F or click). WASD + Space.',
    accent: '#e0f2fe',
  },
};

const DEFAULT_COLORS = {
  head: '#b8bcc4',
  torso: '#7d828c',
  arm: '#9aa0aa',
  legs: '#5c616a',
};

interface GuestArena3DProps {
  user: User;
  onClose?: () => void;
  mode: GuestArenaMode;
}

type Projectile = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  life: number;
};

function buildAvatar(THREE: any, colors: typeof DEFAULT_COLORS, scale = 0.55) {
  const g = new THREE.Group();
  const mat = (hex: string) =>
    new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 0.72, metalness: 0.08 });
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 1.05), mat(colors.head));
  head.position.set(0, 2.05, 0);
  g.add(head);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.72), mat(colors.torso));
  torso.position.set(0, 0.9, 0);
  g.add(torso);
  const armGeo = new THREE.BoxGeometry(0.4, 1.55, 0.4);
  const leftArm = new THREE.Mesh(armGeo, mat(colors.arm));
  leftArm.position.set(-1.0, 0.95, 0);
  g.add(leftArm);
  const rightArm = new THREE.Mesh(armGeo, mat(colors.arm));
  rightArm.position.set(1.0, 0.95, 0);
  g.add(rightArm);
  const legGeo = new THREE.BoxGeometry(0.5, 1.4, 0.5);
  const leftLeg = new THREE.Mesh(legGeo, mat(colors.legs));
  leftLeg.position.set(-0.36, -0.15, 0);
  g.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeo, mat(colors.legs));
  rightLeg.position.set(0.36, -0.15, 0);
  g.add(rightLeg);
  g.scale.setScalar(scale);
  return { group: g, leftArm, rightArm, leftLeg, rightLeg };
}

function addNametag(THREE: any, name: string): any {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(8,12,24,0.72)';
    ctx.roundRect?.(8, 12, 240, 40, 10);
    if (!ctx.roundRect) ctx.fillRect(8, 12, 240, 40);
    else ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.slice(0, 16), 128, 34);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(2.4, 0.6, 1);
  sprite.position.y = 2.6;
  return sprite;
}

function buildWorld(THREE: any, scene: any, mode: GuestArenaMode) {
  const platforms: Array<{ x: number; y: number; z: number; w: number; h: number; d: number }> = [];
  const crystals: Array<{ x: number; y: number; z: number; mesh: any }> = [];

  if (mode === 'skyTag') {
    scene.background = new THREE.Color(0x87c6f0);
    scene.fog = new THREE.Fog(0x87c6f0, 18, 90);
    const island = (x: number, y: number, z: number, s: number) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(s, s * 1.15, 1.2, 10),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 }),
      );
      m.position.set(x, y, z);
      scene.add(m);
      platforms.push({ x, y: y + 0.6, z, w: s * 1.8, h: 1.2, d: s * 1.8 });
    };
    island(0, 0, 0, 6);
    island(12, 2.2, -4, 3.2);
    island(-11, 3.4, -8, 3);
    island(4, 5.2, -16, 2.8);
    island(-6, 6.8, -18, 2.6);
  } else if (mode === 'crystalRush') {
    scene.background = new THREE.Color(0x1b1030);
    scene.fog = new THREE.Fog(0x1b1030, 16, 70);
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(22, 32),
      new THREE.MeshStandardMaterial({ color: 0x2a1848, roughness: 0.95 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    platforms.push({ x: 0, y: 0, z: 0, w: 44, h: 0.2, d: 44 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = 6 + (i % 3) * 3.5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55),
        new THREE.MeshStandardMaterial({ color: 0xe879f9, emissive: 0x7c3aed, emissiveIntensity: 0.8 }),
      );
      gem.position.set(x, 1.1, z);
      scene.add(gem);
      crystals.push({ x, y: 1.1, z, mesh: gem });
    }
  } else if (mode === 'kingHill') {
    scene.background = new THREE.Color(0xfde68a);
    scene.fog = new THREE.Fog(0xfde68a, 20, 80);
    const sand = new THREE.Mesh(
      new THREE.CircleGeometry(28, 36),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 1 }),
    );
    sand.rotation.x = -Math.PI / 2;
    scene.add(sand);
    platforms.push({ x: 0, y: 0, z: 0, w: 56, h: 0.2, d: 56 });
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(5.5, 4.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.85 }),
    );
    hill.position.set(0, 2.1, 0);
    scene.add(hill);
    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xb45309, emissiveIntensity: 0.45 }),
    );
    crown.position.set(0, 4.35, 0);
    scene.add(crown);
    platforms.push({ x: 0, y: 4.55, z: 0, w: 3.2, h: 0.4, d: 3.2 });
  } else if (mode === 'neonRace') {
    scene.background = new THREE.Color(0x050816);
    scene.fog = new THREE.Fog(0x050816, 20, 90);
    const track = new THREE.Mesh(
      new THREE.RingGeometry(10, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x0ea5e9, emissiveIntensity: 0.18, side: THREE.DoubleSide }),
    );
    track.rotation.x = -Math.PI / 2;
    scene.add(track);
    platforms.push({ x: 0, y: 0, z: 0, w: 40, h: 0.2, d: 40 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.35, 2.4),
        new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.7 }),
      );
      p.position.set(Math.cos(a) * 13, 0.2, Math.sin(a) * 13);
      p.rotation.y = -a;
      scene.add(p);
    }
  } else if (mode === 'balloonBrawl') {
    scene.background = new THREE.Color(0xfbcfe8);
    scene.fog = new THREE.Fog(0xfbcfe8, 16, 70);
    const pads = [
      [0, 0, 0, 5],
      [8, 1.2, 3, 2.6],
      [-8, 1.6, -2, 2.6],
      [3, 2.8, -9, 2.4],
      [-4, 3.4, 8, 2.4],
      [0, 5.0, 0, 2.2],
    ] as const;
    pads.forEach(([x, y, z, s]) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(s, s, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.55 }),
      );
      m.position.set(x, y, z);
      scene.add(m);
      platforms.push({ x, y: y + 0.22, z, w: s * 1.9, h: 0.5, d: s * 1.9 });
    });
  } else if (mode === 'laserDome') {
    scene.background = new THREE.Color(0x022c22);
    scene.fog = new THREE.Fog(0x022c22, 14, 55);
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(16, 40),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8, metalness: 0.2 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    platforms.push({ x: 0, y: 0, z: 0, w: 32, h: 0.2, d: 32 });
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(16, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.12, side: THREE.BackSide }),
    );
    scene.add(dome);
  } else if (mode === 'parkourPeak') {
    scene.background = new THREE.Color(0x1e293b);
    scene.fog = new THREE.Fog(0x1e293b, 18, 80);
    const steps = [
      [0, 0, 4, 4],
      [0, 1.2, -1, 2.4],
      [3.2, 2.6, -5, 2.2],
      [-3.4, 4.0, -8, 2.0],
      [2.6, 5.6, -12, 1.9],
      [-2.2, 7.4, -16, 1.8],
      [0, 9.4, -20, 2.6],
    ] as const;
    steps.forEach(([x, y, z, s], i) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(s * 2, 0.45, s * 2),
        new THREE.MeshStandardMaterial({ color: i === steps.length - 1 ? 0xfacc15 : 0x64748b }),
      );
      m.position.set(x, y, z);
      scene.add(m);
      platforms.push({ x, y: y + 0.22, z, w: s * 2, h: 0.45, d: s * 2 });
    });
  } else {
    scene.background = new THREE.Color(0xbfdbfe);
    scene.fog = new THREE.Fog(0xbfdbfe, 18, 80);
    const snow = new THREE.Mesh(
      new THREE.CircleGeometry(22, 36),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.95 }),
    );
    snow.rotation.x = -Math.PI / 2;
    scene.add(snow);
    platforms.push({ x: 0, y: 0, z: 0, w: 44, h: 0.2, d: 44 });
    [
      [-8, 1.1, -4],
      [8, 1.1, -4],
      [0, 1.4, 8],
    ].forEach(([x, y, z]) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 2.2, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.7 }),
      );
      wall.position.set(x, y, z);
      scene.add(wall);
    });
  }

  return { platforms, crystals };
}

export default function GuestArena3D({ user, onClose, mode }: GuestArena3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const info = MODE_INFO[mode];
  const [status, setStatus] = useState(info.hint);
  const [scoreboard, setScoreboard] = useState<Array<{ name: string; score: number; you?: boolean }>>([]);
  const remotesRef = useRef<ArenaPlayerState[]>([]);
  const metaRef = useRef<ArenaMeta | null>(null);
  const scoreRef = useRef(0);
  const extraRef = useRef(0);

  const colors = useMemo(() => {
    const c = user.isGuest ? GUEST_SKIN.colors : DEFAULT_COLORS;
    return {
      head: c?.head || DEFAULT_COLORS.head,
      torso: c?.torso || DEFAULT_COLORS.torso,
      arm: c?.arm || DEFAULT_COLORS.arm,
      legs: c?.legs || DEFAULT_COLORS.legs,
    };
  }, [user.isGuest]);

  useEffect(() => {
    scoreRef.current = 0;
    extraRef.current = 0;
    const unsubP = subscribeArenaPlayers(mode, user.username, (players) => {
      remotesRef.current = players;
      setScoreboard((prevYou) => {
        const youScore = scoreRef.current;
        const rows = [
          { name: 'You', score: youScore, you: true },
          ...players.map((p) => ({ name: p.username, score: p.score || 0 })),
        ].sort((a, b) => b.score - a.score);
        if (
          prevYou.length === rows.length &&
          prevYou.every((r, i) => r.name === rows[i]?.name && r.score === rows[i]?.score)
        ) {
          return prevYou;
        }
        return rows;
      });
    });
    const unsubM = subscribeArenaMeta(mode, (meta) => {
      metaRef.current = meta;
    });
    return () => {
      unsubP();
      unsubM();
      void leaveArena(mode, user.username);
    };
  }, [mode, user.username]);

  useEffect(() => {
    if (!mountRef.current) return;
    let disposed = false;
    let cleanup = () => {};

    Promise.all([import('three')]).then(([THREE]) => {
      if (disposed || !mountRef.current) return;

      const scene = new THREE.Scene();
      const { platforms, crystals } = buildWorld(THREE, scene, mode);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 1.05);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xffffff, 1.15);
      sun.position.set(8, 14, 6);
      scene.add(sun);

      const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      const local = buildAvatar(THREE, colors);
      scene.add(local.group);
      local.group.position.set(0, 0, mode === 'neonRace' ? 13 : 3);

      const remoteMap = new Map<string, { group: any; leftArm: any; rightArm: any; leftLeg: any; rightLeg: any }>();
      const projectiles: Projectile[] = [];
      const shotMeshes: any[] = [];

      const keys = new Set<string>();
      let verticalVel = 0;
      let yaw = Math.PI;
      let pitch = 0.32;
      let zoom = 9.2;
      let lastPublish = 0;
      let lastShot = 0;
      let lastTag = 0;
      let lastBump = 0;
      let checkpoint = 0;
      let hillAcc = 0;
      let walkT = 0;
      let lastTouch: { x: number; y: number } | null = null;

      const spawnY = () => {
        if (mode === 'skyTag' || mode === 'balloonBrawl' || mode === 'parkourPeak') return platforms[0]?.y || 0;
        return 0;
      };
      local.group.position.y = spawnY();

      const groundYAt = (x: number, z: number, fallback = -8): number => {
        let best = fallback;
        for (const p of platforms) {
          if (Math.abs(x - p.x) <= p.w / 2 && Math.abs(z - p.z) <= p.d / 2) {
            const top = p.y;
            if (top > best) best = top;
          }
        }
        return best;
      };

      const onKeyDown = (ev: KeyboardEvent) => {
        const k = ev.key.toLowerCase();
        if (['w', 'a', 's', 'd', ' ', 'f', 'i', 'o'].includes(k)) ev.preventDefault();
        if (k === 'i') zoom = Math.max(4, zoom - 0.5);
        else if (k === 'o') zoom = Math.min(16, zoom + 0.5);
        else keys.add(k);
      };
      const onKeyUp = (ev: KeyboardEvent) => keys.delete(ev.key.toLowerCase());
      const onClick = () => keys.add('fire');
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      renderer.domElement.addEventListener('pointerdown', onClick);

      const getTwo = (touches: TouchList) =>
        touches.length < 2
          ? null
          : { x: (touches[0]!.clientX + touches[1]!.clientX) * 0.5, y: (touches[0]!.clientY + touches[1]!.clientY) * 0.5 };
      const onTouchStart = (ev: TouchEvent) => {
        if (ev.touches.length === 2) lastTouch = getTwo(ev.touches);
      };
      const onTouchMove = (ev: TouchEvent) => {
        if (ev.touches.length !== 2) return;
        const c = getTwo(ev.touches);
        if (!c || !lastTouch) {
          lastTouch = c;
          return;
        }
        yaw -= (c.x - lastTouch.x) * 0.01;
        pitch = Math.max(0.08, Math.min(1.2, pitch - (c.y - lastTouch.y) * 0.008));
        lastTouch = c;
        ev.preventDefault();
      };
      renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
      renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
      renderer.domElement.addEventListener('touchend', () => {
        lastTouch = null;
      });

      const onResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);
      onResize();

      const fire = () => {
        const now = performance.now();
        if (now - lastShot < 420) return;
        lastShot = now;
        const speed = mode === 'snowballSiege' ? 14 : 22;
        projectiles.push({
          x: local.group.position.x,
          y: local.group.position.y + 1.2,
          z: local.group.position.z,
          vx: Math.sin(local.group.rotation.y) * speed,
          vz: Math.cos(local.group.rotation.y) * speed,
          life: 1.4,
        });
        const mesh = new THREE.Mesh(
          mode === 'snowballSiege' ? new THREE.SphereGeometry(0.22, 8, 8) : new THREE.SphereGeometry(0.12, 8, 8),
          new THREE.MeshStandardMaterial({
            color: mode === 'snowballSiege' ? 0xf8fafc : 0x4ade80,
            emissive: mode === 'snowballSiege' ? 0x94a3b8 : 0x22c55e,
            emissiveIntensity: 0.8,
          }),
        );
        shotMeshes.push(mesh);
        scene.add(mesh);
      };

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        const dt = Math.min(clock.getDelta(), 0.033);
        const pos = local.group.position;

        if (keys.has('a')) local.group.rotation.y += 2.7 * dt;
        if (keys.has('d')) local.group.rotation.y -= 2.7 * dt;
        const move = Number(keys.has('w')) - Number(keys.has('s'));
        const prevX = pos.x;
        const prevZ = pos.z;
        if (move) {
          pos.x += Math.sin(local.group.rotation.y) * 6.4 * move * dt;
          pos.z += Math.cos(local.group.rotation.y) * 6.4 * move * dt;
        }

        if (mode === 'neonRace') {
          const r = Math.hypot(pos.x, pos.z);
          if (r < 10.2 || r > 16.2) {
            pos.x = prevX;
            pos.z = prevZ;
          }
        }

        const ground = groundYAt(pos.x, pos.z, mode === 'balloonBrawl' || mode === 'skyTag' || mode === 'parkourPeak' ? -12 : 0);
        const grounded = pos.y <= ground + 0.04;
        if ((keys.has(' ') || keys.has('space')) && grounded) verticalVel = 6.8;
        verticalVel -= 18 * dt;
        pos.y += verticalVel * dt;
        if (pos.y <= ground) {
          pos.y = ground;
          verticalVel = 0;
        }

        if (pos.y < -6) {
          pos.set(0, spawnY(), mode === 'neonRace' ? 13 : 3);
          verticalVel = 0;
          extraRef.current = 0;
          checkpoint = 0;
        }

        walkT += dt * (move ? 10 : 4);
        const swing = move ? Math.sin(walkT) * 0.55 : 0;
        local.leftArm.rotation.x = swing;
        local.rightArm.rotation.x = -swing;
        local.leftLeg.rotation.x = -swing;
        local.rightLeg.rotation.x = swing;

        if (keys.has('f') || keys.has('fire')) {
          if (mode === 'laserDome' || mode === 'snowballSiege') fire();
          keys.delete('fire');
        }

        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i]!;
          p.x += p.vx * dt;
          p.z += p.vz * dt;
          p.life -= dt;
          const mesh = shotMeshes[i];
          if (mesh) mesh.position.set(p.x, p.y, p.z);
          let hit = false;
          for (const other of remotesRef.current) {
            if (Math.hypot(p.x - other.x, p.z - other.z) < 1.05 && Math.abs(p.y - (other.y + 1)) < 1.3) {
              scoreRef.current += 1;
              hit = true;
              setStatus(`Hit ${other.username}! Score ${scoreRef.current}`);
              break;
            }
          }
          if (hit || p.life <= 0) {
            if (mesh) scene.remove(mesh);
            projectiles.splice(i, 1);
            shotMeshes.splice(i, 1);
          }
        }

        if (mode === 'skyTag') {
          const itName = metaRef.current?.itUsername || '';
          const amIt = !itName || itName.toLowerCase() === user.username.toLowerCase();
          extraRef.current = amIt ? 1 : 0;
          if (amIt) {
            for (const other of remotesRef.current) {
              if (
                performance.now() - lastTag > 900 &&
                Math.hypot(pos.x - other.x, pos.z - other.z) < 1.45 &&
                Math.abs(pos.y - other.y) < 1.4
              ) {
                lastTag = performance.now();
                scoreRef.current += 1;
                void publishArenaMeta(mode, { itUsername: other.username });
                setStatus(`Tagged ${other.username}! They are It.`);
                break;
              }
            }
            if (!itName) void publishArenaMeta(mode, { itUsername: user.username });
          } else {
            setStatus(`It: ${itName}. Tag them back!`);
          }
        }

        if (mode === 'crystalRush') {
          crystals.forEach((c, idx) => {
            c.mesh.rotation.y += dt * 2;
            c.mesh.position.y = 1.1 + Math.sin(performance.now() / 400 + idx) * 0.15;
            if (c.mesh.visible && Math.hypot(pos.x - c.x, pos.z - c.z) < 1.1 && Math.abs(pos.y - c.y) < 1.4) {
              c.mesh.visible = false;
              scoreRef.current += 1;
              setStatus(`Crystal grabbed! ${scoreRef.current}`);
              window.setTimeout(() => {
                if (!disposed) c.mesh.visible = true;
              }, 7000);
            }
          });
        }

        if (mode === 'kingHill') {
          const onHill = Math.hypot(pos.x, pos.z) < 1.7 && pos.y >= 4.3;
          if (onHill) {
            hillAcc += dt;
            if (hillAcc >= 1) {
              hillAcc -= 1;
              scoreRef.current += 1;
              setStatus(`Holding the hill · ${scoreRef.current}`);
            }
          } else hillAcc = 0;
        }

        if (mode === 'neonRace') {
          const ang = (Math.atan2(pos.z, pos.x) + Math.PI * 2) % (Math.PI * 2);
          const sector = Math.floor((ang / (Math.PI * 2)) * 4);
          if (sector === checkpoint) {
            checkpoint = (checkpoint + 1) % 4;
            extraRef.current += 1;
            if (checkpoint === 0) {
              scoreRef.current += 1;
              setStatus(`Lap ${scoreRef.current} complete!`);
            }
          }
        }

        if (mode === 'balloonBrawl') {
          for (const other of remotesRef.current) {
            const d = Math.hypot(pos.x - other.x, pos.z - other.z);
            if (d < 1.25 && Math.abs(pos.y - other.y) < 1.2 && move && performance.now() - lastBump > 700) {
              lastBump = performance.now();
              scoreRef.current += 1;
              const nx = (pos.x - other.x) / Math.max(0.2, d);
              const nz = (pos.z - other.z) / Math.max(0.2, d);
              pos.x += nx * 0.4;
              pos.z += nz * 0.4;
              setStatus(`Bump! ${scoreRef.current}`);
            }
          }
        }

        if (mode === 'parkourPeak') {
          const hScore = Math.max(0, Math.floor(pos.y * 4));
          if (hScore > scoreRef.current) {
            scoreRef.current = hScore;
            setStatus(`Height ${scoreRef.current}`);
          }
        }

        const seen = new Set<string>();
        for (const p of remotesRef.current) {
          seen.add(p.username);
          let remote = remoteMap.get(p.username);
          if (!remote) {
            remote = buildAvatar(THREE, {
              head: p.colors?.head || '#f4c2a1',
              torso: p.colors?.torso || '#3b82f6',
              arm: p.colors?.arm || '#2563eb',
              legs: p.colors?.legs || '#1e3a8a',
            });
            remote.group.add(addNametag(THREE, p.username));
            scene.add(remote.group);
            remoteMap.set(p.username, remote);
          }
          remote.group.position.lerp(new THREE.Vector3(p.x, p.y, p.z), 0.25);
          remote.group.rotation.y = p.rotY;
        }
        for (const [name, remote] of remoteMap) {
          if (!seen.has(name)) {
            scene.remove(remote.group);
            remoteMap.delete(name);
          }
        }

        const now = performance.now();
        if (now - lastPublish > 110) {
          lastPublish = now;
          void publishArenaPlayer(mode, {
            username: user.username,
            x: pos.x,
            y: pos.y,
            z: pos.z,
            rotY: local.group.rotation.y,
            anim: move ? 'walk' : 'idle',
            score: scoreRef.current,
            extra: extraRef.current,
            colors,
          });
          setScoreboard((prev) => {
            const remotes = remotesRef.current.map((p) => ({ name: p.username, score: p.score || 0 }));
            const rows = [{ name: 'You', score: scoreRef.current, you: true }, ...remotes].sort((a, b) => b.score - a.score);
            if (prev.length === rows.length && prev.every((r, i) => r.name === rows[i]?.name && r.score === rows[i]?.score)) {
              return prev;
            }
            return rows;
          });
        }

        const target = new THREE.Vector3(pos.x, pos.y + 1.7, pos.z);
        const camPos = new THREE.Vector3(
          target.x + Math.sin(yaw) * Math.cos(pitch) * zoom,
          target.y + Math.sin(pitch) * zoom,
          target.z + Math.cos(yaw) * Math.cos(pitch) * zoom,
        );
        camera.position.lerp(camPos, 0.16);
        camera.lookAt(target);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('pointerdown', onClick);
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [colors, mode, user.username]);

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 }}>
        <h2 style={{ margin: 0, color: info.accent }}>{info.title}</h2>
        {onClose ? (
          <button type="button" className="btn" onClick={onClose}>
            Back
          </button>
        ) : null}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>{status}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {scoreboard.slice(0, 8).map((row) => (
          <span
            key={row.name}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 999,
              background: row.you ? 'rgba(56,189,248,0.22)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            {row.name} · {row.score}
          </span>
        ))}
      </div>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          minHeight: 460,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
