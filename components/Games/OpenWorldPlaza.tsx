'use client';

import { useEffect, useRef, useState } from 'react';
import { User } from '@/types';
import { applyAvatarPose } from '@/lib/applyAvatarPose';
import { createAvatarMesh, getUserAvatarData } from '@/lib/avatar3DRenderer';
import { filterForDisplay } from '@/lib/pyx';
import {
  createPrivateInvite,
  GLOBAL_MAX_PLAYERS,
  invitePublicUrl,
  joinBestGlobalRoom,
  leaveOpenWorld,
  openWorldRoomForFriends,
  publishOpenWorldPlayer,
  sendOpenWorldChat,
  startPrivateServer,
  subscribeOpenWorldChat,
  subscribeOpenWorldPlayers,
  type OpenWorldChatChannel,
  type OpenWorldChatMessage,
  type OpenWorldPlayerState,
  type PrivateInviteRecord,
} from '@/lib/openWorldRtdb';
import {
  buildPlazaBuildings,
  collideWalls,
  resolveBuildingAt,
  type PlazaBuilding,
} from '@/lib/openWorldBuildings';

interface OpenWorldPlazaProps {
  user: User;
  onClose?: () => void;
  /** When set, join a private duo room with this friend */
  playWithFriend?: string;
  /** Join this room immediately (invite / deep link) */
  initialRoomId?: string;
  /** Private invite code when joining via share link */
  inviteCode?: string;
}

const DEFAULT_COLORS = {
  head: '#f4c2a1',
  torso: '#4d536f',
  arm: '#3a3f56',
  legs: '#3a3f56',
};

type RemoteAvatar = {
  group: any;
  limbs: {
    leftArm: any;
    rightArm: any;
    leftLeg: any;
    rightLeg: any;
    head: any;
  };
  anim: 'idle' | 'walk';
  username: string;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSimpleAvatar(THREE: any, colors: typeof DEFAULT_COLORS, scale = 0.55) {
  const characterGroup = new THREE.Group();
  const mat = (hex: string) =>
    new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 0.75, metalness: 0.05 });

  const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), mat(colors.head));
  head.position.set(0, 2.1, 0);
  characterGroup.add(head);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.7, 0.75), mat(colors.torso));
  torso.position.set(0, 0.9, 0);
  characterGroup.add(torso);

  const armH = 1.7;
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, armH, 0.45), mat(colors.arm));
  leftArmMesh.position.set(0, -armH / 2, 0);
  const leftArm = new THREE.Group();
  leftArm.position.set(-1.05, 1.55, 0);
  leftArm.add(leftArmMesh);
  characterGroup.add(leftArm);

  const rightArmMesh = leftArmMesh.clone();
  rightArmMesh.material = mat(colors.arm);
  const rightArm = new THREE.Group();
  rightArm.position.set(1.05, 1.55, 0);
  rightArm.add(rightArmMesh);
  characterGroup.add(rightArm);

  const legH = 1.5;
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, legH, 0.55), mat(colors.legs));
  leftLegMesh.position.set(0, -legH / 2, 0);
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.38, -0.2, 0);
  leftLeg.add(leftLegMesh);
  characterGroup.add(leftLeg);

  const rightLegMesh = leftLegMesh.clone();
  rightLegMesh.material = mat(colors.legs);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.38, -0.2, 0);
  rightLeg.add(rightLegMesh);
  characterGroup.add(rightLeg);

  characterGroup.scale.setScalar(scale);
  return { characterGroup, bodyParts: { head, torso, leftArm, rightArm, leftLeg, rightLeg } };
}

function addTree(THREE: any, scene: any, x: number, z: number, rng: () => number) {
  const trunkH = 2.2 + rng() * 1.4;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.32, trunkH, 8),
    new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 0.95 }),
  );
  trunk.position.set(x, trunkH / 2, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(1.4 + rng() * 0.6, 3.2 + rng() * 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.9 }),
  );
  foliage.position.set(x, trunkH + 1.1, z);
  foliage.castShadow = true;
  scene.add(foliage);
}

function addBench(THREE: any, scene: any, x: number, z: number, yaw: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = yaw;
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.12, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x6b4f3a }),
  );
  seat.position.y = 0.45;
  g.add(seat);
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.55, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x5a4030 }),
  );
  back.position.set(0, 0.75, -0.22);
  g.add(back);
  scene.add(g);
}

