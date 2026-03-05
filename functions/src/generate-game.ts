/**
 * AI Game Generation - Groq + template fallback
 * Used by Cloud Functions (Next.js API routes not available with static export)
 */
import * as admin from 'firebase-admin';
import { getAnthropicApiKey } from './config';
import { getAuthFromRequest } from './authMiddleware';

const PYX_DEFAULT_URL = 'https://pyxaiapi-574247481583.us-central1.run.app';
const PYX_CODE_MAX_TOKENS = 4096;

const CLAUDE_SONNET_COST = 550; // $5.50 worth at ~100 coins/$0.99

const AI_MODELS: Record<string, { groqModel: string; cost: number }> = {
  template: { groqModel: '', cost: 0 },
  pyx: { groqModel: '', cost: 0 },
  'claude-haiku': { groqModel: '', cost: 0 },
  claude: { groqModel: '', cost: CLAUDE_SONNET_COST },
  'groq-8b': { groqModel: 'llama-3.1-8b-instant', cost: 0 },
  'groq-70b': { groqModel: 'llama-3.3-70b-versatile', cost: 10 },
};

async function generateWithPyx(prompt: string): Promise<{ completion: string; connectionError?: boolean }> {
  const url = process.env.PYX_SERVICE_URL || PYX_DEFAULT_URL;
  const gamePrompt = `Create a complete Three.js game. Export: export function createGame(container: HTMLElement). Import: import * as THREE from 'three'. Include lighting, player controls (WASD, mouse), and a simple playable scene. Return ONLY the TypeScript/JavaScript code, no markdown or explanation.

User request: ${prompt}`;
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/code/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: gamePrompt, max_tokens: PYX_CODE_MAX_TOKENS }),
    });
    if (!res.ok) return { completion: '', connectionError: true };
    const data = (await res.json()) as { completion?: string };
    return { completion: typeof data.completion === 'string' ? data.completion : '' };
  } catch (e) {
    console.error('[Pyx] Code complete error:', e);
    return { completion: '', connectionError: true };
  }
}

function normalizeGameCode(code: string): string {
  let out = (code || '').replace(/```typescript\n?/g, '').replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();
  if (!out.includes('export function createGame') && !out.includes('function createGame')) {
    out = `export function createGame(container: HTMLElement) {\n${out}\n}`;
  }
  return out;
}

async function generateWithGroq(prompt: string, apiKey: string, groqModel?: string): Promise<string> {
  const key = (apiKey || '').trim();
  if (!key) throw new Error('Groq API key is missing');
  const model = groqModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert game developer and Three.js specialist. Generate complete, working 3D games.

REQUIREMENTS:
1. Export: export function createGame(container: HTMLElement)
2. Import: import * as THREE from 'three'
3. Create a COMPLETE, playable game (aim for 500+ lines minimum)
4. Include: lighting, materials, player controls (WASD, mouse), physics, game state (score, health), REQUIRED UI (HUD, score/health display, start menu, game-over screen), win/lose conditions
5. Return ONLY the TypeScript/JavaScript code. NO markdown, NO code blocks, NO backticks, NO explanations.`,
        },
        {
          role: 'user',
          content: `Create a complete, working 3D game based on this description:\n\n${prompt}\n\nGenerate production-ready Three.js code with full gameplay, controls, and visuals. Return ONLY the code.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 16000,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    let errMsg = `Groq API error: ${response.status} ${response.statusText}`;
    try {
      const j = JSON.parse(body);
      if (j.error?.message) errMsg += ` — ${j.error.message}`;
      else if (body) errMsg += ` — ${body.slice(0, 200)}`;
    } catch {
      if (body) errMsg += ` — ${body.slice(0, 200)}`;
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  let code = data.choices?.[0]?.message?.content || '';

  code = code.replace(/```typescript\n?/g, '').replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();

  if (!code.includes('export function createGame') && !code.includes('function createGame')) {
    code = `export function createGame(container: HTMLElement) {\n${code}\n}`;
  }

  return code;
}

