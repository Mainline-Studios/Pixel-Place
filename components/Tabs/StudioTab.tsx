'use client';

import { useEffect, useRef, useState } from 'react';
import { User, SceneObject, DraftGame } from '@/types';
import { getDraft, saveDraft, getPublished, savePublished, getSceneData, saveSceneData } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';

interface StudioTabProps {
  user: User;
  editMode: boolean;
}

interface SceneObjectRef {
  id: string;
  type: 'cube' | 'sphere' | 'light';
  mesh: any;
}

export default function StudioTab({ user, editMode }: StudioTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [sceneObjects, setSceneObjects] = useState<SceneObjectRef[]>([]);
  const [draft, setDraft] = useState<DraftGame>({ title: '', desc: '', owner: '' });
  const [posX, setPosX] = useState('');
  const [posY, setPosY] = useState('');
  const [posZ, setPosZ] = useState('');

  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);

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

    // Dynamic import for Three.js
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
          requestAnimationFrame(animate);
          if (controls) controls.update();
          renderer.render(scene, camera);
        }
        animate();

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

  const makeCubeMesh = (THREE: any) => {
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0, 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const makeSphereMesh = (THREE: any) => {
    const geom = new THREE.SphereGeometry(0.5, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff4d4d });
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
        mesh = makeCubeMesh(THREE);
      } else if (o.type === 'sphere') {
        mesh = makeSphereMesh(THREE);
      } else if (o.type === 'light') {
        mesh = makeLight(THREE);
      } else {
        return;
      }
      mesh.position.set(o.position.x, o.position.y, o.position.z);
      scene.add(mesh);
      objects.push({ id: o.id, type: o.type, mesh });
    });
    setSceneObjects(objects);
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
    sceneRef.current.add(mesh);
    const newObjects = [...sceneObjects, { id, type, mesh }];
    setSceneObjects(newObjects);
    rebuildExplorerList(newObjects);
  };

  const rebuildExplorerList = (objects: SceneObjectRef[] = sceneObjects) => {
    const treeEl = document.getElementById('explorerTree');
    if (!treeEl) return;
    let out = 'Scene Objects:\n';
    objects.forEach((o) => {
      const selMark = o.id === selectedObjectId ? '* ' : '  ';
      out += `${selMark}${o.id} [${o.type}]  pos(${o.mesh.position.x.toFixed(1)},${o.mesh.position.y.toFixed(1)},${o.mesh.position.z.toFixed(1)})\n`;
    });
    out += '\n(click to select object)';
    treeEl.textContent = out;
  };

  useEffect(() => {
    rebuildExplorerList();
  }, [sceneObjects, selectedObjectId]);

  const selectObject = () => {
    const pick = prompt('Type object id to select:');
    if (!pick) return;

    const obj = sceneObjects.find((o) => o.id === pick.trim());
    if (!obj) {
      alert('Object not found: ' + pick);
      return;
    }

    setSelectedObjectId(obj.id);
    setPosX(obj.mesh.position.x.toFixed(2));
    setPosY(obj.mesh.position.y.toFixed(2));
    setPosZ(obj.mesh.position.z.toFixed(2));
  };

  const applyTransform = () => {
    if (!selectedObjectId) return;
    const obj = sceneObjects.find((o) => o.id === selectedObjectId);
    if (!obj) return;

    const nx = parseFloat(posX) || 0;
    const ny = parseFloat(posY) || 0;
    const nz = parseFloat(posZ) || 0;

    obj.mesh.position.set(nx, ny, nz);
    setSceneObjects([...sceneObjects]);
  };

  const deleteSelected = () => {
    if (!selectedObjectId) return;
    const idx = sceneObjects.findIndex((o) => o.id === selectedObjectId);
    if (idx === -1) return;
    const obj = sceneObjects[idx];

    if (obj.mesh && sceneRef.current) {
      sceneRef.current.remove(obj.mesh);
    }

    const newObjects = sceneObjects.filter((o) => o.id !== selectedObjectId);
    setSceneObjects(newObjects);
    setSelectedObjectId(null);
    setPosX('');
    setPosY('');
    setPosZ('');
  };

  const saveScene = () => {
    const data = {
      objects: sceneObjects.map((o) => ({
        id: o.id,
        type: o.type,
        position: {
          x: o.mesh.position.x,
          y: o.mesh.position.y,
          z: o.mesh.position.z,
        },
      })),
    };
    saveSceneData(data);
    alert('Scene saved.');
  };

  const loadScene = async () => {
    sceneObjects.forEach((o) => {
      if (o.mesh && sceneRef.current) {
        sceneRef.current.remove(o.mesh);
      }
    });
    setSceneObjects([]);
    setSelectedObjectId(null);
    if (sceneRef.current) {
      const THREE = await import('three');
      loadSceneObjects(sceneRef.current, THREE);
    }
    alert('Scene loaded.');
  };

  const saveDraftFromProps = () => {
    saveDraft(draft);
    alert('Draft saved.');
  };

  const publishDraftNow = async () => {
    if (user.role !== 'admin') {
      alert('Only admins can publish live.');
      return;
    }
    if (!draft.title) {
      alert('No draft to publish. Save draft first in Studio.');
      return;
    }
    const pub = await getPublished();
    pub.push({
      title: draft.title,
      desc: draft.desc || '(no description)',
      owner: draft.owner || user.username,
      ts: Date.now(),
    });
    savePublished(pub);
    alert("Published '" + draft.title + "' to Discover instantly (no approval).");
  };

  return (
    <>
      <h2 className="section-title">Studio</h2>
      <div className="studio-toolbar">
        <div className="toolbar-title">Studio Toolbar</div>
        <button className="btn" onClick={() => addObject('cube')}>
          + Cube
        </button>
        <button className="btn" onClick={() => addObject('sphere')}>
          + Sphere
        </button>
        <button className="btn" onClick={() => addObject('light')}>
          + Light
        </button>
        <button className="btn" onClick={saveScene}>
          Save Scene
        </button>
        <button className="btn" onClick={loadScene}>
          Load Scene
        </button>
        <button className="btn" onClick={saveDraftFromProps}>
          Save Draft
        </button>
        {user.role === 'admin' ? (
          <button className="btn" onClick={publishDraftNow}>
            Publish Game Now
          </button>
        ) : (
          <button className="btn" disabled title="Admin only">
            Publish Game Now
          </button>
        )}
      </div>
      <div className="studio-layout">
        <div className="explorer-panel">
          <div className="explorer-title">EXPLORER</div>
          <div className="explorer-tree" id="explorerTree" onClick={selectObject}>
            (scene will list objects here)
          </div>
        </div>
        <div className="viewport-panel">
          <div className="viewport-header">
            <div>3D Viewport</div>
            <div style={{ fontSize: '11px', color: '#8b90a8' }}>
              Orbit: drag • Zoom: scroll • Pan: right-click
            </div>
          </div>
          <div className="viewport-canvas-wrap">
            <canvas id="studioCanvas" ref={canvasRef}></canvas>
          </div>
        </div>
        <div className="props-panel">
          <div className="props-title">PROPERTIES</div>
          <div className="prop-field-label">Selected Object</div>
          <input className="prop-input" value={selectedObjectId || ''} disabled />
          <div className="prop-field-label">Position (X / Y / Z)</div>
          <div className="prop-row-xyz">
            <input
              className="prop-input"
              placeholder="X"
              value={posX}
              onChange={(e) => setPosX(e.target.value)}
            />
            <input
              className="prop-input"
              placeholder="Y"
              value={posY}
              onChange={(e) => setPosY(e.target.value)}
            />
            <input
              className="prop-input"
              placeholder="Z"
              value={posZ}
              onChange={(e) => setPosZ(e.target.value)}
            />
          </div>
          <div className="prop-field-label">Apply Transform</div>
          <button className="btn" style={{ width: '100%' }} onClick={applyTransform}>
            Apply
          </button>
          <div className="prop-field-label">Delete Object</div>
          <button
            className="btn"
            style={{ width: '100%', background: '#3a1a1a', borderColor: '#5a2a2a', color: '#ff4d4d' }}
            onClick={deleteSelected}
          >
            Delete Selected
          </button>
          <div className="prop-field-label">Draft Title</div>
          <input
            className="prop-input"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Untitled Game"
          />
          <div className="prop-field-label">Description</div>
          <textarea
            className="prop-textarea"
            value={draft.desc}
            onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
            placeholder="Describe your game..."
          />
          <div className="prop-field-label">Creator</div>
          <input
            className="prop-input"
            value={draft.owner}
            onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
            placeholder="Creator name"
          />
          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button className="btn" onClick={saveDraftFromProps}>
              Save Draft
            </button>
            {user.role === 'admin' ? (
              <button className="btn" onClick={publishDraftNow}>
                Publish Game Now
              </button>
            ) : (
              <button className="btn" disabled title="Admin only">
                Publish Game Now
              </button>
            )}
          </div>
          <div className="smalltext" style={{ marginTop: '10px' }}>
            Saving draft updates your work-in-progress. Publish Game Now (admin only) makes it live in Discover
            instantly.
          </div>
        </div>
      </div>
    </>
  );
}

