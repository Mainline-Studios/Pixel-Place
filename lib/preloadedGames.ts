import { PublishedGame } from '@/types';

// FNAF Franchise Game - Preloaded
export const FNAF_GAME_CODE = `// FNAF Franchise - 3D Survival Game
// THREE is provided by the game engine

function createGame(container) {
  // Check if socket is already available
  const initialSocketCheck = typeof window !== 'undefined' && (
    (window.gameSocket !== undefined && window.gameSocket !== null) ||
    (window.__gameSocket !== undefined && window.__gameSocket !== null) ||
    (window.__gameSocket && window.__gameSocket.connected === true)
  );
  
  // If no socket, show Play Online button immediately
  if (!initialSocketCheck) {
    container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>This game requires online multiplayer. Click "Play Online" to start.</p><button id="hide-seek-play-online-initial" style="margin-top: 15px; padding: 10px 20px; background: #4A9EFF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">Play Online</button></div>';
    
    // Add click handler
    const playBtnInitial = container.querySelector('#hide-seek-play-online-initial');
    if (playBtnInitial) {
      playBtnInitial.addEventListener('click', () => {
        // Dispatch custom event to trigger online mode
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('hide-seek-request-online'));
        }
        container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>Connecting to server...</p></div>';
      });
    }
  }
  
// Wait for socket to be available (it connects asynchronously)
  let checkCount = 0;
  const maxChecks = 50; // Wait up to 5 seconds (50 * 100ms)
  
  const checkSocket = setInterval(() => {
    checkCount++;
    // Check for socket in multiple ways
    const hasSocket = typeof window !== 'undefined' && (
      (window.gameSocket !== undefined && window.gameSocket !== null) ||
      (window.__gameSocket !== undefined && window.__gameSocket !== null) ||
      (window.__gameSocket && window.__gameSocket.connected === true)
    );
    
    if (hasSocket) {
      clearInterval(checkSocket);
      // Socket is available, start the game
      setupGame();
    } else if (checkCount >= maxChecks) {
      // Give up after max checks
      clearInterval(checkSocket);
      container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>This game requires online multiplayer. Click "Play Online" to start.</p><button id="hide-seek-play-online-timeout" style="margin-top: 15px; padding: 10px 20px; background: #4A9EFF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">Play Online</button><p style="font-size: 12px; margin-top: 15px; color: #FF6B6B;">Connection timeout. Please ensure the socket server is running.</p></div>';
      // Add click handler for Play Online button
      const playBtnTimeout = container.querySelector('#hide-seek-play-online-timeout');
      if (playBtnTimeout) {
        playBtnTimeout.addEventListener('click', () => {
          // Trigger online mode
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'enable-online-mode' }, '*');
          }
          // Reset and try again
          checkCount = 0;
          const newInterval = setInterval(() => {
            checkCount++;
            const hasSocket = typeof window !== 'undefined' && (
              (window.gameSocket !== undefined && window.gameSocket !== null) ||
              (window.__gameSocket !== undefined && window.__gameSocket !== null) ||
              (window.__gameSocket && window.__gameSocket.connected === true)
            );
            if (hasSocket) {
              clearInterval(newInterval);
              setupGame();
            } else if (checkCount >= maxChecks) {
              clearInterval(newInterval);
              container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>This game requires online multiplayer. Click "Play Online" to start.</p><button id="hide-seek-retry" style="margin-top: 15px; padding: 10px 20px; background: #4A9EFF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">Retry Connection</button><p style="font-size: 12px; margin-top: 15px; color: #FF6B6B;">Connection timeout. Please ensure the socket server is running.</p></div>';
            }
          }, 100);
        });
      }
    } else if (checkCount % 10 === 0) {
      // Show progress every second
      container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>Waiting for connection... (' + Math.ceil((maxChecks - checkCount) / 10) + 's)</p><button id="hide-seek-play-online-progress" style="margin-top: 15px; padding: 10px 20px; background: #4A9EFF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">Play Online</button></div>';
    }
  }, 100);
  
  function setupGame() {
  
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // Ground
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x90EE90 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Hiding spots (boxes, trees, structures)
  const hidingSpots = [];
  const hidingSpotTypes = [
    { size: [3, 3, 3], color: 0x8B4513 },
    { size: [2, 2, 2], color: 0x654321 },
    { size: [1.5, 4, 1.5], color: 0x228B22 },
    { size: [2, 1, 2], color: 0x696969 },
  ];
  
  for (let i = 0; i < 30; i++) {
    const type = hidingSpotTypes[Math.floor(Math.random() * hidingSpotTypes.length)];
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(type.size[0], type.size[1], type.size[2]),
      new THREE.MeshStandardMaterial({ color: type.color })
    );
    box.position.set(
      (Math.random() - 0.5) * 80,
      type.size[1] / 2,
      (Math.random() - 0.5) * 80
    );
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    hidingSpots.push(box);
  }
  
  // Player
  const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
  const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x4A9EFF });
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 1, 0);
  player.castShadow = true;
  scene.add(player);
  
  // Other players (from multiplayer)
  const otherPlayers = new Map();
  
  // UI
  const uiContainer = document.createElement('div');
  uiContainer.style.cssText = 'position: absolute; top: 20px; left: 20px; color: white; font-family: Arial, sans-serif; font-size: 16px; z-index: 100; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 10px;';
  container.appendChild(uiContainer);
  
  const roleText = document.createElement('div');
  roleText.textContent = 'Waiting for role assignment...';
  roleText.style.fontWeight = 'bold';
  roleText.style.marginBottom = '8px';
  uiContainer.appendChild(roleText);
  
  const countdownText = document.createElement('div');
  countdownText.textContent = '';
  countdownText.style.fontSize = '24px';
  countdownText.style.color = '#FFD700';
  uiContainer.appendChild(countdownText);
  
  const statusText = document.createElement('div');
  statusText.textContent = '';
  statusText.style.marginTop = '8px';
  statusText.style.fontSize = '14px';
  uiContainer.appendChild(statusText);
  
  const hidersFoundText = document.createElement('div');
  hidersFoundText.textContent = '';
  hidersFoundText.style.marginTop = '8px';
  hidersFoundText.style.fontSize = '12px';
  uiContainer.appendChild(hidersFoundText);
  
  // Controls
  const keys = {};
  window.addEventListener('keydown', (e) => { 
    keys[e.key.toLowerCase()] = true;
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => { 
    keys[e.key.toLowerCase()] = false;
    keys[e.code] = false;
  });
  
  // Mouse look for seeker
  let yaw = 0;
  let pitch = 0;
  let mouseLocked = false;
  
  container.addEventListener('click', () => {
    if (!mouseLocked) {
      container.requestPointerLock();
    }
  });
  
  document.addEventListener('pointerlockchange', () => {
    mouseLocked = document.pointerLockElement === container;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (mouseLocked) {
      yaw -= e.movementX * 0.002;
      pitch -= e.movementY * 0.002;
      pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    }
  });
  
  // Game state
  let isSeeker = false;
  let gameStarted = false;
  let countdown = 0;
  let gameTime = 0;
  let hidersFound = 0;
  let totalHiders = 0;
  let gameOver = false;
  
  // Detection radius for seeker
  const detectionRadius = 8;
  
  // Multiplayer setup
  if (window.gameSocket) {
    window.gameSocket.on('game-start', (data) => {
      gameStarted = true;
      countdown = 30;
      totalHiders = (data.players || []).length - 1;
      statusText.textContent = isSeeker ? 'Find all the hiders!' : 'Hide! The seeker is coming!';
    });
    
    window.gameSocket.on('role-assigned', (data) => {
      isSeeker = data.role === 'seeker';
      roleText.textContent = isSeeker ? '🔍 You are the SEEKER' : '🙈 You are a HIDER';
      roleText.style.color = isSeeker ? '#FF6B6B' : '#4A9EFF';
      statusText.textContent = isSeeker ? 'Wait for game to start...' : 'Wait for game to start...';
    });
    
    window.gameSocket.on('player-update', (data) => {
      if (data.id && data.id !== window.gameSocket.id) {
        if (!otherPlayers.has(data.id)) {
          const otherPlayer = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.5, 1.5, 4, 8),
            new THREE.MeshStandardMaterial({ color: isSeeker ? 0xFF6B6B : 0x4A9EFF })
          );
          scene.add(otherPlayer);
          otherPlayers.set(data.id, otherPlayer);
        }
        const otherPlayer = otherPlayers.get(data.id);
        if (otherPlayer && data.position) {
          otherPlayer.position.set(data.position.x, data.position.y || 1, data.position.z);
        }
      }
    });
    
    window.gameSocket.on('hider-found', (data) => {
      hidersFound++;
      hidersFoundText.textContent = 'Hiders Found: ' + hidersFound + '/' + totalHiders;
      if (hidersFound >= totalHiders && isSeeker) {
        gameOver = true;
        statusText.textContent = '🎉 You found everyone! You win!';
        statusText.style.color = '#4CAF50';
      }
    });
    
    window.gameSocket.on('game-over', (data) => {
      gameOver = true;
      if (data.winner === 'seekers') {
        statusText.textContent = isSeeker ? '🎉 Seekers win!' : '😔 You were found!';
      } else {
        statusText.textContent = isSeeker ? '😔 Time ran out! Hiders win!' : '🎉 You survived! Hiders win!';
      }
    });
  }
  
  // Game loop
  const animate = () => {
    requestAnimationFrame(animate);
    
    if (gameStarted && !gameOver) {
      if (countdown > 0) {
        countdown -= 1/60;
        countdownText.textContent = isSeeker ? 'Game starts in: ' + Math.ceil(countdown) : 'Hide! ' + Math.ceil(countdown) + 's';
        countdownText.style.color = countdown < 10 ? '#FF0000' : '#FFD700';
      } else {
        countdownText.textContent = '';
        gameTime += 1/60;
        
        const speed = isSeeker ? 0.15 : 0.12;
        const moveVector = new THREE.Vector3();
        
        if (keys['w'] || keys['arrowup']) moveVector.z -= 1;
        if (keys['s'] || keys['arrowdown']) moveVector.z += 1;
        if (keys['a'] || keys['arrowleft']) moveVector.x -= 1;
        if (keys['d'] || keys['arrowright']) moveVector.x += 1;
        
        if (isSeeker && mouseLocked) {
          moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        }
        
        moveVector.normalize();
        moveVector.multiplyScalar(speed);
        player.position.add(moveVector);
        
        player.position.y = 1;
        player.position.x = Math.max(-45, Math.min(45, player.position.x));
        player.position.z = Math.max(-45, Math.min(45, player.position.z));
        
        if (isSeeker && countdown <= 0) {
          otherPlayers.forEach((otherPlayer, id) => {
            const distance = player.position.distanceTo(otherPlayer.position);
            if (distance < detectionRadius) {
              if (window.gameSocket) {
                window.gameSocket.emit('hider-found', { hiderId: id });
              }
              otherPlayer.material.color.setHex(0xFF0000);
            }
          });
        }
        
        if (isSeeker && mouseLocked) {
          camera.rotation.order = 'YXZ';
          camera.rotation.y = yaw;
          camera.rotation.x = pitch;
          camera.position.copy(player.position);
          camera.position.y += 1.6;
        } else {
          const cameraOffset = new THREE.Vector3(0, 3, 5);
          cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
          camera.position.copy(player.position).add(cameraOffset);
          camera.lookAt(player.position);
        }
        
        if (window.gameSocket && window.updatePlayerPosition) {
          window.updatePlayerPosition(player.position, { x: pitch, y: yaw, z: 0 });
        }
        
        if (gameTime > 300 && !gameOver) {
          gameOver = true;
          if (window.gameSocket) {
            window.gameSocket.emit('game-over', { winner: 'hiders' });
          }
          statusText.textContent = isSeeker ? '😔 Time ran out! Hiders win!' : '🎉 You survived! Hiders win!';
        }
      }
    }
    
    renderer.render(scene, camera);
  };
  
  animate();
  
  return () => {
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    if (container.contains(uiContainer)) {
      container.removeChild(uiContainer);
    }
    document.exitPointerLock();
  };
  }
}
`;
export const HIDE_AND_SEEK_PRELOADED_GAME: PublishedGame = {
  title: 'Hide and Seek',
  desc: 'Classic hide and seek! One seeker, multiple hiders. Online multiplayer only - requires 3+ players.',
  owner: 'System',
  ts: Date.now() + 3000,
  gameCode: HIDE_AND_SEEK_GAME_CODE,
  thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzg3Q0VFQiIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNGRkZGRkYiLz48Y2lyY2xlIGN4PSIxODAiIGN5PSIxNDAiIHI9IjgiIGZpbGw9IiMwMDAiLz48Y2lyY2xlIGN4PSIyMjAiIGN5PSIxNDAiIHI9IjgiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNIDE4MCAxNzAgUSAyMDAgMTkwIDIyMCAxNzAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PC9zdmc+',
  playable: true,
  multiplayer: true,
  maxPlayers: 8
};