async function generateWithAnthropic(prompt: string, apiKey: string, useHaiku = false): Promise<string> {
  const key = (apiKey || '').trim();
  if (!key) throw new Error('Anthropic API key is missing');
  // Use date-pinned model IDs from docs to avoid "expected pattern" validation errors
  const model = useHaiku ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-6';
  const maxTokens = 8192; // Safe limit; avoid validation issues with very large values
  const systemPrompt = useHaiku
    ? `You are an expert game developer and Three.js specialist. Generate a complete, working 3D game. REQUIREMENTS: 1) export function createGame(container: HTMLElement) 2) import * as THREE from 'three' 3) 500+ lines, lighting, materials, player controls (WASD, mouse), physics, game state, UI (HUD, start menu, game-over). Return ONLY code, NO markdown.`
    : `You are an ELITE game developer and Three.js expert. Generate a MASSIVE, production-quality 3D game. REQUIREMENTS: 1) export function createGame(container: HTMLElement) 2) import * as THREE from 'three' 3) At least 5000 lines 4) Beautiful visuals, full mechanics, physics, controls, UI. 5) Return ONLY code, NO markdown.`;
  const userText = useHaiku
    ? `Create a complete 3D game:\n\n${prompt}\n\nReturn ONLY the code.`
    : `Create a massive, comprehensive 3D game:\n\n${prompt}\n\nReturn ONLY the code.`;
  // Minimal request: string content (no content blocks), integer max_tokens, exact model ID from docs
  const body = {
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userText }],
  };
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = (data as { error?: { message?: string } })?.error?.message || response.statusText;
    throw new Error(`Anthropic API error: ${msg}`);
  }
  let code = (data.content?.[0] as { text?: string })?.text || '';
  code = code.replace(/```typescript\n?/g, '').replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();
  if (!code.includes('export function createGame') && !code.includes('function createGame')) {
    code = `export function createGame(container: HTMLElement) {\n${code}\n}`;
  }
  return code;
}

function generateSmartTemplateCode(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('racing') || lowerPrompt.includes('car') || lowerPrompt.includes('race')) {
    return getRacingGameTemplate();
  }
  if (lowerPrompt.includes('platform') || lowerPrompt.includes('jump') || lowerPrompt.includes('mario')) {
    return getPlatformerTemplate();
  }
  if (lowerPrompt.includes('shoot') || lowerPrompt.includes('fps') || lowerPrompt.includes('gun')) {
    return getShooterTemplate();
  }
  if (lowerPrompt.includes('puzzle') || lowerPrompt.includes('solve') || lowerPrompt.includes('match')) {
    return getPuzzleTemplate();
  }
  if (lowerPrompt.includes('space') || lowerPrompt.includes('asteroid') || lowerPrompt.includes('ship')) {
    return getSpaceGameTemplate();
  }
  if (lowerPrompt.includes('zombie') || lowerPrompt.includes('survival') || lowerPrompt.includes('enemy')) {
    return getSurvivalTemplate();
  }
  return getCreativeTemplate();
}

function getRacingGameTemplate(): string {
  return `import * as THREE from 'three';

export function createGame(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 15);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  const roadGeometry = new THREE.PlaneGeometry(10, 100);
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  scene.add(road);
  const carGroup = new THREE.Group();
  const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  carGroup.add(body);
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
  [-1, 1].forEach(x => {
    [-1.5, 1.5].forEach(z => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x * 0.8, 0.4, z);
      carGroup.add(wheel);
    });
  });
  carGroup.position.set(0, 1, 0);
  scene.add(carGroup);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  let speed = 0;
  const keys: { [key: string]: boolean } = {};
  window.addEventListener('keydown', (e) => { keys[e.key] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });
  function animate() {
    requestAnimationFrame(animate);
    if (keys['ArrowLeft'] || keys['a']) carGroup.rotation.y += 0.05;
    if (keys['ArrowRight'] || keys['d']) carGroup.rotation.y -= 0.05;
    if (keys['ArrowUp'] || keys['w']) speed = Math.min(speed + 0.1, 0.5);
    if (keys['ArrowDown'] || keys['s']) speed = Math.max(speed - 0.1, -0.3);
    carGroup.translateZ(-speed);
    speed *= 0.95;
    camera.position.copy(carGroup.position);
    camera.position.y += 5;
    camera.position.z += 10;
    camera.lookAt(carGroup.position);
    renderer.render(scene, camera);
  }
  animate();
  return () => { container.removeChild(renderer.domElement); renderer.dispose(); };
}`;
}

function getPlatformerTemplate(): string {
  return `import * as THREE from 'three';

