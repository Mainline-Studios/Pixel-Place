'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { User } from '@/types';
import { getSkins, getAccessories, findSkin } from '@/lib/storage';

interface AvatarRunner3DProps {
  user: User;
  onClose?: () => void;
}

export default function AvatarRunner3D({ user, onClose }: AvatarRunner3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speedRef = useRef(0.1);
  const positionRef = useRef({ x: 0, y: 0, z: 0 });

  const createAvatar = useCallback((THREE: any, skin: any, accessories: any[]) => {
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
    if (!canvasRef.current) return;

    let animationFrameId: number;
    let scene: any, camera: any, renderer: any;
    let avatar: any;
    let coins: any[] = [];
    let obstacles: any[] = [];
    const keys: { [key: string]: boolean } = {};

    import('three').then(async (THREE) => {

      const canvas = canvasRef.current!;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a2332);
      scene.fog = new THREE.Fog(0x1a2332, 10, 50);

      camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.set(0, 2, 5);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.shadowMap.enabled = true;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 10, 5);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // Ground
      const groundGeo = new THREE.PlaneGeometry(200, 200);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a3a4a });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      scene.add(ground);

      // Create avatar
      const skins = await getSkins();
      const accessories = await getAccessories();
      const equippedSkin = findSkin(skins, user.equippedSkin);
      const equippedAccessories = (user.equippedAccessories || {});
      const equippedAccessoriesList = Object.values(equippedAccessories).map(id => 
        accessories.find(a => a.id === id)
      ).filter(Boolean);

      avatar = createAvatar(THREE, equippedSkin, equippedAccessoriesList);
      avatar.position.set(0, 1, 0);
      scene.add(avatar);

      // Camera follows avatar
      camera.position.set(0, 3, 8);
      camera.lookAt(avatar.position);

      // Handle input
      const handleKeyDown = (e: KeyboardEvent) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') {
          e.preventDefault();
          setIsPaused(prev => !prev);
        }
      };
      const handleKeyUp = (e: KeyboardEvent) => {
        keys[e.key.toLowerCase()] = false;
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Game loop
      let lastCoinTime = 0;
      let lastObstacleTime = 0;

      const gameLoop = () => {
        if (!isPaused && !gameOver) {
          // Move avatar
          if (keys['a'] || keys['arrowleft']) {
            avatar.position.x -= 0.1;
            if (avatar.position.x < -3) avatar.position.x = -3;
          }
          if (keys['d'] || keys['arrowright']) {
            avatar.position.x += 0.1;
            if (avatar.position.x > 3) avatar.position.x = 3;
          }

          // Auto-run forward
          positionRef.current.z += speedRef.current;
          avatar.position.z = positionRef.current.z;

          // Camera follows
          camera.position.z = avatar.position.z + 8;
          camera.lookAt(avatar.position);

          // Spawn coins
          const now = Date.now();
          if (now - lastCoinTime > 1500) {
            const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
            const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
            const coin = new THREE.Mesh(coinGeo, coinMat);
            coin.position.set(
              (Math.random() - 0.5) * 6,
              1.5,
              avatar.position.z + 20
            );
            coin.rotation.x = Math.PI / 2;
            coin.userData = { type: 'coin' };
            scene.add(coin);
            coins.push(coin);
            lastCoinTime = now;
          }

          // Spawn obstacles
          if (now - lastObstacleTime > 2000) {
            const obstacleGeo = new THREE.BoxGeometry(1, 1.5, 1);
            const obstacleMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
            const obstacle = new THREE.Mesh(obstacleGeo, obstacleMat);
            obstacle.position.set(
              (Math.random() - 0.5) * 6,
              0.75,
              avatar.position.z + 20
            );
            obstacle.userData = { type: 'obstacle' };
            scene.add(obstacle);
            obstacles.push(obstacle);
            lastObstacleTime = now;
          }

          // Update coins and obstacles
          coins.forEach((coin, index) => {
            coin.rotation.z += 0.1;
            if (coin.position.z < avatar.position.z - 5) {
              scene.remove(coin);
              coins.splice(index, 1);
            } else {
              const distance = Math.sqrt(
                Math.pow(coin.position.x - avatar.position.x, 2) +
                Math.pow(coin.position.z - avatar.position.z, 2)
              );
              if (distance < 1) {
                setScore(prev => prev + 10);
                scene.remove(coin);
                coins.splice(index, 1);
              }
            }
          });

          obstacles.forEach((obstacle, index) => {
            if (obstacle.position.z < avatar.position.z - 5) {
              scene.remove(obstacle);
              obstacles.splice(index, 1);
            } else {
              const distance = Math.sqrt(
                Math.pow(obstacle.position.x - avatar.position.x, 2) +
                Math.pow(obstacle.position.z - avatar.position.z, 2)
              );
              if (distance < 1) {
                setGameOver(true);
              }
            }
          });

          // Increase speed
          speedRef.current += 0.0001;
        }

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
        renderer.dispose();
      };
    });
  }, [user, isPaused, gameOver, createAvatar]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    speedRef.current = 0.1;
    positionRef.current = { x: 0, y: 0, z: 0 };
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
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🏃 3D Avatar Runner</h3>
        {onClose && (
          <button className="btn" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Close
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Score: {score}</div>
        {(gameOver || isPaused) && (
          <div style={{ fontSize: '14px', color: gameOver ? '#ff4d4d' : '#ffd76a' }}>
            {gameOver ? 'Game Over!' : 'Paused'}
          </div>
        )}
      </div>

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
          Use A/D or Arrow Keys to move left/right • Space to pause • Avoid red obstacles, collect gold coins!
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button className="btn" onClick={resetGame}>
            {gameOver ? 'Play Again' : 'Reset'}
          </button>
          <button className="btn" onClick={() => setIsPaused(!isPaused)} disabled={gameOver}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>
    </div>
  );
}






