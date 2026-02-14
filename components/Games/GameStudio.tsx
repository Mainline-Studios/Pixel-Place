'use client';

import React, { useRef, useEffect, useState } from 'react';
import ModernButton from '../RobloxStyle/ModernButton';
import ModernCard from '../RobloxStyle/ModernCard';
import { applyAdvancedRendering, createDynamicLighting } from '../RobloxStyle/AdvancedRenderer';
import { ProfessionalCamera } from '../RobloxStyle/ProfessionalCamera';
import { applyColorGrading, applyVignette } from '../RobloxStyle/VisualEffects';
import { WorldSaveManager, WorldSaveData } from './GameStudio/WorldSaveManager';
import { PrefabManager, PrefabAsset } from './GameStudio/PrefabManager';
import { ChunkManager } from './GameStudio/ChunkManager';
import { MaterialSystem, MaterialPreset } from './GameStudio/MaterialSystem';
import VisualScripting from './GameStudio/VisualScripting';

/**
 * Game Studio - Multiplayer Game Creation Platform
 * 
 * A Roblox Studio-like game creation system built with Three.js
 * Allows players to:
 * - Join shared multiplayer 3D worlds
 * - Place and edit objects
 * - Attach hot-reloadable scripts to objects
 * - Play and test creations in real time
 * 
 * This is the "engine" that makes Pixel Place a creation platform
 */

interface WorldObject {
  id: string;
  type: 'cube' | 'sphere' | 'ramp' | 'platform';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  script?: string;
  material?: string;
  shader?: string;
  mesh?: any;
}

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  mesh?: any;
}

type GameMode = 'play' | 'build';