export function createGame(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  const playerGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 1, 0);
  scene.add(player);
  for (let i = 0; i < 5; i++) {
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.5, 3),
new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    platform.position.set((i - 2) * 4, i * 2, 0);
    scene.add(platform);
  }
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  let velocity = { x: 0, y: 0, z: 0 };
  const keys: { [key: string]: boolean } = {};
  let onGround = false;
  window.addEventListener('keydown', (e) => { keys[e.key] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });
  function animate() {
    requestAnimationFrame(animate);
    if (keys['ArrowLeft'] || keys['a']) velocity.x = -0.1;
    if (keys['ArrowRight'] || keys['d']) velocity.x = 0.1;
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && onGround) { velocity.y = 0.2; onGround = false; }
    velocity.y -= 0.01;
    player.position.add(new THREE.Vector3(velocity.x, velocity.y, 0));
    if (player.position.y < 0.5) { player.position.y = 0.5; velocity.y = 0; onGround = true; }
    velocity.x *= 0.9;
    camera.position.x = player.position.x;
    camera.position.y = player.position.y + 3;
    camera.lookAt(player.position);
    renderer.render(scene, camera);
  }
  animate();
  return () => { container.removeChild(renderer.domElement); renderer.dispose(); };
}`;
}

function getShooterTemplate(): string {
  return `import * as THREE from 'three';

export function createGame(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  player.position.set(0, 1, 0);
  scene.add(player);
  const targets: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const target = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    target.position.set((i - 2) * 3, 1, -5);
    scene.add(target);
    targets.push(target);
  }
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const bullets: THREE.Mesh[] = [];
  const keys: { [key: string]: boolean } = {};
  window.addEventListener('keydown', (e) => { keys[e.key] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });
  window.addEventListener('click', () => {
    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    bullet.position.copy(player.position);
    bullet.position.y += 0.5;
    scene.add(bullet);
    bullets.push(bullet);
  });
  function animate() {
    requestAnimationFrame(animate);
    if (keys['ArrowLeft'] || keys['a']) player.position.x -= 0.1;
    if (keys['ArrowRight'] || keys['d']) player.position.x += 0.1;
    bullets.forEach((bullet, index) => {
      bullet.position.z -= 0.3;
      targets.forEach((target, tIndex) => {
        if (bullet.position.distanceTo(target.position) < 0.5) {
          scene.remove(target);
          scene.remove(bullet);
          targets.splice(tIndex, 1);
          bullets.splice(index, 1);
        }
      });
      if (bullet.position.z < -20) {
        scene.remove(bullet);
        bullets.splice(index, 1);
      }
    });
    renderer.render(scene, camera);
  }
  animate();
  return () => { container.removeChild(renderer.domElement); renderer.dispose(); };
}`;
}

function getPuzzleTemplate(): string {
  return `import * as THREE from 'three';

export function createGame(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2a2a3a);
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  const blocks: THREE.Mesh[] = [];
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  for (let i = 0; i < 9; i++) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length] })
    );
    block.position.set((i % 3 - 1) * 1.5, Math.floor(i / 3) * 1.5 - 1, 0);
    scene.add(block);
    blocks.push(block);
  }
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  let selectedBlock: THREE.Mesh | null = null;
  window.addEventListener('click', (e) => {
    const mouse = new THREE.Vector2();
    mouse.x = (e.clientX / container.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / container.clientHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(blocks);
    if (intersects.length > 0) {
      const clicked = intersects[0].object as THREE.Mesh;
      if (selectedBlock) {
        const tempPos = selectedBlock.position.clone();
        selectedBlock.position.copy(clicked.position);
        clicked.position.copy(tempPos);
        selectedBlock = null;
      } else {
        selectedBlock = clicked;
      }
    }
  });
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  return () => { container.removeChild(renderer.domElement); renderer.dispose(); };
}`;
}

function getSpaceGameTemplate(): string {
  return `import * as THREE from 'three';

export function createGame(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  const starsGeometry = new THREE.BufferGeometry();
  const starsVertices: number[] = [];
  for (let i = 0; i < 1000; i++) {
    starsVertices.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 }));
  scene.add(stars);
  const ship = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 1, 8),
    new THREE.MeshStandardMaterial({ color: 0x00ffff })
  );
  ship.rotation.x = Math.PI;
  scene.add(ship);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);
  const keys: { [key: string]: boolean } = {};
  window.addEventListener('keydown', (e) => { keys[e.key] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });
  function animate() {
    requestAnimationFrame(animate);
    if (keys['ArrowLeft'] || keys['a']) ship.rotation.z += 0.1;
    if (keys['ArrowRight'] || keys['d']) ship.rotation.z -= 0.1;
    if (keys['ArrowUp'] || keys['w']) {
      ship.position.x += Math.sin(ship.rotation.z) * 0.1;
      ship.position.y -= Math.cos(ship.rotation.z) * 0.1;
    }
    stars.rotation.y += 0.001;
    renderer.render(scene, camera);
  }
  animate();
  return () => { container.removeChild(renderer.domElement); renderer.dispose(); };
}`;
}

function getSurvivalTemplate(): string {
  return `import * as THREE from 'three';