function addLamp(THREE: any, scene: any, x: number, z: number) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x333333 }),
  );
  pole.position.set(x, 1.6, z);
  scene.add(pole);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xffe08a, emissiveIntensity: 0.8 }),
  );
  bulb.position.set(x, 3.3, z);
  scene.add(bulb);
  const light = new THREE.PointLight(0xfff0d0, 0.55, 18, 2);
  light.position.set(x, 3.2, z);
  scene.add(light);
}

export default function OpenWorldPlaza({
  user,
  onClose,
  playWithFriend,
  initialRoomId,
  inviteCode,
}: OpenWorldPlazaProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'lobby' | 'playing'>(() =>
    playWithFriend || initialRoomId ? 'playing' : 'lobby',
  );
  const [room, setRoom] = useState(() => {
    if (initialRoomId) return initialRoomId;
    if (playWithFriend) return openWorldRoomForFriends(user.username, playWithFriend);
    return '';
  });
  const [privateDraft, setPrivateDraft] = useState<(PrivateInviteRecord & { url: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [lobbyError, setLobbyError] = useState('');
  const [copied, setCopied] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [chatMessages, setChatMessages] = useState<OpenWorldChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatChannel, setChatChannel] = useState<OpenWorldChatChannel>('server');
  const [status, setStatus] = useState(
    playWithFriend ? `Joining ${playWithFriend}…` : initialRoomId ? 'Joining private server…' : 'Connecting…',
  );
  const [locationLabel, setLocationLabel] = useState('Town Plaza');
  const remotePlayersRef = useRef<OpenWorldPlayerState[]>([]);
  const chatInputFocused = useRef(false);
  const roomRef = useRef(room);
  roomRef.current = room;

  const enterRoom = (nextRoom: string, label: string) => {
    setRoom(nextRoom);
    setStatus(label);
    setPhase('playing');
  };

  const handlePlayGlobal = async () => {
    setBusy(true);
    setLobbyError('');
    try {
      const roomId = await joinBestGlobalRoom();
      enterRoom(roomId, `Global server · max ${GLOBAL_MAX_PLAYERS}`);
    } catch (e) {
      setLobbyError(e instanceof Error ? e.message : 'Could not join global server');
    } finally {
      setBusy(false);
    }
  };

  const handlePrivatePlay = async () => {
    setBusy(true);
    setLobbyError('');
    try {
      const invite = await createPrivateInvite(user.username);
      setPrivateDraft(invite);
    } catch (e) {
      setLobbyError(e instanceof Error ? e.message : 'Could not create private server');
    } finally {
      setBusy(false);
    }
  };

  const handleStartPrivate = async () => {
    if (!privateDraft) return;
    setBusy(true);
    setLobbyError('');
    try {
      await startPrivateServer(privateDraft.code, user.username);
      enterRoom(privateDraft.roomId, `Private · ${privateDraft.code}`);
    } catch (e) {
      setLobbyError(e instanceof Error ? e.message : 'Could not start private server');
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    if (!privateDraft) return;
    try {
      await navigator.clipboard.writeText(privateDraft.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setLobbyError('Copy failed — select the link and copy manually');
    }
  };

  useEffect(() => {
    if (phase !== 'playing' || !room) return;
    const unsub = subscribeOpenWorldPlayers(
      user.username,
      (players) => {
        remotePlayersRef.current = players;
        setOnlineCount(players.length + 1);
        if (playWithFriend) {
          const friendHere = players.some(
            (p) => p.username.toLowerCase() === playWithFriend.toLowerCase(),
          );
          setStatus(
            friendHere
              ? `Playing with ${playWithFriend}`
              : `Waiting for ${playWithFriend} — ask them to Play with you from Games`,
          );
        } else if (inviteCode || room.startsWith('priv_')) {
          setStatus(
            players.length
              ? `Private server · ${players.length + 1} here`
              : 'Private server · waiting for friends with the link',
          );
        } else {
          setStatus(
            players.length
              ? `Global · ${players.length + 1}/${GLOBAL_MAX_PLAYERS} in this server`
              : `Global server · open (max ${GLOBAL_MAX_PLAYERS})`,
          );
        }
      },
      room,
    );
    return unsub;
  }, [user.username, room, playWithFriend, phase, inviteCode]);

  useEffect(() => {
    if (phase !== 'playing' || !room) return;
    const unsub = subscribeOpenWorldChat(setChatMessages, room, chatChannel);
    return unsub;
  }, [room, phase, chatChannel]);

  useEffect(() => {
    return () => {
      if (roomRef.current) leaveOpenWorld(user.username, roomRef.current);
    };
  }, [user.username]);

  useEffect(() => {
    if (phase !== 'playing' || !room || !mountRef.current) return;
    let disposed = false;
    let raf = 0;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      if (disposed || !mountRef.current) return;

      const avatarData = await getUserAvatarData(user);
      if (disposed || !mountRef.current) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x7eb8e8);
      scene.fog = new THREE.Fog(0xa8cce8, 40, 140);

      const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 250);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xfff2d9, 0x4a6b3a, 0.9);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
      sun.position.set(28, 42, 18);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      scene.add(sun);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(220, 220),
        new THREE.MeshStandardMaterial({ color: 0x4f9a4a, roughness: 0.95 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      const plaza = new THREE.Mesh(
        new THREE.CircleGeometry(14, 48),
        new THREE.MeshStandardMaterial({ color: 0xc4b59a, roughness: 0.92 }),
      );
      plaza.rotation.x = -Math.PI / 2;
      plaza.position.y = 0.02;
      plaza.receiveShadow = true;
      scene.add(plaza);

      const pathMat = new THREE.MeshStandardMaterial({ color: 0xb8a888, roughness: 0.94 });
      for (const [px, pz, pw, pd] of [
        [0, 22, 4, 28],
        [0, -22, 4, 28],
        [22, 0, 28, 4],
        [-22, 0, 28, 4],
      ] as const) {
        const path = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.06, pd), pathMat);
        path.position.set(px, 0.03, pz);
        path.receiveShadow = true;
        scene.add(path);
      }

      const rng = mulberry32(42);
      for (let i = 0; i < 48; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = 18 + rng() * 55;
        const tx = Math.cos(angle) * dist;
        const tz = Math.sin(angle) * dist;
        if (Math.hypot(tx, tz) < 16) continue;
        // keep trees clear of building footprints roughly
        if (Math.abs(tx) > 14 && Math.abs(tz) > 12 && Math.abs(tx) < 45 && Math.abs(tz) < 42) {
          if (rng() > 0.45) continue;
        }
        addTree(THREE, scene, tx, tz, rng);
      }

      const buildings: PlazaBuilding[] = buildPlazaBuildings(THREE, scene);
      const allWalls = buildings.flatMap((b) => b.walls);

      addBench(THREE, scene, 6, 10, 0.4);
      addBench(THREE, scene, -7, 9, -0.5);
      addBench(THREE, scene, 5, -8, Math.PI);
      addLamp(THREE, scene, 10, 10);
      addLamp(THREE, scene, -10, 10);
      addLamp(THREE, scene, 10, -10);
      addLamp(THREE, scene, -10, -10);
      addLamp(THREE, scene, 0, 18);
      addLamp(THREE, scene, 0, -18);

      // Fountain centerpiece
      const fountainBase = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.8, 0.5, 24),
        new THREE.MeshStandardMaterial({ color: 0x9aa3ad }),
      );
      fountainBase.position.set(0, 0.25, 0);
      scene.add(fountainBase);
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, 0.2, 24),
        new THREE.MeshStandardMaterial({ color: 0x4aa3d9, transparent: true, opacity: 0.75 }),
      );
      water.position.set(0, 0.55, 0);
      scene.add(water);

      let localColors = { ...DEFAULT_COLORS };
      let characterGroup: any;
      let bodyParts: any;

      if (avatarData.skin) {
        const built = createAvatarMesh(THREE, scene, avatarData.skin, avatarData.face, avatarData.accessories, {
          scale: 0.55,
          position: { x: 0, y: 0, z: 0 },
          animation: 'none',
        });
        characterGroup = built.characterGroup;
        bodyParts = built.bodyParts;
        const c = avatarData.skin.colors || DEFAULT_COLORS;
        localColors = {
          head: c.head || DEFAULT_COLORS.head,
          torso: c.torso || DEFAULT_COLORS.torso,
          arm: c.arm || DEFAULT_COLORS.arm,
          legs: c.legs || DEFAULT_COLORS.legs,
        };
      } else {
        const built = buildSimpleAvatar(THREE, DEFAULT_COLORS);
        characterGroup = built.characterGroup;
        bodyParts = built.bodyParts;
        scene.add(characterGroup);
      }

      // createAvatarMesh already adds to scene; lift so pivoted feet sit on ground
      const footLift = 1.7 * 0.55;
      characterGroup.position.set(4, footLift, 8);
      characterGroup.rotation.y = Math.PI;

      const remoteMap = new Map<string, RemoteAvatar>();

      const ensureRemote = (p: OpenWorldPlayerState) => {
        let remote = remoteMap.get(p.username);
        if (!remote) {
          const built = buildSimpleAvatar(THREE, p.colors);
          scene.add(built.characterGroup);
          // Name label (canvas sprite)
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 64;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(0, 8, 256, 48);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.username.slice(0, 16), 128, 42);
          const tex = new THREE.CanvasTexture(canvas);
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }),
          );
          sprite.scale.set(3.2, 0.8, 1);
          sprite.position.y = 3.2;
          built.characterGroup.add(sprite);
          remote = {
            group: built.characterGroup,
            limbs: built.bodyParts,
            anim: p.anim,
            username: p.username,
          };
          remoteMap.set(p.username, remote);
        }
        return remote;
      };

      const keys = new Set<string>();
      let camYaw = 0;
      let camPitch = 0.38;
      let camZoom = 9.5;
      let dragging = false;
      let lastMx = 0;
      let lastMy = 0;
      let lastPublish = 0;
      let verticalVel = 0;

      const onKeyDown = (ev: KeyboardEvent) => {
        if (chatInputFocused.current) return;
        const k = ev.key.toLowerCase();
        if (['w', 'a', 's', 'd', ' ', 'i', 'o'].includes(k)) ev.preventDefault();
        if (k === 'i') {
          camZoom = Math.max(4, camZoom - 0.6);
          return;
        }
        if (k === 'o') {
          camZoom = Math.min(18, camZoom + 0.6);
          return;
        }
        keys.add(k);
      };
      const onKeyUp = (ev: KeyboardEvent) => {
        keys.delete(ev.key.toLowerCase());
      };
      const onPointerDown = (ev: PointerEvent) => {
        if (ev.button !== 0) return;
        dragging = true;
        lastMx = ev.clientX;
        lastMy = ev.clientY;
        renderer.domElement.setPointerCapture(ev.pointerId);
      };
      const onPointerMove = (ev: PointerEvent) => {
        if (!dragging) return;
        const dx = ev.clientX - lastMx;
        const dy = ev.clientY - lastMy;
        lastMx = ev.clientX;
        lastMy = ev.clientY;
        camYaw -= dx * 0.005;
        camPitch = Math.max(0.12, Math.min(1.2, camPitch - dy * 0.004));
      };
      const onPointerUp = (ev: PointerEvent) => {
        dragging = false;
        try {
          renderer.domElement.releasePointerCapture(ev.pointerId);
        } catch {
          /* ignore */
        }
      };
      const onWheel = (ev: WheelEvent) => {
        camZoom = Math.max(4, Math.min(18, camZoom + ev.deltaY * 0.01));
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

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

      const clock = new THREE.Clock();
      const worldBounds = 85;
      let baseY = footLift;

      const animateFixed = () => {
        if (disposed) return;
        raf = requestAnimationFrame(animateFixed);
        const dt = Math.min(clock.getDelta(), 0.033);
        const t = clock.elapsedTime;

        const turn = 2.6;
        if (keys.has('a')) characterGroup.rotation.y += turn * dt;
        if (keys.has('d')) characterGroup.rotation.y -= turn * dt;

        // W = move forward + walk animation (idle/pose from turntable, no custom shop pose)
        const forward = Number(keys.has('w')) - Number(keys.has('s'));
        const poseAnim: 'idle' | 'walk' = keys.has('w') || keys.has('s') ? 'walk' : 'idle';

        if (forward !== 0) {
          const speed = keys.has('w') ? 6.2 : 4.4;
          const tryX = characterGroup.position.x + Math.sin(characterGroup.rotation.y) * speed * forward * dt;
          const tryZ = characterGroup.position.z + Math.cos(characterGroup.rotation.y) * speed * forward * dt;
          const hit = collideWalls(allWalls, tryX, tryZ, 0.42);
          characterGroup.position.x = Math.max(-worldBounds, Math.min(worldBounds, hit.x));
          characterGroup.position.z = Math.max(-worldBounds, Math.min(worldBounds, hit.z));
        }

        const inside = resolveBuildingAt(buildings, characterGroup.position.x, characterGroup.position.z);
        const nextLabel = inside
          ? inside.kind === 'store'
            ? `🛒 ${inside.name}`
            : inside.kind === 'food'
              ? `🍽 ${inside.name}`
              : `🏠 ${inside.name}`
          : 'Town Plaza';
        setLocationLabel((prev) => (prev === nextLabel ? prev : nextLabel));

        const grounded = baseY <= footLift + 0.001;
        if (keys.has(' ') && grounded) verticalVel = 6.2;
        verticalVel -= 18 * dt;
        baseY = Math.max(footLift, baseY + verticalVel * dt);
        if (baseY <= footLift) verticalVel = 0;

        applyAvatarPose(poseAnim, t, {
          leftArm: bodyParts.leftArm,
          rightArm: bodyParts.rightArm,
          leftLeg: bodyParts.leftLeg,
          rightLeg: bodyParts.rightLeg,
          head: bodyParts.head,
          character: { position: { y: 0, x: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
        });
        const bob = poseAnim === 'walk' ? Math.abs(Math.sin(t * 4)) * 0.08 : 0;
        characterGroup.position.y = baseY + bob;

        // Sync remotes
        const seen = new Set<string>();
        for (const p of remotePlayersRef.current) {
          seen.add(p.username);
          const remote = ensureRemote(p);
          remote.anim = p.anim;
          remote.group.position.x += (p.x - remote.group.position.x) * Math.min(1, dt * 8);
          remote.group.position.z += (p.z - remote.group.position.z) * Math.min(1, dt * 8);
          remote.group.rotation.y = p.rotY;
          applyAvatarPose(p.anim, t, {
            leftArm: remote.limbs.leftArm,
            rightArm: remote.limbs.rightArm,
            leftLeg: remote.limbs.leftLeg,
            rightLeg: remote.limbs.rightLeg,
            head: remote.limbs.head,
            character: { position: { y: 0, x: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
          });
          const rBob = p.anim === 'walk' ? Math.abs(Math.sin(t * 4)) * 0.08 : 0;
          remote.group.position.y = (typeof p.y === 'number' ? p.y : footLift) + rBob;
        }
        for (const [name, remote] of remoteMap) {
          if (!seen.has(name)) {
            scene.remove(remote.group);
            remoteMap.delete(name);
          }
        }

        // Camera follow
        const px = characterGroup.position.x;
        const pz = characterGroup.position.z;
        const face = characterGroup.rotation.y + camYaw;
        camera.position.set(
          px - Math.sin(face) * camZoom,
          baseY + 2.4 + Math.sin(camPitch) * camZoom * 0.55,
          pz - Math.cos(face) * camZoom,
        );
        camera.lookAt(px, baseY + 1.6, pz);

        const now = performance.now();
        if (now - lastPublish > 100) {
          lastPublish = now;
          publishOpenWorldPlayer({
            username: user.username,
            x: characterGroup.position.x,
            y: baseY,
            z: characterGroup.position.z,
            rotY: characterGroup.rotation.y,
            anim: poseAnim,
            colors: localColors,
            room: roomRef.current,
          }).catch(() => {});
        }

        renderer.render(scene, camera);
      };

      animateFixed();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('wheel', onWheel);
        renderer.dispose();
        if (mountRef.current) mountRef.current.innerHTML = '';
        leaveOpenWorld(user.username, roomRef.current);
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [user, room, phase]);

  const handleSend = async () => {
    const raw = chatInput.trim();
    if (!raw || !room) return;
    setChatInput('');
    const filtered = await filterForDisplay(raw);
    await sendOpenWorldChat(user.username, filtered, room, chatChannel);
  };

  if (phase === 'lobby') {
    return (
      <div
        style={{
          width: '100%',
          minHeight: 420,
          borderRadius: 12,
          padding: 24,
          background: 'linear-gradient(160deg, #14201a 0%, #0c1418 60%, #1a1020 100%)',
          color: '#e8f5e9',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Open World Plaza</div>
            <div style={{ opacity: 0.8, marginTop: 6, maxWidth: 520, lineHeight: 1.45 }}>
              Join a public town (max {GLOBAL_MAX_PLAYERS} per server) or create a private invite link for friends
              only.
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 14px',
                background: '#00a2ff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePlayGlobal()}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              border: 'none',
              background: '#22c55e',
              color: '#052e16',
              fontWeight: 800,
              fontSize: 15,
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            {busy && !privateDraft ? 'Finding server…' : 'Play'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePrivatePlay()}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#e8f5e9',
              fontWeight: 700,
              fontSize: 15,
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            Private Play
          </button>
        </div>

        {lobbyError ? <div style={{ color: '#f87171', fontSize: 13 }}>{lobbyError}</div> : null}

        {privateDraft ? (
          <div
            style={{
              marginTop: 4,
              padding: 16,
              borderRadius: 12,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxWidth: 640,
            }}
          >
            <div style={{ fontWeight: 700 }}>Private server ready</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Share this secret link. Only people with it can join. Then press Start Server.
            </div>
            <code
              style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: 8,
                background: '#0a0f12',
                fontSize: 12,
                wordBreak: 'break-all',
                color: '#7dd3fc',
              }}
            >
              {privateDraft.url}
            </code>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#38bdf8',
                  color: '#082f49',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleStartPrivate()}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#22c55e',
                  color: '#052e16',
                  fontWeight: 800,
                  cursor: busy ? 'wait' : 'pointer',
                }}
              >
                Start Server
              </button>
              <button
                type="button"
                onClick={() => setPrivateDraft(null)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>
              Format: pixelplaceofficial.com/open-world/invite/{privateDraft.code}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'min(78vh, 720px)',
        minHeight: 420,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#1a2a1a',
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(12,20,16,0.72)',
            color: '#e8f5e9',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 13,
            maxWidth: 340,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            {playWithFriend
              ? `Open World · with ${playWithFriend}`
              : room.startsWith('priv_')
                ? 'Open World · Private'
                : 'Open World · Global'}
          </div>
          <div style={{ opacity: 0.9 }}>{status}</div>
          <div style={{ marginTop: 4, fontWeight: 600, color: '#bbf7d0' }}>{locationLabel}</div>
          <div style={{ opacity: 0.7, marginTop: 4, fontSize: 12 }}>
            WASD move · walk into open doorways · Space jump · drag look · I/O zoom
          </div>
          {inviteCode || privateDraft ? (
            <div style={{ opacity: 0.65, marginTop: 4, fontSize: 11, wordBreak: 'break-all' }}>
              {invitePublicUrl(inviteCode || privateDraft?.code || '')}
            </div>
          ) : null}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              pointerEvents: 'auto',
              padding: '8px 14px',
              background: '#00a2ff',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              height: 'fit-content',
            }}
          >
            ← Back
          </button>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          width: 'min(340px, calc(100% - 24px))',
          background: 'rgba(10,16,14,0.82)',
          borderRadius: 10,
          padding: 10,
          color: '#eef7f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxHeight: 220,
        }}
      >
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setChatChannel('everywhere')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: 6,
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              background: chatChannel === 'everywhere' ? '#38bdf8' : 'rgba(255,255,255,0.08)',
              color: chatChannel === 'everywhere' ? '#082f49' : '#cbd5e1',
            }}
          >
            Everywhere
          </button>
          <button
            type="button"
            onClick={() => setChatChannel('server')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: 6,
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              background: chatChannel === 'server' ? '#22c55e' : 'rgba(255,255,255,0.08)',
              color: chatChannel === 'server' ? '#052e16' : '#cbd5e1',
            }}
          >
            Server Only
          </button>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>
          {chatChannel === 'everywhere' ? 'Everywhere chat' : `Server chat · ${onlineCount} here`}
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            fontSize: 12,
            lineHeight: 1.35,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minHeight: 80,
          }}
        >
          {chatMessages.length === 0 && (
            <div style={{ opacity: 0.55 }}>
              {chatChannel === 'everywhere'
                ? 'Talk to everyone in Open World across all servers.'
                : playWithFriend || room.startsWith('priv_')
                  ? 'Only people on this private server see this.'
                  : 'Only people on this global server see this.'}
            </div>
          )}
          {chatMessages.map((m) => (
            <div key={m.id}>
              <span style={{ color: chatChannel === 'everywhere' ? '#38bdf8' : '#7dd3fc', fontWeight: 600 }}>
                {m.username}
              </span>
              <span style={{ opacity: 0.9 }}>: {m.text}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => {
              chatInputFocused.current = true;
            }}
            onBlur={() => {
              chatInputFocused.current = false;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={chatChannel === 'everywhere' ? 'Message everyone…' : 'Message this server…'}
            maxLength={200}
            style={{
              flex: 1,
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.35)',
              color: '#fff',
              padding: '8px 10px',
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              background: chatChannel === 'everywhere' ? '#38bdf8' : '#22c55e',
              color: chatChannel === 'everywhere' ? '#082f49' : '#052e16',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