export default function GameStudio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const cameraControllerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const threeRef = useRef<any>(null);
  
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const [worldObjects, setWorldObjects] = useState<WorldObject[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedObject, setSelectedObject] = useState<WorldObject | null>(null);
  const [buildMode, setBuildMode] = useState(false);
  const [scriptEditor, setScriptEditor] = useState<{ objectId: string; code: string } | null>(null);
  const [propertyEditor, setPropertyEditor] = useState<WorldObject | null>(null);
  const [worldName, setWorldName] = useState('My World');
  const [showWorldMenu, setShowWorldMenu] = useState(false);
  const [showPrefabMenu, setShowPrefabMenu] = useState(false);
  const [showVisualScripting, setShowVisualScripting] = useState(false);
  const [selectedPrefabs, setSelectedPrefabs] = useState<string[]>([]);
  const [renderQuality, setRenderQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, isRightDown: false });
  const cameraRotationRef = useRef({ x: 0, y: 0 });
  const playerPositionRef = useRef({ x: 0, y: 5, z: 0 });
  const objectsRef = useRef<Map<string, any>>(new Map());
  const scriptsRef = useRef<Map<string, any>>(new Map());
  const chunkManagerRef = useRef<ChunkManager | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    let THREE: any;
    let isMounted = true;

    import('three').then((module) => {
      if (!isMounted || !containerRef.current) return;
      
      try {
        THREE = module;
        threeRef.current = module;

        const container = containerRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb); // Sky blue
        scene.fog = new THREE.FogExp2(0x87ceeb, 0.01);

        // Camera
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(0, 5, 10);
        cameraRef.current = camera;

        // Professional camera controller
        try {
          const cameraController = new ProfessionalCamera(camera);
          cameraController.setThirdPerson({ x: 0, y: 5, z: 0 }, 10, 5);
          cameraControllerRef.current = cameraController;
        } catch (err) {
          console.warn('Camera controller init failed, using default:', err);
        }

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Advanced lighting (with error handling)
        try {
          if (createDynamicLighting) {
            createDynamicLighting(scene);
          }
          if (applyAdvancedRendering) {
            applyAdvancedRendering(scene, camera, renderer);
          }
        } catch (err) {
          console.warn('Advanced rendering init failed, using basic lighting:', err);
          // Fallback: basic lighting
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);
          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight.position.set(10, 10, 5);
          directionalLight.castShadow = true;
          scene.add(directionalLight);
        }

        // Initialize chunk manager
        chunkManagerRef.current = new ChunkManager(50);

        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
          color: 0x90ee90,
          roughness: 0.8,
          metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        scene.add(ground);

        // Grid helper
        const gridHelper = new THREE.GridHelper(200, 50, 0x888888, 0xcccccc);
        scene.add(gridHelper);

        sceneRef.current = scene;
        setIsInitialized(true);

        // Visual effects (with error handling)
        setTimeout(() => {
          if (container) {
            try {
              if (applyColorGrading) {
                applyColorGrading(container, 'vibrant');
              }
              if (applyVignette) {
                applyVignette(container, 0.2);
              }
            } catch (err) {
              console.warn('Visual effects init failed:', err);
            }
          }
        }, 100);

        // Handle window resize
        const handleResize = () => {
          if (!containerRef.current || !camera || !renderer) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
          isMounted = false;
          window.removeEventListener('resize', handleResize);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          if (renderer) {
            renderer.dispose();
          }
        };
      } catch (error) {
        console.error('Three.js initialization error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="padding: 20px; color: #fff; background: rgba(255,0,0,0.1); border-radius: 8px;">
            <h3>Initialization Error</h3>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p style="font-size: 12px; color: #999;">Check console for details</p>
          </div>`;
        }
      }
    }).catch((error) => {
      console.error('Failed to load Three.js:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div style="padding: 20px; color: #fff; background: rgba(255,0,0,0.1); border-radius: 8px;">
          <h3>Failed to Load Three.js</h3>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>`;
      }
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !threeRef.current || !rendererRef.current) return;

    const THREE = threeRef.current;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Player movement (WASD)
      const keys = keysRef.current;
      const moveSpeed = 10;
      let moveX = 0;
      let moveZ = 0;

      if (keys['w'] || keys['W'] || keys['ArrowUp']) moveZ -= moveSpeed * deltaTime;
      if (keys['s'] || keys['S'] || keys['ArrowDown']) moveZ += moveSpeed * deltaTime;
      if (keys['a'] || keys['A'] || keys['ArrowLeft']) moveX -= moveSpeed * deltaTime;
      if (keys['d'] || keys['D'] || keys['ArrowRight']) moveX += moveSpeed * deltaTime;
      if (keys[' '] || keys['Space']) playerPositionRef.current.y += moveSpeed * deltaTime;
      if (keys['Shift']) playerPositionRef.current.y -= moveSpeed * deltaTime;

      playerPositionRef.current.x += moveX;
      playerPositionRef.current.z += moveZ;

      // Update camera
      const cameraController = cameraControllerRef.current;
      if (cameraController) {
        cameraController.setThirdPerson(
          {
            x: playerPositionRef.current.x,
            y: playerPositionRef.current.y,
            z: playerPositionRef.current.z
          },
          10,
          5
        );
        cameraController.update(deltaTime);
      }

      // Activate chunks near player (world streaming)
      if (chunkManagerRef.current) {
        const activeIds = chunkManagerRef.current.activateChunks(
          playerPositionRef.current.x,
          playerPositionRef.current.z,
          2
        );
        
        // Only update active objects (performance optimization)
        const activeObjects = worldObjects.filter(obj => activeIds.includes(obj.id));
        
        // Update world objects (run scripts) - only for active chunks
        activeObjects.forEach(obj => {
          if (obj.script && scriptsRef.current.has(obj.id)) {
            try {
              const scriptContext = scriptsRef.current.get(obj.id)!;
              const api = createObjectAPI(obj, sceneRef.current, THREE);
              
              // Call on_update if it exists
              if (scriptContext.on_update) {
                scriptContext.on_update(api, deltaTime);
              }
            } catch (error) {
              console.error(`Script error for object ${obj.id}:`, error);
            }
          }
        });
      } else {
        // Fallback: update all objects if chunk manager not initialized
        worldObjects.forEach(obj => {
          if (obj.script && scriptsRef.current.has(obj.id)) {
            try {
              const scriptContext = scriptsRef.current.get(obj.id)!;
              const api = createObjectAPI(obj, sceneRef.current, THREE);
              
              if (scriptContext.on_update) {
                scriptContext.on_update(api, deltaTime);
              }
            } catch (error) {
              console.error(`Script error for object ${obj.id}:`, error);
            }
          }
        });
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [worldObjects]);

  // Create object API for scripts
  const createObjectAPI = (obj: WorldObject, scene: any, THREE: any) => {
    const mesh = objectsRef.current.get(obj.id);
    return {
      get_position: () => ({ x: obj.position.x, y: obj.position.y, z: obj.position.z }),
      move_object: (pos: { x: number; y: number; z: number }) => {
        if (mesh) {
          mesh.position.set(pos.x, pos.y, pos.z);
          obj.position = pos;
          setWorldObjects(prev => prev.map(o => o.id === obj.id ? { ...o, position: pos } : o));
        }
      },
      set_color: (color: string) => {
        if (mesh && mesh.material) {
          mesh.material.color.setHex(parseInt(color.replace('#', '0x')));
          obj.color = color;
          setWorldObjects(prev => prev.map(o => o.id === obj.id ? { ...o, color } : o));
        }
      },
      get_nearby_players: () => {
        // Return players within 10 units
        return players.filter(p => {
          const dist = Math.sqrt(
            Math.pow(p.position.x - obj.position.x, 2) +
            Math.pow(p.position.y - obj.position.y, 2) +
            Math.pow(p.position.z - obj.position.z, 2)
          );
          return dist < 10;
        });
      },
      print_debug: (message: string) => {
        console.log(`[Object ${obj.id}]: ${message}`);
      },
      get_time: () => performance.now() / 1000
    };
  };

  // Place object in world (with material system)
  const placeObject = (type: WorldObject['type'], position: { x: number; y: number; z: number }, materialPreset?: MaterialPreset) => {
    if (!sceneRef.current || !threeRef.current) return;

    const THREE = threeRef.current;
    const id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let geometry: any;
    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 16, 16);
        break;
      case 'ramp':
        geometry = new THREE.BoxGeometry(2, 1, 4);
        break;
      case 'platform':
        geometry = new THREE.BoxGeometry(4, 0.5, 4);
        break;
    }

    // Use material system
    const preset = materialPreset || MaterialSystem.getPreset('default');
    const material = MaterialSystem.createMaterial(preset, THREE);
    if (preset.shader === 'outline') {
      // Will add outline after mesh creation
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sceneRef.current.add(mesh);

    // Add outline if needed
    if (preset.shader === 'outline') {
      MaterialSystem.addOutline(mesh, THREE, preset.properties.outlineWidth || 0.1, preset.properties.outlineColor || '#000000');
    }

    const newObject: WorldObject = {
      id,
      type,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: preset.properties.color || '#ff6b6b',
      material: preset.id,
      shader: preset.shader
    };

    objectsRef.current.set(id, mesh);
    
    // Add to chunk manager
    if (chunkManagerRef.current) {
      chunkManagerRef.current.addObject(id, position.x, position.z);
    }
    
    setWorldObjects(prev => [...prev, newObject]);
  };

  // Save world
  const saveWorld = () => {
    const saveData: WorldSaveData = {
      version: '1.0',
      objects: worldObjects.map(obj => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
        color: obj.color,
        script: obj.script,
        material: obj.material,
        shader: obj.shader
      })),
      metadata: {
        name: worldName,
        description: 'Created in Game Studio',
        createdAt: Date.now(),
        lastModified: Date.now()
      }
    };

    const worldId = `world_${Date.now()}`;
    if (WorldSaveManager.saveWorld(worldId, saveData)) {
      alert(`World "${worldName}" saved!`);
    }
  };

  // Load world
  const loadWorld = (worldId: string) => {
    const data = WorldSaveManager.loadWorld(worldId);
    if (!data) return;

    // Clear existing objects
    worldObjects.forEach(obj => {
      if (obj.mesh && sceneRef.current) {
        sceneRef.current.remove(obj.mesh);
      }
    });
    objectsRef.current.clear();
    scriptsRef.current.clear();
    if (chunkManagerRef.current) {
      chunkManagerRef.current.clear();
    }

    // Load objects
    const loadedObjects: WorldObject[] = [];
    data.objects.forEach(objData => {
      const preset = objData.material ? MaterialSystem.getPreset(objData.material) : null;
      if (preset) {
        placeObject(objData.type as WorldObject['type'], objData.position, preset);
      } else {
        placeObject(objData.type as WorldObject['type'], objData.position);
      }
      
      // Update with saved properties
      const obj = worldObjects.find(o => o.id === objData.id);
      if (obj) {
        obj.rotation = objData.rotation;
        obj.scale = objData.scale;
        obj.color = objData.color;
        obj.script = objData.script;
        obj.material = objData.material;
        obj.shader = objData.shader;
        
        // Reload script if exists
        if (obj.script) {
          reloadScript(obj.id, obj.script);
        }
      }
    });

    setWorldName(data.metadata.name);
    alert(`World "${data.metadata.name}" loaded!`);
  };

  // Create prefab from selected objects
  const createPrefab = () => {
    if (selectedPrefabs.length === 0) {
      alert('Select objects first!');
      return;
    }

    const selectedObjs = worldObjects.filter(o => selectedPrefabs.includes(o.id));
    if (selectedObjs.length === 0) return;

    const name = prompt('Prefab name:');
    if (!name) return;

    const centerPoint = {
      x: selectedObjs.reduce((sum, o) => sum + o.position.x, 0) / selectedObjs.length,
      y: selectedObjs.reduce((sum, o) => sum + o.position.y, 0) / selectedObjs.length,
      z: selectedObjs.reduce((sum, o) => sum + o.position.z, 0) / selectedObjs.length
    };

    const prefabData = selectedObjs.map(obj => ({
      type: obj.type,
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
      color: obj.color,
      script: obj.script,
      material: obj.material
    }));

    const prefab = PrefabManager.createPrefab(name, 'Custom prefab', prefabData, centerPoint);
    alert(`Prefab "${name}" created!`);
    setSelectedPrefabs([]);
  };

  // Spawn prefab
  const spawnPrefab = (prefab: PrefabAsset, position: { x: number; y: number; z: number }) => {
    const objects = PrefabManager.spawnPrefab(prefab, position);
    objects.forEach(objData => {
      const preset = objData.material ? MaterialSystem.getPreset(objData.material) : undefined;
      placeObject(objData.type as WorldObject['type'], objData.position, preset);
    });
  };

  // Handle canvas click (place objects in build mode)
  useEffect(() => {
    if (!buildMode || !rendererRef.current) return;

    const handleClick = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new (threeRef.current as any).Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new (threeRef.current as any).Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        placeObject('cube', { x: point.x, y: point.y + 1, z: point.z });
      }
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [buildMode]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === 'b' || e.key === 'B') {
        setBuildMode(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse look
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.isDown) return;
      const cameraController = cameraControllerRef.current;
      if (cameraController) {
        cameraController.handleMouseMove(e.movementX, e.movementY);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) mouseRef.current.isDown = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Hot-reload script (sandboxed, supports on_ready, on_update, on_player_touch, on_interact)
  const reloadScript = (objectId: string, code: string) => {
    try {
      // Create sandboxed script context
      const scriptContext: any = {
        on_ready: null,
        on_update: null,
        on_player_touch: null,
        on_interact: null
      };

      // Wrap code to extract functions
      const wrappedCode = `
        ${code}
        
        // Extract functions to context
        if (typeof on_ready === 'function') scriptContext.on_ready = on_ready;
        if (typeof on_update === 'function') scriptContext.on_update = on_update;
        if (typeof on_player_touch === 'function') scriptContext.on_player_touch = on_player_touch;
        if (typeof on_interact === 'function') scriptContext.on_interact = on_interact;
      `;

      // Execute in isolated scope
      const executeScript = new Function('scriptContext', wrappedCode);
      executeScript(scriptContext);

      scriptsRef.current.set(objectId, scriptContext);
      
      // Call on_ready if it exists
      const obj = worldObjects.find(o => o.id === objectId);
      if (obj && scriptContext.on_ready && sceneRef.current && threeRef.current) {
        const api = createObjectAPI(obj, sceneRef.current, threeRef.current);
        try {
          scriptContext.on_ready(api);
        } catch (error) {
          console.error(`on_ready error for ${objectId}:`, error);
        }
      }
      
      setWorldObjects(prev =>
        prev.map(obj => (obj.id === objectId ? { ...obj, script: code } : obj))
      );
      
      return true;
    } catch (error) {
      console.error('Script compilation error:', error);
      return false;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0,
          background: isInitialized ? 'transparent' : '#000'
        }} 
      />
      {!isInitialized && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🎮</div>
          <div>Loading Game Studio...</div>
        </div>
      )}

      {/* Build Mode UI */}
      {buildMode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          minWidth: '300px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>🔨 Build Mode</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ marginBottom: '8px', fontWeight: '600' }}>Place Objects:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <ModernButton onClick={() => placeObject('cube', { x: 0, y: 2, z: 0 })} variant="primary" size="small">
                Cube
              </ModernButton>
              <ModernButton onClick={() => placeObject('sphere', { x: 0, y: 2, z: 0 })} variant="primary" size="small">
                Sphere
              </ModernButton>
              <ModernButton onClick={() => placeObject('platform', { x: 0, y: 1, z: 0 })} variant="primary" size="small">
                Platform
              </ModernButton>
              <ModernButton onClick={() => placeObject('ramp', { x: 0, y: 1, z: 0 })} variant="primary" size="small">
                Ramp
              </ModernButton>
            </div>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#bdc3c7' }}>
              Materials:
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {MaterialSystem.getPresets().slice(0, 6).map(preset => (
                <ModernButton
                  key={preset.id}
                  onClick={() => {
                    const pos = { x: playerPositionRef.current.x, y: playerPositionRef.current.y + 2, z: playerPositionRef.current.z };
                    placeObject('cube', pos, preset);
                  }}
                  variant="secondary"
                  size="small"
                  style={{ fontSize: '10px' }}
                >
                  {preset.name}
                </ModernButton>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ marginBottom: '8px', fontWeight: '600' }}>Objects: {worldObjects.length}</div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {worldObjects.map(obj => (
                <div
                  key={obj.id}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      // Multi-select for prefabs
                      if (selectedPrefabs.includes(obj.id)) {
                        setSelectedPrefabs(prev => prev.filter(id => id !== obj.id));
                      } else {
                        setSelectedPrefabs(prev => [...prev, obj.id]);
                      }
                    } else {
                      setSelectedObject(obj);
                      setSelectedPrefabs([obj.id]);
                    }
                  }}
                  style={{
                    padding: '8px',
                    marginBottom: '4px',
                    background: (selectedObject?.id === obj.id || selectedPrefabs.includes(obj.id))
                      ? 'rgba(0,162,255,0.3)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: selectedPrefabs.includes(obj.id) ? '2px solid #00a2ff' : '1px solid transparent'
                  }}
                >
                  {obj.type} {obj.script ? '📜' : ''} {obj.material ? '🎨' : ''}
                </div>
              ))}
            </div>
          </div>

          {selectedObject && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ marginBottom: '8px', fontWeight: '600' }}>Selected: {selectedObject.type}</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <ModernButton
                  onClick={() => {
                    setPropertyEditor(selectedObject);
                  }}
                  variant="secondary"
                  size="small"
                >
                  Properties
                </ModernButton>
                <ModernButton
                  onClick={() => {
                    setScriptEditor({ objectId: selectedObject.id, code: selectedObject.script || '' });
                  }}
                  variant="secondary"
                  size="small"
                >
                  {selectedObject.script ? 'Edit Script' : 'Add Script'}
                </ModernButton>
                <ModernButton
                  onClick={() => {
                    setShowVisualScripting(true);
                  }}
                  variant="success"
                  size="small"
                >
                  Visual Script
                </ModernButton>
              </div>
            </div>
          )}

          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <ModernButton onClick={() => setShowWorldMenu(true)} variant="info" size="small">
                💾 Worlds
              </ModernButton>
              <ModernButton onClick={() => setShowPrefabMenu(true)} variant="warning" size="small">
                📦 Prefabs
              </ModernButton>
              <ModernButton onClick={() => setShowDebugOverlay(!showDebugOverlay)} variant="secondary" size="small">
                🐛 Debug
              </ModernButton>
            </div>
            <div style={{ marginTop: '8px' }}>
              <select
                value={renderQuality}
                onChange={(e) => setRenderQuality(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              >
                <option value="standard">Standard Quality</option>
                <option value="high">High Quality</option>
                <option value="ultra">Ultra Quality</option>
              </select>
            </div>
          </div>

          <ModernButton
            onClick={() => setBuildMode(false)}
            variant="danger"
            size="small"
            fullWidth
            style={{ marginTop: '12px' }}
          >
            Exit Build Mode (B)
          </ModernButton>
        </div>
      )}

      {/* Property Editor */}
      {propertyEditor && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: 'rgba(0,0,0,0.95)',
          padding: '24px',
          borderRadius: '16px',
          minWidth: '400px',
          maxWidth: '90%',
          color: '#fff'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>⚙️ Object Properties</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Position</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="number"
                  value={propertyEditor.position.x}
                  onChange={(e) => {
                    const newPos = { ...propertyEditor.position, x: parseFloat(e.target.value) };
                    setPropertyEditor({ ...propertyEditor, position: newPos });
                    const mesh = objectsRef.current.get(propertyEditor.id);
                    if (mesh) mesh.position.x = newPos.x;
                  }}
                  style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#fff' }}
                  placeholder="X"
                />
                <input
                  type="number"
                  value={propertyEditor.position.y}
                  onChange={(e) => {
                    const newPos = { ...propertyEditor.position, y: parseFloat(e.target.value) };
                    setPropertyEditor({ ...propertyEditor, position: newPos });
                    const mesh = objectsRef.current.get(propertyEditor.id);
                    if (mesh) mesh.position.y = newPos.y;
                  }}
                  style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#fff' }}
                  placeholder="Y"
                />
                <input
                  type="number"
                  value={propertyEditor.position.z}
                  onChange={(e) => {
                    const newPos = { ...propertyEditor.position, z: parseFloat(e.target.value) };
                    setPropertyEditor({ ...propertyEditor, position: newPos });
                    const mesh = objectsRef.current.get(propertyEditor.id);
                    if (mesh) mesh.position.z = newPos.z;
                  }}
                  style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#fff' }}
                  placeholder="Z"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Color</label>
              <input
                type="color"
                value={propertyEditor.color}
                onChange={(e) => {
                  const newColor = e.target.value;
                  setPropertyEditor({ ...propertyEditor, color: newColor });
                  const mesh = objectsRef.current.get(propertyEditor.id);
                  if (mesh && mesh.material) {
                    mesh.material.color.setHex(parseInt(newColor.replace('#', '0x')));
                  }
                }}
                style={{ width: '100%', padding: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Material</label>
              <select
                value={propertyEditor.material || 'default'}
                onChange={(e) => {
                  const preset = MaterialSystem.getPreset(e.target.value);
                  if (preset && threeRef.current) {
                    const mesh = objectsRef.current.get(propertyEditor.id);
                    if (mesh) {
                      const newMaterial = MaterialSystem.createMaterial(preset, threeRef.current);
                      mesh.material.dispose();
                      mesh.material = newMaterial;
                      if (preset.shader === 'outline') {
                        MaterialSystem.addOutline(mesh, threeRef.current, preset.properties.outlineWidth || 0.1, preset.properties.outlineColor || '#000000');
                      }
                    }
                    setPropertyEditor({ ...propertyEditor, material: preset.id, shader: preset.shader });
                  }
                }}
                style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#fff' }}
              >
                {MaterialSystem.getPresets().map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <ModernButton onClick={() => setPropertyEditor(null)} variant="secondary" size="medium" fullWidth>
              Close
            </ModernButton>
          </div>
        </div>
      )}

      {/* World Menu */}
      {showWorldMenu && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: 'rgba(0,0,0,0.95)',
          padding: '24px',
          borderRadius: '16px',
          minWidth: '500px',
          maxWidth: '90%',
          maxHeight: '80%',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>💾 World Manager</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              placeholder="World name"
              style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <ModernButton onClick={saveWorld} variant="success" size="medium">
                Save World
              </ModernButton>
              <ModernButton onClick={() => {
                const json = WorldSaveManager.exportWorld({
                  version: '1.0',
                  objects: worldObjects.map(obj => ({
                    id: obj.id,
                    type: obj.type,
                    position: obj.position,
                    rotation: obj.rotation,
                    scale: obj.scale,
                    color: obj.color,
                    script: obj.script,
                    material: obj.material,
                    shader: obj.shader
                  })),
                  metadata: {
                    name: worldName,
                    description: 'Exported from Game Studio',
                    createdAt: Date.now(),
                    lastModified: Date.now()
                  }
                });
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${worldName}.json`;
                a.click();
              }} variant="info" size="medium">
                Export JSON
              </ModernButton>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Saved Worlds:</div>
            {Object.entries(WorldSaveManager.getAllWorlds()).map(([id, data]) => (
              <div
                key={id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>{data.metadata.name}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {data.objects.length} objects • {new Date(data.metadata.lastModified).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <ModernButton onClick={() => { loadWorld(id); setShowWorldMenu(false); }} variant="primary" size="small">
                    Load
                  </ModernButton>
                  <ModernButton onClick={() => {
                    if (confirm('Delete this world?')) {
                      WorldSaveManager.deleteWorld(id);
                      setShowWorldMenu(false);
                      setTimeout(() => setShowWorldMenu(true), 100);
                    }
                  }} variant="danger" size="small">
                    Delete
                  </ModernButton>
                </div>
              </div>
            ))}
          </div>

          <ModernButton onClick={() => setShowWorldMenu(false)} variant="secondary" size="medium" fullWidth>
            Close
          </ModernButton>
        </div>
      )}

      {/* Prefab Menu */}
      {showPrefabMenu && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: 'rgba(0,0,0,0.95)',
          padding: '24px',
          borderRadius: '16px',
          minWidth: '500px',
          maxWidth: '90%',
          maxHeight: '80%',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>📦 Prefab Manager</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px', fontWeight: '600' }}>Selected Objects: {selectedPrefabs.length}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <ModernButton onClick={createPrefab} variant="success" size="medium" disabled={selectedPrefabs.length === 0}>
                Create Prefab
              </ModernButton>
              <ModernButton onClick={() => setSelectedPrefabs([])} variant="secondary" size="medium">
                Clear Selection
              </ModernButton>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Prefabs:</div>
            {Object.entries(PrefabManager.getAllPrefabs()).map(([id, prefab]) => (
              <div
                key={id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{prefab.name}</div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                  {prefab.objects.length} objects
                </div>
                <ModernButton
                  onClick={() => {
                    spawnPrefab(prefab, { x: playerPositionRef.current.x, y: playerPositionRef.current.y + 2, z: playerPositionRef.current.z });
                    setShowPrefabMenu(false);
                  }}
                  variant="primary"
                  size="small"
                >
                  Spawn at Player
                </ModernButton>
              </div>
            ))}
          </div>

          <ModernButton onClick={() => setShowPrefabMenu(false)} variant="secondary" size="medium" fullWidth>
            Close
          </ModernButton>
        </div>
      )}

      {/* Visual Scripting */}
      {showVisualScripting && selectedObject && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: 'rgba(0,0,0,0.95)',
          padding: '24px',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90%',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>🎨 Visual Scripting</h3>
            <ModernButton onClick={() => setShowVisualScripting(false)} variant="secondary" size="small">
              Close
            </ModernButton>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <VisualScripting
              objectId={selectedObject.id}
              onSave={(script) => {
                reloadScript(selectedObject.id, script);
                setShowVisualScripting(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Debug Overlay */}
      {showDebugOverlay && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          padding: '16px',
          borderRadius: '12px',
          color: '#fff',
          fontSize: '12px',
          fontFamily: 'monospace',
          minWidth: '250px'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '14px' }}>🐛 Debug Info</div>
          <div style={{ marginBottom: '4px' }}>Objects: {worldObjects.length}</div>
          <div style={{ marginBottom: '4px' }}>Active Chunks: {chunkManagerRef.current ? chunkManagerRef.current.getActiveObjectIds().length : 0}</div>
          <div style={{ marginBottom: '4px' }}>Scripts: {scriptsRef.current.size}</div>
          <div style={{ marginBottom: '4px' }}>Render Quality: {renderQuality}</div>
          <div style={{ marginBottom: '4px' }}>FPS: {Math.round(1000 / 16)}</div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '10px', color: '#999' }}>
              Player: ({playerPositionRef.current.x.toFixed(1)}, {playerPositionRef.current.y.toFixed(1)}, {playerPositionRef.current.z.toFixed(1)})
            </div>
          </div>
        </div>
      )}

      {/* Script Editor */}
      {scriptEditor && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000,
          background: 'rgba(0,0,0,0.95)',
          padding: '24px',
          borderRadius: '16px',
          minWidth: '600px',
          maxWidth: '90%',
          maxHeight: '80%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#fff' }}>📜 Script Editor</h3>
          
          <textarea
            value={scriptEditor.code}
            onChange={(e) => setScriptEditor({ ...scriptEditor, code: e.target.value })}
            placeholder={`// Object Behavior Script
// Available functions: on_ready(), on_update(api, delta), on_player_touch(player), on_interact(player)

// Called when object is created or script is loaded
function on_ready(api) {
  api.print_debug("Object ready!");
}

// Called every frame
function on_update(api, delta) {
  // Example: Moving platform
  const pos = api.get_position();
  pos.y += Math.sin(api.get_time() * 2) * delta * 2;
  api.move_object(pos);
}

// Called when a player touches this object
function on_player_touch(player) {
  // Example: Lava floor
  // player.take_damage(10);
}

// Called when a player interacts with this object
function on_interact(player) {
  // Example: Door
  // api.rotate_object({x: 0, y: 90, z: 0});
}`}
            style={{
              flex: 1,
              minHeight: '300px',
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '14px',
              resize: 'vertical',
              marginBottom: '12px'
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <ModernButton
              onClick={() => {
                if (reloadScript(scriptEditor.objectId, scriptEditor.code)) {
                  alert('Script reloaded!');
                } else {
                  alert('Script error! Check console.');
                }
              }}
              variant="success"
              size="medium"
            >
              Hot Reload Script
            </ModernButton>
            <ModernButton
              onClick={() => setScriptEditor(null)}
              variant="secondary"
              size="medium"
            >
              Close
            </ModernButton>
          </div>
        </div>
      )}

      {/* Play Mode UI */}
      {!buildMode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            🎮 Game Studio
          </div>
          <div style={{ fontSize: '14px', color: '#bdc3c7' }}>
            Press <strong>B</strong> to enter Build Mode
          </div>
          <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '4px' }}>
            WASD: Move | Mouse: Look | Space: Up | Shift: Down
          </div>
        </div>
      )}
    </div>
  );
}
