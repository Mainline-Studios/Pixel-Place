'use client';

import { useState, useRef, useEffect } from 'react';
import { User, DraftGame } from '@/types';
import { getDraft, saveDraft } from '@/lib/storage';
import { toast } from '@/lib/toast';
import { navigateToTab } from '@/lib/routing';

interface GameStudioTabProps {
  user: User;
  editMode: boolean;
}

// Game Templates
const GAME_TEMPLATES = [
  {
    id: 'platformer',
    name: '3D Platformer',
    description: 'Jump and run platformer game',
    code: `// 3D Platformer Template
function createGame(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x90EE90 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  
  // Player
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x4A9EFF })
  );
  player.position.set(0, 0.5, 0);
  scene.add(player);
  
  // Platforms
  for (let i = 0; i < 5; i++) {
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.2, 2),
      new THREE.MeshStandardMaterial({ color: 0xFF6B6B })
    );
    platform.position.set(i * 3 - 6, i + 1, 0);
    scene.add(platform);
  }
  
  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  
  // Controls
  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  
  let velocity = new THREE.Vector3();
  let isGrounded = false;
  
  function animate() {
    requestAnimationFrame(animate);
    
    // Movement
    if (keys['KeyA'] || keys['ArrowLeft']) velocity.x = -0.1;
    else if (keys['KeyD'] || keys['ArrowRight']) velocity.x = 0.1;
    else velocity.x *= 0.9;
    
    if ((keys['KeyW'] || keys['ArrowUp'] || keys['Space']) && isGrounded) {
      velocity.y = 0.15;
      isGrounded = false;
    }
    
    velocity.y -= 0.01; // Gravity
    player.position.add(velocity);
    
    if (player.position.y < 0.5) {
      player.position.y = 0.5;
      velocity.y = 0;
      isGrounded = true;
    }
    
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 10;
    camera.lookAt(player.position);
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  return () => {
    container.removeChild(renderer.domElement);
  };
}`
  },
  {
    id: 'racing',
    name: 'Racing Game',
    description: 'Simple racing game template',
    code: `// Racing Game Template
function createGame(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Track
  const track = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 100),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  track.rotation.x = -Math.PI / 2;
  scene.add(track);
  
  // Car
  const car = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 2),
    new THREE.MeshStandardMaterial({ color: 0xFF0000 })
  );
  car.position.set(0, 0.25, 0);
  scene.add(car);
  
  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(5, 10, 5);
  scene.add(light);
  
  // Controls
  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  
  function animate() {
    requestAnimationFrame(animate);
    
    if (keys['KeyA'] || keys['ArrowLeft']) car.position.x -= 0.1;
    if (keys['KeyD'] || keys['ArrowRight']) car.position.x += 0.1;
    if (keys['KeyW'] || keys['ArrowUp']) car.position.z -= 0.1;
    if (keys['KeyS'] || keys['ArrowDown']) car.position.z += 0.1;
    
    car.position.x = Math.max(-4, Math.min(4, car.position.x));
    
    camera.position.z = car.position.z + 10;
    camera.lookAt(car.position);
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  return () => {
    container.removeChild(renderer.domElement);
  };
}`
  },
  {
    id: 'shooter',
    name: 'Shooter Game',
    description: 'First-person shooter template',
    code: `// Shooter Game Template
function createGame(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);
  
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 0);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  
  // Targets
  for (let i = 0; i < 10; i++) {
    const target = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xFF0000 })
    );
    target.position.set(
      (Math.random() - 0.5) * 20,
      1,
      (Math.random() - 0.5) * 20
    );
    scene.add(target);
  }
  
  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  
  // Mouse look
  let yaw = 0;
  let pitch = 0;
  container.addEventListener('mousemove', (e) => {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  });
  
  // Movement
  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  
  function animate() {
    requestAnimationFrame(animate);
    
    // Movement
    const speed = 0.1;
    const direction = new THREE.Vector3();
    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;
    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;
    direction.normalize();
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    camera.position.add(direction.multiplyScalar(speed));
    
    // Camera rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  return () => {
    container.removeChild(renderer.domElement);
  };
}`
  }
];

