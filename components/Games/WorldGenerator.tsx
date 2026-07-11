'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { User } from '@/types';
import { apiUrl, resolveClientApiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch } from '@/lib/api';

interface WorldGeneratorProps {
  user: User;
  onClose?: () => void;
}

type CloudStatus = {
  ok: boolean;
  provider: 'lingbot' | 'fal' | 'veo' | 'hf' | 'none';
  ready: boolean;
  message: string;
};

type JobPublic = {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  provider: string;
  prompt: string;
  videoUrl: string | null;
  error: string | null;
};

type Biome =
  | 'meadow'
  | 'forest'
  | 'desert'
  | 'snow'
  | 'ocean'
  | 'cyber'
  | 'volcanic'
  | 'ruins'
  | 'space';

const PRESETS = [
  'A serene lakeside with a lone tree in calm water, snow-capped mountains under drifting clouds',
  'Neon cyberpunk alley at night, rain-soaked streets, hovering neon signs, camera slowly drifts forward',
  'Sunlit fantasy jungle path toward an ancient stone temple, birds, mist between giant trees',
  'Endless desert dunes at sunset with a sandstone arch and heat shimmer',
  'Frozen fjord with ice spires, aurora overhead, and a wooden cabin on the shore',
];

function hash32(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function detectBiome(prompt: string): Biome {
  const p = prompt.toLowerCase();
  if (/cyber|neon|city|alley|rain-soaked|futur/.test(p)) return 'cyber';
  if (/desert|dune|sand|canyon|oasis/.test(p)) return 'desert';
  if (/snow|ice|frozen|fjord|aurora|arctic/.test(p)) return 'snow';
  if (/ocean|sea|island|beach|reef|underwater/.test(p)) return 'ocean';
  if (/lava|volcan|magma|ash/.test(p)) return 'volcanic';
  if (/ruin|temple|castle|ancient|gothic/.test(p)) return 'ruins';
  if (/space|planet|asteroid|orbit|starfield/.test(p)) return 'space';
  if (/jungle|forest|tree|woods/.test(p)) return 'forest';
  return 'meadow';
}

async function readApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) throw new Error(`Empty response (${res.status})`);
  if (trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE')) {
    throw new Error(
      `API returned a web page instead of JSON (${res.status}). Try again, or the Cloud Function route may be down.`,
    );
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(`Invalid JSON from API (${res.status}): ${trimmed.slice(0, 120)}`);
  }
}

async function worldApi(path: string, init?: RequestInit): Promise<Response> {
  const primary = await authenticatedFetch(apiUrl(path), init);
  const ctype = primary.headers.get('content-type') || '';
  if (ctype.includes('application/json') || primary.status === 401 || primary.status === 403) {
    return primary;
  }
  // Hosting sometimes serves SPA HTML if the rewrite misses — fall back to the function URL
  const peek = await primary.clone().text();
  if (peek.trim().startsWith('<')) {
    return authenticatedFetch(resolveClientApiUrl(path.replace(/^\/api/, '')), init);
  }
  return primary;
}

