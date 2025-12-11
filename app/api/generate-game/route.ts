import { NextRequest, NextResponse } from 'next/server';

// AI Game Generation API
// Supports OpenAI, Anthropic Claude, or other LLM providers
export async function POST(request: NextRequest) {
  let prompt = '';

  try {
    const body = await request.json();
    prompt = body.prompt || '';

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check which LLM provider to use (default to OpenAI)
    const provider = process.env.AI_PROVIDER || 'openai';
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback to a smart template-based generator if no API key
      return NextResponse.json({
        code: generateSmartTemplateCode(prompt),
        provider: 'template'
      });
    }

    let generatedCode = '';

    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      generatedCode = await generateWithOpenAI(prompt, process.env.OPENAI_API_KEY);
    } else if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      generatedCode = await generateWithAnthropic(prompt, process.env.ANTHROPIC_API_KEY);
    } else {
      // Fallback to smart template
      generatedCode = generateSmartTemplateCode(prompt);
    }

    return NextResponse.json({ code: generatedCode, provider });
  } catch (error: any) {
    console.error('AI generation error:', error);
    // Fallback to template-based generation on error
    const fallbackPrompt = prompt && prompt.trim() ? prompt : 'creative sandbox game';
    return NextResponse.json({
      code: generateSmartTemplateCode(fallbackPrompt),
      provider: 'template-fallback',
      error: error.message
    });
  }
}

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an ELITE game developer and Three.js expert. Your task is to generate MASSIVE, production-quality, visually stunning 3D games that are COMPLETE, POLISHED, and WORK PERFECTLY.

CRITICAL REQUIREMENTS - YOU MUST FOLLOW ALL OF THESE:
1. Export function: export function createGame(container: HTMLElement)
2. Import Three.js: import * as THREE from 'three'
3. CODE SIZE: Generate AT LEAST 5000 lines of code. This is MANDATORY. The game must be MASSIVE and COMPREHENSIVE.
4. VISUAL QUALITY: Create BEAUTIFUL, NOT UGLY games with:
   - Advanced lighting (multiple lights, shadows, ambient occlusion)
   - High-quality materials (PBR materials, textures, normal maps where appropriate)
   - Particle systems for effects
   - Post-processing effects
   - Smooth animations and transitions
   - Professional color schemes and visual polish
5. GAME MECHANICS: Include COMPLETE game systems:
   - Full player controls (WASD, mouse, keyboard)
   - Physics simulation (gravity, collisions, momentum)
   - Game state management (score, health, lives, levels)
   - Win/lose conditions with proper feedback
   - Sound effects (using Web Audio API or similar)
   - UI elements (HUD, menus, score displays)
6. CODE QUALITY:
   - Well-organized, modular code structure
   - Comprehensive comments explaining complex logic
   - Proper error handling
   - Performance optimizations
   - Clean, readable code with consistent formatting
7. FEATURES TO INCLUDE:
   - Multiple game objects and entities
   - Collision detection and response
   - Camera systems (follow camera, first-person, etc.)
   - Animation systems
   - Particle effects
   - Environmental details (terrain, skybox, decorations)
   - Interactive elements
   - Game progression systems
8. CLEANUP: Return a cleanup function that properly disposes of all resources
9. FORMAT: Return ONLY the code, NO explanations, NO markdown, NO code blocks, NO backticks

The user has provided a DETAILED description. Read it CAREFULLY and implement EXACTLY what they asked for. Generate a MASSIVE, COMPREHENSIVE, BEAUTIFUL game that matches their description perfectly.`
        },
        {
          role: 'user',
          content: `Create a massive, comprehensive, production-quality 3D game based on this detailed description:\n\n${prompt}\n\nGenerate at least 5000 lines of code with beautiful visuals, complete game mechanics, and professional polish.`
        }
      ],
      temperature: 0.8,
      max_tokens: 32000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  let code = data.choices[0]?.message?.content || '';

  // Clean up markdown code blocks if present
  code = code.replace(/```typescript\n?/g, '').replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();

  // Ensure it exports createGame
  if (!code.includes('export function createGame') && !code.includes('function createGame')) {
    code = `export function createGame(container: HTMLElement) {\n${code}\n}`;
  }

  return code;
}

