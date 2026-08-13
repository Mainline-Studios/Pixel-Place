'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getSkins } from '@/lib/storage';
import { Skin, User } from '@/types';
import { GUEST_SKIN } from '@/lib/guestMode';

interface ObstacleCourseProps {
  user: User;
  onClose?: () => void;
}

type Obstacle = {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
};

const DEFAULT_COLORS = {
  head: '#f4c2a1',
  torso: '#4d536f',
  arm: '#3a3f56',
  legs: '#3a3f56',
};

const COURSE: Obstacle[] = [
  { x: 0, y: 0.3, z: -6, w: 2, h: 0.6, d: 2 },
  { x: 2.7, y: 0.7, z: -10, w: 2, h: 1.4, d: 2 },
  { x: -2.7, y: 1.1, z: -14, w: 2, h: 2.2, d: 2 },
  { x: 0, y: 1.4, z: -18, w: 2, h: 2.8, d: 2 },
  { x: 3.2, y: 1.8, z: -22, w: 2.2, h: 3.6, d: 2.2 },
  { x: -3.2, y: 2.2, z: -26, w: 2.2, h: 4.4, d: 2.2 },
  { x: 0, y: 2.7, z: -30, w: 2.2, h: 5.4, d: 2.2 },
];

function insideAabb(px: number, py: number, pz: number, o: Obstacle, radius: number): boolean {
  const oxMin = o.x - o.w / 2 - radius;
  const oxMax = o.x + o.w / 2 + radius;
  const oyMin = o.y - o.h / 2 - 0.01;
  const oyMax = o.y + o.h / 2 + 0.01;
  const ozMin = o.z - o.d / 2 - radius;
  const ozMax = o.z + o.d / 2 + radius;
  return px >= oxMin && px <= oxMax && py >= oyMin && py <= oyMax && pz >= ozMin && pz <= ozMax;
}

