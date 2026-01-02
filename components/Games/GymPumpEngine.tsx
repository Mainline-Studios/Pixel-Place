'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { PixelPlaceAPI } from '@/lib/pixelPlaceAPI';

interface GymPumpEngineProps {
  onClose?: () => void;
  user?: any;
}

export default function GymPumpEngine({ onClose, user }: GymPumpEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<PixelPlaceAPI | null>(null);
  const { user: contextUser } = useUser();
  const currentUser = user || contextUser;
  const [score, setScore] = useState({ power: 0, coins: 0, level: 1 });
  const [isLifting, setIsLifting] = useState(false);
  const [liftProgress, setLiftProgress] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const characterRef = useRef<any>(null);
  const barbellRef = useRef<any>(null);
  const weightsRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const gameStateRef = useRef({
    power: 0,
    coins: 0,
    level: 1,
    liftHeight: 0,
    isLifting: false,
    liftStartTime: 0,
    animationTime: 0
  });

  useEffect(() => {
    if (!containerRef.current || !currentUser) return;

    let THREE: any;
    let isMounted = true;

    const initGame = async () => {
      try {
        // Initialize PixelPlace API
        const api = new PixelPlaceAPI('gym-pump', currentUser.username);
        apiRef.current = api;
        await api.connectGame('gym-pump');

        // Load saved progress
        const savedProgress = await api.getGameProgress('gym-pump');
        if (savedProgress) {
          gameStateRef.current.power = savedProgress.power || 0;
          gameStateRef.current.coins = savedProgress.coins || 0;
          gameStateRef.current.level = savedProgress.level || 1;
          setScore(savedProgress);
        }

        // Import Three.js
        THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

        // Create camera
        const camera = new THREE.PerspectiveCamera(
          60,
          containerRef.current!.clientWidth / containerRef.current!.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 4, 8);
        camera.lookAt(0, 1, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current!.appendChild(renderer.domElement);

        // Create controls (for viewing, not movement)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 15;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.minPolarAngle = Math.PI / 3;
        controls.target.set(0, 1.5, 0);

        // Lighting - realistic gym lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);

        // Gym floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({
          color: 0x2a2a3a,
          roughness: 0.8,
          metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Gym walls
        const wallMaterial = new THREE.MeshStandardMaterial({
          color: 0x3a3a4a,
          roughness: 0.7
        });

        // Back wall
        const backWall = new THREE.Mesh(
          new THREE.PlaneGeometry(20, 10),
          wallMaterial
        );
        backWall.position.set(0, 5, -10);
        backWall.receiveShadow = true;
        scene.add(backWall);

        // Side walls
        const leftWall = new THREE.Mesh(
          new THREE.PlaneGeometry(20, 10),
          wallMaterial
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-10, 5, 0);
        leftWall.receiveShadow = true;
        scene.add(leftWall);

        const rightWall = new THREE.Mesh(
          new THREE.PlaneGeometry(20, 10),
          wallMaterial
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(10, 5, 0);
        rightWall.receiveShadow = true;
        scene.add(rightWall);

        // Gym equipment - bench
        const benchGeometry = new THREE.BoxGeometry(2, 0.2, 0.8);
        const benchMaterial = new THREE.MeshStandardMaterial({
          color: 0x4a4a5a,
          roughness: 0.6
        });
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.set(0, 0.1, 0);
        bench.castShadow = true;
        bench.receiveShadow = true;
        scene.add(bench);

        // Bench back support
        const benchBack = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.8, 0.2),
          benchMaterial
        );
        benchBack.position.set(0, 0.5, -0.3);
        benchBack.castShadow = true;
        scene.add(benchBack);

        // Create 3D character (simplified but realistic)
        const characterGroup = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
          color: 0x4a90e2,
          roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1.2, 0);
        body.castShadow = true;
        characterGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
          color: 0xffdbac,
          roughness: 0.6
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 2, 0);
        head.castShadow = true;
        characterGroup.add(head);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
          color: 0xffdbac,
          roughness: 0.6
        });

        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 1.2, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        characterGroup.add(leftArm);

        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 1.2, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        characterGroup.add(rightArm);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
          color: 0x2a2a3a,
          roughness: 0.7
        });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, 0.4, 0);
        leftLeg.castShadow = true;
        characterGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, 0.4, 0);
        rightLeg.castShadow = true;
        characterGroup.add(rightLeg);

        characterGroup.position.set(0, 0, 0);
        scene.add(characterGroup);
        characterRef.current = characterGroup;

        // Create barbell
        const barbellGroup = new THREE.Group();

        // Barbell bar
        const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 16);
        const barMaterial = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.9,
          roughness: 0.2
        });
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.rotation.z = Math.PI / 2;
        bar.castShadow = true;
        barbellGroup.add(bar);

        // Weight plates
        const plateGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const plateMaterial = new THREE.MeshStandardMaterial({
          color: 0xff4444,
          metalness: 0.7,
          roughness: 0.3
        });

        const weights: any[] = [];
        // Left side plates
        for (let i = 0; i < 3; i++) {
          const plate = new THREE.Mesh(plateGeometry, plateMaterial);
          plate.position.set(-0.6 - i * 0.15, 0, 0);
          plate.rotation.z = Math.PI / 2;
          plate.castShadow = true;
          barbellGroup.add(plate);
          weights.push(plate);
        }

        // Right side plates
        for (let i = 0; i < 3; i++) {
          const plate = new THREE.Mesh(plateGeometry, plateMaterial);
          plate.position.set(0.6 + i * 0.15, 0, 0);
          plate.rotation.z = Math.PI / 2;
          plate.castShadow = true;
          barbellGroup.add(plate);
          weights.push(plate);
        }

        barbellGroup.position.set(0, 1.8, 0);
        scene.add(barbellGroup);
        barbellRef.current = barbellGroup;
        weightsRef.current = weights;

        // Store refs
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;

        // Animation loop
        const animate = () => {
          if (!isMounted) return;
          animationFrameRef.current = requestAnimationFrame(animate);

          const time = Date.now() * 0.001;
          gameStateRef.current.animationTime = time;

          // Update character animation (breathing/idle)
          if (characterRef.current && !gameStateRef.current.isLifting) {
            const breatheAmount = Math.sin(time * 2) * 0.02;
            characterRef.current.position.y = breatheAmount;
          }

          // Update lifting animation
          if (gameStateRef.current.isLifting && barbellRef.current && characterRef.current) {
            const liftTime = (Date.now() - gameStateRef.current.liftStartTime) / 1000;
            const maxLiftHeight = 0.8;
            const liftSpeed = 0.5;

            gameStateRef.current.liftHeight = Math.min(liftTime * liftSpeed, maxLiftHeight);
            setLiftProgress(gameStateRef.current.liftHeight / maxLiftHeight);

            // Move barbell up
            barbellRef.current.position.y = 1.8 + gameStateRef.current.liftHeight;

            // Animate character arms
            const leftArm = characterRef.current.children.find((c: any) => c.position.x < 0 && c.geometry?.type === 'CylinderGeometry');
            const rightArm = characterRef.current.children.find((c: any) => c.position.x > 0 && c.geometry?.type === 'CylinderGeometry');

            if (leftArm) {
              leftArm.rotation.z = Math.PI / 6 - gameStateRef.current.liftHeight * 0.5;
            }
            if (rightArm) {
              rightArm.rotation.z = -Math.PI / 6 + gameStateRef.current.liftHeight * 0.5;
            }

            // Character slight movement
            characterRef.current.position.y = Math.sin(time * 8) * 0.05;

            // Check if lift is complete
            if (gameStateRef.current.liftHeight >= maxLiftHeight) {
              // Complete lift
              gameStateRef.current.power += 10 + Math.floor(gameStateRef.current.level * 0.5);
              gameStateRef.current.coins += 5 + Math.floor(gameStateRef.current.level * 0.3);
              gameStateRef.current.level = Math.floor(gameStateRef.current.power / 100) + 1;

              setScore({
                power: gameStateRef.current.power,
                coins: gameStateRef.current.coins,
                level: gameStateRef.current.level
              });

              // Reset
              gameStateRef.current.isLifting = false;
              gameStateRef.current.liftHeight = 0;
              setIsLifting(false);
              setLiftProgress(0);

              // Sync progress
              api.syncGameProgress('gym-pump', {
                power: gameStateRef.current.power,
                coins: gameStateRef.current.coins,
                level: gameStateRef.current.level
              });
            }
          } else if (!gameStateRef.current.isLifting && barbellRef.current) {
            // Return barbell to start position
            if (barbellRef.current.position.y > 1.8) {
              barbellRef.current.position.y = Math.max(1.8, barbellRef.current.position.y - 0.05);
            }
          }

          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
          if (!containerRef.current || !camera || !renderer) return;
          camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Handle keyboard
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space' && !gameStateRef.current.isLifting) {
            e.preventDefault();
            gameStateRef.current.isLifting = true;
            gameStateRef.current.liftStartTime = Date.now();
            setIsLifting(true);
            setGameStarted(true);
          }
          if (e.key === 'Escape' && onClose) {
            onClose();
          }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
          if (e.code === 'Space' && gameStateRef.current.isLifting) {
            // Release early - partial lift
            if (gameStateRef.current.liftHeight > 0.3) {
              // Still get some reward
              gameStateRef.current.power += Math.floor(5 * (gameStateRef.current.liftHeight / 0.8));
              gameStateRef.current.coins += Math.floor(3 * (gameStateRef.current.liftHeight / 0.8));
              setScore({
                power: gameStateRef.current.power,
                coins: gameStateRef.current.coins,
                level: gameStateRef.current.level
              });
            }
            gameStateRef.current.isLifting = false;
            setIsLifting(false);
          }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup
        return () => {
          isMounted = false;
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          if (containerRef.current && renderer.domElement) {
            containerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };
      } catch (err: any) {
        console.error('Error initializing Gym Pump:', err);
      }
    };

    const cleanup = initGame();

    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn();
        });
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentUser, onClose]);

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#fff' }}>
        <p>Please log in to play Gym Pump.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 3D Game Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      />

      {/* Score Display */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '16px 24px',
          borderRadius: '12px',
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          zIndex: 10001,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '20px' }}>
          💪 Power: {score.power}
        </div>
        <div style={{ marginBottom: '8px' }}>🪙 Coins: {score.coins}</div>
        <div>⭐ Level: {score.level}</div>
      </div>

      {/* Lift Progress Bar */}
      {isLifting && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '30px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '15px',
            padding: '4px',
            zIndex: 10001,
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div
            style={{
              width: `${liftProgress * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff4444, #ff8888)',
              borderRadius: '12px',
              transition: 'width 0.1s linear',
              boxShadow: '0 0 20px rgba(255, 68, 68, 0.5)'
            }}
          />
        </div>
      )}

      {/* Instructions */}
      {!gameStarted && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '24px 32px',
            borderRadius: '12px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            zIndex: 10001,
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '24px' }}>
            🏋️ Welcome to Gym Pump!
          </div>
          <div>Press <strong style={{ color: '#4a90e2' }}>SPACE</strong> to lift weights!</div>
          <div style={{ marginTop: '8px', fontSize: '16px', opacity: 0.8 }}>
            Hold SPACE to complete a full lift and earn power & coins
          </div>
        </div>
      )}

      {isLifting && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 68, 68, 0.9)',
            padding: '16px 24px',
            borderRadius: '12px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            zIndex: 10001,
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(255, 68, 68, 0.5)'
          }}
        >
          💪 LIFTING! Hold SPACE...
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            background: 'rgba(255, 68, 68, 0.9)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            zIndex: 10001,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 68, 68, 1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 68, 68, 0.9)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Close (ESC)
        </button>
      )}
    </div>
  );
}