// Asset Library
const ASSET_LIBRARY = {
  models: [
    { id: 'cube', name: 'Cube', type: 'primitive', icon: '⬜' },
    { id: 'sphere', name: 'Sphere', type: 'primitive', icon: '⚪' },
    { id: 'cylinder', name: 'Cylinder', type: 'primitive', icon: '🔵' },
    { id: 'cone', name: 'Cone', type: 'primitive', icon: '🔺' },
    { id: 'torus', name: 'Torus', type: 'primitive', icon: '⭕' },
  ],
  textures: [
    { id: 'wood', name: 'Wood', color: '#8B4513' },
    { id: 'metal', name: 'Metal', color: '#C0C0C0' },
    { id: 'grass', name: 'Grass', color: '#90EE90' },
    { id: 'stone', name: 'Stone', color: '#808080' },
    { id: 'brick', name: 'Brick', color: '#B22222' },
  ],
  materials: [
    { id: 'standard', name: 'Standard Material' },
    { id: 'phong', name: 'Phong Material' },
    { id: 'lambert', name: 'Lambert Material' },
    { id: 'basic', name: 'Basic Material' },
  ]
};

export default function GameStudioTab({ user, editMode }: GameStudioTabProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftGame>(getDraft());
  const [gameCode, setGameCode] = useState(draft.gameCode || '');
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);

  // Visual Builder state
  const [visualObjects, setVisualObjects] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  useEffect(() => {
    if (draft.gameCode) {
      setGameCode(draft.gameCode);
    }
  }, [draft]);

  const saveCode = () => {
    const updatedDraft = { ...draft, gameCode };
    saveDraft(updatedDraft);
    setDraft(updatedDraft);
    toast.info('Code saved!');
  };

  const loadTemplate = (template: typeof GAME_TEMPLATES[0]) => {
    if (confirm(`Load "${template.name}" template? This will replace your current code.`)) {
      setGameCode(template.code);
      saveCode();
    }
  };

  const addAssetToCode = (asset: any) => {
    let codeSnippet = '';
    if (asset.type === 'primitive') {
      const geometryMap: { [key: string]: string } = {
        'cube': 'BoxGeometry(1, 1, 1)',
        'sphere': 'SphereGeometry(1, 32, 32)',
        'cylinder': 'CylinderGeometry(1, 1, 2, 32)',
        'cone': 'ConeGeometry(1, 2, 32)',
        'torus': 'TorusGeometry(1, 0.3, 16, 100)'
      };
      codeSnippet = `const ${asset.id} = new THREE.Mesh(
  new THREE.${geometryMap[asset.id] || 'BoxGeometry(1, 1, 1)'},
  new THREE.MeshStandardMaterial({ color: 0x4A9EFF })
);
${asset.id}.position.set(0, 0, 0);
scene.add(${asset.id});`;
    }
    
    if (codeSnippet) {
      setGameCode(prev => prev + '\n\n' + codeSnippet);
      toast.info(`${asset.name} added to code!`);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="section-title">🎮 Game Studio</h2>
        <button
          className="btn"
          onClick={() => navigateToTab('games')}
          style={{ padding: '10px 20px', fontSize: '14px' }}
        >
          🎨 Classic Studio
        </button>
      </div>
      
      <div className="ai-box" style={{ marginTop: '20px' }}>
        <div className="ai-label">Game Creation Tools</div>
        <div className="ai-output">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <button
              className="btn"
              onClick={() => setSelectedTool('visual')}
              style={{ padding: '20px', textAlign: 'center' }}
            >
              🎨 Visual Builder
            </button>
            <button
              className="btn"
              onClick={() => setSelectedTool('code')}
              style={{ padding: '20px', textAlign: 'center' }}
            >
              💻 Code Editor
            </button>
            <button
              className="btn"
              onClick={() => setSelectedTool('templates')}
              style={{ padding: '20px', textAlign: 'center' }}
            >
              📋 Templates
            </button>
            <button
              className="btn"
              onClick={() => setSelectedTool('assets')}
              style={{ padding: '20px', textAlign: 'center' }}
            >
              🖼️ Asset Library
            </button>
          </div>
        </div>
      </div>

      {selectedTool && (
        <div className="ai-box" style={{ marginTop: '20px' }}>
          <div className="ai-label">
            {selectedTool === 'visual' && '🎨 Visual Game Builder'}
            {selectedTool === 'code' && '💻 Code Editor'}
            {selectedTool === 'templates' && '📋 Game Templates'}
            {selectedTool === 'assets' && '🖼️ Asset Library'}
            <button
              className="btn"
              onClick={() => setSelectedTool(null)}
              style={{ float: 'right', padding: '4px 8px', fontSize: '12px' }}
            >
              ✕ Close
            </button>
          </div>
          <div className="ai-output">
            {selectedTool === 'visual' && (
              <div>
                <p style={{ marginBottom: '16px' }}>Visual Builder - Drag and drop objects to build your game visually.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  {ASSET_LIBRARY.models.map((model) => (
                    <button
                      key={model.id}
                      className="btn"
                      onClick={() => {
                        setSelectedAsset(model.id);
                        addAssetToCode(model);
                      }}
                      style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        background: selectedAsset === model.id ? 'var(--accent)' : 'var(--panel)'
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{model.icon}</div>
                      <div style={{ fontSize: '12px' }}>{model.name}</div>
                    </button>
                  ))}
                </div>
                <div className="smalltext">
                  💡 Tip: Click on objects above to add them to your game code. Then switch to Code Editor to customize.
                </div>
              </div>
            )}
            
            {selectedTool === 'code' && (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button className="btn" onClick={saveCode}>
                    💾 Save Code
                  </button>
                  <button className="btn" onClick={() => {
                    navigator.clipboard.writeText(gameCode);
                    toast.info('Code copied!');
                  }}>
                    📋 Copy
                  </button>
                  <button className="btn" onClick={() => {
                    if (confirm('Clear all code?')) {
                      setGameCode('');
                    }
                  }}>
                    🗑️ Clear
                  </button>
                </div>
                <textarea
                  ref={codeEditorRef}
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  placeholder="// Write your Three.js game code here...\n// THREE is provided by the game engine\n\nfunction createGame(container) {\n  // Your code here\n}"
                  style={{
                    width: '100%',
                    minHeight: '500px',
                    fontFamily: "'Courier New', 'Monaco', 'Consolas', monospace",
                    fontSize: '14px',
                    lineHeight: '1.6',
                    background: '#0d1117',
                    color: '#c9d1d9',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '20px',
                    resize: 'vertical',
                    whiteSpace: 'pre',
                    overflowWrap: 'normal',
                    overflowX: 'auto'
                  }}
                  spellCheck={false}
                />
                <div className="smalltext" style={{ marginTop: '8px' }}>
                  💡 <strong>Tip:</strong> Export a function called <code>createGame(container)</code> that sets up your Three.js game.
                  <br />
                  🎮 THREE.js is automatically available - no imports needed!
                </div>
              </div>
            )}
            
            {selectedTool === 'templates' && (
              <div>
                <p style={{ marginBottom: '16px' }}>Choose a template to get started quickly:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                  {GAME_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="ai-box"
                      style={{ cursor: 'pointer', padding: '16px' }}
                      onClick={() => loadTemplate(template)}
                    >
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                        {template.description}
                      </div>
                      <button className="btn" style={{ width: '100%', fontSize: '12px' }}>
                        Load Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedTool === 'assets' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>3D Models</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                    {ASSET_LIBRARY.models.map((model) => (
                      <button
                        key={model.id}
                        className="btn"
                        onClick={() => addAssetToCode(model)}
                        style={{ padding: '16px', textAlign: 'center' }}
                      >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{model.icon}</div>
                        <div style={{ fontSize: '12px' }}>{model.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Textures & Colors</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                    {ASSET_LIBRARY.textures.map((texture) => (
                      <button
                        key={texture.id}
                        className="btn"
                        onClick={() => {
                          const colorCode = texture.color.replace('#', '0x');
                          const snippet = `// ${texture.name} texture\nconst material = new THREE.MeshStandardMaterial({ color: ${colorCode} });`;
                          setGameCode(prev => prev + '\n\n' + snippet);
                          toast.info(`${texture.name} color added!`);
                        }}
                        style={{ 
                          padding: '16px', 
                          textAlign: 'center',
                          background: texture.color,
                          color: '#fff'
                        }}
                      >
                        {texture.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="smalltext">
                  💡 Click on assets to add them to your code. Switch to Code Editor to see the generated code.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
