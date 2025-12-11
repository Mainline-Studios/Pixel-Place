'use client';

import { useEffect, useRef } from 'react';
import { UserMadeGame, User } from '@/types';

interface UserMadeGamePlayerProps {
  game: UserMadeGame;
  user?: User;
  onClose?: () => void;
}

export default function UserMadeGamePlayer({ game, user, onClose }: UserMadeGamePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
          let mesh;
          if (obj.type === 'cube') {
            const geom = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
            mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
          } else if (obj.type === 'sphere') {
            const geom = new THREE.SphereGeometry(0.5, 32, 32);
            const mat = new THREE.MeshStandardMaterial({ color: 0xff4d4d });
            mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
          } else if (obj.type === 'light') {
            mesh = new THREE.PointLight(0xffffff, 1, 20);
            mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
          }
          if (mesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
          }
        });
      }

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      controlsRef.current = controls;

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
  }, [game]);

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
        <h3 style={{ margin: '0 0 10px 0' }}>{game.title}</h3>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.8 }}>By: {game.owner}</p>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>{game.desc}</p>
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
