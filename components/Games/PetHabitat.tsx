'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import {
  ANIMALS,
  FOOD_ITEMS,
  GEAR_ITEMS,
  HABITATS,
  HEALTHY_COIN_AMOUNT,
  HEALTHY_COIN_INTERVAL_MS,
  animalsForHabitat,
  getAnimal,
  getHabitat,
  getShopItem,
  type HabitatId,
} from '@/lib/petHabitatData';
import { animatePet, buildPetMesh, type PetLimbSet } from '@/lib/petHabitatAnimals';
import {
  PET_HABITAT_MAX_PLAYERS,
  applyOfflineDecay,
  createPetPrivateInvite,
  isPetNeglected,
  joinBestPetHabitatRoom,
  leavePetHabitat,
  loadPetSave,
  petInvitePublicUrl,
  petRoomForFriends,
  publishPetPlayer,
  savePetSave,
  startPetPrivateServer,
  subscribePetPlayers,
  type PetPlayerState,
  type PetPrivateInvite,
  type PetSaveState,
} from '@/lib/petHabitatRtdb';

interface PetHabitatProps {
  user: User;
  onClose?: () => void;
  playWithFriend?: string;
  initialRoomId?: string;
  inviteCode?: string;
}

type Phase = 'lobby' | 'setup' | 'playing';
type ShopTab = 'food' | 'gear' | null;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function PetHabitat({
  user,
  onClose,
  playWithFriend,
  initialRoomId,
  inviteCode,
}: PetHabitatProps) {
  const { updateUser } = useUser();
  const userRef = useRef(user);
  userRef.current = user;
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(() =>
    playWithFriend || initialRoomId ? 'setup' : 'lobby',
  );
  const [room, setRoom] = useState(() => {
    if (initialRoomId) return initialRoomId;
    if (playWithFriend) return petRoomForFriends(user.username, playWithFriend);
    return '';
  });
  const [privateDraft, setPrivateDraft] = useState<(PetPrivateInvite & { url: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('Choose a habitat for your pet');
  const [onlineCount, setOnlineCount] = useState(1);
  const [shop, setShop] = useState<ShopTab>(null);
  const [toast, setToast] = useState('');

  const [habitat, setHabitat] = useState<HabitatId>('plains');
  const [animalId, setAnimalId] = useState('rabbit');
  const [pet, setPet] = useState<PetSaveState | null>(null);
  const petRef = useRef<PetSaveState | null>(null);
  petRef.current = pet;

  const remotesRef = useRef<PetPlayerState[]>([]);
  const roomRef = useRef(room);
  roomRef.current = room;
  const keysRef = useRef(new Set<string>());

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  };

  const persistPet = useCallback(
    async (next: PetSaveState) => {
      setPet(next);
      petRef.current = next;
      await savePetSave(next);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const saved = await loadPetSave(user.username);
      if (cancelled || !saved) return;
      if (isPetNeglected(saved)) {
        setError('Your pet was neglected for too long and is gone. Adopt a new friend.');
        return;
      }
      const decayed = applyOfflineDecay(saved);
      setPet(decayed);
      setHabitat(decayed.habitat);
      setAnimalId(decayed.animalId);
      if (playWithFriend || initialRoomId) {
        setPhase('playing');
        setStatus('Welcome back — your pet returned with you');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.username, playWithFriend, initialRoomId]);

  const enterPlaying = (nextRoom: string, label: string) => {
    setRoom(nextRoom);
    setStatus(label);
    setPhase('playing');
  };

  const handlePlayGlobal = async () => {
    setBusy(true);
    setError('');
    try {
      if (pet && !isPetNeglected(pet)) {
        const roomId = await joinBestPetHabitatRoom();
        enterPlaying(roomId, `Public habitat · max ${PET_HABITAT_MAX_PLAYERS}`);
      } else {
        setPhase('setup');
        setStatus('Pick a habitat and animal, then Play');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join');
    } finally {
      setBusy(false);
    }
  };

  const handlePrivatePlay = async () => {
    setBusy(true);
    setError('');
    try {
      const invite = await createPetPrivateInvite(user.username);
      setPrivateDraft(invite);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create invite');
    } finally {
      setBusy(false);
    }
  };

  const handleStartPrivate = async () => {
    if (!privateDraft) return;
    setBusy(true);
    setError('');
    try {
      await startPetPrivateServer(privateDraft.code, user.username);
      if (!pet) {
        setRoom(privateDraft.roomId);
        setPhase('setup');
        setStatus('Adopt a pet, then you will join your private habitat');
      } else {
        enterPlaying(privateDraft.roomId, `Private · ${privateDraft.code}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start');
    } finally {
      setBusy(false);
    }
  };

  const handleAdopt = async () => {
    const animal = getAnimal(animalId);
    if (!animal || animal.habitat !== habitat) {
      setError('Pick an animal from this habitat');
      return;
    }
    const now = Date.now();
    const next: PetSaveState = {
      username: user.username,
      habitat,
      animalId,
      hunger: 85,
      health: 95,
      gear: [],
      lastCareAt: now,
      createdAt: now,
      neglectDeadline: now + 365 * 24 * 60 * 60 * 1000,
      coinsEarnedLifetime: 0,
      updatedAt: now,
    };
    await persistPet(next);
    const roomId =
      room ||
      (playWithFriend
        ? petRoomForFriends(user.username, playWithFriend)
        : privateDraft?.roomId || (await joinBestPetHabitatRoom()));
    enterPlaying(roomId, `${getHabitat(habitat).name} · ${animal.name}`);
  };

  const spendCoins = async (cost: number): Promise<boolean> => {
    if (user.coins < cost) {
      showToast('Not enough Pixel Coins');
      return false;
    }
    await updateUser({ coins: user.coins - cost });
    return true;
  };

  const buyItem = async (itemId: string) => {
    const item = getShopItem(itemId);
    const cur = petRef.current;
    if (!item || !cur) return;
    const ok = await spendCoins(item.cost);
    if (!ok) return;
    const now = Date.now();
    if (item.kind === 'food') {
      const next: PetSaveState = {
        ...cur,
        hunger: clamp(cur.hunger + (item.hunger || 0), 0, 100),
        health: clamp(cur.health + (item.health || 0), 0, 100),
        lastCareAt: now,
        neglectDeadline: now + 365 * 24 * 60 * 60 * 1000,
        updatedAt: now,
      };
      await persistPet(next);
      showToast(`Fed ${item.name}`);
    } else {
      const gear = cur.gear.includes(itemId) ? cur.gear : [...cur.gear, itemId].slice(0, 8);
      const next: PetSaveState = { ...cur, gear, lastCareAt: now, updatedAt: now };
      await persistPet(next);
      showToast(`Got ${item.name}`);
    }
  };

  useEffect(() => {
    if (phase !== 'playing' || !room) return;
    return subscribePetPlayers(
      user.username,
      (players) => {
        remotesRef.current = players;
        setOnlineCount(players.length + 1);
        setStatus(
          room.startsWith('pet_priv') || room.startsWith('pet_duo')
            ? `Private habitat · ${players.length + 1} here`
            : `Public · ${players.length + 1}/${PET_HABITAT_MAX_PLAYERS}`,
        );
      },
      room,
    );
  }, [phase, room, user.username]);

  // Healthy coin drip while playing
  useEffect(() => {
    if (phase !== 'playing' || !pet) return;
    const id = window.setInterval(() => {
      const cur = petRef.current;
      if (!cur) return;
      if (cur.health < 60 || cur.hunger < 40) return;
      void (async () => {
        await updateUser({ coins: (userRef.current.coins || 0) + HEALTHY_COIN_AMOUNT });
        const next = {
          ...cur,
          coinsEarnedLifetime: cur.coinsEarnedLifetime + HEALTHY_COIN_AMOUNT,
          updatedAt: Date.now(),
        };
        await persistPet(next);
        showToast(`+${HEALTHY_COIN_AMOUNT} coins — pet is thriving`);
      })();
    }, HEALTHY_COIN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase, pet?.animalId, updateUser, persistPet]);

  // Slow hunger drain while online
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      const cur = petRef.current;
      if (!cur) return;
      const next = {
        ...cur,
        hunger: clamp(cur.hunger - 1.2, 0, 100),
        health: clamp(cur.health - (cur.hunger < 25 ? 0.8 : 0.15), 5, 100),
        updatedAt: Date.now(),
      };
      void persistPet(next);
    }, 45_000);
    return () => clearInterval(id);
  }, [phase, persistPet]);

  useEffect(() => {
    return () => {
      if (roomRef.current) void leavePetHabitat(user.username, roomRef.current);
    };
  }, [user.username]);

  // 3D scene
  useEffect(() => {
    if (phase !== 'playing' || !room || !pet || !mountRef.current) return;
    let disposed = false;
    let raf = 0;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      if (disposed || !mountRef.current) return;

      const hab = getHabitat(pet.habitat);
      const animal = getAnimal(pet.animalId) || ANIMALS[0]!;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(hab.sky);
      scene.fog = new THREE.Fog(hab.fog, 28, 90);

      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xfff5e6, 0x445566, 0.95));
      const sun = new THREE.DirectionalLight(0xfff2d0, 1.1);
      sun.position.set(20, 30, 12);
      scene.add(sun);

      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(40, 48),
        new THREE.MeshStandardMaterial({ color: hab.ground, roughness: 0.95 }),
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // Habitat props
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2;
        const dist = 10 + (i % 5) * 3.5;
        const px = Math.cos(ang) * dist;
        const pz = Math.sin(ang) * dist;
        if (hab.id === 'forest' || hab.id === 'plains') {
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.28, 2.2, 6),
            new THREE.MeshStandardMaterial({ color: 0x5c4030 }),
          );
          trunk.position.set(px, 1.1, pz);
          scene.add(trunk);
          const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(1.1, 2.4, 7),
            new THREE.MeshStandardMaterial({ color: hab.id === 'forest' ? 0x2f6b32 : 0x7cb342 }),
          );
          leaves.position.set(px, 2.8, pz);
          scene.add(leaves);
        } else if (hab.id === 'desert') {
          const dune = new THREE.Mesh(
            new THREE.SphereGeometry(1.2 + (i % 3) * 0.3, 8, 6),
            new THREE.MeshStandardMaterial({ color: hab.accent }),
          );
          dune.position.set(px, 0.2, pz);
          dune.scale.y = 0.35;
          scene.add(dune);
        } else if (hab.id === 'arctic') {
          const ice = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.7 + (i % 3) * 0.4, 1.2),
            new THREE.MeshStandardMaterial({ color: 0xdce8f2, roughness: 0.55 }),
          );
          ice.position.set(px, 0.35, pz);
          scene.add(ice);
        } else {
          const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.5 + (i % 3) * 0.2),
            new THREE.MeshStandardMaterial({ color: 0x8a9aaa }),
          );
          rock.position.set(px, 0.35, pz);
          scene.add(rock);
        }
      }

      // Shop pads
      const foodPad = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 0.12, 20),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b }),
      );
      foodPad.position.set(8, 0.06, 0);
      scene.add(foodPad);
      const gearPad = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 0.12, 20),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8 }),
      );
      gearPad.position.set(-8, 0.06, 0);
      scene.add(gearPad);

      const localPet = buildPetMesh(THREE, {
        kind: animal.kind,
        colors: animal.colors,
        scale: 0.9,
      });
      localPet.group.position.set(0, 0, 0);
      scene.add(localPet.group);

      type RemotePet = { group: any; limbs: PetLimbSet; kind: typeof animal.kind; animalId: string };
      const remoteMap = new Map<string, RemotePet>();

      const ensureRemote = (p: PetPlayerState) => {
        let remote = remoteMap.get(p.username);
        const def = getAnimal(p.animalId);
        if (!remote || remote.animalId !== p.animalId) {
          if (remote) scene.remove(remote.group);
          const built = buildPetMesh(THREE, {
            kind: def?.kind || 'quad',
            colors: def?.colors || { primary: '#888', secondary: '#666', accent: '#444' },
            scale: 0.85,
          });
          scene.add(built.group);
          remote = {
            group: built.group,
            limbs: built,
            kind: def?.kind || 'quad',
            animalId: p.animalId,
          };
          remoteMap.set(p.username, remote);
        }
        return remote;
      };

      const keys = keysRef.current;
      let camYaw = 0.4;
      let camPitch = 0.42;
      let camZoom = 8;
      let dragging = false;
      let lastMx = 0;
      let lastMy = 0;
      let lastPublish = 0;
      let publishBusy = false;
      let lastNearShop: ShopTab = null;

      const onKeyDown = (ev: KeyboardEvent) => {
        const k = ev.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(k)) {
          ev.preventDefault();
          keys.add(k);
        }
      };
      const onKeyUp = (ev: KeyboardEvent) => keys.delete(ev.key.toLowerCase());
      const onPointerDown = (ev: PointerEvent) => {
        if (ev.button !== 0) return;
        dragging = true;
        lastMx = ev.clientX;
        lastMy = ev.clientY;
        renderer.domElement.setPointerCapture(ev.pointerId);
      };
      const onPointerMove = (ev: PointerEvent) => {
        if (!dragging) return;
        camYaw -= (ev.clientX - lastMx) * 0.005;
        camPitch = clamp(camPitch - (ev.clientY - lastMy) * 0.004, 0.15, 1.1);
        lastMx = ev.clientX;
        lastMy = ev.clientY;
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
        camZoom = clamp(camZoom + ev.deltaY * 0.01, 4, 16);
      };
      const onResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('resize', onResize);
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
      onResize();

      const clock = new THREE.Clock();

      const animate = () => {
        if (disposed) return;
        raf = requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.033);
        const t = clock.elapsedTime;
        const curPet = petRef.current;
        if (!curPet) {
          renderer.render(scene, camera);
          return;
        }

        if (keys.has('a')) localPet.group.rotation.y += 2.4 * dt;
        if (keys.has('d')) localPet.group.rotation.y -= 2.4 * dt;
        const forward = Number(keys.has('w')) - Number(keys.has('s'));
        const anim: 'idle' | 'walk' = forward !== 0 ? 'walk' : 'idle';
        if (forward !== 0) {
          const speed = 5.5;
          localPet.group.position.x += Math.sin(localPet.group.rotation.y) * speed * forward * dt;
          localPet.group.position.z += Math.cos(localPet.group.rotation.y) * speed * forward * dt;
          localPet.group.position.x = clamp(localPet.group.position.x, -34, 34);
          localPet.group.position.z = clamp(localPet.group.position.z, -34, 34);
        }
        animatePet(localPet, anim, t, animal.kind);

        // Shop proximity
        const lx = localPet.group.position.x;
        const lz = localPet.group.position.z;
        const nearFood = Math.hypot(lx - 8, lz) < 2.8;
        const nearGear = Math.hypot(lx + 8, lz) < 2.8;
        const near: ShopTab = nearFood ? 'food' : nearGear ? 'gear' : null;
        if (near !== lastNearShop) {
          lastNearShop = near;
          setShop(near);
        }

        const seen = new Set<string>();
        const follow = Math.min(1, dt * 10);
        for (const p of remotesRef.current) {
          seen.add(p.username);
          const remote = ensureRemote(p);
          remote.group.position.x += (p.x - remote.group.position.x) * follow;
          remote.group.position.z += (p.z - remote.group.position.z) * follow;
          remote.group.rotation.y += (p.rotY - remote.group.rotation.y) * follow;
          animatePet(remote.limbs, p.anim, t, remote.kind);
        }
        for (const [name, remote] of remoteMap) {
          if (!seen.has(name)) {
            scene.remove(remote.group);
            remoteMap.delete(name);
          }
        }

        const face = localPet.group.rotation.y + camYaw;
        camera.position.set(
          lx - Math.sin(face) * camZoom,
          2.2 + Math.sin(camPitch) * camZoom * 0.45,
          lz - Math.cos(face) * camZoom,
        );
        camera.lookAt(lx, 1.1, lz);

        const now = performance.now();
        if (!publishBusy && now - lastPublish > 180) {
          lastPublish = now;
          publishBusy = true;
          publishPetPlayer({
            username: user.username,
            habitat: curPet.habitat,
            animalId: curPet.animalId,
            x: lx,
            y: 0,
            z: lz,
            rotY: localPet.group.rotation.y,
            anim,
            hunger: curPet.hunger,
            health: curPet.health,
            gear: curPet.gear,
            room: roomRef.current,
          })
            .catch(() => {})
            .finally(() => {
              publishBusy = false;
            });
        }

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        if (mountRef.current) mountRef.current.innerHTML = '';
        void leavePetHabitat(user.username, roomRef.current);
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [phase, room, pet?.animalId, pet?.habitat, user.username]);

  const animalChoices = animalsForHabitat(habitat);
  const animal = getAnimal(pet?.animalId || animalId);

  if (phase === 'lobby' || phase === 'setup') {
    return (
      <div
        style={{
          width: '100%',
          minHeight: 460,
          borderRadius: 12,
          padding: 24,
          background: 'linear-gradient(160deg, #1a2a22 0%, #0e1618 55%, #1a1520 100%)',
          color: '#e8f5e9',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Pet Habitat</div>
            <div style={{ opacity: 0.8, marginTop: 6, maxWidth: 520, lineHeight: 1.45 }}>
              Choose a habitat, adopt an animal, walk them around, shop for food & gear, and meet
              friends in public or private worlds. Pets are saved offline and only appear when you
              join — they only vanish for good after about a year of neglect.
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
                height: 'fit-content',
              }}
            >
              ← Back
            </button>
          )}
        </div>

        {error ? <div style={{ color: '#fca5a5' }}>{error}</div> : null}
        <div style={{ opacity: 0.75, fontSize: 13 }}>{status}</div>

        {phase === 'lobby' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
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
                cursor: 'pointer',
              }}
            >
              {pet ? 'Play' : 'Play — adopt first'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePrivatePlay()}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: '#38bdf8',
                color: '#082f49',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Private Play
            </button>
            {pet ? (
              <button
                type="button"
                onClick={() => setPhase('setup')}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  color: '#e2e8f0',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Change pet
              </button>
            ) : null}
          </div>
        )}

        {privateDraft ? (
          <div
            style={{
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 700 }}>Private invite</div>
            <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{privateDraft.url}</code>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(privateDraft.url);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  } catch {
                    setError('Copy failed');
                  }
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#64748b',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleStartPrivate()}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#22c55e',
                  color: '#052e16',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Start Server
              </button>
            </div>
          </div>
        ) : null}

        {(phase === 'setup' || !pet) && (
          <>
            <div style={{ fontWeight: 700 }}>Habitat</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {HABITATS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setHabitat(h.id);
                    const first = animalsForHabitat(h.id)[0];
                    if (first) setAnimalId(first.id);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: habitat === h.id ? '2px solid #86efac' : '1px solid rgba(255,255,255,0.12)',
                    background: habitat === h.id ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                    color: '#e8f5e9',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minWidth: 120,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{h.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{h.blurb}</div>
                </button>
              ))}
            </div>
            <div style={{ fontWeight: 700 }}>Animals</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
              {animalChoices.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAnimalId(a.id)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: animalId === a.id ? '2px solid #7dd3fc' : '1px solid rgba(255,255,255,0.1)',
                    background: animalId === a.id ? 'rgba(56,189,248,0.18)' : 'rgba(0,0,0,0.25)',
                    color: '#e8f5e9',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      height: 36,
                      borderRadius: 8,
                      marginBottom: 8,
                      background: `linear-gradient(135deg, ${a.colors.primary}, ${a.colors.secondary})`,
                    }}
                  />
                  <div style={{ fontWeight: 800 }}>{a.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{a.blurb}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleAdopt()}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: '#a78bfa',
                color: '#1e1b4b',
                fontWeight: 800,
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Adopt & enter
            </button>
          </>
        )}
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
        background: '#132018',
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
            background: 'rgba(10,18,14,0.82)',
            color: '#e8f5e9',
            padding: '10px 12px',
            borderRadius: 10,
            fontSize: 13,
            maxWidth: 360,
          }}
        >
          <div style={{ fontWeight: 800 }}>
            {animal?.name || 'Pet'} · {getHabitat(pet?.habitat || habitat).name}
          </div>
          <div style={{ opacity: 0.85, marginTop: 2 }}>{status}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, fontSize: 12 }}>
            <span>♥ {Math.round(pet?.health || 0)}</span>
            <span>🍽 {Math.round(pet?.hunger || 0)}</span>
            <span>🪙 {user.coins}</span>
            <span>{onlineCount} online</span>
          </div>
          <div style={{ opacity: 0.65, marginTop: 6, fontSize: 11 }}>
            WASD move · drag look · walk onto orange Food / blue Gear pads
          </div>
          {inviteCode || privateDraft ? (
            <div style={{ opacity: 0.6, marginTop: 4, fontSize: 10, wordBreak: 'break-all' }}>
              {petInvitePublicUrl(inviteCode || privateDraft?.code || '')}
            </div>
          ) : null}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={() => {
              void leavePetHabitat(user.username, room);
              onClose();
            }}
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

      {toast ? (
        <div
          style={{
            position: 'absolute',
            top: 90,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15,23,42,0.9)',
            color: '#fde68a',
            padding: '8px 14px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            zIndex: 5,
          }}
        >
          {toast}
        </div>
      ) : null}

      {shop && (
        <div
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            width: 'min(300px, calc(100% - 24px))',
            background: 'rgba(8,14,12,0.92)',
            borderRadius: 12,
            padding: 12,
            color: '#eef7f0',
            zIndex: 5,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            {shop === 'food' ? 'Food Shop' : 'Gear Shop'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
            {(shop === 'food' ? FOOD_ITEMS : GEAR_ITEMS).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void buyItem(item.id)}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {item.name} · {item.cost}🪙
                </div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{item.blurb}</div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShop(null)}
            style={{
              marginTop: 8,
              width: '100%',
              padding: 8,
              borderRadius: 8,
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
