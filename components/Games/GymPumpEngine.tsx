'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { PixelPlaceAPI } from '@/lib/pixelPlaceAPI';
import { getUserAvatarData, createAvatarMesh } from '@/lib/avatar3DRenderer';

interface GymPumpEngineProps {
  onClose?: () => void;
  user?: any;
}

export default function GymPumpEngine({ onClose, user }: GymPumpEngineProps) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GymPumpEngine.tsx:12',message:'GymPumpEngine render start',data:{hasUser:!!user,hasOnClose:!!onClose},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<PixelPlaceAPI | null>(null);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GymPumpEngine.tsx:15',message:'Before useUser hook',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const { user: contextUser } = useUser();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GymPumpEngine.tsx:16',message:'After useUser hook',data:{hasContextUser:!!contextUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const currentUser = user || contextUser;
  const [score, setScore] = useState({ power: 0, coins: 0, level: 1 });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GymPumpEngine.tsx:17',message:'After useState score',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const [isLifting, setIsLifting] = useState(false);
  const [liftProgress, setLiftProgress] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [exerciseType, setExerciseType] = useState<'bench' | 'curl' | 'squat'>('bench');
  const [rhythmPhase, setRhythmPhase] = useState<'down' | 'up' | 'hold'>('down');
  const [rhythmProgress, setRhythmProgress] = useState(0);
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/002741fb-cb98-444e-83cd-7086902151aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GymPumpEngine.tsx:20',message:'After all useState hooks',data:{hookCount:4},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const characterRef = useRef<any>(null);
  const barbellRef = useRef<any>(null);
  const weightsRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const avatarResultRef = useRef<any>(null);
  const avatarDataRef = useRef<any>(null);
  const gameStateRef = useRef({
    power: 0,
    coins: 0,
    level: 1,
    liftHeight: 0,
    isLifting: false,
    liftStartTime: 0,
    animationTime: 0
  });
  
  // Body type based on power level (weak to jacked)
  const [bodyType, setBodyType] = useState<'weak' | 'normal' | 'athletic' | 'strong' | 'jacked'>('normal');

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

        // Load user's avatar data
        const avatarData = await getUserAvatarData(currentUser);
        if (!avatarData.skin) {
          console.warn('No skin found for user, using default');
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

        // Determine body type based on power level (defined outside to be accessible in animate loop)
        const determineBodyType = (power: number): 'weak' | 'normal' | 'athletic' | 'strong' | 'jacked' => {
          if (power < 50) return 'weak';
          if (power < 200) return 'normal';
          if (power < 500) return 'athletic';
          if (power < 1000) return 'strong';
          return 'jacked';
        };

        const currentBodyType = determineBodyType(gameStateRef.current.power);
        setBodyType(currentBodyType);
        
        // Store refs for use in animate loop
        avatarDataRef.current = avatarData;
        const determineBodyTypeRef = { func: determineBodyType };

        // Create 3D character using user's equipped avatar with body type
        let avatarResult: any = null;
        if (avatarData && avatarData.skin) {
          try {
            avatarResult = createAvatarMesh(
              THREE,
              scene,
              avatarData.skin,
              avatarData.face,
              avatarData.accessories,
              {
                scale: 1.0,
                position: { x: 0, y: 0, z: 0 },
                animation: 'idle',
                bodyType: currentBodyType  // Apply body type based on power
              }
            );
            characterRef.current = avatarResult.characterGroup;
            avatarResultRef.current = avatarResult;
          } catch (error) {
            console.error('Error creating avatar mesh:', error);
            // Fallback to simple character
            avatarResult = null;
          }
        }

        // Fallback to simple character if avatar creation failed
        if (!avatarResult) {
          const characterGroup = new THREE.Group();
          const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.4);
          const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a90e2,
            roughness: 0.7
          });
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.set(0, 1.2, 0);
          body.castShadow = true;
          characterGroup.add(body);

          const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
          const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdbac,
            roughness: 0.6
          });
          const head = new THREE.Mesh(headGeometry, headMaterial);
          head.position.set(0, 2, 0);
          head.castShadow = true;
          characterGroup.add(head);

          characterGroup.position.set(0, 0, 0);
          scene.add(characterGroup);
          characterRef.current = characterGroup;
        }

        // Load barbell from GLB file (or fallback to procedural)
        const loadBarbell = async () => {
          try {
            const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
            const loader = new GLTFLoader();
            
            loader.load(
              '/models/gym/barbell.glb',
              (gltf) => {
                const model = gltf.scene;
                model.scale.set(1, 1, 1);
                model.position.set(0, 1.5, 0.3);
                model.castShadow = true;
                model.traverse((child: any) => {
                  if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                });
                scene.add(model);
                barbellRef.current = model;
                console.log('Barbell loaded from GLB');
              },
              undefined,
              (error) => {
                console.warn('Could not load barbell.glb, using fallback:', error);
                createFallbackBarbell();
              }
            );
          } catch (error) {
            console.warn('GLTFLoader not available, using fallback:', error);
            createFallbackBarbell();
          }
        };

        const createFallbackBarbell = () => {
          // Fallback procedural barbell
          const barbellGroup = new THREE.Group();
          const barGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1.4, 32);
          const barMaterial = new THREE.MeshStandardMaterial({
            color: 0xb0b0b0,
            metalness: 0.95,
            roughness: 0.1
          });
          const bar = new THREE.Mesh(barGeometry, barMaterial);
          bar.rotation.z = Math.PI / 2;
          bar.castShadow = true;
          barbellGroup.add(bar);

          const weights: any[] = [];
          const plateConfigs = [
            { radius: 0.25, thickness: 0.08, color: 0xff0000, pos: -0.85 },
            { radius: 0.22, thickness: 0.08, color: 0x0000ff, pos: -0.95 },
            { radius: 0.19, thickness: 0.08, color: 0x00ff00, pos: -1.05 },
          ];

          for (const config of plateConfigs) {
            const plateGeometry = new THREE.CylinderGeometry(config.radius, config.radius, config.thickness, 32);
            const plateMaterial = new THREE.MeshStandardMaterial({
              color: config.color,
              metalness: 0.8,
              roughness: 0.3
            });
            for (let side of [-1, 1]) {
              const plate = new THREE.Mesh(plateGeometry, plateMaterial);
              plate.position.set(config.pos * side, 0, 0);
              plate.rotation.z = Math.PI / 2;
              plate.castShadow = true;
              barbellGroup.add(plate);
              weights.push(plate);
            }
          }

          barbellGroup.position.set(0, 1.5, 0.3);
          scene.add(barbellGroup);
          barbellRef.current = barbellGroup;
          weightsRef.current = weights;
        };

        loadBarbell();

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


          // Update lifting animation with rhythm-based mechanics
          if (gameStateRef.current.isLifting && barbellRef.current && characterRef.current) {
            const liftTime = (Date.now() - gameStateRef.current.liftStartTime) / 1000;
            const rhythmCycle = 2.0; // 2 seconds per full cycle (down-up)
            const cycleProgress = (liftTime % rhythmCycle) / rhythmCycle;
            
            // Determine phase
            let currentPhase: 'down' | 'up' | 'hold' = 'down';
            if (cycleProgress < 0.4) {
              currentPhase = 'down';
            } else if (cycleProgress < 0.9) {
              currentPhase = 'up';
            } else {
              currentPhase = 'hold';
            }
            setRhythmPhase(currentPhase);
            setRhythmProgress(cycleProgress);

            // Calculate lift height based on exercise type and phase
            let liftHeight = 0;
            let armRotationX = 0;
            let armRotationZ = 0;
            
            if (exerciseType === 'bench') {
              // Bench press: arms go from down to up
              if (currentPhase === 'down') {
                liftHeight = 0.2 * (cycleProgress / 0.4);
                armRotationX = -0.3 + (0.3 * (cycleProgress / 0.4));
              } else if (currentPhase === 'up') {
                const upProgress = (cycleProgress - 0.4) / 0.5;
                liftHeight = 0.2 + (0.6 * upProgress);
                armRotationX = 0.3 - (0.6 * upProgress);
              } else {
                liftHeight = 0.8;
                armRotationX = -0.3;
              }
            } else if (exerciseType === 'curl') {
              // Bicep curl: arms bend at elbow
              if (currentPhase === 'down') {
                liftHeight = 0.3 * (cycleProgress / 0.4);
                armRotationZ = -0.5 + (0.5 * (cycleProgress / 0.4));
              } else if (currentPhase === 'up') {
                const upProgress = (cycleProgress - 0.4) / 0.5;
                liftHeight = 0.3 + (0.5 * upProgress);
                armRotationZ = 0.5 - (1.0 * upProgress);
              } else {
                liftHeight = 0.8;
                armRotationZ = -0.5;
              }
            }

            gameStateRef.current.liftHeight = liftHeight;
            setLiftProgress(liftHeight / 0.8);

            // Attach barbell to hands and move with arms
            if (avatarResult?.bodyParts) {
              const { leftArm, rightArm, torso } = avatarResult.bodyParts;
              
              // Calculate hand positions based on arm rotations
              const handOffsetY = Math.sin(armRotationX) * 0.9;
              const handOffsetZ = Math.cos(armRotationX) * 0.9;
              
              // Position barbell at hands (using simple vector math)
              const leftHandX = -0.5;
              const leftHandY = 0.9 + handOffsetY;
              const leftHandZ = handOffsetZ;
              const rightHandX = 0.5;
              const rightHandY = 0.9 + handOffsetY;
              const rightHandZ = handOffsetZ;
              
              // Center between hands
              const barbellCenterX = (leftHandX + rightHandX) / 2;
              const barbellCenterY = (leftHandY + rightHandY) / 2;
              const barbellCenterZ = (leftHandZ + rightHandZ) / 2;
              
              barbellRef.current.position.set(barbellCenterX, barbellCenterY, barbellCenterZ);
              barbellRef.current.rotation.x = armRotationX;
              barbellRef.current.rotation.z = armRotationZ;
              
              // Animate arms
              if (leftArm && rightArm) {
                leftArm.rotation.x = armRotationX;
                leftArm.rotation.z = armRotationZ;
                rightArm.rotation.x = armRotationX;
                rightArm.rotation.z = -armRotationZ; // Mirror for right arm
              }
              
              // Slight torso movement
              if (torso) {
                torso.rotation.x = Math.sin(time * 2) * 0.05 * liftHeight;
              }
            } else {
              // Fallback animation
              barbellRef.current.position.y = 1.5 + liftHeight;
              barbellRef.current.rotation.x = armRotationX;
            }

            // Check for perfect timing (bonus points)
            const perfectTiming = cycleProgress > 0.88 && cycleProgress < 0.92;
            if (perfectTiming && currentPhase === 'hold') {
              // Perfect rep bonus
            }

              // Complete rep when cycle finishes
            if (cycleProgress > 0.95) {
              const repPower = 10 + Math.floor(gameStateRef.current.level * 0.5);
              const repCoins = 5 + Math.floor(gameStateRef.current.level * 0.3);
              
              // Combo bonus
              const comboBonus = Math.min(streak, 10);
              gameStateRef.current.power += repPower + comboBonus;
              gameStateRef.current.coins += repCoins + Math.floor(comboBonus * 0.5);
              gameStateRef.current.level = Math.floor(gameStateRef.current.power / 100) + 1;
              
              setStreak(prev => prev + 1);
              setCombo(prev => prev + 1);

              // Update body type if power threshold crossed
              const newBodyType = determineBodyTypeRef.func(gameStateRef.current.power);
              if (newBodyType !== bodyType) {
                setBodyType(newBodyType);
                // Recreate avatar with new body type (preserves skin and accessories)
                const currentAvatarData = avatarDataRef.current;
                const currentAvatarResult = avatarResultRef.current;
                if (currentAvatarData && currentAvatarData.skin && currentAvatarResult) {
                  // Remove old avatar
                  scene.remove(currentAvatarResult.characterGroup);
                  // Create new one with updated body type
                  const newAvatarResult = createAvatarMesh(
                    THREE,
                    scene,
                    currentAvatarData.skin,
                    currentAvatarData.face,
                    currentAvatarData.accessories,
                    {
                      scale: 1.0,
                      position: { x: 0, y: 0, z: 0 },
                      animation: 'idle',
                      bodyType: newBodyType
                    }
                  );
                  characterRef.current = newAvatarResult.characterGroup;
                  avatarResultRef.current = newAvatarResult;
                }
              }

              setScore({
                power: gameStateRef.current.power,
                coins: gameStateRef.current.coins,
                level: gameStateRef.current.level
              });

              // Sync progress
              api.syncGameProgress('gym-pump', {
                power: gameStateRef.current.power,
                coins: gameStateRef.current.coins,
                level: gameStateRef.current.level
              });
            }
          } else if (!gameStateRef.current.isLifting && barbellRef.current) {
              // Return to rest position
            if (avatarResult?.bodyParts) {
              const { leftArm, rightArm } = avatarResult.bodyParts;
              if (leftArm && rightArm) {
                const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
                leftArm.rotation.x = lerp(leftArm.rotation.x, 0, 0.1);
                leftArm.rotation.z = lerp(leftArm.rotation.z, 0, 0.1);
                rightArm.rotation.x = lerp(rightArm.rotation.x, 0, 0.1);
                rightArm.rotation.z = lerp(rightArm.rotation.z, 0, 0.1);
              }
            }
            const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
            barbellRef.current.position.y = lerp(barbellRef.current.position.y, 1.5, 0.1);
            barbellRef.current.rotation.x = lerp(barbellRef.current.rotation.x, 0, 0.1);
            
            // Reset combo if not lifting for too long
            if (streak > 0) {
              setTimeout(() => {
                if (!gameStateRef.current.isLifting) {
                  setStreak(0);
                  setCombo(0);
                }
              }, 3000);
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

        // Handle keyboard - rhythm-based lifting
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space') {
            e.preventDefault();
            if (!gameStateRef.current.isLifting) {
              // Start lifting
              gameStateRef.current.isLifting = true;
              gameStateRef.current.liftStartTime = Date.now();
              setIsLifting(true);
              setGameStarted(true);
            }
          }
          
          // Exercise type switching
          if (e.key === '1') {
            setExerciseType('bench');
          } else if (e.key === '2') {
            setExerciseType('curl');
          } else if (e.key === '3') {
            setExerciseType('squat');
          }
          
          if (e.key === 'Escape' && onClose) {
            onClose();
          }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
          if (e.code === 'Space' && gameStateRef.current.isLifting) {
            // Stop lifting - but keep rhythm going if in good phase
            // Only stop if held too long or released at bad time
            const liftTime = (Date.now() - gameStateRef.current.liftStartTime) / 1000;
            const cycleProgress = (liftTime % 2.0) / 2.0;
            
            // Allow stopping only at rest phase
            if (cycleProgress < 0.1 || cycleProgress > 0.95) {
              gameStateRef.current.isLifting = false;
              setIsLifting(false);
              setStreak(0);
              setCombo(0);
            }
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
        <div style={{ marginBottom: '8px' }}>⭐ Level: {score.level}</div>
        <div style={{ 
          marginTop: '8px', 
          padding: '4px 8px', 
          background: bodyType === 'jacked' ? 'rgba(255, 215, 0, 0.3)' : 
                      bodyType === 'strong' ? 'rgba(255, 140, 0, 0.3)' :
                      bodyType === 'athletic' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(100, 100, 100, 0.3)',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          💪 Body: {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)}
        </div>
      </div>

      {/* Rhythm Indicator & Progress */}
      {isLifting && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            zIndex: 10001
          }}
        >
          {/* Rhythm Bar */}
          <div
            style={{
              width: '100%',
              height: '40px',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '20px',
              padding: '4px',
              marginBottom: '12px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${rhythmProgress * 100}%`,
                height: '100%',
                background: rhythmPhase === 'up' 
                  ? 'linear-gradient(90deg, #4caf50, #8bc34a)'
                  : rhythmPhase === 'hold'
                  ? 'linear-gradient(90deg, #ff9800, #ffc107)'
                  : 'linear-gradient(90deg, #2196f3, #03a9f4)',
                borderRadius: '16px',
                transition: 'width 0.05s linear',
                boxShadow: `0 0 20px ${rhythmPhase === 'up' ? 'rgba(76, 175, 80, 0.6)' : rhythmPhase === 'hold' ? 'rgba(255, 152, 0, 0.6)' : 'rgba(33, 150, 243, 0.6)'}`
              }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'uppercase',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {rhythmPhase === 'up' ? '⬆️ LIFT UP!' : rhythmPhase === 'hold' ? '⏸️ HOLD!' : '⬇️ LOWER'}
            </div>
          </div>
          
          {/* Combo & Streak Display */}
          {(combo > 0 || streak > 0) && (
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '8px'
            }}>
              {combo > 0 && (
                <div style={{
                  background: 'rgba(255, 152, 0, 0.9)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)'
                }}>
                  🔥 {combo}x COMBO!
                </div>
              )}
              {streak > 0 && (
                <div style={{
                  background: 'rgba(76, 175, 80, 0.9)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                }}>
                  ⚡ {streak} STREAK
                </div>
              )}
            </div>
          )}
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
            border: '2px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px'
          }}
        >
          <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '24px' }}>
            🏋️ Welcome to Gym Pump!
          </div>
          <div style={{ marginBottom: '12px' }}>
            Press <strong style={{ color: '#4a90e2' }}>SPACE</strong> to start lifting!
          </div>
          <div style={{ marginTop: '12px', fontSize: '16px', opacity: 0.9 }}>
            <div style={{ marginBottom: '8px' }}>🎯 <strong>Rhythm-Based Lifting:</strong></div>
            <div style={{ marginBottom: '8px' }}>Follow the rhythm - lift on the beat!</div>
            <div style={{ marginBottom: '8px' }}>🔥 <strong>Combo System:</strong> Keep lifting for bonus rewards!</div>
            <div style={{ marginTop: '12px', fontSize: '14px', opacity: 0.7 }}>
              <div>Press <strong>1</strong> for Bench Press</div>
              <div>Press <strong>2</strong> for Bicep Curls</div>
              <div>Press <strong>3</strong> for Squats</div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Type Display */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '12px 20px',
          borderRadius: '12px',
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          zIndex: 10001,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', opacity: 0.8 }}>
          Exercise Type:
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          {exerciseType === 'bench' ? '🏋️ Bench Press' : exerciseType === 'curl' ? '💪 Bicep Curls' : '🦵 Squats'}
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.6 }}>
          Press 1/2/3 to switch
        </div>
      </div>

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
