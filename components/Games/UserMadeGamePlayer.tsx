'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { UserMadeGame, User } from '@/types';
import FilteredText from '@/components/FilteredText';

const GamePlayer = dynamic(() => import('@/components/GamePlayer'), { ssr: false });

interface UserMadeGamePlayerProps {
  game: UserMadeGame;
  user?: User;
  onClose?: () => void;
}

/** Check if game has createGame(container) code - AI-generated or code editor */
function isCodeGame(game: UserMadeGame): boolean {
  return !!(game.gameCode && game.gameCode.trim().length > 0);
}

/** Check if game is an imported file (HTML/JS/etc) rather than 3D scene */
function isImportedFileGame(game: UserMadeGame): boolean {
  return !!(game.fileContent && (game.gameType === 'file' || game.gameType === 'html' || game.fileType));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function UserMadeGamePlayer({ game, user, onClose }: UserMadeGamePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const scriptExecutorsRef = useRef<Map<string, any>>(new Map());
  const meshesRef = useRef<Map<string, any>>(new Map());

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

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
      hemi.position.set(0, 20, 0);
      scene.add(hemi);

      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(5, 10, 5);
      scene.add(dir);

      const gridHelper = new THREE.GridHelper(40, 40, 0x444466, 0x222233);
      scene.add(gridHelper);

      if (game.sceneData && game.sceneData.objects) {
        game.sceneData.objects.forEach((obj) => {
          const pos = obj.position || { x: 0, y: 0, z: 0 };
          let mesh;
          if (obj.type === 'cube') {
            const geom = new THREE.BoxGeometry(1, 1, 1);
            const colorHex = obj.color ? parseInt(String(obj.color).replace('#', '0x')) : 0x4a90e2;
            const mat = new THREE.MeshStandardMaterial({ color: colorHex });
            mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(pos.x ?? 0, pos.y ?? 0, pos.z ?? 0);
          } else if (obj.type === 'sphere') {
            const geom = new THREE.SphereGeometry(0.5, 32, 32);
            const colorHex = obj.color ? parseInt(String(obj.color).replace('#', '0x')) : 0xff4d4d;
            const mat = new THREE.MeshStandardMaterial({ color: colorHex });
            mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(pos.x ?? 0, pos.y ?? 0, pos.z ?? 0);
          } else if (obj.type === 'light') {
            mesh = new THREE.PointLight(0xffffff, 1, 20);
            mesh.position.set(pos.x ?? 0, pos.y ?? 0, pos.z ?? 0);
          }
          if (mesh) {
            if (obj.rotation) {
              mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
            }
            if (obj.scale) {
              mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
            }
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            meshesRef.current.set(obj.id, mesh);
            
            if (obj.script) {
              try {
                const updateFn = new Function('delta', 'mesh', `
                  const position = mesh.position;
                  const rotation = mesh.rotation;
                  const scale = mesh.scale;
                  ${obj.script}
                `);
                scriptExecutorsRef.current.set(obj.id, { update: updateFn });
              } catch (e) {
                console.error(`Error compiling script for ${obj.id}:`, e);
              }
            }
          }
        });
      }

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      controlsRef.current = controls;

      let lastTime = 0;
      function animate(time: number) {
        requestAnimationFrame(animate);
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        
        if (controls) controls.update();
        
        if (game.sceneData && game.sceneData.objects) {
          game.sceneData.objects.forEach((obj) => {
            if (obj.script) {
              try {
                const executor = scriptExecutorsRef.current.get(obj.id);
                const mesh = meshesRef.current.get(obj.id);
                if (executor && mesh) {
                  executor.update(delta, mesh);
                }
              } catch (e) {
                console.error(`Error executing script for ${obj.id}:`, e);
              }
            }
          });
        }
        
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
  }, [game]);

  // Render createGame(container) code via GamePlayer (AI-generated, code editor)
  if (isCodeGame(game) && game.gameCode) {
    return (
      <GamePlayer
        game={{
          title: game.title,
          desc: game.desc,
          owner: game.owner,
          ts: game.ts,
          id: game.id,
          gameCode: game.gameCode,
        }}
        onClose={onClose || (() => {})}
      />
    );
  }

  // Render imported HTML/JS files in iframe
  if (isImportedFileGame(game) && game.fileContent) {
    const fileType = (game.fileType || 'html').toLowerCase();
    let htmlToRender: string;
    if (fileType === 'html' || fileType === 'htm') {
      htmlToRender = game.fileContent;
    } else if (fileType === 'js') {
      htmlToRender = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;background:#0d1019}</style></head><body><script>${game.fileContent}<\/script></body></html>`;
    } else {
      htmlToRender = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;background:#0d1019;color:#fff;font-family:monospace;padding:16px}</style></head><body><pre>${escapeHtml(game.fileContent.slice(0, 10000))}${game.fileContent.length > 10000 ? '\n...(truncated)' : ''}</pre></body></html>`;
    }
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        {onClose && (
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: '10px 20px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontSize: 14 }}>Close</button>
        )}
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000, background: 'rgba(0,0,0,0.7)', padding: 15, borderRadius: 8, color: 'var(--text)' }}>
          <h3 style={{ margin: '0 0 10px 0' }}><FilteredText text={game.title} /></h3>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>By: <FilteredText text={game.owner} /></p>
        </div>
        <iframe srcDoc={htmlToRender} title={game.title} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} sandbox="allow-scripts allow-same-origin" />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Close
        </button>
      )}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        color: 'var(--text)'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}><FilteredText text={game.title} /></h3>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.8 }}>By: <FilteredText text={game.owner} /></p>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}><FilteredText text={game.desc || ''} /></p>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}