export default function ObstacleCourse({ user, onClose }: ObstacleCourseProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [status, setStatus] = useState('Reach the gold finish pad!');

  useEffect(() => {
    let active = true;
    getSkins()
      .then((data) => {
        if (!active) return;
        setSkins(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setSkins([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const skinColors = useMemo(() => {
    const equipped = user.isGuest
      ? GUEST_SKIN
      : skins.find((s) => s.id === user.equippedSkin) || skins.find((s) => s.id === 'pixel_placer');
    const c = equipped?.colors || DEFAULT_COLORS;
    return {
      head: c.head || DEFAULT_COLORS.head,
      torso: c.torso || DEFAULT_COLORS.torso,
      arm: c.arm || DEFAULT_COLORS.arm,
      legs: c.legs || DEFAULT_COLORS.legs,
    };
  }, [skins, user.equippedSkin, user.isGuest]);

  useEffect(() => {
    if (!mountRef.current) return;
    let disposed = false;

    let cleanup = () => {};

    Promise.all([import('three')]).then(([THREE]) => {
      if (disposed || !mountRef.current) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c1020);
      scene.fog = new THREE.Fog(0x0c1020, 20, 75);

      const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 1.1);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xffffff, 1.1);
      sun.position.set(4, 10, 6);
      scene.add(sun);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 120),
        new THREE.MeshStandardMaterial({ color: 0x122033, roughness: 0.95, metalness: 0.05 }),
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const finishPad = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.25, 4),
        new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0x5a4505 }),
      );
      finishPad.position.set(0, 0.13, -36);
      scene.add(finishPad);

      COURSE.forEach((o) => {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(o.w, o.h, o.d),
          new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }),
        );
        m.position.set(o.x, o.y, o.z);
        scene.add(m);
      });

      const player = new THREE.Group();
      scene.add(player);

      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.25, 0.7),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(skinColors.torso) }),
      );
      torso.position.y = 1.35;
      player.add(torso);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.78, 0.78),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(skinColors.head) }),
      );
      head.position.y = 2.35;
      player.add(head);

      const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.95, 0.26),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(skinColors.arm) }),
      );
      leftArm.position.set(-0.78, 1.35, 0);
      player.add(leftArm);

      const rightArm = leftArm.clone();
      rightArm.position.x = 0.78;
      player.add(rightArm);

      const leftLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 1.05, 0.38),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(skinColors.legs) }),
      );
      leftLeg.position.set(-0.24, 0.42, 0);
      player.add(leftLeg);

      const rightLeg = leftLeg.clone();
      rightLeg.position.x = 0.24;
      player.add(rightLeg);

      player.position.set(0, 0, 4);

      const keys = new Set<string>();
      let verticalVel = 0;
      let yaw = Math.PI;
      let pitch = 0.34;
      let zoom = 8.6;
      let didWin = false;

      let lastTouch: { x: number; y: number } | null = null;
      const getTwoFingerCenter = (touches: TouchList) => {
        if (touches.length < 2) return null;
        return {
          x: (touches[0]!.clientX + touches[1]!.clientX) * 0.5,
          y: (touches[0]!.clientY + touches[1]!.clientY) * 0.5,
        };
      };

      const onTouchStart = (ev: TouchEvent) => {
        if (ev.touches.length === 2) lastTouch = getTwoFingerCenter(ev.touches);
      };
      const onTouchMove = (ev: TouchEvent) => {
        if (ev.touches.length !== 2) return;
        const center = getTwoFingerCenter(ev.touches);
        if (!center) return;
        if (!lastTouch) {
          lastTouch = center;
          return;
        }
        const dx = center.x - lastTouch.x;
        const dy = center.y - lastTouch.y;
        lastTouch = center;
        yaw -= dx * 0.01;
        pitch = Math.max(0.1, Math.min(1.15, pitch - dy * 0.008));
        ev.preventDefault();
      };
      const onTouchEnd = () => {
        lastTouch = null;
      };

      const onKeyDown = (ev: KeyboardEvent) => {
        const k = ev.key.toLowerCase();
        if (['w', 'a', 's', 'd', ' ', 'i', 'o'].includes(k)) ev.preventDefault();
        if (k === 'i') {
          zoom = Math.max(3.5, zoom - 0.55);
          return;
        }
        if (k === 'o') {
          zoom = Math.min(16, zoom + 0.55);
          return;
        }
        keys.add(k);
      };
      const onKeyUp = (ev: KeyboardEvent) => {
        keys.delete(ev.key.toLowerCase());
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
      renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
      renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: true });

      const clock = new THREE.Clock();
      const playerRadius = 0.45;

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

      const animate = () => {
        if (disposed) return;
        const dt = Math.min(clock.getDelta(), 0.033);

        const speed = 5.8;
        const turn = 2.8;
        if (keys.has('a')) player.rotation.y += turn * dt;
        if (keys.has('d')) player.rotation.y -= turn * dt;

        const move = Number(keys.has('w')) - Number(keys.has('s'));
        const prev = player.position.clone();
        if (move !== 0) {
          player.position.x += Math.sin(player.rotation.y) * speed * move * dt;
          player.position.z += Math.cos(player.rotation.y) * speed * move * dt;
        }

        const grounded = player.position.y <= 0.001;
        if (keys.has(' ') && grounded) verticalVel = 6.6;
        verticalVel -= 17.5 * dt;
        player.position.y = Math.max(0, player.position.y + verticalVel * dt);
        if (player.position.y <= 0) verticalVel = 0;

        // collision against obstacles
        for (const o of COURSE) {
          const nearTop = Math.abs(player.position.y - (o.y + o.h / 2)) < 0.35;
          const onTop =
            player.position.x > o.x - o.w / 2 + 0.05 &&
            player.position.x < o.x + o.w / 2 - 0.05 &&
            player.position.z > o.z - o.d / 2 + 0.05 &&
            player.position.z < o.z + o.d / 2 - 0.05 &&
            nearTop &&
            verticalVel <= 0;
          if (onTop) {
            player.position.y = o.y + o.h / 2;
            verticalVel = 0;
            continue;
          }
          if (insideAabb(player.position.x, player.position.y + 1.0, player.position.z, o, playerRadius)) {
            player.position.x = prev.x;
            player.position.z = prev.z;
            break;
          }
        }

        if (!didWin && player.position.z < -35 && Math.abs(player.position.x) < 2.5) {
          didWin = true;
          setStatus('You cleared the obstacle course!');
        }

        // camera
        const target = new THREE.Vector3(player.position.x, player.position.y + 1.8, player.position.z);
        const camPos = new THREE.Vector3(
          target.x + Math.sin(yaw) * Math.cos(pitch) * zoom,
          target.y + Math.sin(pitch) * zoom,
          target.z + Math.cos(yaw) * Math.cos(pitch) * zoom,
        );
        camera.position.lerp(camPos, 0.15);
        camera.lookAt(target);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('touchstart', onTouchStart as any);
        renderer.domElement.removeEventListener('touchmove', onTouchMove as any);
        renderer.domElement.removeEventListener('touchend', onTouchEnd as any);
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [skinColors.arm, skinColors.head, skinColors.legs, skinColors.torso]);

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Obstacle Course</h2>
        {onClose ? (
          <button type="button" className="btn" onClick={onClose}>
            Back
          </button>
        ) : null}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
        Controls: WASD move/turn, Space jump, I zoom in, O zoom out, 2-finger drag moves camera.
      </div>
      <div style={{ fontSize: 13, color: '#bfdbfe', marginBottom: 10 }}>{status}</div>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          minHeight: 430,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
