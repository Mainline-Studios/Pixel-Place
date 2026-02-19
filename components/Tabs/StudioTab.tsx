'use client';

import { useEffect, useRef, useState } from 'react';
import { User, SceneObject, DraftGame, UserMadeGame, GameSubmission } from '@/types';
import { getDraft, saveDraft, saveGameSubmission } from '@/lib/storage';
import { apiUrl } from '@/lib/apiBaseUrl';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/lib/toast';
import PyxCheckingPopup from '@/components/PyxCheckingPopup';

interface StudioTabProps {
  user: User;
  editMode: boolean;
}

interface SceneObjectRef {
  id: string;
  type: 'cube' | 'sphere' | 'light';
  mesh: any;
  script?: string;
}

// Preset messages for chat/UI
const PRESET_MESSAGES = [
  'Hello!',
  'Good game!',
  'Nice!',
  'GG!',
  'Well played!',
  'Thanks!',
  'You are welcome!',
  'Good luck!',
  'Have fun!',
  'Lets go!',
];

// Control schemes
const CONTROL_SCHEMES = [
  { id: 'wasd', name: 'WASD', keys: { forward: 'KeyW', back: 'KeyS', left: 'KeyA', right: 'KeyD', jump: 'Space' } },
  { id: 'arrows', name: 'Arrow Keys', keys: { forward: 'ArrowUp', back: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', jump: 'Space' } },
  { id: 'custom', name: 'Custom', keys: { forward: 'KeyW', back: 'KeyS', left: 'KeyA', right: 'KeyD', jump: 'Space' } },
];

let THREE: any = null;

export default function StudioTab({ user, editMode }: StudioTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [sceneObjects, setSceneObjects] = useState<SceneObjectRef[]>([]);
  const [draft, setDraft] = useState<DraftGame>({ title: '', desc: '', owner: '' });
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [color, setColor] = useState('#4a90e2');
  const [objectScript, setObjectScript] = useState('');
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'position' | 'rotation' | 'scale' | null>(null);
  const [selectedPresetMessages, setSelectedPresetMessages] = useState<string[]>([]);
  const [controlScheme, setControlScheme] = useState(CONTROL_SCHEMES[0]);
  const [customControls, setCustomControls] = useState(CONTROL_SCHEMES[0].keys);
  const [showPyxCheck, setShowPyxCheck] = useState(false);

  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scriptExecutorsRef = useRef<Map<string, Function>>(new Map());
  const raycasterRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, z: 0 });

  const resizeRenderer = (renderer: any, canvas: HTMLCanvasElement) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      renderer.setSize(width, height, false);
      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js')
    ]).then(([THREE_MODULE, OrbitControlsModule]) => {
      THREE = THREE_MODULE;
      const OrbitControls = OrbitControlsModule.OrbitControls;

      const canvas = canvasRef.current!;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      resizeRenderer(renderer, canvas);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0d1019);

      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.set(6, 6, 6);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.enablePan = true;
      controls.screenSpacePanning = false;
      controls.target.set(0, 0, 0);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
      hemi.position.set(0, 20, 0);
      scene.add(hemi);

      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(5, 10, 5);
      scene.add(dir);

      const gridHelper = new THREE.GridHelper(40, 40, 0x444466, 0x222233);
      scene.add(gridHelper);

      // Create raycaster for object placement
      const raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;

      // Ground plane for object placement
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshBasicMaterial({ 
        visible: false, 
        side: THREE.DoubleSide 
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      scene.add(ground);

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      controlsRef.current = controls;

      loadSceneObjects(scene, THREE);

      // Mouse move handler for dragging
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (isDragging && selectedObjectId && dragMode) {
          const obj = sceneObjects.find(o => o.id === selectedObjectId);
          if (!obj) return;

          raycaster.setFromCamera(mouseRef.current, camera);
          const intersects = raycaster.intersectObject(ground);

          if (intersects.length > 0 && dragMode === 'position') {
            const point = intersects[0].point;
            obj.mesh.position.set(point.x, point.y, point.z);
            setSceneObjects([...sceneObjects]);
          }
        }
      };

      // Click handler for object placement
      const handleClick = (e: MouseEvent) => {
        if (isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        
        // Check for object selection
        const meshes = sceneObjects.map(o => o.mesh);
        const intersects = raycaster.intersectObjects(meshes, true);
        
        if (intersects.length > 0) {
          const clickedMesh = intersects[0].object;
          const obj = sceneObjects.find(o => o.mesh === clickedMesh || o.mesh.children.includes(clickedMesh));
          if (obj) {
            setSelectedObjectId(obj.id);
          }
        }
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleClick);

      function animate() {
        animationFrameRef.current = requestAnimationFrame(animate);
        if (controls) controls.update();
        
        sceneObjects.forEach((obj) => {
          if (obj.script && scriptExecutorsRef.current.has(obj.id)) {
            try {
              const executor = scriptExecutorsRef.current.get(obj.id)!;
              executor(obj.mesh, THREE, scene, Date.now());
            } catch (e) {
              console.error(`Error executing script for ${obj.id}:`, e);
            }
          }
        });
        
        renderer.render(scene, camera);
      }
      animate();

      const handleResize = () => resizeRenderer(renderer, canvas);
      resizeHandlerRef.current = handleResize;
      window.addEventListener('resize', handleResize);

      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleClick);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        if (resizeHandlerRef.current) {
          window.removeEventListener('resize', resizeHandlerRef.current);
          resizeHandlerRef.current = null;
        }
      };
    });
  }, [isDragging, selectedObjectId, dragMode, sceneObjects]);

  const executeScript = (script: string, objectId: string): Function | null => {
    if (!script.trim()) return null;
    
    try {
      const executor = new Function('mesh', 'THREE', 'scene', 'time', script);
      scriptExecutorsRef.current.set(objectId, executor);
      return executor;
    } catch (e: any) {
      console.error('Script compilation error:', e);
      toast.error(`Script error: ${e.message}`);
      return null;
    }
  };

  const makeCubeMesh = (THREE: any, colorHex?: number) => {
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex || 0x4a90e2 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0, 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const makeSphereMesh = (THREE: any, colorHex?: number) => {
    const geom = new THREE.SphereGeometry(0.5, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex || 0xff4d4d });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0, 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const makeLight = (THREE: any) => {
    const light = new THREE.PointLight(0xffffff, 1, 20);
    light.position.set(0, 2, 0);
    return light;
  };

  const hexToNumber = (hex: string): number => {
    return parseInt(hex.replace('#', ''), 16);
  };

  const loadSceneObjects = async (scene: any, THREE: any) => {
    try {
      // Prefer draft scene if available
      const draftData = await getDraft(user.username);
      const saved = draftData?.sceneData?.objects?.length
        ? { objects: draftData.sceneData!.objects }
        : await fetch(apiUrl('/api/scene')).then(r => r.json());
      if (!saved || !saved.objects) return;

      const objects: SceneObjectRef[] = [];
      saved.objects.forEach((o: SceneObject) => {
        let mesh;
        const colorHex = o.color ? hexToNumber(o.color) : undefined;
        
        if (o.type === 'cube') {
          mesh = makeCubeMesh(THREE, colorHex);
        } else if (o.type === 'sphere') {
          mesh = makeSphereMesh(THREE, colorHex);
        } else if (o.type === 'light') {
          mesh = makeLight(THREE);
        } else {
          return;
        }
        
        mesh.position.set(o.position.x, o.position.y, o.position.z);
        
        if (o.rotation) {
          mesh.rotation.set(
            THREE.MathUtils.degToRad(o.rotation.x || 0),
            THREE.MathUtils.degToRad(o.rotation.y || 0),
            THREE.MathUtils.degToRad(o.rotation.z || 0)
          );
        }
        
        if (o.scale) {
          mesh.scale.set(o.scale.x || 1, o.scale.y || 1, o.scale.z || 1);
        }
        
        scene.add(mesh);
        objects.push({ id: o.id, type: o.type, mesh, script: o.script });
        
        if (o.script) {
          executeScript(o.script, o.id);
        }
      });
      setSceneObjects(objects);
      if (draftData?.title || draftData?.desc || draftData?.owner) {
        setDraft({ title: draftData.title || '', desc: draftData.desc || '', owner: draftData.owner || user.username });
      }
      setDraftLoaded(true);
    } catch (err) {
      console.error('Error loading scene:', err);
      setDraftLoaded(true);
    }
  };

  const addObjectAtPosition = async (type: 'cube' | 'sphere' | 'light', position?: { x: number; y: number; z: number }) => {
    if (!sceneRef.current) return;

    const THREE = await import('three');
    let mesh;
    const colorHex = color ? hexToNumber(color) : undefined;
    
    if (type === 'cube') {
      mesh = makeCubeMesh(THREE, colorHex);
    } else if (type === 'sphere') {
      mesh = makeSphereMesh(THREE, colorHex);
    } else {
      mesh = makeLight(THREE);
    }

    if (position) {
      mesh.position.set(position.x, position.y, position.z);
    } else {
      mesh.position.set(0, 0.5, 0);
    }

    const id = 'obj_' + Date.now();
    sceneRef.current.add(mesh);
    const newObjects = [...sceneObjects, { id, type, mesh }];
    setSceneObjects(newObjects);
    setSelectedObjectId(id);
  };

  const addObject = async (type: 'cube' | 'sphere' | 'light') => {
    // Enable drag mode to place object
    setDragMode('position');
    setIsDragging(true);
    
    // Add object at default position, user can drag it
    await addObjectAtPosition(type);
  };

  const saveScene = async () => {
    const THREE = await import('three');
    const data = {
      objects: sceneObjects.map((o) => ({
        id: o.id,
        type: o.type,
        position: {
          x: o.mesh.position.x,
          y: o.mesh.position.y,
          z: o.mesh.position.z,
        },
        rotation: {
          x: THREE.MathUtils.radToDeg(o.mesh.rotation.x),
          y: THREE.MathUtils.radToDeg(o.mesh.rotation.y),
          z: THREE.MathUtils.radToDeg(o.mesh.rotation.z),
        },
        scale: {
          x: o.mesh.scale.x,
          y: o.mesh.scale.y,
          z: o.mesh.scale.z,
        },
        color: o.mesh.material?.color ? '#' + o.mesh.material.color.getHexString() : undefined,
        script: o.script,
      })),
    };
    
    try {
      const response = await fetch(apiUrl('/api/scene'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success('Scene saved!');
      } else {
        toast.error('Failed to save scene');
      }
    } catch (err) {
      toast.error('Error saving scene');
    }
  };

  const buildSceneData = async () => {
    const THREE = await import('three');
    return {
      objects: sceneObjects.map((o) => ({
        id: o.id,
        type: o.type,
        position: { x: o.mesh.position.x, y: o.mesh.position.y, z: o.mesh.position.z },
        rotation: {
          x: THREE.MathUtils.radToDeg(o.mesh.rotation.x),
          y: THREE.MathUtils.radToDeg(o.mesh.rotation.y),
          z: THREE.MathUtils.radToDeg(o.mesh.rotation.z),
        },
        scale: { x: o.mesh.scale.x, y: o.mesh.scale.y, z: o.mesh.scale.z },
        color: o.mesh.material?.color ? '#' + o.mesh.material.color.getHexString() : undefined,
        script: o.script,
      })),
    };
  };

  const saveDraftToApi = async () => {
    if (!draft.title) {
      toast.error('Enter a game title first');
      return;
    }
    try {
      const sceneData = await buildSceneData();
      const draftToSave: DraftGame = {
        title: draft.title,
        desc: draft.desc || '',
        owner: draft.owner || user.username,
        sceneData: { objects: sceneData.objects },
      };
      await saveDraft(draftToSave);
      toast.success('Draft saved!');
    } catch (err) {
      toast.error('Failed to save draft');
    }
  };

  const publishForEvaluation = () => {
    if (!draft.title) {
      toast.error('Save draft first with a title');
      return;
    }
    if (sceneObjects.length === 0) {
      toast.error('Add at least one object to your scene');
      return;
    }
    setShowPyxCheck(true);
  };

  const doPublishForEvaluationAfterCheck = async () => {
    try {
      const sceneData = await buildSceneData();
      const submission: GameSubmission = {
        id: 'submission_' + Date.now(),
        title: draft.title,
        desc: draft.desc || '(no description)',
        owner: draft.owner || user.username,
        ts: Date.now(),
        sceneData: { objects: sceneData.objects },
        status: 'pending',
      };
      await saveGameSubmission(submission);
      toast.success(`"${draft.title}" submitted for evaluation! Admins will review it.`);
    } catch (err) {
      toast.error('Failed to submit for evaluation');
    }
  };

  const deleteSelected = () => {
    if (!selectedObjectId) return;
    const idx = sceneObjects.findIndex((o) => o.id === selectedObjectId);
    if (idx === -1) return;
    const obj = sceneObjects[idx];

    if (obj.mesh && sceneRef.current) {
      sceneRef.current.remove(obj.mesh);
    }
    
    scriptExecutorsRef.current.delete(obj.id);

    const newObjects = sceneObjects.filter((o) => o.id !== selectedObjectId);
    setSceneObjects(newObjects);
    setSelectedObjectId(null);
  };

  const saveObjectScript = () => {
    if (!selectedObjectId) return;
    
    const obj = sceneObjects.find((o) => o.id === selectedObjectId);
    if (!obj) return;
    
    obj.script = objectScript;
    executeScript(objectScript, selectedObjectId);
    setSceneObjects([...sceneObjects]);
    toast.success('Script saved and executed!');
  };

  const selectedObject = sceneObjects.find(o => o.id === selectedObjectId);

  const handlePyxCheckComplete = (result: { safe: boolean; titleBlocked?: boolean; descBlocked?: boolean; connectionError?: boolean }) => {
    setShowPyxCheck(false);
    if (!result.safe) {
      if (result.connectionError) {
        toast.error("Couldn't connect to Pyx AI. Your game was not published.");
        return;
      }
      const parts: string[] = [];
      if (result.titleBlocked) parts.push('title');
      if (result.descBlocked) parts.push('description');
      toast.error(`Content safety check failed. Please revise the ${parts.join(' and ')}.`);
      return;
    }
    doPublishForEvaluationAfterCheck();
  };

  return (
    <>
      {showPyxCheck && (
        <PyxCheckingPopup
          open={showPyxCheck}
          title={draft.title || ''}
          desc={draft.desc || ''}
          onComplete={handlePyxCheckComplete}
        />
      )}
      <h2 className="section-title">🎨 Studio</h2>
      
      <div className="studio-toolbar" style={{ 
        display: 'flex', 
        gap: '8px', 
        flexWrap: 'wrap', 
        padding: '12px',
        background: 'var(--panel-soft)',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <button className="btn" onClick={() => addObject('cube')}>
          ➕ Cube
        </button>
        <button className="btn" onClick={() => addObject('sphere')}>
          ⭕ Sphere
        </button>
        <button className="btn" onClick={() => addObject('light')}>
          💡 Light
        </button>
        <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
        <button className="btn" onClick={saveScene}>
          💾 Save Scene
        </button>
        <button className="btn" onClick={saveDraftToApi}>
          📝 Save Draft
        </button>
        <button className="btn" onClick={publishForEvaluation}>
          🚀 Publish for Evaluation
        </button>
        <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
        <button 
          className="btn" 
          onClick={() => setIsDragging(!isDragging)}
          style={{ background: isDragging ? 'var(--accent)' : undefined }}
        >
          {isDragging ? '🖱️ Dragging: ON' : '🖱️ Drag Mode: OFF'}
        </button>
      </div>

      <div className="studio-layout" style={{ 
        display: 'grid', 
        gridTemplateColumns: '250px 1fr 320px', 
        gap: '16px',
        height: 'calc(100vh - 300px)',
        minHeight: '600px'
      }}>
        <div className="explorer-panel" style={{
          background: 'var(--panel-soft)',
          borderRadius: '8px',
          padding: '12px',
          overflow: 'auto',
          border: '1px solid var(--border)'
        }}>
          <div className="explorer-title" style={{
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            marginBottom: '12px',
            color: 'var(--accent)'
          }}>
            📁 Objects ({sceneObjects.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sceneObjects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => setSelectedObjectId(obj.id)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  background: selectedObjectId === obj.id ? 'var(--accent-bg)' : 'transparent',
                  color: selectedObjectId === obj.id ? 'var(--accent)' : 'var(--text)',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{obj.type} - {obj.id.slice(-6)}</span>
                {obj.script && <span>📜</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="viewport-panel" style={{
          background: 'var(--panel-soft)',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="viewport-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <div style={{ fontWeight: 600 }}>3D Viewport</div>
            <div style={{ fontSize: '11px', color: '#8b90a8' }}>
              🖱️ Click to select • Drag to place • Scroll to zoom
            </div>
          </div>
          <div className="viewport-canvas-wrap" style={{
            flex: 1,
            background: '#000',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <canvas 
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            />
          </div>
        </div>

        <div className="props-panel" style={{
          background: 'var(--panel-soft)',
          borderRadius: '8px',
          padding: '12px',
          overflow: 'auto',
          border: '1px solid var(--border)'
        }}>
          {selectedObject ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Selected: {selectedObject.type}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Position: ({selectedObject.mesh.position.x.toFixed(2)}, {selectedObject.mesh.position.y.toFixed(2)}, {selectedObject.mesh.position.z.toFixed(2)})
                </div>
              </div>

              {selectedObject.type !== 'light' && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', marginBottom: '6px' }}>Color</div>
                  <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => {
                      setColor(e.target.value);
                      if (selectedObject.mesh.material) {
                        selectedObject.mesh.material.color.setHex(hexToNumber(e.target.value));
                        setSceneObjects([...sceneObjects]);
                      }
                    }}
                    style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📜 Script</span>
                  <button 
                    className="btn" 
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => setShowScriptEditor(!showScriptEditor)}
                  >
                    {showScriptEditor ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showScriptEditor && (
                  <>
                    <textarea
                      value={objectScript}
                      onChange={(e) => setObjectScript(e.target.value)}
                      placeholder="// JavaScript code for this object"
                      style={{
                        width: '100%',
                        minHeight: '120px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        background: '#0d1117',
                        color: '#c9d1d9',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px',
                        resize: 'vertical',
                        marginBottom: '8px'
                      }}
                      spellCheck={false}
                    />
                    <button className="btn" style={{ width: '100%' }} onClick={saveObjectScript}>
                      💾 Save Script
                    </button>
                  </>
                )}
              </div>

              <button
                className="btn"
                style={{ 
                  width: '100%', 
                  background: '#3a1a1a', 
                  borderColor: '#5a2a2a', 
                  color: '#ff4d4d' 
                }}
                onClick={deleteSelected}
              >
                🗑️ Delete Object
              </button>
            </>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
              Select an object to edit
            </div>
          )}

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Game Info</div>
            <input
              className="prop-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Game Title"
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <textarea
              className="prop-textarea"
              value={draft.desc}
              onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              placeholder="Description"
              style={{ width: '100%', minHeight: '60px', marginBottom: '8px' }}
            />
            <input
              className="prop-input"
              value={draft.owner}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
              placeholder={user.username}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Preset Messages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
              {PRESET_MESSAGES.map((msg) => (
                <label key={msg} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedPresetMessages.includes(msg)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPresetMessages([...selectedPresetMessages, msg]);
                      } else {
                        setSelectedPresetMessages(selectedPresetMessages.filter(m => m !== msg));
                      }
                    }}
                  />
                  <span>{msg}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Controls</div>
            <select
              value={controlScheme.id}
              onChange={(e) => {
                const scheme = CONTROL_SCHEMES.find(s => s.id === e.target.value);
                if (scheme) {
                  setControlScheme(scheme);
                  if (scheme.id !== 'custom') {
                    setCustomControls(scheme.keys);
                  }
                }
              }}
              style={{ width: '100%', padding: '6px', marginBottom: '8px' }}
            >
              {CONTROL_SCHEMES.map(scheme => (
                <option key={scheme.id} value={scheme.id}>{scheme.name}</option>
              ))}
            </select>
            
            {controlScheme.id === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  Click a key to set it
                </div>
                {Object.entries(customControls).map(([action, key]) => (
                  <div key={action} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                    <span>{action}:</span>
                    <input
                      type="text"
                      value={key}
                      readOnly
                      onKeyDown={(e) => {
                        e.preventDefault();
                        setCustomControls({ ...customControls, [action]: e.code });
                      }}
                      style={{ width: '100px', padding: '4px', textAlign: 'center' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
