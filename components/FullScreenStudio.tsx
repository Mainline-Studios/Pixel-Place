'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

type PixelPlacerMode = 'realism' | '3d' | '2d';

interface FullScreenStudioProps {
  mode: PixelPlacerMode;
  onClose: () => void;
}

export default function FullScreenStudio({ mode, onClose }: FullScreenStudioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [sceneObjects, setSceneObjects] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [showProperties, setShowProperties] = useState(true);
  const [showAssets, setShowAssets] = useState(false);
  const [showScripts, setShowScripts] = useState(false);
  const [showNetworking, setShowNetworking] = useState(false);
  
  // Three.js scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<any>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1d29);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      canvas: canvasRef.current || undefined
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (!canvasRef.current && containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x3a3f57, 0x2a2f45);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close
      if (e.key === 'Escape' && !e.shiftKey) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
      // F11 or F for fullscreen
      if (e.key === 'F11' || (e.key === 'f' && e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
      // T to toggle toolbar
      if (e.key === 't' && e.ctrlKey) {
        e.preventDefault();
        setShowToolbar(!showToolbar);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, toggleFullscreen, showToolbar]);

  const addObject = (type: string) => {
    if (!sceneRef.current) return;

    let object: THREE.Object3D;
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    );

    switch (type) {
      case 'cube':
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
        object = new THREE.Mesh(cubeGeometry, cubeMaterial);
        object.position.copy(position);
        object.castShadow = true;
        object.receiveShadow = true;
        break;
      case 'sphere':
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc71 });
        object = new THREE.Mesh(sphereGeometry, sphereMaterial);
        object.position.copy(position);
        object.castShadow = true;
        object.receiveShadow = true;
        break;
      case 'plane':
        const planeGeometry = new THREE.PlaneGeometry(5, 5);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x95a5a6 });
        object = new THREE.Mesh(planeGeometry, planeMaterial);
        object.rotation.x = -Math.PI / 2;
        object.position.copy(position);
        object.receiveShadow = true;
        break;
      default:
        return;
    }

    sceneRef.current.add(object);
    setSceneObjects([...sceneObjects, { id: Date.now(), type, object }]);
  };

  const deleteSelectedObject = () => {
    if (!selectedObject || !sceneRef.current) return;
    sceneRef.current.remove(selectedObject.object);
    setSceneObjects(sceneObjects.filter(obj => obj.id !== selectedObject.id));
    setSelectedObject(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#0f1117',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Top Toolbar */}
      {showToolbar && (
        <div
          style={{
            background: 'linear-gradient(180deg, #1a1d29 0%, #0f1117 100%)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#00aaff' }}>
              {mode === 'realism' && '🌟 Realism Pixel'}
              {mode === '3d' && '🎯 3D Pixel'}
              {mode === '2d' && '📐 2D Pixel'}
            </div>
            <div style={{ 
              padding: '4px 12px', 
              background: 'var(--panel-soft)', 
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-dim)'
            }}>
              Full Screen Studio
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setShowToolbar(!showToolbar)}
              style={{
                padding: '6px 12px',
                background: 'var(--panel-soft)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Toggle Toolbar (Ctrl+T)"
            >
              {showToolbar ? '⬇️' : '⬆️'}
            </button>
            <button
              onClick={toggleFullscreen}
              style={{
                padding: '6px 12px',
                background: 'var(--panel-soft)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Fullscreen (F11)"
            >
              {isFullscreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                background: '#ff4d4d',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              ✕ Close (ESC)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Tools */}
        {showToolbar && (
          <div
            style={{
              width: '280px',
              background: 'var(--panel)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            {/* Tool Selection */}
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Tools</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {['select', 'move', 'rotate', 'scale', 'add', 'delete'].map(tool => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    style={{
                      padding: '8px',
                      background: selectedTool === tool ? 'var(--accent-bg)' : 'var(--panel-soft)',
                      border: selectedTool === tool ? '2px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={tool.charAt(0).toUpperCase() + tool.slice(1)}
                  >
                    {tool === 'select' && '👆'}
                    {tool === 'move' && '↔️'}
                    {tool === 'rotate' && '🔄'}
                    {tool === 'scale' && '📏'}
                    {tool === 'add' && '➕'}
                    {tool === 'delete' && '🗑️'}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Objects */}
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Add Objects</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => addObject('cube')}
                  style={{
                    padding: '10px',
                    background: 'var(--panel-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⬜</span> Cube
                </button>
                <button
                  onClick={() => addObject('sphere')}
                  style={{
                    padding: '10px',
                    background: 'var(--panel-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🔵</span> Sphere
                </button>
                <button
                  onClick={() => addObject('plane')}
                  style={{
                    padding: '10px',
                    background: 'var(--panel-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⬛</span> Plane
                </button>
              </div>
            </div>

            {/* Scene Objects List */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Scene Objects</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sceneObjects.map(obj => (
                  <div
                    key={obj.id}
                    onClick={() => setSelectedObject(obj)}
                    style={{
                      padding: '8px',
                      background: selectedObject?.id === obj.id ? 'var(--accent-bg)' : 'var(--panel-soft)',
                      border: selectedObject?.id === obj.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{obj.type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sceneRef.current) {
                          sceneRef.current.remove(obj.object);
                          setSceneObjects(sceneObjects.filter(o => o.id !== obj.id));
                          if (selectedObject?.id === obj.id) {
                            setSelectedObject(null);
                          }
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ff4d4d',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {sceneObjects.length === 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                    No objects in scene
                  </div>
                )}
              </div>
            </div>

            {/* Panel Toggles */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => setShowProperties(!showProperties)}
                  style={{
                    padding: '8px',
                    background: showProperties ? 'var(--accent-bg)' : 'var(--panel-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}
                >
                  {showProperties ? '▼' : '▶'} Properties
                </button>
                <button
                  onClick={() => setShowAssets(!showAssets)}
                  style={{
                    padding: '8px',
                    background: showAssets ? 'var(--accent-bg)' : 'var(--panel-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}
                >
                  {showAssets ? '▼' : '▶'} Assets
                </button>
                <button
                  onClick={() => setShowScripts(!showScripts)}
                  style={{
                    padding: '8px',
                    background: showScripts ? 'var(--accent-bg)' : 'var(--panel-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}
                >
                  {showScripts ? '▼' : '▶'} Scripts
                </button>
                <button
                  onClick={() => setShowNetworking(!showNetworking)}
                  style={{
                    padding: '8px',
                    background: showNetworking ? 'var(--accent-bg)' : 'var(--panel-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}
                >
                  {showNetworking ? '▼' : '▶'} Networking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Center - 3D Viewport */}
        <div style={{ flex: 1, position: 'relative', background: '#0d1019' }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block'
            }}
          />
          
          {/* Viewport Overlay Info */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(26, 29, 41, 0.9)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-dim)',
              border: '1px solid var(--border)'
            }}
          >
            Objects: {sceneObjects.length} | Tool: {selectedTool}
          </div>
        </div>

        {/* Right Sidebar - Properties & Panels */}
        {showToolbar && (
          <div
            style={{
              width: '320px',
              background: 'var(--panel)',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              flexShrink: 0
            }}
          >
            {/* Properties Panel */}
            {showProperties && (
              <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                  Properties
                </div>
                {selectedObject ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Type</div>
                      <div style={{ padding: '8px', background: 'var(--panel-soft)', borderRadius: '6px', fontSize: '12px' }}>
                        {selectedObject.type}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Position</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {['X', 'Y', 'Z'].map(axis => (
                          <input
                            key={axis}
                            type="number"
                            value={selectedObject.object.position[axis.toLowerCase()]}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              selectedObject.object.position[axis.toLowerCase()] = value;
                              setSelectedObject({ ...selectedObject });
                            }}
                            style={{
                              padding: '6px',
                              background: 'var(--panel-soft)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              color: 'var(--text-main)',
                              fontSize: '12px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Rotation</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {['X', 'Y', 'Z'].map(axis => (
                          <input
                            key={axis}
                            type="number"
                            value={THREE.MathUtils.radToDeg(selectedObject.object.rotation[axis.toLowerCase()]).toFixed(1)}
                            onChange={(e) => {
                              const value = THREE.MathUtils.degToRad(parseFloat(e.target.value) || 0);
                              selectedObject.object.rotation[axis.toLowerCase()] = value;
                              setSelectedObject({ ...selectedObject });
                            }}
                            style={{
                              padding: '6px',
                              background: 'var(--panel-soft)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              color: 'var(--text-main)',
                              fontSize: '12px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Scale</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {['X', 'Y', 'Z'].map(axis => (
                          <input
                            key={axis}
                            type="number"
                            step="0.1"
                            value={selectedObject.object.scale[axis.toLowerCase()]}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 1;
                              selectedObject.object.scale[axis.toLowerCase()] = value;
                              setSelectedObject({ ...selectedObject });
                            }}
                            style={{
                              padding: '6px',
                              background: 'var(--panel-soft)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              color: 'var(--text-main)',
                              fontSize: '12px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    {selectedObject.object.material && (
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Color</div>
                        <input
                          type="color"
                          value={'#' + selectedObject.object.material.color.getHexString()}
                          onChange={(e) => {
                            selectedObject.object.material.color.set(e.target.value);
                            setSelectedObject({ ...selectedObject });
                          }}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                    Select an object to edit properties
                  </div>
                )}
              </div>
            )}

            {/* Assets Panel */}
            {showAssets && (
              <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Asset Manager</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Import 3D models (.stl, .obj, .gltf)
                  </div>
                  <input
                    type="file"
                    accept=".stl,.obj,.gltf,.glb"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Implement 3D model loading
                        alert('3D model import coming soon!');
                      }
                    }}
                    style={{ display: 'none' }}
                    id="model-upload"
                  />
                  <button
                    onClick={() => document.getElementById('model-upload')?.click()}
                    style={{
                      padding: '10px',
                      background: 'var(--accent-bg)',
                      border: '1px solid var(--accent)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📁 Import 3D Model
                  </button>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
                    Supported: STL, OBJ, GLTF, GLB formats
                  </div>
                </div>
              </div>
            )}

            {/* Scripts Panel */}
            {showScripts && (
              <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Scripting</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    placeholder="// Write your game script here..."
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '8px',
                      background: '#0d1117',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: '#c9d1d9',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    style={{
                      padding: '8px',
                      background: 'var(--accent-bg)',
                      border: '1px solid var(--accent)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ▶ Run Script
                  </button>
                </div>
              </div>
            )}

            {/* Networking Panel */}
            {showNetworking && (
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Networking</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" />
                    Enable Multiplayer
                  </label>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    Configure real-time multiplayer synchronization
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
