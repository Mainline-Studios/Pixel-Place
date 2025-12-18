'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { PublishedGame, GameServer, User } from '@/types';
import { getServers } from '@/lib/storage';
// Optional socket.io - completely optional, app works without it
// Note: To enable socket.io, install: npm install socket.io-client
// For now, socket.io is disabled to allow the app to build without it
let io: any = null;
let Socket: any = null;

// Load socket.io-client dynamically
const loadSocketIO = async () => {
  try {
    const socketModule = await import('socket.io-client');
    io = socketModule.io;
    Socket = socketModule.Socket;
    return Promise.resolve();
  } catch (err) {
    console.warn('Socket.io-client not available:', err);
    return Promise.resolve();
  }
};

interface GamePlayerProps {
  game: PublishedGame;
  onClose: () => void;
}

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export default function GamePlayer({ game, onClose }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSafetyPopup, setShowSafetyPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'engine' | 'assets' | 'world'>('engine');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const serverId = game.serverId;
  const isOnlineMode = game.multiplayer && !!serverId;
  const [isOnline, setIsOnline] = useState(isOnlineMode);
  const [players, setPlayers] = useState<Player[]>([]);
  const [server, setServer] = useState<GameServer | null>(null);
  const { user: contextUser } = useUser();
  const [onlineSession, setOnlineSession] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);

  // Initialize server and socket for online mode
  useEffect(() => {
    if (isOnline && (serverId || onlineSession) && (game.multiplayer || onlineSession)) {
      const servers = getServers();
      const foundServer = servers.find(s => s.id === serverId);
      if (foundServer) {
        setServer(foundServer);

        // Initialize Socket.io connection
        // Note: For full multiplayer, you need a Socket.io server running
        // For now, it will gracefully fall back to offline mode if server is unavailable
        // Load socket.io if available
        loadSocketIO().then(() => {
          if (!io) {
            console.warn('Socket.io not available, running in offline mode');
            setIsOnline(false);
            return;
          }
          try {
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
            const socket = io(socketUrl, {
              transports: ['websocket', 'polling'],
              reconnection: true,
              reconnectionAttempts: 3,
              reconnectionDelay: 1000,
              timeout: 5000
            });

            socket.on('connect', () => {
              console.log('Connected to game server');
              socket.emit('join-game', {
                serverId: serverId,
                gameId: game.ts.toString(),
                username: contextUser?.username || 'Player',
                sessionId: onlineSession || undefined
              });

              // Update server player count
              const servers = getServers();
              const serverIndex = servers.findIndex(s => s.id === serverId);
              if (serverIndex !== -1) {
                servers[serverIndex].currentPlayers = Math.min(
                  servers[serverIndex].currentPlayers + 1,
                  servers[serverIndex].maxPlayers
                );
                require('@/lib/storage').saveServers(servers);
              }
            });

            socket.on('connect_error', () => {
              console.warn('Socket.io server not available, running in offline mode');
              setIsOnline(false);
            });

            socket.on('player-joined', (player: Player) => {
              setPlayers(prev => {
                if (!prev.find(p => p.id === player.id)) {
                  return [...prev, player];
                }
                return prev;
              });
            });

            socket.on('player-left', (playerId: string) => {
              setPlayers(prev => prev.filter(p => p.id !== playerId));

              // Update server player count
              const servers = getServers();
              const serverIndex = servers.findIndex(s => s.id === serverId);
              if (serverIndex !== -1) {
                servers[serverIndex].currentPlayers = Math.max(0, servers[serverIndex].currentPlayers - 1);
                require('@/lib/storage').saveServers(servers);
              }
            });

            socket.on('player-update', (player: Player) => {
              setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
            });

            socket.on('disconnect', () => {
              console.log('Disconnected from game server');
              setIsOnline(false);
            });

            socketRef.current = socket;
          } catch (err) {
            console.warn('Socket.io connection failed, running in offline mode:', err);
            setIsOnline(false);
          }
        }).catch(() => {
          console.warn('Socket.io not available, running in offline mode');
          setIsOnline(false);
        });
      } else {
        console.warn('Server not found, switching to offline mode');
        setIsOnline(false);
      }
    }

    return () => {
      if (socketRef.current) {
        // Update server player count on disconnect
        if (serverId) {
          const servers = getServers();
          const serverIndex = servers.findIndex(s => s.id === serverId);
          if (serverIndex !== -1) {
            servers[serverIndex].currentPlayers = Math.max(0, servers[serverIndex].currentPlayers - 1);
            require('@/lib/storage').saveServers(servers);
          }
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOnline, serverId, game.ts, game.multiplayer, onlineSession, contextUser]);

  // Loading sequence: 5s engine, 3s assets, 10s world (18s total)
  useEffect(() => {
    if (!isLoading) return;
    
    setLoadingStage('engine');
    setLoadingProgress(0);
    
    const totalTime = 18000; // 18 seconds total
    const engineTime = 5000; // 5 seconds
    const assetsTime = 3000; // 3 seconds
    const worldTime = 10000; // 10 seconds
    
    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / totalTime) * 100);
      setLoadingProgress(progress);
      
      if (elapsed < engineTime) {
        setLoadingStage('engine');
      } else if (elapsed < engineTime + assetsTime) {
        setLoadingStage('assets');
      } else if (elapsed < totalTime) {
        setLoadingStage('world');
      } else {
        clearInterval(interval);
      }
    }, 50); // Update every 50ms for smooth progress
    
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!containerRef.current || !game.gameCode) return;
    setIsLoading(true);

    // Create a safe execution context for the game code
    const executeGame = async () => {
      try {
        // Import Three.js dynamically
        const THREE = await import('three');

        // Create a module-like environment
        const moduleExports: any = {};
        const moduleObj = { exports: moduleExports };

        // Get user skin data for avatar rendering
        let userSkinData = null;
        if (contextUser) {
          try {
            const { getSkins, findSkin } = await import('@/lib/storage');
            const skins = await getSkins();
            const equippedSkin = findSkin(skins, contextUser.equippedSkin);
            if (equippedSkin) {
              userSkinData = {
                colors: equippedSkin.colors || {
                  head: '#FFDBB3',
                  torso: '#2196F3',
                  arm: '#2196F3',
                  legs: '#2196F3'
                }
              };
            }
          } catch (err) {
            console.warn('Could not load user skin:', err);
          }
        }
        
        // Pass user skin data to game
        (window as any).__userSkinData = userSkinData;
        
        // Add multiplayer support if online
        let multiplayerCode = '';
        if (isOnline && socketRef.current) {
          // Store socket reference globally for game code
          (window as any).__gameSocket = socketRef.current;
          multiplayerCode = `
          // Multiplayer support
          if (window.__gameSocket) {
            window.gameSocket = {
              emit: function(event, data) {
                try {
                  const socket = window.__gameSocket;
                  if (socket && socket.emit) {
                    socket.emit(event, data);
                  }
                } catch (e) {
                  console.warn('Socket emit error:', e);
                }
              },
              on: function(event, callback) {
                try {
                  const socket = window.__gameSocket;
                  if (socket && socket.on) {
                    socket.on(event, callback);
                  }
                } catch (e) {
                  console.warn('Socket on error:', e);
                }
              },
              off: function(event, callback) {
                try {
                  const socket = window.__gameSocket;
                  if (socket && socket.off) {
                    socket.off(event, callback);
                  }
                } catch (e) {
                  console.warn('Socket off error:', e);
                }
              }
            };
            window.gamePlayers = ${JSON.stringify(players)};
            window.updatePlayerPosition = function(pos, rot) {
              if (window.gameSocket && window.gameSocket.emit) {
                window.gameSocket.emit('player-update', { position: pos, rotation: rot });
              }
            };
          } else {
            window.gameSocket = undefined;
            window.gamePlayers = [];
          }
        `;
        }

        // Wrap the game code in a function that has access to THREE
        // Ensure code is treated as plain script, not module
        const gameCodeStr = String(game.gameCode || '').trim();

        // Remove any potential import/export statements that might cause issues
        // Also convert escaped template literals back to actual template literals
        let cleanCode = gameCodeStr
          .replace(/^import\s+.*?from\s+['"].*?['"];?/gm, '')
          .replace(/^export\s+/gm, '')
          .trim();

        // Convert escaped template literals (\` and \${) back to actual template literals
        // This is needed because the code is stored as a string with escaped backticks
        // Also handle escaped newlines and other escape sequences
        cleanCode = cleanCode
          .replace(/\\`/g, '`')
          .replace(/\\\$\{/g, '${')
          .replace(/\\\\n/g, '\\n')  // Preserve actual newlines in strings
          .replace(/\\\\\\/g, '\\\\');  // Preserve actual backslashes

        // Roblox-style Engine with Playhop-quality Textures
        const textureUtils = `
          // Advanced Texture Utilities - Playhop Quality, Roblox Style
          window.createTexture = function(type, options) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = options.size || 1024; // Higher resolution for quality
            canvas.width = size;
            canvas.height = size;
            
            if (type === 'wood') {
              // Realistic wood grain - Playhop style
              const baseColor = options.color || '#8B4513';
              const darkColor = options.darkColor || '#654321';
              const lightColor = options.lightColor || '#CD853F';
              
              // Base color
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
              
              // Wood grain lines - curved and natural
              for (let i = 0; i < 80; i++) {
                const y = Math.random() * size;
                const curve = (Math.random() - 0.5) * 20;
                ctx.strokeStyle = Math.random() > 0.5 ? darkColor : lightColor;
                ctx.lineWidth = Math.random() * 4 + 1;
                ctx.beginPath();
                ctx.moveTo(0, y);
                for (let x = 0; x < size; x += 10) {
                  ctx.lineTo(x, y + Math.sin(x / 50) * curve);
                }
                ctx.stroke();
              }
              
              // Add knots
              for (let i = 0; i < 5; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const radius = Math.random() * 30 + 10;
                ctx.fillStyle = darkColor;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
              }
            } else if (type === 'metal') {
              // Polished metal - Roblox style
              const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
              gradient.addColorStop(0, '#F0F0F0');
              gradient.addColorStop(0.3, '#D0D0D0');
              gradient.addColorStop(0.7, '#B0B0B0');
              gradient.addColorStop(1, '#909090');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, size, size);
              
              // Brushed metal effect
              for (let i = 0; i < 100; i++) {
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, i * 10);
                ctx.lineTo(size, i * 10 + Math.random() * 5);
                ctx.stroke();
              }
            } else if (type === 'concrete') {
              // Realistic concrete - Playhop style
              const baseColor = options.color || '#808080';
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
              
              // Add aggregate texture
              const imageData = ctx.getImageData(0, 0, size, size);
              for (let i = 0; i < imageData.data.length; i += 4) {
                const noise = (Math.random() - 0.5) * 40;
                imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
                imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
                imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
              }
              ctx.putImageData(imageData, 0, 0);
              
              // Add cracks
              for (let i = 0; i < 10; i++) {
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(Math.random() * size, Math.random() * size);
                ctx.lineTo(Math.random() * size, Math.random() * size);
                ctx.stroke();
              }
            } else if (type === 'fabric') {
              // Realistic fabric - Playhop style
              const baseColor = options.color || '#CCCCCC';
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
              
              // Weave pattern
              for (let x = 0; x < size; x += 8) {
                for (let y = 0; y < size; y += 8) {
                  const isOver = (x + y) % 16 === 0;
                  ctx.fillStyle = isOver ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
                  ctx.fillRect(x, y, 4, 4);
                }
              }
            } else if (type === 'grass') {
              // Realistic grass - Playhop style
              const baseColor = options.color || '#4CAF50';
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
              
              // Grass blades with variation
              for (let i = 0; i < 500; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const height = Math.random() * 8 + 2;
                const angle = (Math.random() - 0.5) * 0.3;
                ctx.strokeStyle = 'rgba(34, 139, 34, ' + (0.3 + Math.random() * 0.4) + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.sin(angle) * height, y - Math.cos(angle) * height);
                ctx.stroke();
              }
            } else if (type === 'brick') {
              // Realistic brick - Playhop style
              const brickColor = options.color || '#B22222';
              const mortarColor = options.mortar || '#888888';
              const brickWidth = 60;
              const brickHeight = 20;
              const mortarWidth = 4;
              
              ctx.fillStyle = mortarColor;
              ctx.fillRect(0, 0, size, size);
              
              let offset = 0;
              for (let y = 0; y < size; y += brickHeight + mortarWidth) {
                for (let x = -offset; x < size; x += brickWidth + mortarWidth) {
                  ctx.fillStyle = brickColor;
                  ctx.fillRect(x, y, brickWidth, brickHeight);
                  
                  // Add texture variation
                  ctx.fillStyle = 'rgba(0,0,0,0.1)';
                  ctx.fillRect(x + 2, y + 2, brickWidth - 4, brickHeight - 4);
                }
                offset = offset === 0 ? brickWidth / 2 : 0;
              }
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(options.repeatX || 1, options.repeatY || 1);
            texture.anisotropy = 16; // High quality filtering
            return texture;
          };
          
          // Roblox-style Material Creator
          window.createRealisticMaterial = function(type, options) {
            options = options || {};
            let texture = null;
            
            if (type === 'wood') {
              texture = window.createTexture('wood', { 
                color: options.color,
                colors: options.colors 
              });
              return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: options.roughness !== undefined ? options.roughness : 0.7,
                metalness: options.metalness !== undefined ? options.metalness : 0.1,
                bumpMap: texture,
                bumpScale: 0.3
              });
            } else if (type === 'metal') {
              texture = window.createTexture('metal');
              return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: options.roughness !== undefined ? options.roughness : 0.2,
                metalness: options.metalness !== undefined ? options.metalness : 0.95,
                envMapIntensity: 1.2
              });
            } else if (type === 'concrete') {
              texture = window.createTexture('concrete', { color: options.color });
              return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: options.roughness !== undefined ? options.roughness : 0.9,
                metalness: options.metalness !== undefined ? options.metalness : 0.0
              });
            } else if (type === 'fabric') {
              texture = window.createTexture('fabric', { color: options.color });
              return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: options.roughness !== undefined ? options.roughness : 0.95,
                metalness: options.metalness !== undefined ? options.metalness : 0.0
              });
            } else if (type === 'grass') {
              texture = window.createTexture('grass', { color: options.color });
              return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: options.roughness !== undefined ? options.roughness : 0.9,
                metalness: options.metalness !== undefined ? options.metalness : 0.0
              });
            } else if (type === 'brick') {
              texture = window.createTexture('brick', { 
                color: options.color,
                mortar: options.mortar 
              });
              return new THREE.MeshStandardMaterial({
                map: texture,
                roughness: options.roughness !== undefined ? options.roughness : 0.8,
                metalness: options.metalness !== undefined ? options.metalness : 0.0
              });
            }
            
            // Roblox-style default material (smooth, polished)
            return new THREE.MeshStandardMaterial({
              color: options.color || 0xffffff,
              roughness: options.roughness !== undefined ? options.roughness : 0.4,
              metalness: options.metalness !== undefined ? options.metalness : 0.1
            });
          };
          
          // Roblox-style Part Creator (smooth, polished shapes)
          window.createPart = function(shape, size, material) {
            let geometry;
            const defaultSize = size || 1;
            
            if (shape === 'block' || shape === 'box') {
              geometry = new THREE.BoxGeometry(defaultSize, defaultSize, defaultSize);
            } else if (shape === 'sphere' || shape === 'ball') {
              geometry = new THREE.SphereGeometry(defaultSize / 2, 32, 32);
            } else if (shape === 'cylinder') {
              geometry = new THREE.CylinderGeometry(defaultSize / 2, defaultSize / 2, defaultSize, 32);
            } else if (shape === 'wedge') {
              // Wedge shape for Roblox style
              const shape = new THREE.Shape();
              shape.moveTo(0, 0);
              shape.lineTo(defaultSize, 0);
              shape.lineTo(defaultSize, defaultSize);
              shape.lineTo(0, 0);
              geometry = new THREE.ExtrudeGeometry(shape, { depth: defaultSize, bevelEnabled: false });
            } else {
              geometry = new THREE.BoxGeometry(defaultSize, defaultSize, defaultSize);
            }
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
          };
        `;

        // Use Function constructor with proper parameters to prevent module parsing
        // Wrap in IIFE with "use strict" to ensure script mode
        const fullCode =
          '"use strict";\n' +
          textureUtils + '\n' +
          cleanCode + '\n' +
          multiplayerCode + '\n' +
          'if (typeof createGame !== "undefined") {\n' +
          '  exports.createGame = createGame;\n' +
          '}';

        // Execute in function scope with THREE and exports as parameters
        const gameFunction = new Function('THREE', 'exports', fullCode);

        gameFunction(THREE, moduleExports);

        if (moduleExports.createGame && typeof moduleExports.createGame === 'function') {
          const cleanup = moduleExports.createGame(containerRef.current!);
          if (typeof cleanup === 'function') {
            cleanupRef.current = cleanup;
          }
          // Wait for loading sequence to complete (18 seconds total)
          await new Promise(resolve => setTimeout(resolve, 18000));
          
          setLoadingProgress(100);
          setIsLoading(false);
        } else {
          throw new Error('Game code must export a createGame function');
        }
      } catch (err: any) {
        console.error('Game execution error:', err);
        setError(err.message || 'Failed to load game');
        setIsLoading(false);
      }
    };

    executeGame();

    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
        cleanupRef.current = null;
      }
      if (containerRef.current) {
        try {
          // Clear container safely
          while (containerRef.current.firstChild) {
            const child = containerRef.current.firstChild;
            if (containerRef.current.contains(child)) {
              containerRef.current.removeChild(child);
            } else {
              break;
            }
          }
        } catch (e) {
          // If removeChild fails, try innerHTML
          try {
            containerRef.current.innerHTML = '';
          } catch (e2) {
            // Ignore cleanup errors
          }
        }
      }
    };
  }, [game, isOnline, players]);

  // Handle ESC key to close game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);


  // Safety/Rules Popup
  if (showSafetyPopup) {
    return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 20000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            padding: '40px',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
        >
          <h2 style={{ margin: '0 0 20px 0', fontSize: '28px', textAlign: 'center', color: '#4CAF50' }}>
            Game Rules & Safety
          </h2>
          
          <div style={{ marginBottom: '24px', lineHeight: '1.8', fontSize: '16px' }}>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
              <strong style={{ color: '#4CAF50' }}>✓ Be Nice:</strong> Treat all players with respect and kindness.
            </div>
            
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
              <strong style={{ color: '#4CAF50' }}>✓ No Bullying:</strong> Harassment, threats, or mean behavior is not allowed.
            </div>
            
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
              <strong style={{ color: '#4CAF50' }}>✓ Report Problems:</strong> Use the Report button if you see something wrong.
            </div>
            
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 193, 7, 0.15)', borderRadius: '8px', borderLeft: '4px solid #FFC107' }}>
              <strong style={{ color: '#FFC107' }}>⚠ Safety Warning:</strong>
              <div style={{ marginTop: '8px' }}>
                This game contains bright colors and motion. If you feel dizzy, nauseous, or uncomfortable, please take a break immediately.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', fontSize: '14px', color: '#aaa', textAlign: 'center' }}>
            <strong>Privacy:</strong> This game does not collect personal information. Only nicknames are used.
          </div>

          <button
            onClick={() => setShowSafetyPopup(false)}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '14px 28px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            I Understand - Start Game
          </button>
          <button
            onClick={async () => {
              if (!contextUser) {
                alert('Please log in to play online');
                return;
              }
              setIsCreatingSession(true);
              try {
                const response = await fetch('/api/game-sessions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'create',
                    gameId: game.ts.toString(),
                    gameTitle: game.title,
                    username: contextUser.username,
                    maxPlayers: game.maxPlayers || 10
                  })
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
                }
                
                const data = await response.json();
                if (data.success) {
                  setOnlineSession(data.session.id);
                  setIsOnline(true);
                  setShowSafetyPopup(false);
                  setIsLoading(true);
                } else {
                  alert('Failed to create session: ' + (data.error || 'Unknown error'));
                }
              } catch (err: any) {
                alert('Error creating session: ' + err.message);
              } finally {
                setIsCreatingSession(false);
              }
            }}
            disabled={isCreatingSession}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '14px 28px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00A2FF 0%, #00D4FF 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: isCreatingSession ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0, 162, 255, 0.4)',
              transition: 'transform 0.2s',
              opacity: isCreatingSession ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isCreatingSession) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isCreatingSession ? 'Creating Session...' : '🎮 Play Online'}
          </button>
        </div>
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
        width: '100vw',
        height: '100vh',
        background: '#000',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
            {/* Play Online Button */}
      {showSafetyPopup === false && !onlineSession && !isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20000,
            textAlign: 'center'
          }}
        >
          <button
            onClick={async () => {
              if (!contextUser) {
                alert('Please log in to play online');
                return;
              }
              setIsCreatingSession(true);
              try {
                // Create or find a session
                const response = await fetch('/api/game-sessions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'create',
                    gameId: game.ts.toString(),
                    gameTitle: game.title,
                    username: contextUser.username,
                    maxPlayers: game.maxPlayers || 10
                  })
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
                }
                
                const data = await response.json();
                if (data.success) {
                  setOnlineSession(data.session.id);
                  setIsOnline(true);
                  setIsLoading(true);
                } else {
                  alert('Failed to create session: ' + (data.error || 'Unknown error'));
                }
              } catch (err: any) {
                alert('Error creating session: ' + err.message);
              } finally {
                setIsCreatingSession(false);
              }
            }}
            disabled={isCreatingSession}
            style={{
              padding: '16px 32px',
              fontSize: '20px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00A2FF 0%, #00D4FF 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isCreatingSession ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(0, 162, 255, 0.4)',
              transition: 'transform 0.2s',
              opacity: isCreatingSession ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isCreatingSession) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isCreatingSession ? 'Creating Session...' : '🎮 Play Online'}
          </button>
          <div style={{ marginTop: '16px', color: '#999', fontSize: '14px' }}>
            Play with other players in real-time
          </div>
        </div>
      )}

      {/* Roblox-style Loading Screen */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#181818',
            zIndex: 15000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: '"Gotham SSm A", "Gotham SSm B", Arial, sans-serif'
          }}
        >
          {/* Roblox-style Logo/Title */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ 
              fontSize: '64px', 
              margin: '0 0 20px 0', 
              fontWeight: 'bold',
              background: 'linear-gradient(180deg, #fff 0%, #ccc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {game.title}
            </div>
            <div style={{ 
              fontSize: '18px', 
              color: '#999',
              marginTop: '10px',
              fontWeight: 300
            }}>
              by {game.owner}
            </div>
          </div>
          
          {/* Roblox-style Progress Bar Container */}
          <div style={{ width: '500px', maxWidth: '90%' }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#999',
              marginBottom: '12px',
              textAlign: 'center',
              fontWeight: 300
            }}>
              Loading...
            </div>
            
            {/* Progress Bar Background */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: '#2a2a2a',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #1a1a1a',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {/* Actual Progress Fill */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #00A2FF 0%, #00D4FF 50%, #00A2FF 100%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '4px',
                  transition: 'width 0.1s linear',
                  boxShadow: '0 0 10px rgba(0, 162, 255, 0.5)'
                }}
              />
            </div>
            
            {/* Loading Steps */}
            <div style={{
              marginTop: '30px',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
              fontWeight: 300
            }}>
              <div style={{ 
                marginBottom: '8px',
                color: loadingStage === 'engine' ? '#00A2FF' : '#666'
              }}>
                {loadingProgress > 27.8 ? '✓' : loadingStage === 'engine' ? '○' : '○'} Initializing game engine...
              </div>
              <div style={{ 
                marginBottom: '8px',
                color: loadingStage === 'assets' ? '#00A2FF' : loadingProgress > 44.4 ? '#999' : '#666'
              }}>
                {loadingProgress > 44.4 ? '✓' : loadingStage === 'assets' ? '○' : '○'} Loading assets...
              </div>
              <div style={{
                color: loadingStage === 'world' ? '#00A2FF' : loadingProgress === 100 ? '#999' : '#666'
              }}>
                {loadingProgress === 100 ? '✓' : loadingStage === 'world' ? '○' : '○'} Preparing world...
              </div>
            </div>
          </div>
          
          <style>{`
            @keyframes robloxLoading {
              0% { 
                background-position: 0% 0%;
                transform: translateX(-100%);
              }
              50% {
                background-position: 100% 0%;
                transform: translateX(0%);
              }
              100% { 
                background-position: 200% 0%;
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
      )}

      {/* Hidden header - ESC key to exit */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s'
        }}
      />
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 77, 77, 0.9)',
            color: '#fff',
            padding: '24px',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '500px'
          }}
        >
          <h3 style={{ margin: '0 0 12px 0' }}>Game Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
          <button
            onClick={onClose}
            style={{
              marginTop: '16px',
              background: '#fff',
              border: 'none',
              color: '#ff4d4d',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
