'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TagGameProps {
  onClose?: () => void;
}

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  z?: number;
  isIt: boolean;
  color: string;
  isCPU: boolean;
  direction: { x: number; y: number; z?: number };
  mesh?: any;
}

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PLAYER_SIZE = 20;
const TAG_DISTANCE = 30;
const CPU_SPEED = 2;
const PLAYER_SPEED = 4;

export default function TagGame({ onClose }: TagGameProps) {
  const [gameMode, setGameMode] = useState<'2d' | '3d'>('2d');
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'paused'>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setPlayerCount] = useState(1);
  const [gameTime, setGameTime] = useState(0);
  const [lastTagged, setLastTagged] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas3DRef = useRef<HTMLCanvasElement>(null);
  const container3DRef = useRef<HTMLDivElement>(null);
  const tagTimeoutRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const threeSceneRef = useRef<any>(null);

  const colors = ['#4a90e2', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];

  const createPlayer = (id: string, name: string, isCPU: boolean, isIt: boolean = false, mode: '2d' | '3d' = '2d'): Player => {
    if (mode === '3d') {
      return {
        id,
        name,
        x: (Math.random() - 0.5) * 40,
        y: 1,
        z: (Math.random() - 0.5) * 40,
        isIt,
        color: isIt ? '#ff0000' : colors[players.length % colors.length],
        isCPU,
        direction: { x: Math.random() > 0.5 ? 1 : -1, y: 0, z: Math.random() > 0.5 ? 1 : -1 },
      };
    }
    return {
      id,
      name,
      x: Math.random() * (GAME_WIDTH - PLAYER_SIZE),
      y: Math.random() * (GAME_HEIGHT - PLAYER_SIZE),
      isIt,
      color: colors[players.length % colors.length],
      isCPU,
      direction: { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 },
    };
  };

  const initializeGame = (count: number, startWithCPU: boolean) => {
    const maxPlayers = gameMode === '3d' ? 5 : 6;
    const actualCount = Math.min(count, maxPlayers);
    const newPlayers: Player[] = [];
    
    // Add human player
    const humanPlayer = createPlayer('player1', 'You', false, false, gameMode);
    newPlayers.push(humanPlayer);

    // Add CPU players
    if (startWithCPU || actualCount > 1) {
      for (let i = 2; i <= actualCount; i++) {
        const cpuPlayer = createPlayer(`cpu${i}`, `CPU ${i - 1}`, true, false, gameMode);
        newPlayers.push(cpuPlayer);
      }
    }

    // Randomly assign someone as "it" - ensure someone is always it
    const randomIndex = Math.floor(Math.random() * newPlayers.length);
    newPlayers[randomIndex].isIt = true;
    newPlayers[randomIndex].color = '#ff0000'; // Make it red

    setPlayers(newPlayers);
    setGameState('playing');
    setGameTime(0);
    
    if (gameMode === '3d') {
      setIsFullscreen(true);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.key.toLowerCase()] = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.key.toLowerCase()] = false;
  }, []);

  const initialize3DGame = useCallback(() => {
    if (!canvas3DRef.current || !players.length) return;

    // Clean up existing scene
    if (threeSceneRef.current) {
      threeSceneRef.current.renderer.dispose();
      threeSceneRef.current.scene.clear();
    }

    import('three').then((THREE) => {
      const canvas = canvas3DRef.current!;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a2332);
      scene.fog = new THREE.Fog(0x1a2332, 10, 50);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 15, 25);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.shadowMap.enabled = true;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(10, 20, 10);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // Ground
      const groundGeo = new THREE.PlaneGeometry(50, 50);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a3a4a });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Create player meshes
      const playerMeshes: { [key: string]: any } = {};
      players.forEach((player) => {
        // Create a simple character using boxes
        const playerGroup = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(0.6, 1, 0.6);
        const bodyMat = new THREE.MeshStandardMaterial({ 
          color: player.isIt ? 0xff0000 : new THREE.Color(player.color),
          metalness: 0.3,
          roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5;
        body.castShadow = true;
        playerGroup.add(body);
        
        // Head
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMat = new THREE.MeshStandardMaterial({ 
          color: player.isIt ? 0xff0000 : new THREE.Color(player.color),
          metalness: 0.3,
          roughness: 0.7
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.25;
        head.castShadow = true;
        playerGroup.add(head);
        
        playerGroup.position.set(player.x, player.y, player.z || 0);
        scene.add(playerGroup);
        playerMeshes[player.id] = { group: playerGroup, body, head };
      });

      threeSceneRef.current = { scene, camera, renderer, playerMeshes };

      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        if (gameMode === '3d') {
          renderer.render(scene, camera);
        }
      };
      animate();

      const handleResize = () => {
        if (camera && renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationId) cancelAnimationFrame(animationId);
      };
    });
  }, [players, gameState, gameMode, isPaused]);

  useEffect(() => {
    if (gameMode === '3d' && gameState === 'playing' && players.length > 0) {
      // Wait a bit for fullscreen to be ready
      const timer = setTimeout(() => {
        if (canvas3DRef.current) {
          initialize3DGame();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [gameMode, gameState, players, isFullscreen, initialize3DGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateCPUPlayer = useCallback((player: Player, allPlayers: Player[], mode: '2d' | '3d' = '2d'): Player => {
    if (!player.isCPU) return player;

    const humanPlayer = allPlayers.find(p => !p.isCPU);
    if (!humanPlayer) return player;

    let newDirection = { ...player.direction };

    if (mode === '3d') {
      if (player.isIt) {
        // CPU is "it" - chase the closest non-it player
        const target = allPlayers.find(p => !p.isIt && !p.isCPU) || allPlayers.find(p => !p.isIt);
        if (target && target.z !== undefined && player.z !== undefined) {
          const dx = target.x - player.x;
          const dz = target.z - player.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance > 2) {
            newDirection.x = dx / distance;
            newDirection.z = dz / distance;
          }
        }
      } else {
        // CPU is not "it" - run away from the "it" player
        const itPlayer = allPlayers.find(p => p.isIt);
        if (itPlayer && itPlayer.z !== undefined && player.z !== undefined) {
          const dx = player.x - itPlayer.x;
          const dz = player.z - itPlayer.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance > 2) {
            newDirection.x = dx / distance;
            newDirection.z = dz / distance;
          } else {
            // Random movement if too close
            newDirection.x = (Math.random() - 0.5) * 2;
            newDirection.z = (Math.random() - 0.5) * 2;
          }
        }
      }

      // Normalize direction
      const length = Math.sqrt(newDirection.x * newDirection.x + (newDirection.z || 0) * (newDirection.z || 0));
      if (length > 0) {
        newDirection.x /= length;
        newDirection.z = (newDirection.z || 0) / length;
      }

      const speed = CPU_SPEED * 0.1;
      let newX = player.x + newDirection.x * speed;
      let newZ = (player.z || 0) + (newDirection.z || 0) * speed;

      // Boundary checks for 3D
      newX = Math.max(-20, Math.min(20, newX));
      newZ = Math.max(-20, Math.min(20, newZ));

      return {
        ...player,
        x: newX,
        z: newZ,
        direction: newDirection,
      };
} else {
      // 2D logic with improved AI
      // 30% chance to move randomly (add unpredictability)
      const shouldMoveRandomly = Math.random() < 0.3;
      
      if (shouldMoveRandomly) {
        // Random movement
        newDirection.x = (Math.random() - 0.5) * 2;
        newDirection.y = (Math.random() - 0.5) * 2;
      } else if (player.isIt) {
        // CPU is "it" - chase the closest non-it player
        const targets = allPlayers.filter(p => !p.isIt);
        if (targets.length > 0) {
          // Find closest target
          let closestTarget = targets[0];
          let closestDistance = Math.sqrt(
            Math.pow(targets[0].x - player.x, 2) + Math.pow(targets[0].y - player.y, 2)
          );
          
          for (const target of targets) {
            const distance = Math.sqrt(
              Math.pow(target.x - player.x, 2) + Math.pow(target.y - player.y, 2)
            );
            if (distance < closestDistance) {
              closestDistance = distance;
              closestTarget = target;
            }
          }
          
          const dx = closestTarget.x - player.x;
          const dy = closestTarget.y - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 5) {
            newDirection.x = dx / distance;
            newDirection.y = dy / distance;
          }
        }
      } else {
        const itPlayer = allPlayers.find(p => p.isIt);
        if (itPlayer) {
          const dx = player.x - itPlayer.x;
          const dy = player.y - itPlayer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 5) {
            newDirection.x = dx / distance;
            newDirection.y = dy / distance;
          } else {
            newDirection.x = (Math.random() - 0.5) * 2;
            newDirection.y = (Math.random() - 0.5) * 2;
          }
        }
      }

      const length = Math.sqrt(newDirection.x * newDirection.x + newDirection.y * newDirection.y);
      if (length > 0) {
        newDirection.x /= length;
        newDirection.y /= length;
      }

      let newX = player.x + newDirection.x * CPU_SPEED;
      let newY = player.y + newDirection.y * CPU_SPEED;

      newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));
      newY = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, newY));

      return {
        ...player,
        x: newX,
        y: newY,
        direction: newDirection,
      };
    }
  }, []);

  const checkTag = useCallback((allPlayers: Player[], mode: '2d' | '3d' = '2d'): Player[] => {
    const itPlayer = allPlayers.find(p => p.isIt);
    if (!itPlayer) return allPlayers;

    const tagDistance = mode === '3d' ? 3 : TAG_DISTANCE;

    return allPlayers.map(player => {
      if (player.isIt || player.id === itPlayer.id) return player;

      let distance: number;
      if (mode === '3d' && player.z !== undefined && itPlayer.z !== undefined) {
        const dx = itPlayer.x - player.x;
        const dz = itPlayer.z - player.z;
        distance = Math.sqrt(dx * dx + dz * dz);
      } else {
        const dx = itPlayer.x - player.x;
        const dy = itPlayer.y - player.y;
        distance = Math.sqrt(dx * dx + dy * dy);
      }

      if (distance < tagDistance) {
        setLastTagged(player.name);
        if (tagTimeoutRef.current) clearTimeout(tagTimeoutRef.current);
        tagTimeoutRef.current = setTimeout(() => setLastTagged(null), 2000);
        return {
          ...player,
          isIt: true,
          color: '#ff0000', // Make clearly red
        };
      }
      return player;
    }).map(player => {
      if (player.id === itPlayer.id) {
        const otherPlayer = allPlayers.find(p => !p.isIt && p.id !== itPlayer.id);
        if (otherPlayer) {
          let distance: number;
          if (mode === '3d' && otherPlayer.z !== undefined && itPlayer.z !== undefined) {
            const dx = otherPlayer.x - itPlayer.x;
            const dz = otherPlayer.z - itPlayer.z;
            distance = Math.sqrt(dx * dx + dz * dz);
          } else {
            const dx = otherPlayer.x - itPlayer.x;
            const dy = otherPlayer.y - itPlayer.y;
            distance = Math.sqrt(dx * dx + dy * dy);
          }
          if (distance < tagDistance) {
            return {
              ...player,
              isIt: false,
              color: colors[allPlayers.indexOf(player) % colors.length],
            };
          }
        }
      }
      return player;
    });
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const gameLoop = () => {
      setPlayers(prevPlayers => {
        let updatedPlayers = prevPlayers.map(player => {
          if (!player.isCPU) {
            // Human player movement
            if (gameMode === '3d') {
              let dx = 0;
              let dz = 0;

              if (keysRef.current['w'] || keysRef.current['arrowup']) dz -= 1;
              if (keysRef.current['s'] || keysRef.current['arrowdown']) dz += 1;
              if (keysRef.current['a'] || keysRef.current['arrowleft']) dx -= 1;
              if (keysRef.current['d'] || keysRef.current['arrowright']) dx += 1;

              if (dx !== 0 && dz !== 0) {
                dx *= 0.707;
                dz *= 0.707;
              }

              const speed = PLAYER_SPEED * 0.1;
              let newX = player.x + dx * speed;
              let newZ = (player.z || 0) + dz * speed;

              newX = Math.max(-20, Math.min(20, newX));
              newZ = Math.max(-20, Math.min(20, newZ));

              return {
                ...player,
                x: newX,
                z: newZ,
              };
            } else {
              let dx = 0;
              let dy = 0;

              if (keysRef.current['w'] || keysRef.current['arrowup']) dy -= 1;
              if (keysRef.current['s'] || keysRef.current['arrowdown']) dy += 1;
              if (keysRef.current['a'] || keysRef.current['arrowleft']) dx -= 1;
              if (keysRef.current['d'] || keysRef.current['arrowright']) dx += 1;

              if (dx !== 0 && dy !== 0) {
                dx *= 0.707;
                dy *= 0.707;
              }

              let newX = player.x + dx * PLAYER_SPEED;
              let newY = player.y + dy * PLAYER_SPEED;

              newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));
              newY = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, newY));

              return {
                ...player,
                x: newX,
                y: newY,
              };
            }
          }
          return player;
        });

        // Update CPU players
        updatedPlayers = updatedPlayers.map(player => updateCPUPlayer(player, updatedPlayers));

        // Check for tags
        updatedPlayers = checkTag(updatedPlayers);

        // Update 3D meshes
        if (gameMode === '3d' && threeSceneRef.current) {
          updatedPlayers.forEach(player => {
            const meshData = threeSceneRef.current?.playerMeshes?.[player.id];
            if (meshData) {
              meshData.group.position.set(player.x, player.y, player.z || 0);
              const colorHex = player.isIt ? 0xff0000 : parseInt(player.color.replace('#', ''), 16);
              if (meshData.body && meshData.body.material) {
                meshData.body.material.color.setHex(colorHex);
              }
              if (meshData.head && meshData.head.material) {
                meshData.head.material.color.setHex(colorHex);
              }
            }
          });
        }

        return updatedPlayers;
      });

      setGameTime(prev => prev + 1);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, gameMode, isPaused, updateCPUPlayer, checkTag]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < GAME_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < GAME_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_WIDTH, y);
        ctx.stroke();
      }

      // Draw players
      players.forEach(player => {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(
          player.x + PLAYER_SIZE / 2,
          player.y + PLAYER_SIZE / 2,
          PLAYER_SIZE / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Draw "it" indicator
        if (player.isIt) {
          ctx.strokeStyle = '#ff4d4d';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            player.x + PLAYER_SIZE / 2,
            player.y + PLAYER_SIZE / 2,
            PLAYER_SIZE / 2 + 5,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // Draw "IT" text
          ctx.fillStyle = '#ff4d4d';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('IT', player.x + PLAYER_SIZE / 2, player.y - 8);
        }

        // Draw player name
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          player.name,
          player.x + PLAYER_SIZE / 2,
          player.y + PLAYER_SIZE + 14
        );
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [gameState, players]);

  const addPlayerToLobby = () => {
    const maxPlayers = gameMode === '3d' ? 5 : 6;
    if (playerCount < maxPlayers) {
      setPlayerCount(prev => prev + 1);
    }
  };

  const removePlayerFromLobby = () => {
    if (playerCount > 1) {
      setPlayerCount(prev => prev - 1);
    }
  };

  const resetGame = () => {
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
    setIsPaused(false);
    setGameState('lobby');
    setPlayers([]);
    setPlayerCount(1);
    setGameTime(0);
    setLastTagged(null);
    if (tagTimeoutRef.current) clearTimeout(tagTimeoutRef.current);
    threeSceneRef.current = null;
  };

  useEffect(() => {
    if (isFullscreen && container3DRef.current) {
      container3DRef.current.requestFullscreen().catch(() => {});
    }
  }, [isFullscreen]);

  if (gameState === 'lobby') {
    return (
      <div style={{
        background: 'var(--panel)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🏃 Tag Game</h3>
          {onClose && (
            <button className="btn" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
              Close
            </button>
          )}
        </div>

        <div style={{
          background: 'var(--panel-soft)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Lobby</div>
          <div style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '16px' }}>
            Waiting for players... (Need 3+ players or play with CPU)
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Game Mode</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
              <button
                className="btn"
                onClick={() => setGameMode('2d')}
                style={{ 
                  padding: '8px 16px',
                  background: gameMode === '2d' ? 'var(--accent)' : 'var(--panel-alt)'
                }}
              >
                2D Mode
              </button>
              <button
                className="btn"
                onClick={() => setGameMode('3d')}
                style={{ 
                  padding: '8px 16px',
                  background: gameMode === '3d' ? 'var(--accent)' : 'var(--panel-alt)'
                }}
              >
                3D Mode (Fullscreen)
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
              {playerCount} {playerCount === 1 ? 'Player' : 'Players'}
              {gameMode === '3d' && <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}> (Max 5)</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
              <button
                className="btn"
                onClick={removePlayerFromLobby}
                disabled={playerCount <= 1}
                style={{ padding: '8px 16px' }}
              >
                -
              </button>
              <button
                className="btn"
                onClick={addPlayerToLobby}
                disabled={playerCount >= (gameMode === '3d' ? 5 : 6)}
                style={{ padding: '8px 16px' }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => initializeGame(Math.max(3, playerCount), true)}
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              Start with CPU ({playerCount < 3 ? 3 : playerCount} players)
            </button>
            <button
              className="btn"
              onClick={() => initializeGame(playerCount, true)}
              style={{ padding: '12px 24px', fontSize: '14px', background: 'var(--panel-alt)' }}
            >
              Play Now ({playerCount} {playerCount === 1 ? 'player' : 'players'})
            </button>
          </div>
        </div>

        <div className="smalltext" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
          Use W/A/S/D or Arrow Keys to move. The player marked "IT" tries to tag others!
        </div>
      </div>
    );
  }

  if (gameMode === '3d' && isFullscreen) {
    return (
      <div
        ref={container3DRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#000',
          zIndex: 10000,
        }}
      >
        <canvas
          ref={canvas3DRef}
          style={{ width: '100%', height: '100%', display: 'block', background: '#1a2332' }}
        />
        {gameState === 'paused' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 700,
            color: '#fff',
            zIndex: 10001
          }}>
            PAUSED
          </div>
        )}
        {lastTagged && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 32px',
            background: 'rgba(255, 77, 77, 0.9)',
            borderRadius: '8px',
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff',
            zIndex: 10001
          }}>
            {lastTagged} was tagged!
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '16px',
          borderRadius: '8px',
          color: '#fff',
          zIndex: 10001
        }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>
            Time: {Math.floor(gameTime / 60)}s
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#ff4d4d' }}>
            {players.filter(p => p.isIt).map(p => p.name).join(', ')} is IT
          </div>
        </div>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '8px',
          zIndex: 10001
        }}>
          <button
            className="btn"
            onClick={() => {
              const newPaused = !isPaused;
              setIsPaused(newPaused);
              setGameState(newPaused ? 'paused' : 'playing');
            }}
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="btn"
            onClick={resetGame}
            style={{ padding: '12px 24px', fontSize: '14px', background: 'var(--panel-alt)' }}
          >
            Exit
          </button>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '12px 24px',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          zIndex: 10001
        }}>
          Use W/A/S/D or Arrow Keys to move. Avoid the player in RED!
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--panel)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🏃 Tag Game</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={() => {
            const newPaused = !isPaused;
            setIsPaused(newPaused);
            setGameState(newPaused ? 'paused' : 'playing');
          }} style={{ padding: '6px 12px', fontSize: '12px' }}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          {onClose && (
            <button className="btn" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
              Close
            </button>
          )}
        </div>
      </div>

      {lastTagged && (
        <div style={{
          padding: '12px',
          background: 'rgba(255, 77, 77, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ff4d4d',
        }}>
          {lastTagged} was tagged!
        </div>
      )}

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
          Time: {Math.floor(gameTime / 60)}s
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>
          {players.filter(p => p.isIt).map(p => p.name).join(', ')} is IT
        </div>
      </div>

      <div style={{
        position: 'relative',
        background: '#0a0a0a',
        border: '2px solid var(--border)',
        borderRadius: '8px',
        marginBottom: '16px',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
        {gameState === 'paused' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff'
          }}>
            PAUSED
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button className="btn" onClick={resetGame}>
          Back to Lobby
        </button>
        <button className="btn" onClick={() => initializeGame(players.length, true)} style={{ background: 'var(--panel-alt)' }}>
          Restart
        </button>
      </div>

      <div className="smalltext" style={{ marginTop: '12px', textAlign: 'center', color: 'var(--text-dim)' }}>
        Use W/A/S/D or Arrow Keys to move. Avoid the player marked "IT"!
      </div>
    </div>
  );
}
