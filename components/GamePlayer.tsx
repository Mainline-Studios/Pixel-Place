'use client';

import { useEffect, useRef, useState } from 'react';
import { PublishedGame, GameServer } from '@/types';
import { getServers, getUsers, saveUsers } from '@/lib/storage';
import { getFirestore, doc, onSnapshot, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/lib/firebaseConfig';
import { useUser } from '@/contexts/UserContext';

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
  const firestoreUnsubscribeRef = useRef<(() => void) | null>(null);
  const dbRef = useRef<Firestore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSafetyPopup, setShowSafetyPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const serverId = game.serverId;
  const isOnlineMode = game.multiplayer && !!serverId;
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

  // Initialize Firebase Firestore for online multiplayer mode
  useEffect(() => {
    if (isOnline && serverId && game.multiplayer && user) {
      const servers = getServers();
      const foundServer = servers.find(s => s.id === serverId);
      if (foundServer) {
        setServer(foundServer);

        // Initialize Firebase Firestore connection
        try {
          let app;
          if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
          } else {
            app = getApps()[0];
          }
          
          const db = getFirestore(app);
          dbRef.current = db;

          const gameSessionId = `game_${serverId}_${game.ts.toString()}`;
          const gameSessionRef = doc(db, 'game_sessions', gameSessionId);
          const playerRef = doc(db, 'game_sessions', gameSessionId, 'players', user.username);

          // Join game session
          setDoc(playerRef, {
            id: user.username,
            username: user.username,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            joinedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(err => {
            console.warn('Failed to join game session:', err);
            setIsOnline(false);
          });

          // Update game session
          setDoc(gameSessionRef, {
            serverId,
            gameId: game.ts.toString(),
            updatedAt: serverTimestamp()
          }, { merge: true });

          // Listen to players in this game session
          const playersRef = doc(db, 'game_sessions', gameSessionId);
          const unsubscribe = onSnapshot(playersRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              // Get all players from subcollection
              // Note: Firestore doesn't support listening to subcollections directly
              // This is a simplified version - in production, you'd use a different structure
            }
          }, (error) => {
            console.warn('Firebase connection error, running in offline mode:', error);
            setIsOnline(false);
          });

          firestoreUnsubscribeRef.current = unsubscribe;

          // Update server player count
          const serverIndex = servers.findIndex(s => s.id === serverId);
          if (serverIndex !== -1) {
            servers[serverIndex].currentPlayers = Math.min(
              servers[serverIndex].currentPlayers + 1,
              servers[serverIndex].maxPlayers
            );
            require('@/lib/storage').saveServers(servers);
          }
        } catch (err) {
          console.warn('Firebase connection failed, running in offline mode:', err);
          setIsOnline(false);
        }
      } else {
        console.warn('Server not found, switching to offline mode');
        setIsOnline(false);
      }
    }

    return () => {
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
        firestoreUnsubscribeRef.current = null;
      }
      // Update server player count on disconnect
      if (serverId && user) {
        const servers = getServers();
        const serverIndex = servers.findIndex(s => s.id === serverId);
        if (serverIndex !== -1) {
          servers[serverIndex].currentPlayers = Math.max(0, servers[serverIndex].currentPlayers - 1);
          require('@/lib/storage').saveServers(servers);
        }
      }
    };
  }, [isOnline, serverId, game.ts, game.multiplayer, user]);

  useEffect(() => {
    if (!containerRef.current || !game.gameCode) return;
    
    // Built-in games should not go through GamePlayer
    if (game.gameCode === 'builtin_schoolAdventure') {
      setError('This game should open directly, not through GamePlayer');
      setIsLoading(false);
      return;
    }
    
    // Don't show loading screen - load immediately
    setIsLoading(false);

    // Create a safe execution context for the game code
    const executeGame = async () => {
      try {
        // Import Three.js dynamically
        const THREE = await import('three');

        // Create a module-like environment
        const moduleExports: any = {};
        const moduleObj = { exports: moduleExports };

        // Add multiplayer support if online (using Firebase)
        let multiplayerCode = '';
        if (isOnline && dbRef.current && user) {
          const gameSessionId = `game_${serverId}_${game.ts.toString()}`;
          const playerRef = doc(dbRef.current, 'game_sessions', gameSessionId, 'players', user.username);
          
          multiplayerCode = `
          // Multiplayer support via Firebase
          window.gamePlayers = ${JSON.stringify(players)};
          window.updatePlayerPosition = function(pos, rot) {
            // Update player position in Firebase
            if (window.__firebaseDb && window.__currentPlayerRef) {
              import('firebase/firestore').then(({ setDoc, serverTimestamp }) => {
                setDoc(window.__currentPlayerRef, {
                  position: pos,
                  rotation: rot,
                  updatedAt: serverTimestamp()
                }, { merge: true }).catch(err => console.warn('Failed to update position:', err));
              });
            }
          };
          window.__firebaseDb = ${JSON.stringify({ connected: true })};
          window.__currentPlayerRef = ${JSON.stringify({ path: `game_sessions/${gameSessionId}/players/${user.username}` })};
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

        if (createGameFunc && typeof createGameFunc === 'function') {
          try {
            const cleanup = createGameFunc(containerRef.current!);
            if (typeof cleanup === 'function') {
              cleanupRef.current = cleanup;
            }
            // Game loaded successfully
            setIsLoading(false);
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
        const errorMessage = err.message || err.toString() || 'Failed to load game';
        setError(errorMessage);
        setIsLoading(false);

        // Show error in console for debugging
        console.error('Full error details:', {
          message: errorMessage,
          stack: err.stack,
          gameTitle: game.title,
          gameCodeLength: game.gameCode?.length || 0
        });
      }
    };

    // Execute immediately without delay
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
              {/* Animated Progress Fill */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #00A2FF 0%, #00D4FF 50%, #00A2FF 100%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '4px',
                  animation: 'robloxLoading 1.5s linear infinite',
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
              <div style={{ marginBottom: '8px' }}>Initializing game engine...</div>
              <div style={{ marginBottom: '8px' }}>Loading assets...</div>
              <div>Preparing world...</div>
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
            fontFamily: 'Arial, sans-serif'
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
              <strong>Game:</strong> {game.title}<br />
              <strong>Owner:</strong> {game.owner}
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
    </div>
  );
}