export function createGame(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2a2a2a);
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 3, 5);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.6, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  player.position.set(0, 1, 0);
  scene.add(player);
  const enemies: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const enemy = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.2, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    enemy.position.set((i - 1) * 3, 0.6, -5);
    scene.add(enemy);
    enemies.push(enemy);
  }
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const keys: { [key: string]: boolean } = {};
  window.addEventListener('keydown', (e) => { keys[e.key] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });
  function animate() {
    requestAnimationFrame(animate);
    if (keys['ArrowLeft'] || keys['a']) player.position.x -= 0.1;
    if (keys['ArrowRight'] || keys['d']) player.position.x += 0.1;
    if (keys['ArrowUp'] || keys['w']) player.position.z -= 0.1;
    if (keys['ArrowDown'] || keys['s']) player.position.z += 0.1;
    enemies.forEach((enemy) => {
      const direction = new THREE.Vector3();
      direction.subVectors(player.position, enemy.position).normalize();
      enemy.position.add(direction.multiplyScalar(0.02));
    });
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 5;
    camera.lookAt(player.position);
    renderer.render(scene, camera);
  }
  animate();
  return () => { container.removeChild(renderer.domElement); renderer.dispose(); };
}`;
}

function getCreativeTemplate(): string {
  return `import * as THREE from 'three';

export function createGame(container: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1d29);
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  const group = new THREE.Group();
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  for (let i = 0; i < 20; i++) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length] })
    );
    cube.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    group.add(cube);
  }
  scene.add(group);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    group.rotation.y += 0.01;
    group.rotation.x = Math.sin(time) * 0.2;
    group.children.forEach((child, i) => {
      if (i > 0) {
        child.rotation.x += 0.02;
        child.rotation.y += 0.03;
      }
    });
    renderer.render(scene, camera);
  }
  animate();
  return () => { container.removeChild(renderer.domElement); renderer.dispose(); };
}`;
}

export async function handleGenerateGame(
  req: { body: { prompt?: string; model?: string }; headers?: { authorization?: string } },
  res: { status: (n: number) => { json: (d: object) => void } }
) {
  try {
    const prompt = (req.body?.prompt || '').trim();
    const modelId = req.body?.model || 'groq-8b';
    const auth = getAuthFromRequest(req as any);
    const username = auth?.username?.trim() || '';

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const modelConfig = AI_MODELS[modelId] || AI_MODELS['groq-8b'];
    const groqKey = (process.env.GROQ_API_KEY || '').trim();

    let newCoins: number | undefined;

    if (modelConfig.cost > 0) {
      if (!auth) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const db = admin.firestore();
      const userRef = db.collection('users').doc(username.toLowerCase());
      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        return res.status(400).json({ error: 'User not found' });
      }
      const userData = userSnap.data();
      const currentCoins = (userData?.coins ?? 0) as number;
      if (currentCoins < modelConfig.cost) {
        return res.status(400).json({ error: `Not enough Pixel Coins. Need ${modelConfig.cost}, you have ${currentCoins}.` });
      }
      newCoins = currentCoins - modelConfig.cost;
      await userRef.update({ coins: newCoins, updated_at: Date.now() });
    }

    let code: string;
    let usedProvider: string;

    if (modelId === 'template') {
      code = generateSmartTemplateCode(prompt);
      usedProvider = 'template';
    } else if (modelId === 'pyx') {
      const pyxResult = await generateWithPyx(prompt);
      if (pyxResult.connectionError || !pyxResult.completion?.trim()) {
        return res.status(503).json({ error: "Couldn't connect to Pyx AI Code. Please try again or use another model." });
      }
      code = normalizeGameCode(pyxResult.completion);
      usedProvider = 'pyx';
    } else if ((modelId === 'claude' || modelId === 'claude-haiku') && getAnthropicApiKey()) {
      const useHaiku = modelId === 'claude-haiku';
      code = await generateWithAnthropic(prompt, getAnthropicApiKey()!, useHaiku);
      code = normalizeGameCode(code);
      usedProvider = modelId;
    } else if (groqKey && modelConfig.groqModel) {
      code = await generateWithGroq(prompt, groqKey, modelConfig.groqModel);
      usedProvider = modelId;
    } else if (groqKey) {
      code = await generateWithGroq(prompt, groqKey, 'llama-3.1-8b-instant');
      usedProvider = 'groq-8b';
    } else {
      code = generateSmartTemplateCode(prompt);
      usedProvider = 'template';
    }

    res.status(200).json(newCoins !== undefined ? { code, provider: usedProvider, newCoins } : { code, provider: usedProvider });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('AI generation error:', error);
    res.status(500).json({ error: error.message || 'AI generation failed' });
  }
}