function biomePalette(biome: Biome, hue: number) {
  switch (biome) {
    case 'desert':
      return {
        sky: `hsl(${35 + (hue % 20)}, 70%, 68%)`,
        fog: `hsl(32, 55%, 72%)`,
        ground: `hsl(38, 55%, 42%)`,
        accent: `hsl(22, 60%, 38%)`,
        water: `hsl(190, 45%, 42%)`,
      };
    case 'snow':
      return {
        sky: `hsl(${210 + (hue % 30)}, 45%, 72%)`,
        fog: `hsl(210, 30%, 82%)`,
        ground: `hsl(210, 15%, 88%)`,
        accent: `hsl(200, 25%, 55%)`,
        water: `hsl(200, 40%, 55%)`,
      };
    case 'ocean':
      return {
        sky: `hsl(${195 + (hue % 25)}, 65%, 62%)`,
        fog: `hsl(195, 50%, 70%)`,
        ground: `hsl(40, 45%, 48%)`,
        accent: `hsl(160, 40%, 35%)`,
        water: `hsl(200, 70%, 42%)`,
      };
    case 'cyber':
      return {
        sky: `hsl(${265 + (hue % 40)}, 55%, 18%)`,
        fog: `hsl(280, 40%, 22%)`,
        ground: `hsl(230, 20%, 14%)`,
        accent: `hsl(${180 + (hue % 40)}, 90%, 55%)`,
        water: `hsl(190, 80%, 35%)`,
      };
    case 'volcanic':
      return {
        sky: `hsl(${15 + (hue % 15)}, 55%, 28%)`,
        fog: `hsl(10, 40%, 22%)`,
        ground: `hsl(20, 20%, 16%)`,
        accent: `hsl(12, 90%, 45%)`,
        water: `hsl(15, 85%, 40%)`,
      };
    case 'ruins':
      return {
        sky: `hsl(${45 + (hue % 20)}, 35%, 58%)`,
        fog: `hsl(40, 25%, 65%)`,
        ground: `hsl(35, 25%, 32%)`,
        accent: `hsl(30, 15%, 48%)`,
        water: `hsl(185, 35%, 40%)`,
      };
    case 'space':
      return {
        sky: `hsl(${240 + (hue % 40)}, 40%, 8%)`,
        fog: `hsl(250, 30%, 12%)`,
        ground: `hsl(230, 10%, 22%)`,
        accent: `hsl(${280 + (hue % 50)}, 80%, 60%)`,
        water: `hsl(260, 50%, 30%)`,
      };
    case 'forest':
      return {
        sky: `hsl(${110 + (hue % 25)}, 45%, 55%)`,
        fog: `hsl(110, 30%, 62%)`,
        ground: `hsl(95, 35%, 28%)`,
        accent: `hsl(125, 45%, 28%)`,
        water: `hsl(185, 45%, 38%)`,
      };
    default:
      return {
        sky: `hsl(${hue}, 42%, 62%)`,
        fog: `hsl(${hue}, 35%, 70%)`,
        ground: `hsl(${(hue + 90) % 360}, 38%, 34%)`,
        accent: `hsl(${(hue + 110) % 360}, 45%, 28%)`,
        water: `hsl(${(hue + 180) % 360}, 55%, 48%)`,
      };
  }
}

