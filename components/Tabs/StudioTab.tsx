'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

export default function StudioTab({ user, editMode }: StudioTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [sceneObjects, setSceneObjects] = useState<SceneObjectRef[]>([]);
  const [draft, setDraft] = useState<DraftGame>({ title: '', desc: '', owner: '' });
  const [activeTab, setActiveTab] = useState<'properties' | 'script' | 'game'>('properties');
  
  // Transform properties
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
  const [script, setScript] = useState('');

  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const raycasterRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const scriptExecutorsRef = useRef<Map<string, any>>(new Map());
  const isDraggingRef = useRef(false);
  const dragObjectRef = useRef<string | null>(null);
  const selectedObjectIdRef = useRef<string | null>(null);

  const dragPlaneRef = useRef<any>(null);


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
    ]).then(([THREE, OrbitControlsModule]) => {
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

      const raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;

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

      // Create drag plane
      const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      dragPlaneRef.current = dragPlane;

      
      // Mouse down - start drag or select
      const handleMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) return; // Only left mouse button
        
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouseRef.current, camera);
        const intersects = raycaster.intersectObjects(scene.children.filter((child: any) => {
          return child.userData.objectId;
        }));

        if (intersects.length > 0) {
          const objectId = intersects[0].object.userData.objectId;
          const mesh = intersects[0].object;
          if (mesh) {
            // Find object in current sceneObjects
            const currentObjects = sceneObjects;
            const obj = currentObjects.find(o => o.id === objectId);
            if (obj) {
              selectObjectById(objectId);
              selectedObjectIdRef.current = objectId;
              isDraggingRef.current = true;
              dragObjectRef.current = objectId;
              controls.enabled = false;
              
              // Update drag plane to object's Y position
              dragPlane.constant = -mesh.position.y;
            }
          }
        } else {
          setSelectedObjectId(null);
          selectedObjectIdRef.current = null;
        }
      };

      // Mouse move - drag object
      const handleMouseMove = (event: MouseEvent) => {
        if (isDraggingRef.current && dragObjectRef.current) {
          // Get mesh directly from scene
          const mesh = scene.children.find((child: any) => 
            child.userData.objectId === dragObjectRef.current
          );
          
          if (mesh) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
            const intersect = new THREE.Vector3();
            raycaster.ray.intersectPlane(dragPlane, intersect);
            
            if (intersect) {
              mesh.position.copy(intersect);
              mesh.position.y = Math.max(0.5, mesh.position.y);
              
              // Update state
              setPosX(mesh.position.x.toFixed(2));
              setPosY(mesh.position.y.toFixed(2));
              setPosZ(mesh.position.z.toFixed(2));
              
              // Update sceneObjects state
              setSceneObjects(prev => prev.map(o => 
                o.id === dragObjectRef.current 
                  ? { ...o, mesh } 
                  : o
              ));
            }
          }
        }
      };

      // Mouse up - end drag
      const handleMouseUp = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          dragObjectRef.current = null;
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
          }
        }
      };

      // Mouse wheel - scale selected object
      const handleWheel = (event: WheelEvent) => {
        if (selectedObjectIdRef.current && !isDraggingRef.current) {
          event.preventDefault();
          const mesh = scene.children.find((child: any) => 
            child.userData.objectId === selectedObjectIdRef.current
          );
          
          if (mesh) {
            const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
            mesh.scale.multiplyScalar(scaleFactor);
            setScaleX(mesh.scale.x.toFixed(2));
            setScaleY(mesh.scale.y.toFixed(2));
            setScaleZ(mesh.scale.z.toFixed(2));
            
            // Update sceneObjects state
            setSceneObjects(prev => prev.map(o => 
              o.id === selectedObjectIdRef.current 
                ? { ...o, mesh } 
                : o
            ));
          }
        }
      };

      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('wheel', handleWheel);
      };

      loadSceneObjects(scene, THREE);

      let lastTime = 0;
      function animate(time: number) {
        requestAnimationFrame(animate);
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        
        if (controls) controls.update();
        
        // Execute scripts
        executeScripts(delta);
        
        renderer.render(scene, camera);
      }
      animate(0);

      const handleResize = () => resizeRenderer(renderer, canvas);
      resizeHandlerRef.current = handleResize;
      window.addEventListener('resize', handleResize);

    });

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
    };
  }, []);

  // Load draft on mount
  useEffect(() => {
    const loadDraftData = async () => {
      const savedDraft = await getDraft();
      if (savedDraft && (savedDraft.title || savedDraft.desc || savedDraft.owner)) {
        setDraft(savedDraft);
      }
    };
    loadDraftData();
  }, []);


  const executeScripts = (delta: number) => {
    sceneObjects.forEach((obj) => {
      if (obj.script && obj.mesh) {
        try {
          const executor = scriptExecutorsRef.current.get(obj.id);
          if (executor) {
            executor.update(delta, obj.mesh);
          }
        } catch (e) {
          console.error(`Error executing script for ${obj.id}:`, e);
        }
      }
    });
  };

  const compileScript = (scriptCode: string, objectId: string) => {
    try {
      const updateFn = new Function('delta', 'mesh', `
        const position = mesh.position;
        const rotation = mesh.rotation;
        const scale = mesh.scale;
        ${scriptCode}
      `);
      
      scriptExecutorsRef.current.set(objectId, {
        update: updateFn
      });
      return true;
    } catch (e) {
      console.error('Script compilation error:', e);
      return false;
    }
  };

  const makeCubeMesh = (THREE: any, color?: string) => {
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const colorHex = color ? parseInt(color.replace('#', '0x')) : 0x4a90e2;
    const mat = new THREE.MeshStandardMaterial({ color: colorHex });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0, 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const makeSphereMesh = (THREE: any, color?: string) => {
    const geom = new THREE.SphereGeometry(0.5, 32, 32);
    const colorHex = color ? parseInt(color.replace('#', '0x')) : 0xff4d4d;
    const mat = new THREE.MeshStandardMaterial({ color: colorHex });
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

  const loadSceneObjects = async (scene: any, THREE: any) => {
    const saved = await getSceneData();
    if (!saved || !saved.objects) return;

    const objects: SceneObjectRef[] = [];
    saved.objects.forEach((o: SceneObject) => {
      let mesh;
      if (o.type === 'cube') {
        mesh = makeCubeMesh(THREE, o.color);
      } else if (o.type === 'sphere') {
        mesh = makeSphereMesh(THREE, o.color);
      } else if (o.type === 'light') {
        mesh = makeLight(THREE);
      } else {
        return;
      }
      
      mesh.position.set(o.position.x, o.position.y, o.position.z);
      if (o.rotation) {
        mesh.rotation.set(o.rotation.x, o.rotation.y, o.rotation.z);
      }
      if (o.scale) {
        mesh.scale.set(o.scale.x, o.scale.y, o.scale.z);
      }
      mesh.userData.objectId = o.id;
      
      scene.add(mesh);
      objects.push({ id: o.id, type: o.type, mesh, script: o.script });
      
      if (o.script) {
        compileScript(o.script, o.id);
      }
    });
    setSceneObjects(objects);
  };

  const selectObjectById = (id: string) => {
    const obj = sceneObjects.find((o) => o.id === id);
    if (!obj) return;

    setSelectedObjectId(id);
    selectedObjectIdRef.current = id;
    setPosX(obj.mesh.position.x.toFixed(2));
    setPosY(obj.mesh.position.y.toFixed(2));
    setPosZ(obj.mesh.position.z.toFixed(2));
    setRotX((obj.mesh.rotation.x * 180 / Math.PI).toFixed(2));
    setRotY((obj.mesh.rotation.y * 180 / Math.PI).toFixed(2));
    setRotZ((obj.mesh.rotation.z * 180 / Math.PI).toFixed(2));
    setScaleX(obj.mesh.scale.x.toFixed(2));
    setScaleY(obj.mesh.scale.y.toFixed(2));
    setScaleZ(obj.mesh.scale.z.toFixed(2));
    
    if (obj.mesh.material && obj.mesh.material.color) {
      const color = obj.mesh.material.color;
      setColor('#' + color.getHexString());
    }
    
    setScript(obj.script || '');
  };

  const addObject = async (type: 'cube' | 'sphere' | 'light') => {
    if (!sceneRef.current) return;

    const THREE = await import('three');
    let mesh;
    if (type === 'cube') {
      mesh = makeCubeMesh(THREE);
    } else if (type === 'sphere') {
      mesh = makeSphereMesh(THREE);
    } else {
      mesh = makeLight(THREE);
    }

    const id = 'obj_' + Date.now();
    mesh.userData.objectId = id;
    sceneRef.current.add(mesh);
    const newObjects = [...sceneObjects, { id, type, mesh }];
    setSceneObjects(newObjects);
  };

  const applyTransform = () => {
    if (!selectedObjectId) return;
    const obj = sceneObjects.find((o) => o.id === selectedObjectId);
    if (!obj) return;

    const nx = parseFloat(posX) || 0;
    const ny = parseFloat(posY) || 0;
    const nz = parseFloat(posZ) || 0;
    obj.mesh.position.set(nx, ny, nz);

    const rx = (parseFloat(rotX) || 0) * Math.PI / 180;
    const ry = (parseFloat(rotY) || 0) * Math.PI / 180;
    const rz = (parseFloat(rotZ) || 0) * Math.PI / 180;
    obj.mesh.rotation.set(rx, ry, rz);

    const sx = parseFloat(scaleX) || 1;
    const sy = parseFloat(scaleY) || 1;
    const sz = parseFloat(scaleZ) || 1;
    obj.mesh.scale.set(sx, sy, sz);

    if (obj.mesh.material && obj.mesh.material.color) {
      obj.mesh.material.color.set(color);
    }

    setSceneObjects([...sceneObjects]);
  };

  const saveScript = () => {
    if (!selectedObjectId) return;
    const obj = sceneObjects.find((o) => o.id === selectedObjectId);
    if (!obj) return;

    if (compileScript(script, selectedObjectId)) {
      obj.script = script;
      setSceneObjects([...sceneObjects]);
      alert('Script saved and compiled!');
    } else {
      alert('Script compilation failed. Check console for errors.');
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
    scriptExecutorsRef.current.delete(selectedObjectId);

    const newObjects = sceneObjects.filter((o) => o.id !== selectedObjectId);
    setSceneObjects(newObjects);
    setSelectedObjectId(null);
    resetProperties();
  };

  const resetProperties = () => {
    setPosX('');
    setPosY('');
    setPosZ('');
    setRotX('');
    setRotY('');
    setRotZ('');
    setScaleX('');
    setScaleY('');
    setScaleZ('');
    setColor('#4a90e2');
    setScript('');
  };

  const saveScene = async () => {
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
          x: o.mesh.rotation.x,
          y: o.mesh.rotation.y,
          z: o.mesh.rotation.z,
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
    });
    scriptExecutorsRef.current.clear();
    setSceneObjects([]);
    setSelectedObjectId(null);
    resetProperties();
    if (sceneRef.current) {
      const THREE = await import('three');
      loadSceneObjects(sceneRef.current, THREE);
    }
    alert('Scene loaded.');
  };

  const saveDraftFromProps = async () => {
    await saveDraft(draft);
    // Reload draft to ensure state is in sync
    const savedDraft = await getDraft();
    setDraft(savedDraft);
    alert('Draft saved.');
  };

  const publishToUserMadeGames = async () => {
    if (user.role !== 'admin') {
      alert('Only admins can publish games.');
      return;
    }
    // Reload draft from storage to ensure we have the latest
    const currentDraft = await getDraft();
    if (!currentDraft.title) {
      alert('No draft to publish. Save draft first in Studio.');
      return;
    }
    setDraft(currentDraft);
    const sceneData = await getSceneData();
    if (!sceneData || !sceneData.objects || sceneData.objects.length === 0) {
      alert('No scene data to publish. Create a scene first.');
      return;
    }
    const game: UserMadeGame = {
      id: 'game_' + Date.now(),
      title: currentDraft.title,
      desc: currentDraft.desc || '(no description)',
      owner: currentDraft.owner || user.username,
      ts: Date.now(),
      sceneData: sceneData,
      publishedBy: user.username
    };
    await saveUserMadeGame(game);
    alert("Published '" + currentDraft.title + "' to Games tab!");
  };

  const submitGameForReview = async () => {
    // Reload draft from storage to ensure we have the latest
    const currentDraft = await getDraft();
    if (!currentDraft.title) {
      alert('No draft to submit. Save draft first in Studio.');
      return;
    }
    setDraft(currentDraft);
    const sceneData = await getSceneData();
    if (!sceneData || !sceneData.objects || sceneData.objects.length === 0) {
      alert('No scene data to submit. Create a scene first.');
      return;
    }
    const submission: GameSubmission = {
      id: 'submission_' + Date.now(),
      title: currentDraft.title,
      desc: currentDraft.desc || '(no description)',
      owner: currentDraft.owner || user.username,
      ts: Date.now(),
      sceneData: sceneData,
      status: 'pending'
    };
    await saveGameSubmission(submission);
    alert("Submitted '" + currentDraft.title + "' for admin review!");
  };

  const publishDraftNow = async () => {
    if (user.role !== 'admin') {
      alert('Only admins can publish live.');
      return;
    }
    // Reload draft from storage to ensure we have the latest
    const currentDraft = await getDraft();
    if (!currentDraft.title) {
      alert('No draft to publish. Save draft first in Studio.');
      return;
    }
    setDraft(currentDraft);
    const pub = await getPublished();
    pub.push({
      title: currentDraft.title,
      desc: currentDraft.desc || '(no description)',
      owner: currentDraft.owner || user.username,
      ts: Date.now(),
    });
    await savePublished(pub);
    alert("Published '" + currentDraft.title + "' to Discover instantly (no approval).");
  };

  const selectedObject = sceneObjects.find(o => o.id === selectedObjectId);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)' }}>
      {/* Modern Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🎨 Studio
          </h2>
          <p style={{ fontSize: '14px', color: '#8b90a8', margin: '4px 0 0 0' }}>Create and design 3D games</p>
        </div>
      </div>
      
      {/* Modern Toolbar */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        flexWrap: 'wrap', 
        padding: '16px', 
        background: 'rgba(26, 31, 46, 0.8)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#8b90a8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Objects</span>
          <button className="btn" onClick={() => addObject('cube')} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>📦 Cube</button>
          <button className="btn" onClick={() => addObject('sphere')} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none', color: 'white', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)' }}>⚪ Sphere</button>
          <button className="btn" onClick={() => addObject('light')} style={{ background: 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)', border: 'none', color: 'white', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(247, 107, 28, 0.3)' }}>💡 Light</button>
        </div>
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 8px' }}></div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#8b90a8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scene</span>
          <button className="btn" onClick={saveScene} style={{ background: 'rgba(52, 152, 219, 0.2)', border: '1px solid rgba(52, 152, 219, 0.3)', color: '#3498db', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>💾 Save</button>
          <button className="btn" onClick={loadScene} style={{ background: 'rgba(46, 204, 113, 0.2)', border: '1px solid rgba(46, 204, 113, 0.3)', color: '#2ecc71', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>📂 Load</button>
        </div>
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 8px' }}></div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#8b90a8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Game</span>
          <button className="btn" onClick={saveDraftFromProps} style={{ background: 'rgba(155, 89, 182, 0.2)', border: '1px solid rgba(155, 89, 182, 0.3)', color: '#9b59b6', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>💾 Draft</button>
          {user.role === 'admin' ? (
            <>
              <button className="btn" onClick={publishDraftNow} style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: 'none', color: 'white', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)' }}>🚀 Publish</button>
              <button className="btn" onClick={publishToUserMadeGames} style={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', border: 'none', color: 'white', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(238, 9, 121, 0.3)' }}>🎮 Games</button>
            </>
          ) : (
            <button className="btn" onClick={submitGameForReview} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', fontWeight: 600, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>📤 Submit</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 380px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Explorer Panel */}
        <div style={{ background: 'rgba(26, 31, 46, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '16px', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ fontWeight: 700, marginBottom: '16px', fontSize: '13px', textTransform: 'uppercase', color: '#8b90a8', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📋</span> Scene Objects
            <span style={{ marginLeft: 'auto', background: 'rgba(102, 126, 234, 0.2)', color: '#667eea', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{sceneObjects.length}</span>
          </div>
          {sceneObjects.length === 0 ? (
            <div style={{ color: '#8b90a8', textAlign: 'center', padding: '40px 20px', fontSize: '14px', fontStyle: 'italic' }}>
              No objects in scene
              <div style={{ marginTop: '8px', fontSize: '24px' }}>🎨</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sceneObjects.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => selectObjectById(obj.id)}
                  style={{
                    padding: '12px',
                    background: selectedObjectId === obj.id ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' : 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: selectedObjectId === obj.id ? '1px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: selectedObjectId === obj.id ? 600 : 500, color: selectedObjectId === obj.id ? '#fff' : '#e0e0e0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{obj.type === 'cube' ? '📦' : obj.type === 'sphere' ? '⚪' : '💡'}</span>
                    <span style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace' }}>{obj.id}</span>
                  </div>
                  {obj.script && <div style={{ fontSize: '10px', color: '#2ecc71', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><span>📜</span> Scripted</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Viewport */}
        <div style={{ background: 'rgba(10, 14, 26, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '16px', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', color: '#8b90a8', marginBottom: '12px', padding: '8px 12px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '6px', border: '1px solid rgba(102, 126, 234, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💡</span>
            <span>Click & drag to move • Scroll to scale • Right-click to orbit</span>
          </div>
          <div style={{ flex: 1, position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <canvas id="studioCanvas" ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
        </div>

        {/* Properties Panel */}
        <div style={{ background: 'rgba(26, 31, 46, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '16px', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(0, 0, 0, 0.2)', padding: '4px', borderRadius: '8px' }}>
            <button onClick={() => setActiveTab('properties')} style={{ flex: 1, fontSize: '12px', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: activeTab === 'properties' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent', color: activeTab === 'properties' ? 'white' : '#8b90a8' }}>⚙️ Properties</button>
            <button onClick={() => setActiveTab('script')} style={{ flex: 1, fontSize: '12px', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: activeTab === 'script' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent', color: activeTab === 'script' ? 'white' : '#8b90a8' }}>📜 Script</button>
            <button onClick={() => setActiveTab('game')} style={{ flex: 1, fontSize: '12px', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: activeTab === 'game' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent', color: activeTab === 'game' ? 'white' : '#8b90a8' }}>🎮 Game</button>
          </div>

          {activeTab === 'properties' && (
            <div>
              {!selectedObject ? (
                <div style={{ color: '#8b90a8', textAlign: 'center', padding: '40px 20px', fontSize: '14px', fontStyle: 'italic' }}>Select an object to edit properties</div>
              ) : (
                <>
                  <div className="prop-field-label">Object ID</div>
                  <input className="prop-input" value={selectedObjectId || ''} disabled style={{ marginBottom: '12px' }} />
                  <div className="prop-field-label">Position</div>
                  <div className="prop-row-xyz" style={{ marginBottom: '12px' }}>
                    <input className="prop-input" placeholder="X" value={posX} onChange={(e) => setPosX(e.target.value)} />
                    <input className="prop-input" placeholder="Y" value={posY} onChange={(e) => setPosY(e.target.value)} />
                    <input className="prop-input" placeholder="Z" value={posZ} onChange={(e) => setPosZ(e.target.value)} />
                  </div>
                  <div className="prop-field-label">Rotation (degrees)</div>
                  <div className="prop-row-xyz" style={{ marginBottom: '12px' }}>
                    <input className="prop-input" placeholder="X" value={rotX} onChange={(e) => setRotX(e.target.value)} />
                    <input className="prop-input" placeholder="Y" value={rotY} onChange={(e) => setRotY(e.target.value)} />
                    <input className="prop-input" placeholder="Z" value={rotZ} onChange={(e) => setRotZ(e.target.value)} />
                  </div>
                  <div className="prop-field-label">Scale</div>
                  <div className="prop-row-xyz" style={{ marginBottom: '12px' }}>
                    <input className="prop-input" placeholder="X" value={scaleX} onChange={(e) => setScaleX(e.target.value)} />
                    <input className="prop-input" placeholder="Y" value={scaleY} onChange={(e) => setScaleY(e.target.value)} />
                    <input className="prop-input" placeholder="Z" value={scaleZ} onChange={(e) => setScaleZ(e.target.value)} />
                  </div>
                  {selectedObject.type !== 'light' && (
                    <>
                      <div className="prop-field-label">Color</div>
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', height: '40px', marginBottom: '12px', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    </>
                  )}
                  <button className="btn" style={{ width: '100%', marginBottom: '12px' }} onClick={applyTransform}>Apply Transform</button>
                  <button className="btn" style={{ width: '100%', background: '#3a1a1a', borderColor: '#5a2a2a', color: '#ff4d4d' }} onClick={deleteSelected}>Delete Object</button>
                </>
              )}
            </div>
          )}

          {activeTab === 'script' && (
            <div>
              {!selectedObject ? (
                <div style={{ color: '#8b90a8', textAlign: 'center', padding: '40px 20px', fontSize: '14px', fontStyle: 'italic' }}>Select an object to add scripting</div>
              ) : (
                <>
                  <div className="prop-field-label">JavaScript Script</div>
                  <div className="smalltext" style={{ marginBottom: '8px', color: 'var(--text-dim)' }}>
                    Use <code>delta</code> (time in seconds) and <code>mesh</code> (Three.js object).<br/>
                    Example: <code>rotation.y += delta;</code>
                  </div>
                  <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder="// Example: rotation.y += delta * 2;" style={{ width: '100%', height: '300px', padding: '12px', background: '#1a1a1a', color: '#e0e0e0', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', marginBottom: '12px', resize: 'vertical' }} />
                  <button className="btn" style={{ width: '100%' }} onClick={saveScript}>💾 Save & Compile Script</button>
                </>
              )}
            </div>
          )}

          {activeTab === 'game' && (
            <div>
              <div className="prop-field-label">Game Title</div>
              <input className="prop-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Untitled Game" style={{ marginBottom: '12px' }} />
              <div className="prop-field-label">Description</div>
              <textarea className="prop-textarea" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} placeholder="Describe your game..." style={{ marginBottom: '12px', minHeight: '80px' }} />
              <div className="prop-field-label">Creator</div>
              <input className="prop-input" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} placeholder="Creator name" style={{ marginBottom: '12px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn" onClick={saveDraftFromProps}>💾 Save Draft</button>
                {user.role === 'admin' ? (
                  <>
                    <button className="btn" onClick={publishDraftNow}>🚀 Publish to Discover</button>
                    <button className="btn" onClick={publishToUserMadeGames}>🎮 Publish to Games</button>
                  </>
                ) : (
                  <button className="btn" onClick={submitGameForReview}>📤 Submit for Review</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

