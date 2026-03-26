'use client';

import { useEffect, useRef, useState } from 'react';
import { PublishedGame, GameServer } from '@/types';
import { getServers, getUsers, saveUsers } from '@/lib/storage';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@/contexts/UserContext';
import FullScreenGameWrapper from '@/components/FullScreenGameWrapper';
import { FilteredUsername } from '@/components/FilteredText';

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
  const { user, updateUser } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSafetyPopup, setShowSafetyPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Validate game object before processing - ensure all string properties are safe
  if (!game || (!game.title && !game.gameCode)) {
    return (
      <FullScreenGameWrapper gameTitle="Error" onExit={onClose}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Invalid Game Data</h2>
            <p>The game data is missing required information.</p>
            <button onClick={onClose} style={{ marginTop: '20px', padding: '10px 20px', background: '#00a2ff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      </FullScreenGameWrapper>
    );
  }
  
  // Normalize game object to ensure all string properties are safe for toLowerCase
  const safeGame = {
    ...game,
    title: typeof game.title === 'string' ? game.title : (game.title || 'Untitled Game'),
    owner: typeof game.owner === 'string' ? game.owner : (game.owner || 'Unknown'),
    desc: typeof game.desc === 'string' ? game.desc : (game.desc || ''),
    category: typeof game.category === 'string' ? game.category : undefined,
    id: typeof game.id === 'string' ? game.id : (game.id || String(game.ts || Date.now())),
    gameCode: typeof game.gameCode === 'string' ? game.gameCode : (game.gameCode || '')
  };
  
  // Use safeGame instead of game for all operations
  const serverId = safeGame.serverId;
  const isOnlineMode = safeGame.multiplayer && !!serverId;
  const [isOnline, setIsOnline] = useState(isOnlineMode);
  const [players, setPlayers] = useState<Player[]>([]);
  const [server, setServer] = useState<GameServer | null>(null);

  // Set user as playing when game starts and track play
  useEffect(() => {
    if (!user) return;

    const setPlayingStatus = async () => {
      const users = await getUsers();
      const userIndex = users.findIndex(u => u.username === user.username);
      if (userIndex !== -1) {
        users[userIndex].currentGameId = game.ts.toString();
        users[userIndex].currentServerId = serverId || undefined;
        
        // Track recently played
        const gameId = game.id || game.ts.toString();
        if (!users[userIndex].recentlyPlayed) {
          users[userIndex].recentlyPlayed = [];
        }
        // Remove if already exists, then add to end (most recent)
        users[userIndex].recentlyPlayed = users[userIndex].recentlyPlayed.filter(id => id !== gameId);
        users[userIndex].recentlyPlayed.push(gameId);
        // Keep only last 20
        if (users[userIndex].recentlyPlayed.length > 20) {
          users[userIndex].recentlyPlayed = users[userIndex].recentlyPlayed.slice(-20);
        }
        
        await saveUsers(users);
        updateUser({
          currentGameId: game.ts.toString(),
          currentServerId: serverId || undefined,
          recentlyPlayed: users[userIndex].recentlyPlayed
        });
      }
      
      // Increment play count for published games
      const { getPublished, savePublished } = await import('@/lib/storage');
      const published = await getPublished();
      const gameIndex = published.findIndex(g => g.ts === game.ts);
      if (gameIndex !== -1) {
        published[gameIndex].playCount = (published[gameIndex].playCount || 0) + 1;
        await savePublished(published);
      }
    };

    setPlayingStatus();

    // Clear playing status when component unmounts
    return () => {
      const clearPlayingStatus = async () => {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.username === user.username);
        if (userIndex !== -1) {
          users[userIndex].currentGameId = undefined;
          users[userIndex].currentServerId = undefined;
          await saveUsers(users);
          updateUser({
            currentGameId: undefined,
            currentServerId: undefined
          });
        }
      };
      clearPlayingStatus();
    };
  }, [user, game.ts, serverId]);

  // Initialize server and socket for online mode
  useEffect(() => {
    if (isOnline && serverId && game.multiplayer) {
      const servers = getServers();
      const foundServer = servers.find(s => s.id === serverId);
      if (foundServer) {
        setServer(foundServer);

        // Initialize Socket.io connection
        // Note: For full multiplayer, you need a Socket.io server running
        // For now, it will gracefully fall back to offline mode if server is unavailable
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
              username: 'Player'
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
  }, [isOnline, serverId, game.ts, game.multiplayer]);

  // New loading screen - simple and reliable
  useEffect(() => {
    if (!isLoading) {
      setLoadingProgress(0);
      return;
    }
    
    const startTime = Date.now();
    const minLoadTime = 4000; // 4 seconds
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 2, 100));
    }, 80);
    
    // Hide loading after minimum time
    const hideTimeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(progressInterval);
    }, minLoadTime);
    
    return () => {
      clearInterval(progressInterval);
      clearTimeout(hideTimeout);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Start loading
    setIsLoading(true);
    setLoadingProgress(0);
    
    // Handle built-in games that use React components
    if (safeGame.gameCode && safeGame.gameCode.startsWith('builtin_')) {
      const loadBuiltinGame = async () => {
        try {
          setLoadingProgress(20);
          const gameId = safeGame.gameCode!.replace('builtin_', '');
          let GameComponent: React.ComponentType<any> | null = null;
          
          setLoadingProgress(40);
          // Map game IDs to components
          switch (gameId) {
            case 'hypnosia':
              GameComponent = (await import('@/components/Games/Hypnosia')).default;
              break;
            case 'underwaterOdyssey':
              GameComponent = (await import('@/components/Games/UnderwaterOddyseySeries')).default;
              break;
            case 'oceanlifePro':
              GameComponent = (await import('@/components/Games/UnderwaterOddyseySeries')).default;
              break;
            case 'redRover':
              GameComponent = (await import('@/components/Games/RedRover')).default;
              break;
            case 'jungleJourney':
              GameComponent = (await import('@/components/Games/JungleJourneySeries')).default;
              break;
            case 'floorIsLava':
              GameComponent = (await import('@/components/Games/FloorIsLava')).default;
              break;
            case 'hideAndSeek':
              GameComponent = (await import('@/components/Games/HideAndSeek')).default;
              break;
            case 'ghostInTheDark':
              GameComponent = (await import('@/components/Games/GhostInTheDark')).default;
              break;
            case 'cityLife':
              GameComponent = (await import('@/components/Games/CityLife')).default;
              break;
            case 'celestialSeries':
              GameComponent = (await import('@/components/Games/CelestialSeriesExploration')).default;
              break;
            case 'gameStudio':
              GameComponent = (await import('@/components/Games/GameStudio')).default;
              break;
            case 'gymPump':
              GameComponent = (await import('@/components/Games/GymPump')).default;
              break;
            default:
              setError(`Built-in game "${gameId}" not found`);
              return;
          }
          
          setLoadingProgress(60);
          if (GameComponent && containerRef.current) {
            // Use React to render the component
            const React = await import('react');
            const ReactDOM = await import('react-dom/client');
            
            setLoadingProgress(80);
            // Clear container
            containerRef.current.innerHTML = '';
            
            // Create root and render component
            const root = ReactDOM.createRoot(containerRef.current);
            root.render(React.createElement(GameComponent, { 
              onClose: onClose,
              user: user 
            }));
            
            // Store cleanup function
            cleanupRef.current = () => {
              root.unmount();
            };
            
            setError(null);
          }
        } catch (err: any) {
          console.error('Error loading built-in game:', err);
          // Handle toLowerCase errors specifically
          const errorMessage = err.message || 'Unknown error';
          if (errorMessage.includes('toLowerCase') || errorMessage.includes('Cannot read properties of undefined')) {
            setError('Game failed to load due to a data format issue. Please try again or contact support.');
          } else {
            setError(`Failed to load game: ${errorMessage}`);
          }
        }
      };
      
      loadBuiltinGame();
      return;
    }
    
    if (!safeGame.gameCode) {
      setError('Game code is missing');
      return;
    }
    
    // Create a safe execution context for the game code
    const executeGame = async () => {
      try {
        setLoadingProgress(20);
        // Import Three.js dynamically
        const THREE = await import('three');
        setLoadingProgress(40);

        // Create a module-like environment
        const moduleExports: any = {};
        const moduleObj = { exports: moduleExports };

        // Add multiplayer support if online
        let multiplayerCode = '';
        if (isOnline && socketRef.current) {
          // Store socket reference globally for game code
          (window as any).__gameSocket = socketRef.current;
          multiplayerCode = `
          // Multiplayer support
          window.gameSocket = {
            emit: function(event, data) {
              const socket = window.__gameSocket;
              if (socket && socket.emit) {
                socket.emit(event, data);
              }
            },
            on: function(event, callback) {
              const socket = window.__gameSocket;
              if (socket && socket.on) {
                socket.on(event, callback);
              }
            }
          };
          window.gamePlayers = ${JSON.stringify(players)};
          window.updatePlayerPosition = function(pos, rot) {
            if (window.gameSocket && window.gameSocket.emit) {
              window.gameSocket.emit('player-update', { position: pos, rotation: rot });
            }
          };
        `;
        }

        // Wrap the game code in a function that has access to THREE
        // Ensure code is treated as plain script, not module
        const gameCodeStr = String(safeGame.gameCode || '').trim();

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

        // ULTRA-FAST Texture Utilities - Instant Loading
        const textureUtils = `
          // Texture cache for instant reuse
          const textureCache = {};
          
          // Ultra-fast texture generation - minimal processing
          window.createTexture = function(type, options) {
            const cacheKey = type + '_' + (options.color || 'default') + '_' + (options.size || 128);
            if (textureCache[cacheKey]) {
              return textureCache[cacheKey].clone();
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = options.size || 128; // Very small for speed
            canvas.width = size;
            canvas.height = size;
            
            if (type === 'wood') {
              // Ultra-simple wood - just base color with minimal grain
              const baseColor = options.color || '#8B4513';
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
              
              // Only 3 grain lines for speed
              for (let i = 0; i < 3; i++) {
                const y = (i + 1) * (size / 4);
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(size, y);
                ctx.stroke();
              }
            } else if (type === 'metal') {
              // Simple metal - just gradient
              const gradient = ctx.createLinearGradient(0, 0, size, size);
              gradient.addColorStop(0, '#E0E0E0');
              gradient.addColorStop(1, '#A0A0A0');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, size, size);
            } else if (type === 'concrete') {
              // Just solid color
              const baseColor = options.color || '#808080';
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
            } else if (type === 'fabric') {
              // Just solid color
              const baseColor = options.color || '#CCCCCC';
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
            } else if (type === 'grass') {
              // Just solid color
              const baseColor = options.color || '#4CAF50';
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
            } else if (type === 'brick') {
              // Minimal brick pattern
              const brickColor = options.color || '#B22222';
              const mortarColor = options.mortar || '#888888';
              ctx.fillStyle = mortarColor;
              ctx.fillRect(0, 0, size, size);
              
              // Very simple brick pattern
              for (let y = 0; y < size; y += 20) {
                for (let x = 0; x < size; x += 40) {
                  ctx.fillStyle = brickColor;
                  ctx.fillRect(x, y, 36, 16);
                }
              }
            } else {
              // Default - just solid color
              const baseColor = options.color || '#CCCCCC';
              ctx.fillStyle = baseColor;
              ctx.fillRect(0, 0, size, size);
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(options.repeatX || 1, options.repeatY || 1);
            
            // Cache it
            textureCache[cacheKey] = texture;
            return texture.clone();
          };
          
          // Ultra-fast Material Creator - instant fallback
          window.createRealisticMaterial = function(type, options) {
            options = options || {};
            
            // Parse color from hex string if provided
            let color = 0xCCCCCC;
            if (options.color) {
              if (typeof options.color === 'string' && options.color.startsWith('#')) {
                color = parseInt(options.color.slice(1), 16);
              } else if (typeof options.color === 'number') {
                color = options.color;
              }
            }
            
            // Try to create texture, but use instant fallback if it fails
            let texture = null;
            try {
              if (type === 'wood') {
                texture = window.createTexture('wood', { 
                  color: options.color,
                  size: 64 // Very small for speed
                });
              } else if (type === 'metal') {
                texture = window.createTexture('metal', { size: 64 });
              } else if (type === 'concrete') {
                texture = window.createTexture('concrete', { color: options.color, size: 64 });
              } else if (type === 'grass') {
                texture = window.createTexture('grass', { color: options.color, size: 64 });
              } else if (type === 'fabric') {
                texture = window.createTexture('fabric', { color: options.color, size: 64 });
              }
            } catch (e) {
              // Use fallback - solid color material
            }
            
            if (type === 'wood') {
              return new THREE.MeshStandardMaterial({
                map: texture,
                color: color,
                roughness: options.roughness !== undefined ? options.roughness : 0.7,
                metalness: options.metalness !== undefined ? options.metalness : 0.1
              });
            } else if (type === 'metal') {
              return new THREE.MeshStandardMaterial({
                map: texture,
                color: color,
                roughness: options.roughness !== undefined ? options.roughness : 0.2,
                metalness: options.metalness !== undefined ? options.metalness : 0.95
              });
            } else if (type === 'concrete') {
              return new THREE.MeshStandardMaterial({
                map: texture,
                color: color,
                roughness: options.roughness !== undefined ? options.roughness : 0.9,
                metalness: options.metalness !== undefined ? options.metalness : 0.0
              });
            } else if (type === 'fabric') {
              return new THREE.MeshStandardMaterial({
                map: texture,
                color: color,
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
          '} else if (typeof window !== "undefined" && window.createGame) {\n' +
          '  exports.createGame = window.createGame;\n' +
          '}';

        // Execute in function scope with THREE and exports as parameters
        try {
          const gameFunction = new Function('THREE', 'exports', fullCode);
          gameFunction(THREE, moduleExports);
        } catch (parseError: any) {
          console.error('Code parsing error:', parseError);
          throw new Error(`Code syntax error: ${parseError.message}`);
        }

        // Check for createGame function
        let createGameFunc = moduleExports.createGame;

        // Also check window scope in case code assigned it there
        if (!createGameFunc && (window as any).createGame) {
          createGameFunc = (window as any).createGame;
        }

        setLoadingProgress(80);
        if (createGameFunc && typeof createGameFunc === 'function') {
          try {
            const cleanup = createGameFunc(containerRef.current!);
            if (typeof cleanup === 'function') {
              cleanupRef.current = cleanup;
            }
            // Game loaded successfully
            setLoadingProgress(100);
            setGameLoaded(true);
            setError(null);
          } catch (execError: any) {
            console.error('Game execution runtime error:', execError);
            throw new Error(`Game runtime error: ${execError.message || 'Unknown error'}`);
          }
        } else {
          // Try to find createGame in the code string
          if (cleanCode.includes('function createGame') || cleanCode.includes('createGame =')) {
            throw new Error('createGame function found but not exported. Make sure your code defines: function createGame(container) { ... }');
          } else {
            throw new Error('Game code must define a createGame function. Example: function createGame(container) { ... }');
          }
        }
      } catch (err: any) {
        console.error('Game execution error:', err);
        // Handle toLowerCase errors specifically
        const errorMessage = err.message || err.toString() || 'Failed to load game';
        if (errorMessage.includes('toLowerCase') || errorMessage.includes('Cannot read properties of undefined')) {
          setError('Game failed to load due to a data format issue. The game data may be corrupted. Please try again or contact support.');
        } else {
          setError(errorMessage);
        }

        // Show error in console for debugging
        console.error('Full error details:', {
          message: errorMessage,
          stack: err.stack,
          gameTitle: game?.title || 'Unknown',
          gameCodeLength: game?.gameCode?.length || 0,
          gameId: game?.id || game?.ts || 'Unknown'
        });
      }
    };

    // Execute immediately without delay - wrap in try-catch for safety
    try {
      executeGame();
    } catch (setupError: any) {
      console.error('Error setting up game execution:', setupError);
      const errorMessage = setupError?.message || 'Failed to set up game';
      if (errorMessage.includes('toLowerCase') || errorMessage.includes('Cannot read properties of undefined')) {
        setError('Game failed to load due to a data format issue. Please try again or contact support.');
      } else {
        setError(`Failed to load game: ${errorMessage}`);
      }
      setIsLoading(false);
    }

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
        </div>
      </div>
    );
  }

  return (
    <FullScreenGameWrapper gameTitle={safeGame.title} onExit={onClose}>
      {/* New Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#181818',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{
              fontSize: '64px',
              margin: '0 0 20px 0',
              fontWeight: 'bold',
              background: 'linear-gradient(180deg, #fff 0%, #ccc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {safeGame.title}
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#999',
              margin: '10px 0 0 0',
              fontWeight: 300
            }}>
              by <FilteredUsername username={safeGame.owner || ''} currentUsername={user?.username || ''} />
            </p>
          </div>

          <div style={{ width: '500px', maxWidth: '90%' }}>
            <p style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '12px',
              textAlign: 'center',
              fontWeight: 300
            }}>
              Loading...
            </p>

            <div style={{
              width: '100%',
              height: '8px',
              background: '#2a2a2a',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid #1a1a1a'
            }}>
              <div style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00A2FF 0%, #00D4FF 50%, #00A2FF 100%)',
                backgroundSize: '200% 100%',
                borderRadius: '4px',
                animation: 'loadingShimmer 1.5s linear infinite',
                boxShadow: '0 0 10px rgba(0, 162, 255, 0.5)',
                transition: 'width 0.2s ease'
              }} />
            </div>

            <div style={{
              marginTop: '30px',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
              fontWeight: 300
            }}>
              <div style={{ marginBottom: '8px' }}>Initializing game engine...</div>
              <div style={{ marginBottom: '8px' }}>Loading assets...</div>
              <div>Preparing world...</div>
            </div>
          </div>

          <style>{`
            @keyframes loadingShimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </div>
      )}

      {/* Game Container */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s',
          background: '#000'
        }}
      />
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 16000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            pointerEvents: 'all'
          }}
        >
          <div style={{
            background: '#1a1a1a',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            border: '2px solid #ff4444',
            boxShadow: '0 8px 32px rgba(255, 68, 68, 0.3)'
          }}>
            <h2 style={{ color: '#ff4444', marginBottom: '16px', fontSize: '24px' }}>⚠️ Game Failed to Load</h2>
            <div style={{
              color: '#fff',
              marginBottom: '20px',
              fontSize: '16px',
              lineHeight: '1.6',
              backgroundColor: '#2a2a2a',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error}
            </div>
            <div style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>
              <strong>Game:</strong> {safeGame.title}<br />
              <strong>Owner:</strong> <FilteredUsername username={safeGame.owner || ''} currentUsername={user?.username || ''} />
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: '#ff4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close Game
            </button>
          </div>
        </div>
      )}
    </FullScreenGameWrapper>
  );
}