async function generateWithAnthropic(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 32000,
      messages: [
        {
          role: 'user',
          content: `You are an ELITE game developer and Three.js expert. Generate a MASSIVE, production-quality, visually stunning 3D game that is COMPLETE, POLISHED, and WORKS PERFECTLY.

CRITICAL REQUIREMENTS - FOLLOW ALL:
1. Export: export function createGame(container: HTMLElement)
2. Import: import * as THREE from 'three'
3. CODE SIZE: Generate AT LEAST 5000 lines. MANDATORY. The game must be MASSIVE and COMPREHENSIVE.
4. VISUAL QUALITY: Create BEAUTIFUL, NOT UGLY games with:
   - Advanced lighting (multiple lights, shadows, ambient occlusion)
   - High-quality materials (PBR, textures, normal maps)
   - Particle systems for effects
   - Post-processing effects
   - Smooth animations
   - Professional color schemes and visual polish
5. GAME MECHANICS: Complete systems:
   - Full player controls (WASD, mouse, keyboard)
   - Physics (gravity, collisions, momentum)
   - Game state (score, health, lives, levels)
   - Win/lose conditions with feedback
   - Sound effects (Web Audio API)
   - UI elements (HUD, menus, score displays)
6. CODE QUALITY:
   - Well-organized, modular structure
   - Comprehensive comments
   - Error handling
   - Performance optimizations
   - Clean, readable code
7. FEATURES:
   - Multiple game objects
   - Collision detection
   - Camera systems
   - Animation systems
   - Particle effects
   - Environmental details
   - Interactive elements
   - Game progression
8. CLEANUP: Return cleanup function
9. FORMAT: ONLY code, NO explanations, NO markdown, NO code blocks

User description: ${prompt}

Generate a MASSIVE, COMPREHENSIVE, BEAUTIFUL game (5000+ lines) that matches the description EXACTLY.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  let code = data.content[0]?.text || '';

  // Clean up markdown
  code = code.replace(/```typescript\n?/g, '').replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();

  if (!code.includes('export function createGame') && !code.includes('function createGame')) {
    code = `export function createGame(container: HTMLElement) {\n${code}\n}`;
  }

  return code;
}

// Smart template-based generator (fallback when no API key)
function generateSmartTemplateCode(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Enhanced template matching with more game types
  if (lowerPrompt.includes('racing') || lowerPrompt.includes('car') || lowerPrompt.includes('race')) {
    return getRacingGameTemplate();
  } else if (lowerPrompt.includes('platform') || lowerPrompt.includes('jump') || lowerPrompt.includes('mario')) {
    return getPlatformerTemplate();
  } else if (lowerPrompt.includes('shoot') || lowerPrompt.includes('fps') || lowerPrompt.includes('gun')) {
    return getShooterTemplate();
  } else if (lowerPrompt.includes('puzzle') || lowerPrompt.includes('solve') || lowerPrompt.includes('match')) {
    return getPuzzleTemplate();
  } else if (lowerPrompt.includes('space') || lowerPrompt.includes('asteroid') || lowerPrompt.includes('ship')) {
    return getSpaceGameTemplate();
  } else if (lowerPrompt.includes('zombie') || lowerPrompt.includes('survival') || lowerPrompt.includes('enemy')) {
    return getSurvivalTemplate();
  } else {
    // Default: creative sandbox game
    return getCreativeTemplate();
  }
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
  
  // Road
  const roadGeometry = new THREE.PlaneGeometry(10, 100);
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  scene.add(road);
  
  // Car
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
  
  return () => {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
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
  
  // Player
  const playerGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 1, 0);
  scene.add(player);
  
  // Platforms
  const platforms: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const platformGeometry = new THREE.BoxGeometry(3, 0.5, 3);
    const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set((i - 2) * 4, i * 2, 0);
    scene.add(platform);
    platforms.push(platform);
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
    
    // Movement
    if (keys['ArrowLeft'] || keys['a']) velocity.x = -0.1;
    if (keys['ArrowRight'] || keys['d']) velocity.x = 0.1;
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && onGround) {
      velocity.y = 0.2;
      onGround = false;
    }
    
    velocity.y -= 0.01; // Gravity
    player.position.add(new THREE.Vector3(velocity.x, velocity.y, 0));
    
    // Ground collision
    if (player.position.y < 0.5) {
      player.position.y = 0.5;
      velocity.y = 0;
      onGround = true;
    }
    
    velocity.x *= 0.9;
    
    camera.position.x = player.position.x;
    camera.position.y = player.position.y + 3;
    camera.lookAt(player.position);
    
    renderer.render(scene, camera);
  }
  animate();
  
  return () => {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
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
  
  // Player
  const playerGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
  const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 1, 0);
  scene.add(player);
  
  // Targets
  const targets: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const targetGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const targetMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const target = new THREE.Mesh(targetGeometry, targetMaterial);
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
    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
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
  
  return () => {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
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
  
  // Puzzle blocks
  const blocks: THREE.Mesh[] = [];
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  
  for (let i = 0; i < 9; i++) {
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    const blockMaterial = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
    const block = new THREE.Mesh(blockGeometry, blockMaterial);
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
        clicked.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      }
    }
  });
  
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  
  return () => {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
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
  
  // Stars
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
  const starsVertices = [];
  for (let i = 0; i < 1000; i++) {
    starsVertices.push(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
  
  // Ship
  const shipGeometry = new THREE.ConeGeometry(0.3, 1, 8);
  const shipMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
  const ship = new THREE.Mesh(shipGeometry, shipMaterial);
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
  
  return () => {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
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
  
  // Player
  const playerGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.8);
  const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 1, 0);
  scene.add(player);
  
  // Enemies
  const enemies: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const enemyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.6);
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
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
  
  return () => {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
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
  
  // Create colorful objects
  const group = new THREE.Group();
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  
  for (let i = 0; i < 20; i++) {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );
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
  
  return () => {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
}`;
}

