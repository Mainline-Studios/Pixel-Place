'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { User } from '@/types';
import { getSkins, getAccessories } from '@/lib/storage';

interface AvatarCollector3DProps {
  user: User;
  onClose?: () => void;
}

export default function AvatarCollector3D({ user, onClose }: AvatarCollector3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  const createAvatar = useCallback((THREE: any, skin: any) => {
    const avatarGroup = new THREE.Group();
    const hexToColor = (hex: string) => new THREE.Color(hex);
    
    const colors = skin.colors || {
      head: '#4a4f66',
      torso: '#4d536f',
      arm: '#3a3f56',
      legs: '#3a3f56'
    };

    // Head
    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMat = new THREE.MeshStandardMaterial({ color: hexToColor(colors.head), metalness: 0.3, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.5, 0);
    avatarGroup.add(head);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.9, 0.9, 0.5);
    const torsoMat = new THREE.MeshStandardMaterial({ color: hexToColor(colors.torso), metalness: 0.3, roughness: 0.7 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.5, 0);
    avatarGroup.add(torso);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.28, 0.7, 0.28);
    const armMat = new THREE.MeshStandardMaterial({ color: hexToColor(colors.arm), metalness: 0.3, roughness: 0.7 });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.59, 0.5, 0);
    avatarGroup.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.59, 0.5, 0);
    avatarGroup.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4);
    const legMat = new THREE.MeshStandardMaterial({ color: hexToColor(colors.legs), metalness: 0.3, roughness: 0.7 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25, -0.3, 0);
    avatarGroup.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.25, -0.3, 0);
    avatarGroup.add(rightLeg);

    return avatarGroup;
  }, []);

  useEffect(() => {
    if (!canvasRef.current || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationFrameId: number;
    let scene: any, camera: any, renderer: any, controls: any;
    let avatar: any;
    let collectibles: any[] = [];
    const keys: { [key: string]: boolean } = {};
    const velocity = { x: 0, z: 0 };

    Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js')
    ]).then(([THREE, OrbitControlsModule]) => {
      const OrbitControls = OrbitControlsModule.OrbitControls;

      const canvas = canvasRef.current!;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0d1b2a);

      camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.set(8, 8, 8);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.shadowMap.enabled = true;

      // Controls
      controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 1, 0);
      controls.enableDamping = true;
      controls.maxDistance = 15;
      controls.minDistance = 5;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(10, 10, 5);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // Ground
      const groundGeo = new THREE.PlaneGeometry(30, 30);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grid helper
      const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
      scene.add(gridHelper);

      // Create avatar
      const skins = await getSkins();
      const equippedSkin = skins.find(s => s.id === user.equippedSkin) || skins[0];
      avatar = createAvatar(THREE, equippedSkin);
      avatar.position.set(0, 1, 0);
      avatar.castShadow = true;
      scene.add(avatar);

      // Handle input
      const handleKeyDown = (e: KeyboardEvent) => {
        keys[e.key.toLowerCase()] = true;
      };
      const handleKeyUp = (e: KeyboardEvent) => {
        keys[e.key.toLowerCase()] = false;
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Spawn collectibles
      const spawnCollectible = () => {
        const geo = new THREE.OctahedronGeometry(0.4);
        const mat = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
          metalness: 0.8,
          roughness: 0.2
        });
        const collectible = new THREE.Mesh(geo, mat);
        collectible.position.set(
          (Math.random() - 0.5) * 25,
          1.5,
          (Math.random() - 0.5) * 25
        );
        collectible.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        collectible.userData = { type: 'collectible', rotationSpeed: (Math.random() - 0.5) * 0.1 };
        scene.add(collectible);
        collectibles.push(collectible);
      };

      // Initial collectibles
      for (let i = 0; i < 10; i++) {
        spawnCollectible();
      }

      // Game loop
      const gameLoop = () => {
        if (!gameOver) {
          // Move avatar
          velocity.x = 0;
          velocity.z = 0;
          
          if (keys['w'] || keys['arrowup']) velocity.z -= 0.1;
          if (keys['s'] || keys['arrowdown']) velocity.z += 0.1;
          if (keys['a'] || keys['arrowleft']) velocity.x -= 0.1;
          if (keys['d'] || keys['arrowright']) velocity.x += 0.1;

          avatar.position.x += velocity.x;
          avatar.position.z += velocity.z;

          // Keep avatar in bounds
          avatar.position.x = Math.max(-12, Math.min(12, avatar.position.x));
          avatar.position.z = Math.max(-12, Math.min(12, avatar.position.z));

          // Rotate avatar based on movement
          if (velocity.x !== 0 || velocity.z !== 0) {
            avatar.rotation.y = Math.atan2(velocity.x, velocity.z);
          }

          // Update collectibles
          collectibles.forEach((collectible, index) => {
            collectible.rotation.x += collectible.userData.rotationSpeed;
            collectible.rotation.y += collectible.userData.rotationSpeed * 0.7;
            collectible.position.y = 1.5 + Math.sin(Date.now() * 0.003 + index) * 0.3;

            const distance = Math.sqrt(
              Math.pow(collectible.position.x - avatar.position.x, 2) +
              Math.pow(collectible.position.z - avatar.position.z, 2)
            );

            if (distance < 1.5) {
              setScore(prev => prev + 5);
              scene.remove(collectible);
              collectibles.splice(index, 1);
              spawnCollectible();
            }
          });

          // Update camera target
          controls.target.lerp(avatar.position, 0.1);
          controls.target.y = 1;
        }

        controls.update();
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(gameLoop);
      };

      gameLoop();

      const handleResize = () => {
        if (!canvas) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('resize', handleResize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        controls.dispose();
        renderer.dispose();
      };
    });
  }, [user, gameOver, createAvatar]);

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
  };

  return (
    <div style={{
      background: 'var(--panel)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>💎 3D Avatar Collector</h3>
        {onClose && (
          <button className="btn" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Close
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Score: {score}</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: timeLeft < 10 ? '#ff4d4d' : '#4a90e2' }}>
          Time: {timeLeft}s
        </div>
      </div>

      {gameOver && (
        <div style={{
          padding: '16px',
          background: 'rgba(46, 204, 113, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: 700,
          color: '#2ecc71'
        }}>
          🎉 Final Score: {score}!
        </div>
      )}

      <div style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        background: '#0a0a0a',
        border: '2px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <div className="smalltext" style={{ marginBottom: '12px' }}>
          Use W/A/S/D or Arrow Keys to move • Collect all the gems! • 60 seconds to score as much as possible
        </div>
        <button className="btn" onClick={resetGame} disabled={!gameOver}>
          {gameOver ? 'Play Again' : 'Game In Progress'}
        </button>
      </div>
    </div>
  );
}


