'use client';

import { useEffect, useRef, useState } from 'react';
import { User, SceneObject, DraftGame, UserMadeGame, GameSubmission } from '@/types';
import { getDraft, saveDraft, getPublished, savePublished, getSceneData, saveSceneData, saveUserMadeGame, saveGameSubmission } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';

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

let THREE: any = null;

export default function StudioTab({ user, editMode }: StudioTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [sceneObjects, setSceneObjects] = useState<SceneObjectRef[]>([]);
  const [draft, setDraft] = useState<DraftGame>({ title: '', desc: '', owner: '' });
  const [posX, setPosX] = useState('');
  const [posY, setPosY] = useState('');
  const [posZ, setPosZ] = useState('');
  const [rotX, setRotX] = useState('');
  const [rotY, setRotY] = useState('');
  const [rotZ, setRotZ] = useState('');
  const [scaleX, setScaleX] = useState('');
  const [scaleY, setScaleY] = useState('');
  const [scaleZ, setScaleZ] = useState('');
  const [color, setColor] = useState('#4a90e2');
  const [objectScript, setObjectScript] = useState('');
  const [showScriptEditor, setShowScriptEditor] = useState(false);

  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scriptExecutorsRef = useRef<Map<string, Function>>(new Map());

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

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      controlsRef.current = controls;

      loadSceneObjects(scene, THREE);

      function animate() {
        animationFrameRef.current = requestAnimationFrame(animate);
        if (controls) controls.update();
        
        // Execute object scripts
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
    });

    return () => {
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
  }, []);

  const executeScript = (script: string, objectId: string): Function | null => {
    if (!script.trim()) return null;
    
    try {
      const executor = new Function('mesh', 'THREE', 'scene', 'time', script);
      scriptExecutorsRef.current.set(objectId, executor);
      return executor;
    } catch (e: any) {
      console.error('Script compilation error:', e);
      alert(`Script error: ${e.message}`);
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
    const saved = await getSceneData();
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
  };

  const addObject = async (type: 'cube' | 'sphere' | 'light') => {
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

    const id = 'obj_' + Date.now();
    sceneRef.current.add(mesh);
    const newObjects = [...sceneObjects, { id, type, mesh }];
    setSceneObjects(newObjects);
    rebuildExplorerList(newObjects);
  };

  const rebuildExplorerList = (objects: SceneObjectRef[] = sceneObjects) => {
    const treeEl = document.getElementById('explorerTree');
    if (!treeEl) return;
    
    let html = '<div style="padding: 8px; font-size: 12px; line-height: 1.8;">';
    html += '<div style="font-weight: 600; margin-bottom: 8px; color: var(--accent);">Scene Objects</div>';
    
    if (objects.length === 0) {
      html += '<div style="color: var(--text-dim); font-style: italic;">No objects in scene</div>';
    } else {
      objects.forEach((o) => {
        const isSelected = o.id === selectedObjectId;
        const hasScript = o.script ? ' 📜' : '';
        html += `<div 
          style="
            padding: 4px 8px; 
            cursor: pointer; 
            border-radius: 4px;
            background: ${isSelected ? 'var(--accent-bg)' : 'transparent'};
            color: ${isSelected ? 'var(--accent)' : 'var(--text)'};
            margin: 2px 0;
            user-select: none;
          "
          onclick="window.selectStudioObject('${o.id}')"
        >
          ${isSelected ? '▶' : '○'} ${o.id} [${o.type}]${hasScript}
        </div>`;
      });
    }
    
    html += '</div>';
    treeEl.innerHTML = html;
  };

  useEffect(() => {
    (window as any).selectStudioObject = (id: string) => {
      const obj = sceneObjects.find((o) => o.id === id);
      if (!obj) return;

      setSelectedObjectId(obj.id);
      setPosX(obj.mesh.position.x.toFixed(2));
      setPosY(obj.mesh.position.y.toFixed(2));
      setPosZ(obj.mesh.position.z.toFixed(2));
      
      if (THREE) {
        const rot = obj.mesh.rotation;
        setRotX(THREE.MathUtils.radToDeg(rot.x).toFixed(2));
        setRotY(THREE.MathUtils.radToDeg(rot.y).toFixed(2));
        setRotZ(THREE.MathUtils.radToDeg(rot.z).toFixed(2));
      }
      
      const scale = obj.mesh.scale;
      setScaleX(scale.x.toFixed(2));
      setScaleY(scale.y.toFixed(2));
      setScaleZ(scale.z.toFixed(2));
      
      if (obj.mesh.material && obj.mesh.material.color) {
        setColor('#' + obj.mesh.material.color.getHexString());
      }
      
      const objData = sceneObjects.find(o => o.id === id);
      setObjectScript(objData?.script || '');
    };
  }, [sceneObjects]);

  useEffect(() => {
    rebuildExplorerList();
  }, [sceneObjects, selectedObjectId]);

  const applyTransform = async () => {
    if (!selectedObjectId) return;
    const obj = sceneObjects.find((o) => o.id === selectedObjectId);
    if (!obj) return;

    const THREE = await import('three');
    const nx = parseFloat(posX) || 0;
    const ny = parseFloat(posY) || 0;
    const nz = parseFloat(posZ) || 0;
    const rx = parseFloat(rotX) || 0;
    const ry = parseFloat(rotY) || 0;
    const rz = parseFloat(rotZ) || 0;
    const sx = parseFloat(scaleX) || 1;
    const sy = parseFloat(scaleY) || 1;
    const sz = parseFloat(scaleZ) || 1;

    obj.mesh.position.set(nx, ny, nz);
    obj.mesh.rotation.set(
      THREE.MathUtils.degToRad(rx),
      THREE.MathUtils.degToRad(ry),
      THREE.MathUtils.degToRad(rz)
    );
    obj.mesh.scale.set(sx, sy, sz);
    
    if (obj.mesh.material && color) {
      obj.mesh.material.color.setHex(hexToNumber(color));
    }
    
    setSceneObjects([...sceneObjects]);
    rebuildExplorerList();
  };

  const saveObjectScript = () => {
    if (!selectedObjectId) return;
    
    const obj = sceneObjects.find((o) => o.id === selectedObjectId);
    if (!obj) return;
    
    obj.script = objectScript;
    executeScript(objectScript, selectedObjectId);
    setSceneObjects([...sceneObjects]);
    alert('Script saved and executed!');
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
    setPosX('');
    setPosY('');
    setPosZ('');
    setRotX('');
    setRotY('');
    setRotZ('');
    setScaleX('');
    setScaleY('');
    setScaleZ('');
    setObjectScript('');
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
    await saveSceneData(data);
    alert('Scene saved.');
  };

  const loadScene = async () => {
    sceneObjects.forEach((o) => {
      if (o.mesh && sceneRef.current) {
        sceneRef.current.remove(o.mesh);
      }
      scriptExecutorsRef.current.delete(o.id);
    });
    setSceneObjects([]);
    setSelectedObjectId(null);
    if (sceneRef.current) {
      const THREE = await import('three');
      loadSceneObjects(sceneRef.current, THREE);
    }
    alert('Scene loaded.');
  };

  const saveDraftFromProps = async () => {
    await saveDraft(draft);
    alert('Draft saved.');
  };

  const publishToUserMadeGames = async () => {
    if (user.role !== 'admin') {
      alert('Only admins can publish games.');
      return;
    }
    if (!draft.title) {
      alert('No draft to publish. Save draft first in Studio.');
      return;
    }
    const sceneData = await getSceneData();
    if (!sceneData || !sceneData.objects || sceneData.objects.length === 0) {
      alert('No scene data to publish. Create a scene first.');
      return;
    }
    const game: UserMadeGame = {
      id: 'game_' + Date.now(),
      title: draft.title,
      desc: draft.desc || '(no description)',
      owner: draft.owner || user.username,
      ts: Date.now(),
      sceneData: sceneData,
      publishedBy: user.username
    };
    await saveUserMadeGame(game);
    alert("Published '" + draft.title + "' to Games tab!");
  };

  const submitGameForReview = async () => {
    if (!draft.title) {
      alert('No draft to submit. Save draft first in Studio.');
      return;
    }
    const sceneData = await getSceneData();
    if (!sceneData || !sceneData.objects || sceneData.objects.length === 0) {
      alert('No scene data to submit. Create a scene first.');
      return;
    }
    const submission: GameSubmission = {
      id: 'submission_' + Date.now(),
      title: draft.title,
      desc: draft.desc || '(no description)',
      owner: draft.owner || user.username,
      ts: Date.now(),
      sceneData: sceneData,
      status: 'pending'
    };
    await saveGameSubmission(submission);
    alert("Submitted '" + draft.title + "' for admin review!");
  };

  const selectedObject = sceneObjects.find(o => o.id === selectedObjectId);

  return (
    <>
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
        <button className="btn" onClick={loadScene}>
          📂 Load Scene
        </button>
        <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
        <button className="btn" onClick={saveDraftFromProps}>
          📝 Save Draft
        </button>
        {user.role === 'admin' ? (
          <button className="btn" onClick={publishToUserMadeGames}>
            🚀 Publish to Games
          </button>
        ) : (
          <button className="btn" onClick={submitGameForReview}>
            📤 Submit for Review
          </button>
        )}
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
            📁 Explorer
          </div>
          <div className="explorer-tree" id="explorerTree" style={{
            fontFamily: 'monospace',
            fontSize: '11px'
          }}>
            Loading...
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
              🖱️ Orbit: drag • 🔍 Zoom: scroll • ↔️ Pan: right-click
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
              id="studioCanvas" 
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
          <div className="props-title" style={{
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            color: 'var(--accent)'
          }}>
            ⚙️ Properties
          </div>

          {selectedObject ? (
            <>
              <div className="prop-field-label" style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                Selected: {selectedObject.id}
              </div>

              <div className="prop-field-label" style={{ marginTop: '16px', marginBottom: '6px', fontSize: '12px' }}>
                Position
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                <input className="prop-input" placeholder="X" value={posX} onChange={(e) => setPosX(e.target.value)} />
                <input className="prop-input" placeholder="Y" value={posY} onChange={(e) => setPosY(e.target.value)} />
                <input className="prop-input" placeholder="Z" value={posZ} onChange={(e) => setPosZ(e.target.value)} />
              </div>

              <div className="prop-field-label" style={{ marginTop: '12px', marginBottom: '6px', fontSize: '12px' }}>
                Rotation (degrees)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                <input className="prop-input" placeholder="X" value={rotX} onChange={(e) => setRotX(e.target.value)} />
                <input className="prop-input" placeholder="Y" value={rotY} onChange={(e) => setRotY(e.target.value)} />
                <input className="prop-input" placeholder="Z" value={rotZ} onChange={(e) => setRotZ(e.target.value)} />
              </div>

              <div className="prop-field-label" style={{ marginTop: '12px', marginBottom: '6px', fontSize: '12px' }}>
                Scale
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                <input className="prop-input" placeholder="X" value={scaleX} onChange={(e) => setScaleX(e.target.value)} />
                <input className="prop-input" placeholder="Y" value={scaleY} onChange={(e) => setScaleY(e.target.value)} />
                <input className="prop-input" placeholder="Z" value={scaleZ} onChange={(e) => setScaleZ(e.target.value)} />
              </div>

              {selectedObject.type !== 'light' && (
                <>
                  <div className="prop-field-label" style={{ marginTop: '12px', marginBottom: '6px', fontSize: '12px' }}>
                    Color
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input 
                      type="color" 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)}
                      style={{ width: '60px', height: '32px', cursor: 'pointer' }}
                    />
                    <input 
                      className="prop-input" 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)}
                      style={{ flex: 1 }}
                      placeholder="#4a90e2"
                    />
                  </div>
                </>
              )}

              <button className="btn" style={{ width: '100%', marginTop: '12px' }} onClick={applyTransform}>
                ✅ Apply Transform
              </button>

              <div className="prop-field-label" style={{ marginTop: '20px', marginBottom: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    placeholder="// JavaScript code for this object&#10;// Access: mesh, THREE, scene, time&#10;// Example: mesh.rotation.y += 0.01;"
                    style={{
                      width: '100%',
                      minHeight: '150px',
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
                  <div className="smalltext" style={{ marginTop: '6px', fontSize: '10px', lineHeight: '1.4' }}>
                    Script runs every frame. Use <code>mesh</code>, <code>THREE</code>, <code>scene</code>, and <code>time</code> (ms).
                  </div>
                </>
              )}

              <button
                className="btn"
                style={{ 
                  width: '100%', 
                  marginTop: '16px',
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
              Select an object from the Explorer to edit its properties
            </div>
          )}

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div className="prop-field-label" style={{ marginBottom: '6px', fontSize: '12px' }}>
              Game Title
            </div>
            <input
              className="prop-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Untitled Game"
              style={{ width: '100%', marginBottom: '12px' }}
            />
            <div className="prop-field-label" style={{ marginBottom: '6px', fontSize: '12px' }}>
              Description
            </div>
            <textarea
              className="prop-textarea"
              value={draft.desc}
              onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              placeholder="Describe your game..."
              style={{ width: '100%', minHeight: '60px', marginBottom: '12px' }}
            />
            <div className="prop-field-label" style={{ marginBottom: '6px', fontSize: '12px' }}>
              Creator
            </div>
            <input
              className="prop-input"
              value={draft.owner}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
              placeholder={user.username}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