export default function WorldGenerator({ user, onClose }: WorldGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [cloud, setCloud] = useState<CloudStatus | null>(null);
  const [job, setJob] = useState<JobPublic | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sketchSeed, setSketchSeed] = useState('meadow starter');

  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const waterRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await worldApi('/api/world-generator/status');
        const data = await readApiJson<CloudStatus>(res);
        if (!cancelled) setCloud(data);
      } catch (e) {
        if (!cancelled) {
          setCloud({
            ok: false,
            provider: 'none',
            ready: false,
            message: e instanceof Error ? e.message : 'Could not reach world-generator status.',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Prompt-driven world sketch (not a single fixed diorama)
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const seed = hash32(sketchSeed);
    const rand = mulberry32(seed);
    const biome = detectBiome(sketchSeed);
    const hue = seed % 360;
    const pal = biomePalette(biome, hue);

    const w = el.clientWidth || 640;
    const h = Math.max(280, Math.floor(w * 0.56));
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(pal.sky);
    scene.fog = new THREE.Fog(new THREE.Color(pal.fog), biome === 'space' ? 20 : 10, biome === 'cyber' ? 40 : 58);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 140);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    el.innerHTML = '';
    el.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(
      biome === 'cyber' || biome === 'space' ? 0xaaccff : 0xffffff,
      biome === 'volcanic' ? 0x441100 : 0x446688,
      biome === 'space' ? 0.55 : 1.05,
    );
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(biome === 'volcanic' ? 0xff8844 : 0xfff2d6, biome === 'space' ? 0.4 : 1.15);
    sun.position.set(6 + rand() * 6, 10 + rand() * 8, 2 + rand() * 6);
    scene.add(sun);

    if (biome === 'space' || biome === 'cyber') {
      const starGeo = new THREE.BufferGeometry();
      const starCount = 400 + Math.floor(rand() * 400);
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (rand() - 0.5) * 120;
        positions[i * 3 + 1] = rand() * 60 + 5;
        positions[i * 3 + 2] = (rand() - 0.5) * 120 - 20;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 })));
    }

    const ground = new THREE.Mesh(
      biome === 'ocean' ? new THREE.CircleGeometry(18, 64) : new THREE.CircleGeometry(42, 64),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(pal.ground),
        roughness: biome === 'snow' ? 0.55 : 0.92,
        metalness: biome === 'cyber' ? 0.35 : 0.05,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    let water: THREE.Mesh | null = null;
    if (biome !== 'desert' && biome !== 'space' && biome !== 'volcanic') {
      const waterSize = biome === 'ocean' ? 28 : 7 + rand() * 8;
      water = new THREE.Mesh(
        new THREE.CircleGeometry(waterSize, 48),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(pal.water),
          roughness: 0.12,
          metalness: 0.25,
          transparent: true,
          opacity: 0.88,
        }),
      );
      water.rotation.x = -Math.PI / 2;
      water.position.set((rand() - 0.5) * 8, 0.04, -4 - rand() * 6);
      scene.add(water);
      waterRef.current = water;
    } else {
      waterRef.current = null;
    }

    const propCount = 10 + Math.floor(rand() * 22);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.95 });
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(pal.accent),
      roughness: 0.75,
      metalness: biome === 'cyber' ? 0.6 : 0.05,
      emissive: biome === 'cyber' || biome === 'volcanic' ? new THREE.Color(pal.accent) : new THREE.Color(0x000000),
      emissiveIntensity: biome === 'cyber' ? 0.45 : biome === 'volcanic' ? 0.25 : 0,
    });

    for (let i = 0; i < propCount; i++) {
      const group = new THREE.Group();
      const a = rand() * Math.PI * 2;
      const r = 4 + rand() * 16;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r - 2;

      if (biome === 'cyber') {
        const hgt = 1.5 + rand() * 6;
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.7 + rand(), hgt, 0.7 + rand()), accentMat);
        tower.position.y = hgt / 2;
        group.add(tower);
      } else if (biome === 'desert') {
        const dune = new THREE.Mesh(
          new THREE.ConeGeometry(1.2 + rand() * 2, 0.8 + rand() * 1.4, 5),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.ground), roughness: 1 }),
        );
        dune.position.y = 0.4;
        group.add(dune);
      } else if (biome === 'snow') {
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.4 + rand() * 0.6, 2 + rand() * 3, 5), accentMat);
        spire.position.y = 1.2;
        group.add(spire);
      } else if (biome === 'ruins') {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.3, 1.5 + rand() * 2.5, 8),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.accent), roughness: 0.9 }),
        );
        pillar.position.y = 1;
        group.add(pillar);
      } else if (biome === 'volcanic') {
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.5 + rand() * 1.2, 0),
          new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.95, emissive: 0xff3300, emissiveIntensity: 0.15 }),
        );
        rock.position.y = 0.6;
        group.add(rock);
      } else if (biome === 'space') {
        const rock = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.4 + rand() * 1.1, 0),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.ground), flatShading: true }),
        );
        rock.position.y = 0.5 + rand() * 2;
        group.add(rock);
      } else {
        // forest / meadow / ocean shore trees or bushes
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.8 + rand(), 6), trunkMat);
        trunk.position.y = 0.5;
        const canopy = new THREE.Mesh(
          biome === 'meadow' && rand() > 0.55
            ? new THREE.SphereGeometry(0.55 + rand() * 0.4, 8, 6)
            : new THREE.ConeGeometry(0.7 + rand() * 0.5, 1.4 + rand() * 1.4, 7),
          accentMat,
        );
        canopy.position.y = 1.4 + rand();
        group.add(trunk, canopy);
      }

      group.position.set(x, 0, z);
      group.rotation.y = rand() * Math.PI * 2;
      scene.add(group);
    }

    // Unique landmark from prompt hash
    const landmarkRoll = rand();
    if (landmarkRoll > 0.15) {
      let landmark: THREE.Object3D;
      if (biome === 'ruins' || /temple|castle|tower/.test(sketchSeed.toLowerCase())) {
        landmark = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 3.2 + rand() * 2, 2.4),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.accent), roughness: 0.85 }),
        );
        landmark.position.set((rand() - 0.5) * 6, 2, -9 - rand() * 4);
      } else if (biome === 'cyber') {
        landmark = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 8 + rand() * 4, 1.2),
          accentMat,
        );
        landmark.position.set((rand() - 0.5) * 4, 5, -10);
      } else {
        landmark = new THREE.Mesh(
          new THREE.ConeGeometry(5 + rand() * 4, 7 + rand() * 5, 5),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(biome === 'snow' ? '#e8eef5' : pal.accent),
            roughness: 0.95,
          }),
        );
        landmark.position.set(-8 - rand() * 6, 3.2, -18 - rand() * 6);
      }
      scene.add(landmark);
    }

    const camRadius = 8 + rand() * 4;
    const camHeight = 2.2 + rand() * 2;
    const lookY = 0.8 + rand() * 1.2;
    let t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const speed = 0.15 + (seed % 7) * 0.02;
      camera.position.x = Math.sin(t * speed) * camRadius;
      camera.position.z = 9 + Math.cos(t * speed * 0.9) * 2.5;
      camera.position.y = camHeight + Math.sin(t * 0.4) * 0.35;
      camera.lookAt(0, lookY, -5);
      if (waterRef.current) {
        waterRef.current.position.y = 0.04 + Math.sin(t * 1.5) * 0.03;
      }
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth || w;
      const nh = Math.max(280, Math.floor(nw * 0.56));
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      el.innerHTML = '';
    };
  }, [sketchSeed]);

  useEffect(() => {
    if (!job || job.status === 'succeeded' || job.status === 'failed') return;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const res = await worldApi(`/api/world-generator/jobs/${job.id}`);
        const data = await readApiJson<JobPublic & { error?: string }>(res);
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || 'Failed to poll job');
          return;
        }
        setJob(data);
        if (data.status === 'failed') setError(data.error || 'Generation failed');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Poll error');
      }
    }, 2500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [job]);

  const providerLabel = useMemo(() => {
    if (!cloud) return 'Checking cloud…';
    if (cloud.provider === 'lingbot') return 'LingBot World cloud';
    if (cloud.provider === 'fal') return 'Wan 2.2 via fal';
    if (cloud.provider === 'veo') return 'Google Veo cloud GPUs';
    if (cloud.provider === 'hf') return 'Wan 2.2 via Hugging Face';
    return 'Cloud GPU not configured';
  }, [cloud]);

  const biomeLabel = useMemo(() => detectBiome(sketchSeed || prompt || 'meadow'), [sketchSeed, prompt]);

  const onPickImage = (file: File | null) => {
    if (!file) {
      setImageDataUrl(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 4_500_000) {
      setError('Image must be under ~4.5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const applySketch = useCallback(() => {
    const next = prompt.trim();
    if (!next) {
      setError('Write a world prompt first — the sketch is built from your words.');
      return;
    }
    setError('');
    setSketchSeed(`${next} · ${Date.now()}`);
  }, [prompt]);

  const startCloud = async () => {
    setError('');
    const cleaned = prompt.trim();
    if (cleaned.length < 8) {
      setError('Prompt must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setJob(null);
    setSketchSeed(`${cleaned} · ${Date.now()}`);
    try {
      const res = await worldApi('/api/world-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleaned,
          imageUrl: imageDataUrl || undefined,
        }),
      });
      const data = await readApiJson<JobPublic & { error?: string }>(res);
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setJob(data);
      if (data.status === 'failed') setError(data.error || 'Generation failed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start generation');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        minHeight: 0,
        color: 'var(--text, #e8eef7)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 750 }}>World Generator</h2>
          <p style={{ margin: '6px 0 0', opacity: 0.72, fontSize: 14, lineHeight: 1.45, maxWidth: 560 }}>
            Type a world — the live preview rebuilds from your prompt (biome, props, layout). Then render a real
            AI flythrough on cloud GPUs (no local model download).
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.55 }}>
            Signed in as {user.username} · {providerLabel} · sketch biome: {biomeLabel}
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            style={{
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.05)',
              color: 'inherit',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        ) : null}
      </div>

      <div
        ref={mountRef}
        style={{
          width: '100%',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#0a1220',
          minHeight: 280,
        }}
      />

      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
          World prompt
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Misty jungle ruins around a glowing lake, camera drifting toward a stone temple…"
            style={{
              resize: 'vertical',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.25)',
              color: 'inherit',
              padding: 12,
              font: 'inherit',
              lineHeight: 1.45,
            }}
          />
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPrompt(p);
                setSketchSeed(`${p} · ${Date.now()}`);
              }}
              style={{
                border: '1px solid rgba(110,182,245,0.28)',
                background: 'rgba(110,182,245,0.08)',
                color: 'inherit',
                borderRadius: 999,
                padding: '6px 10px',
                fontSize: 12,
                cursor: 'pointer',
                maxWidth: '100%',
              }}
            >
              Try: {p.slice(0, 36)}…
            </button>
          ))}
        </div>

        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Optional start frame (image → world video)
          <input type="file" accept="image/*" onChange={(e) => onPickImage(e.target.files?.[0] || null)} />
        </label>
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt="Start frame preview"
            style={{
              width: 160,
              height: 90,
              objectFit: 'cover',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            type="button"
            onClick={applySketch}
            style={{
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.06)',
              color: 'inherit',
              borderRadius: 999,
              padding: '10px 16px',
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            Rebuild live sketch
          </button>
          <button
            type="button"
            disabled={busy || !cloud?.ready}
            onClick={() => void startCloud()}
            style={{
              border: '1px solid rgba(159,208,255,0.4)',
              background: cloud?.ready
                ? 'linear-gradient(180deg, #4f9ad8, #2b6cb0)'
                : 'rgba(255,255,255,0.08)',
              color: '#fff',
              borderRadius: 999,
              padding: '10px 16px',
              fontWeight: 700,
              cursor: cloud?.ready && !busy ? 'pointer' : 'not-allowed',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'Rendering on cloud GPUs…' : 'Render AI world video (cloud)'}
          </button>
        </div>

        {cloud?.ready ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, opacity: 0.65 }}>
            Live sketch = instant preview from your prompt. Cloud button = real AI video on Google GPUs (~1
            min). Keep this tab open while it runs.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, opacity: 0.7 }}>
            {cloud?.message || 'Checking cloud…'}
          </p>
        )}

        {error ? <p style={{ margin: 0, color: '#ff8f8f', fontSize: 13 }}>{error}</p> : null}

        {job ? (
          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              padding: 12,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Job <code>{job.id.slice(0, 8)}</code> · {job.status} · {job.provider}
            </div>
            {job.status === 'queued' || job.status === 'running' ? (
              <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
                Rendering on cloud GPUs — keep this tab open.
              </p>
            ) : null}
            {job.videoUrl ? (
              <video
                src={job.videoUrl}
                controls
                playsInline
                style={{ width: '100%', maxHeight: 420, borderRadius: 12, background: '#000' }}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
