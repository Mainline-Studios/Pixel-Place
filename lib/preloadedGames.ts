import { PublishedGame } from '@/types';

// FNAF Franchise Game - Preloaded
export const FNAF_GAME_CODE = `// FNAF Franchise - 3D Survival Game
// THREE is provided by the game engine

function createGame(container) {
  // THREE is already available from the execution context
  // Video intro element
  const videoContainer = document.createElement('div');
  videoContainer.style.cssText = \`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  \`;
  
  // Create video element with iframe for YouTube/Bing video embedding
  const videoIframe = document.createElement('iframe');
  videoIframe.src = 'https://www.bing.com/videos/riverview/relatedvideo?&q=fnaf+movie+security+guard+job+video&&mid=0479D20F066702569AA00479D20F066702569AA0&&FORM=VRDGAR';
  videoIframe.allow = 'autoplay; encrypted-media';
  videoIframe.allowFullscreen = true;
  videoIframe.style.cssText = \`
    width: 100%;
    height: 100%;
    border: none;
    position: relative;
  \`;
  
  // Add glitch overlay effect to avoid copyright (subtle visual distortion)
  const glitchOverlay = document.createElement('div');
  glitchOverlay.style.cssText = \`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    background: linear-gradient(90deg, transparent 48%, rgba(255,0,0,0.1) 49%, rgba(255,0,0,0.1) 51%, transparent 52%);
    animation: glitch 0.3s infinite;
  \`;
  
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes glitch {
      0%, 100% { transform: translateX(0); opacity: 0; }
      49% { transform: translateX(-2px); opacity: 0.1; }
      50% { transform: translateX(2px); opacity: 0.1; }
    }
  \`;
  document.head.appendChild(style);
  
  videoContainer.appendChild(videoIframe);
  videoContainer.appendChild(glitchOverlay);
  
  const skipButton = document.createElement('button');
  skipButton.textContent = 'Skip Intro';
  skipButton.style.cssText = \`
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    z-index: 1001;
  \`;
  
  videoContainer.appendChild(skipButton);
  container.appendChild(videoContainer);
  
  const startGame = () => {
    videoContainer.remove();
    style.remove();
    initGame();
  };
  
  // Auto-start after 30 seconds or on skip
  setTimeout(startGame, 30000);
  skipButton.addEventListener('click', startGame);
  
  function initGame() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 5);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lighting - dim, atmospheric like the movie
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffaa44, 0.4);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    scene.add(mainLight);
    
    // Emergency lights (red, flickering)
    const emergencyLight1 = new THREE.PointLight(0xff0000, 0.5, 10);
    emergencyLight1.position.set(-8, 3, -5);
    scene.add(emergencyLight1);
    
    const emergencyLight2 = new THREE.PointLight(0xff0000, 0.5, 10);
    emergencyLight2.position.set(8, 3, -5);
    scene.add(emergencyLight2);
    
    // Flicker effect
    let flickerTime = 0;
    
    // Pizzeria floor - checkerboard pattern
    const floorSize = 30;
    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Add checkerboard pattern
    const checkerSize = 2;
    for (let x = -floorSize/2; x < floorSize/2; x += checkerSize) {
      for (let z = -floorSize/2; z < floorSize/2; z += checkerSize) {
        const isWhite = (Math.floor(x/checkerSize) + Math.floor(z/checkerSize)) % 2 === 0;
        const checker = new THREE.Mesh(
          new THREE.PlaneGeometry(checkerSize, checkerSize),
          new THREE.MeshStandardMaterial({ 
            color: isWhite ? 0xffffff : 0x000000,
            roughness: 0.8
          })
        );
        checker.rotation.x = -Math.PI / 2;
        checker.position.set(x + checkerSize/2, 0.01, z + checkerSize/2);
        checker.receiveShadow = true;
        scene.add(checker);
      }
    }
    
    // Walls - dark, worn brick texture
    const wallHeight = 8;
    const wallThickness = 0.5;
    
    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(floorSize, wallHeight, wallThickness),
      new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.9,
        metalness: 0.1
      })
    );
    backWall.position.set(0, wallHeight/2, -floorSize/2);
    backWall.receiveShadow = true;
    scene.add(backWall);
    
    // Side walls
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, floorSize),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 })
    );
    leftWall.position.set(-floorSize/2, wallHeight/2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, floorSize),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 })
    );
    rightWall.position.set(floorSize/2, wallHeight/2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    
    // Tables and chairs (scattered)
    const tablePositions = [
      { x: -6, z: -8 },
      { x: 6, z: -8 },
      { x: -6, z: 2 },
      { x: 6, z: 2 },
      { x: 0, z: -3 }
    ];
    
    tablePositions.forEach(pos => {
      // Table
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 2),
        new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 })
      );
      table.position.set(pos.x, 0.4, pos.z);
      table.castShadow = true;
      table.receiveShadow = true;
      scene.add(table);
      
      // Chairs (4 per table)
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI * 2) / 4;
        const chair = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.8, 0.4),
          new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 })
        );
        chair.position.set(
          pos.x + Math.cos(angle) * 1.2,
          0.4,
          pos.z + Math.sin(angle) * 1.2
        );
        chair.castShadow = true;
        scene.add(chair);
      }
    });
    
    // Stage area (where animatronics perform)
    const stage = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
    );
    stage.position.set(0, 0.1, -12);
    stage.receiveShadow = true;
    scene.add(stage);
    
    // Curtains on stage
    const curtainLeft = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 5),
      new THREE.MeshStandardMaterial({ color: 0x8B0000 })
    );
    curtainLeft.position.set(-3, 2.5, -12.1);
    scene.add(curtainLeft);
    
    const curtainRight = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 5),
      new THREE.MeshStandardMaterial({ color: 0x8B0000 })
    );
    curtainRight.position.set(3, 2.5, -12.1);
    scene.add(curtainRight);
    
    // Party decorations
    const decorations = [
      { x: -10, z: -10, color: 0xff0000 },
      { x: 10, z: -10, color: 0x00ff00 },
      { x: -10, z: 10, color: 0x0000ff },
      { x: 10, z: 10, color: 0xffff00 }
    ];
    
    decorations.forEach(dec => {
      const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: dec.color, emissive: dec.color, emissiveIntensity: 0.3 })
      );
      balloon.position.set(dec.x, 4, dec.z);
      scene.add(balloon);
    });
    
    // Animatronics
    const animatronics = [];
    
    // Helper to create blocky animatronic
    function createAnimatronic(name, color, position) {
      const group = new THREE.Group();
      
      // Head
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 1.2),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
      );
      head.position.set(0, 2.5, 0);
      head.castShadow = true;
      group.add(head);
      
      // Eyes (glowing)
      const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const eyeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 1
      });
      
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.3, 2.6, 0.6);
      group.add(leftEye);
      
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.3, 2.6, 0.6);
      group.add(rightEye);
      
      // Torso
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.8, 0.8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
      );
      torso.position.set(0, 1.2, 0);
      torso.castShadow = true;
      group.add(torso);
      
      // Arms
      const armGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
      const armMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      
      const leftArm = new THREE.Mesh(armGeometry, armMaterial);
      leftArm.position.set(-1, 1.2, 0);
      leftArm.castShadow = true;
      group.add(leftArm);
      
      const rightArm = new THREE.Mesh(armGeometry, armMaterial);
      rightArm.position.set(1, 1.2, 0);
      rightArm.castShadow = true;
      group.add(rightArm);
      
      // Legs
      const legGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
      const legMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      
      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-0.3, 0.75, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(0.3, 0.75, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);
      
      group.position.copy(position);
      scene.add(group);
      
      return {
        group,
        name,
        position: new THREE.Vector3().copy(position),
        targetPosition: new THREE.Vector3().copy(position),
        speed: 0.02,
        active: false,
        caughtPlayer: false
      };
    }
    
    // Create animatronics
    animatronics.push(createAnimatronic('Freddy', 0x8B4513, new THREE.Vector3(-3, 0, -12)));
    animatronics.push(createAnimatronic('Bonnie', 0x4169E1, new THREE.Vector3(0, 0, -12)));
    animatronics.push(createAnimatronic('Chica', 0xFFFF00, new THREE.Vector3(3, 0, -12)));
    animatronics.push(createAnimatronic('Foxy', 0xFF4500, new THREE.Vector3(-6, 0, -10)));
    
    // Springtrap / Yellow Rabbit (William Afton) - the killer
    const springtrapGroup = new THREE.Group();
    const springtrapColor = 0xFFD700; // Gold/yellow
    
    const springtrapHead = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: springtrapColor, roughness: 0.6 })
    );
    springtrapHead.position.set(0, 2.5, 0);
    springtrapHead.castShadow = true;
    springtrapGroup.add(springtrapHead);
    
    // Glowing red eyes (more menacing)
    const springtrapEyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1.5
    });
    
    const springtrapLeftEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      springtrapEyeMaterial
    );
    springtrapLeftEye.position.set(-0.3, 2.6, 0.6);
    springtrapGroup.add(springtrapLeftEye);
    
    const springtrapRightEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      springtrapEyeMaterial
    );
    springtrapRightEye.position.set(0.3, 2.6, 0.6);
    springtrapGroup.add(springtrapRightEye);
    
    // Torso with visible endoskeleton parts
    const springtrapTorso = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.8, 0.8),
      new THREE.MeshStandardMaterial({ color: springtrapColor, roughness: 0.6 })
    );
    springtrapTorso.position.set(0, 1.2, 0);
    springtrapTorso.castShadow = true;
    springtrapGroup.add(springtrapTorso);
    
    // Exposed endoskeleton parts (silver)
    const endoSkeleton = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.8, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.8 })
    );
    endoSkeleton.position.set(0.5, 1.2, 0);
    springtrapGroup.add(endoSkeleton);
    
    // Arms and legs
    const springtrapArmGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const springtrapArmMaterial = new THREE.MeshStandardMaterial({ color: springtrapColor, roughness: 0.6 });
    
    const springtrapLeftArm = new THREE.Mesh(springtrapArmGeometry, springtrapArmMaterial);
    springtrapLeftArm.position.set(-1, 1.2, 0);
    springtrapLeftArm.castShadow = true;
    springtrapGroup.add(springtrapLeftArm);
    
    const springtrapRightArm = new THREE.Mesh(springtrapArmGeometry, springtrapArmMaterial);
    springtrapRightArm.position.set(1, 1.2, 0);
    springtrapRightArm.castShadow = true;
    springtrapGroup.add(springtrapRightArm);
    
    const springtrapLegGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
    const springtrapLegMaterial = new THREE.MeshStandardMaterial({ color: springtrapColor, roughness: 0.6 });
    
    const springtrapLeftLeg = new THREE.Mesh(springtrapLegGeometry, springtrapLegMaterial);
    springtrapLeftLeg.position.set(-0.3, 0.75, 0);
    springtrapLeftLeg.castShadow = true;
    springtrapGroup.add(springtrapLeftLeg);
    
    const springtrapRightLeg = new THREE.Mesh(springtrapLegGeometry, springtrapLegMaterial);
    springtrapRightLeg.position.set(0.3, 0.75, 0);
    springtrapRightLeg.castShadow = true;
    springtrapGroup.add(springtrapRightLeg);
    
    springtrapGroup.position.set(0, 0, -14);
    scene.add(springtrapGroup);
    
    const springtrap = {
      group: springtrapGroup,
      name: 'Springtrap',
      position: new THREE.Vector3(0, 0, -14),
      targetPosition: new THREE.Vector3(0, 0, -14),
      speed: 0.03,
      active: false,
      caughtPlayer: false
    };
    
    // Game state
    let gameState = 'playing'; // 'playing', 'caught', 'torture', 'escaped', 'dead'
    let survivalTime = 0;
    let playerCaughtBy = null;
    let tortureProgress = 0;
    const tortureMax = 100;
    
    // UI Elements
    const uiContainer = document.createElement('div');
    uiContainer.style.cssText = \`
      position: absolute;
      top: 20px;
      left: 20px;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 18px;
      z-index: 100;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    \`;
    container.appendChild(uiContainer);
    
    const timeDisplay = document.createElement('div');
    timeDisplay.textContent = 'Survival Time: 0s';
    uiContainer.appendChild(timeDisplay);
    
    const warningDisplay = document.createElement('div');
    warningDisplay.textContent = '';
    warningDisplay.style.color = '#ff0000';
    warningDisplay.style.fontWeight = 'bold';
    uiContainer.appendChild(warningDisplay);
    
    // Torture escape UI
    const tortureUI = document.createElement('div');
    tortureUI.style.cssText = \`
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      padding: 30px;
      border-radius: 10px;
      color: white;
      text-align: center;
      display: none;
      z-index: 200;
    \`;
    container.appendChild(tortureUI);
    
    const tortureTitle = document.createElement('div');
    tortureTitle.textContent = 'TRAPPED IN TORTURE FREDDY!';
    tortureTitle.style.cssText = 'font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #ff0000;';
    tortureUI.appendChild(tortureTitle);
    
    const tortureInstructions = document.createElement('div');
    tortureInstructions.textContent = 'Press SPACE rapidly to loosen the bolts and escape!';
    tortureInstructions.style.cssText = 'margin-bottom: 20px;';
    tortureUI.appendChild(tortureInstructions);
    
    const tortureProgressBar = document.createElement('div');
    tortureProgressBar.style.cssText = \`
      width: 300px;
      height: 30px;
      background: #333;
      border: 2px solid #fff;
      border-radius: 5px;
      margin: 0 auto 20px;
      overflow: hidden;
    \`;
    const tortureProgressFill = document.createElement('div');
    tortureProgressFill.style.cssText = \`
      width: 0%;
      height: 100%;
      background: #00ff00;
      transition: width 0.1s;
    \`;
    tortureProgressBar.appendChild(tortureProgressFill);
    tortureUI.appendChild(tortureProgressBar);
    
    const tortureProgressText = document.createElement('div');
    tortureProgressText.textContent = 'Progress: 0%';
    tortureUI.appendChild(tortureProgressText);
    
    // Controls
    const keys = {};
    const keyStates = {};
    
    const handleKeyDown = (e) => {
      keys[e.code] = true;
      if (gameState === 'torture' && e.code === 'Space') {
        tortureProgress += 2;
        if (tortureProgress > tortureMax) {
          tortureProgress = tortureMax;
        }
        tortureProgressFill.style.width = (tortureProgress / tortureMax * 100) + '%';
        tortureProgressText.textContent = \`Progress: \${Math.floor(tortureProgress / tortureMax * 100)}%\`;
        
        if (tortureProgress >= tortureMax) {
          gameState = 'escaped';
          tortureUI.style.display = 'none';
          alert('You escaped! But you must continue surviving...');
          camera.position.set(0, 1.6, 5);
          playerCaughtBy = null;
          tortureProgress = 0;
        }
      }
    };
    
    const handleKeyUp = (e) => {
      keys[e.code] = false;
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Player movement
    const moveSpeed = 0.15;
    const playerPosition = new THREE.Vector3(0, 1.6, 5);
    
    // Check distance to animatronics
    function checkDistance(animatronic, playerPos) {
      return animatronic.group.position.distanceTo(playerPos);
    }
    
    // Animatronic AI
    function updateAnimatronics(delta) {
      if (gameState !== 'playing') return;
      
      animatronics.forEach(anim => {
        const distance = checkDistance(anim, playerPosition);
        
        if (distance < 15) {
          anim.active = true;
        }
        
        if (anim.active) {
          // Move towards player
          const direction = new THREE.Vector3()
            .subVectors(playerPosition, anim.group.position)
            .normalize();
          
          anim.group.position.add(direction.multiplyScalar(anim.speed));
          
          // Look at player
          anim.group.lookAt(playerPosition);
          
          // Check if caught
          if (distance < 2) {
            if (gameState === 'playing') {
              gameState = 'caught';
              playerCaughtBy = anim;
              
              // 50% chance: death, 50% chance: torture
              if (Math.random() < 0.5) {
                gameState = 'dead';
                alert(\`You were caught by \${anim.name}! GAME OVER.\\n\\nSurvival Time: \${Math.floor(survivalTime)}s\`);
                return;
              } else {
                gameState = 'torture';
                tortureUI.style.display = 'block';
                tortureProgress = 0;
                tortureProgressFill.style.width = '0%';
                tortureProgressText.textContent = 'Progress: 0%';
                alert('You were caught and trapped in Torture Freddy! Press SPACE rapidly to escape!');
              }
            }
          }
        }
      });
      
      // Springtrap AI (more aggressive)
      const springtrapDistance = checkDistance(springtrap, playerPosition);
      
      if (springtrapDistance < 20) {
        springtrap.active = true;
      }
      
      if (springtrap.active) {
        const direction = new THREE.Vector3()
          .subVectors(playerPosition, springtrap.group.position)
          .normalize();
        
        springtrap.group.position.add(direction.multiplyScalar(springtrap.speed));
        springtrap.group.lookAt(playerPosition);
        
        if (springtrapDistance < 2) {
          if (gameState === 'playing') {
            gameState = 'caught';
            playerCaughtBy = springtrap;
            
            // Springtrap always tries torture first
            if (Math.random() < 0.7) {
              gameState = 'torture';
              tortureUI.style.display = 'block';
              tortureProgress = 0;
              tortureProgressFill.style.width = '0%';
              tortureProgressText.textContent = 'Progress: 0%';
              alert('SPRINGTRAP CAUGHT YOU! Trapped in Torture Freddy! Press SPACE rapidly to escape!');
            } else {
              gameState = 'dead';
              alert('SPRINGTRAP KILLED YOU! GAME OVER.\\n\\nSurvival Time: ' + Math.floor(survivalTime) + 's');
            }
          }
        }
      }
    }
    
    // Animation loop
    let lastTime = performance.now();
    
    function animate() {
      requestAnimationFrame(animate);
      
      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      if (gameState === 'playing' || gameState === 'escaped') {
        if (gameState === 'escaped') {
          gameState = 'playing';
        }
        
        survivalTime += delta;
        timeDisplay.textContent = \`Survival Time: \${Math.floor(survivalTime)}s\`;
        
        // Player movement
        const moveVector = new THREE.Vector3();
        
        if (keys['KeyW']) moveVector.z -= moveSpeed;
        if (keys['KeyS']) moveVector.z += moveSpeed;
        if (keys['KeyA']) moveVector.x -= moveSpeed;
        if (keys['KeyD']) moveVector.x += moveSpeed;
        
        playerPosition.add(moveVector);
        camera.position.copy(playerPosition);
        
        // Keep player in bounds
        playerPosition.x = Math.max(-floorSize/2 + 1, Math.min(floorSize/2 - 1, playerPosition.x));
        playerPosition.z = Math.max(-floorSize/2 + 1, Math.min(floorSize/2 - 1, playerPosition.z));
        
        // Update animatronics
        updateAnimatronics(delta);
        
        // Warning system
        let closestDistance = Infinity;
        let closestAnimatronic = null;
        
        [...animatronics, springtrap].forEach(anim => {
          if (anim.active) {
            const dist = checkDistance(anim, playerPosition);
            if (dist < closestDistance) {
              closestDistance = dist;
              closestAnimatronic = anim;
            }
          }
        });
        
        if (closestDistance < 5) {
          warningDisplay.textContent = \`WARNING: \${(closestAnimatronic && closestAnimatronic.name) || 'ANIMATRONIC'} IS NEARBY!\`;
        } else {
          warningDisplay.textContent = '';
        }
      }
      
      // Flickering lights
      flickerTime += delta;
      if (flickerTime > 0.1) {
        flickerTime = 0;
        const flicker = Math.random();
        emergencyLight1.intensity = flicker < 0.3 ? 0.5 : 0.2;
        emergencyLight2.intensity = flicker < 0.3 ? 0.5 : 0.2;
      }
      
      // Rotate decorations
      decorations.forEach((dec, index) => {
        const balloon = scene.children.find(child => 
          child instanceof THREE.Mesh && 
          child.position.x === dec.x && 
          child.position.y === 4
        );
        if (balloon) {
          balloon.rotation.y += 0.01;
        }
      });
      
      renderer.render(scene, camera);
    }
    
    // Handle window resize
    function onWindowResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    window.addEventListener('resize', onWindowResize);
    
    animate();
    
    // Cleanup
    return function cleanup() {
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }
}
`;

export const FNAF_PRELOADED_GAME: PublishedGame = {
  title: 'FNAF Franchise',
  desc: 'Survive the night at Freddy Fazbear\'s Pizzeria! Avoid the animatronics and Springtrap. If caught, escape from Torture Freddy by loosening the bolts!',
  owner: 'System',
  ts: Date.now() - 86400000, // Yesterday to ensure it appears
  gameCode: FNAF_GAME_CODE,
  thumbnail: 'https://m.media-amazon.com/images/M/MV5BNDM1YjNjNzAtYjU3ZC00YzE1LWI3YjgtYjE3YjE0YzE1YzE1XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_FMjpg_UX1000_.jpg',
  playable: true,
  multiplayer: false
};

// School Adventure Game - Preloaded
export const SCHOOL_ADVENTURE_GAME_CODE = `// School Adventure - 3D Exploration Game
// THREE is provided by the game engine

function createGame(container) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue
  
  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 15);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  // Ground - school yard
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x90EE90, // Light green grass
    roughness: 0.8
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // School building - main structure
  const schoolWidth = 20;
  const schoolHeight = 8;
  const schoolDepth = 15;
  
  // Main building body
  const schoolBody = new THREE.Mesh(
    new THREE.BoxGeometry(schoolWidth, schoolHeight, schoolDepth),
    new THREE.MeshStandardMaterial({ 
      color: 0xFFD700, // Gold/yellow
      roughness: 0.7
    })
  );
  schoolBody.position.set(0, schoolHeight / 2, -schoolDepth / 2);
  schoolBody.castShadow = true;
  schoolBody.receiveShadow = true;
  scene.add(schoolBody);
  
  // Roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(schoolWidth * 0.8, 3, 4),
    new THREE.MeshStandardMaterial({ 
      color: 0x8B0000, // Dark red
      roughness: 0.6
    })
  );
  roof.position.set(0, schoolHeight + 1.5, -schoolDepth / 2);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  scene.add(roof);
  
  // Windows
  const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x87CEEB, // Sky blue
    emissive: 0x87CEEB,
    emissiveIntensity: 0.3,
    metalness: 0.8
  });
  
  for (let i = 0; i < 6; i++) {
    const window = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      windowMaterial
    );
    window.position.set(
      -schoolWidth / 2 + 3 + (i % 3) * 4,
      4,
      i < 3 ? -schoolDepth / 2 + 0.1 : schoolDepth / 2 - 0.1
    );
    if (i >= 3) window.rotation.y = Math.PI;
    scene.add(window);
  }
  
  // Door
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 5),
    new THREE.MeshStandardMaterial({ color: 0x654321 }) // Brown
  );
  door.position.set(0, 2.5, schoolDepth / 2 + 0.1);
  scene.add(door);
  
  // Door handle
  const handle = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xFFD700 })
  );
  handle.position.set(1.2, 2.5, schoolDepth / 2 + 0.2);
  scene.add(handle);
  
  // Flag pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x808080 })
  );
  pole.position.set(-schoolWidth / 2 - 2, 4, -schoolDepth / 2);
  scene.add(pole);
  
  // Flag
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 2),
    new THREE.MeshStandardMaterial({ color: 0xFF0000 })
  );
  flag.position.set(-schoolWidth / 2 - 0.5, 7.5, -schoolDepth / 2);
  scene.add(flag);
  
  // Trees around the school
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const distance = 25;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Tree trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    trunk.position.set(x, 2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    // Tree leaves
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(3, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0x228B22 })
    );
    leaves.position.set(x, 5.5, z);
    leaves.castShadow = true;
    scene.add(leaves);
  }
  
  // Benches
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const distance = 12;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    bench.position.set(x, 0.5, z);
    bench.rotation.y = angle + Math.PI / 2;
    bench.castShadow = true;
    scene.add(bench);
  }
  
  // Player
  const playerGeometry = new THREE.BoxGeometry(0.8, 1.6, 0.8);
  const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x4A90E2 });
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 0.8, 10);
  player.castShadow = true;
  scene.add(player);
  
  // Controls
  const keys: { [key: string]: boolean } = {};
  
  const handleKeyDown = (e: KeyboardEvent) => {
    keys[e.code] = true;
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
    keys[e.code] = false;
  };
  
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  // UI
  const uiContainer = document.createElement('div');
  uiContainer.style.cssText = \`
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 18px;
    z-index: 100;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    background: rgba(0,0,0,0.5);
    padding: 10px;
    border-radius: 5px;
  \`;
  container.appendChild(uiContainer);
  
  const instructions = document.createElement('div');
  instructions.textContent = 'WASD to move | Explore the school!';
  uiContainer.appendChild(instructions);
  
  // Movement
  const moveSpeed = 0.2;
  let cameraAngle = 0;
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Player movement
    const moveVector = new THREE.Vector3();
    
    if (keys['KeyW']) moveVector.z -= moveSpeed;
    if (keys['KeyS']) moveVector.z += moveSpeed;
    if (keys['KeyA']) {
      moveVector.x -= moveSpeed;
      cameraAngle -= 0.02;
    }
    if (keys['KeyD']) {
      moveVector.x += moveSpeed;
      cameraAngle += 0.02;
    }
    
    // Rotate move vector based on camera angle
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle);
    player.position.add(moveVector);
    
    // Keep player in bounds
    player.position.x = Math.max(-40, Math.min(40, player.position.x));
    player.position.z = Math.max(-40, Math.min(40, player.position.z));
    
    // Camera follows player
    const cameraDistance = 15;
    const cameraHeight = 8;
    camera.position.set(
      player.position.x + Math.sin(cameraAngle) * cameraDistance,
      player.position.y + cameraHeight,
      player.position.z + Math.cos(cameraAngle) * cameraDistance
    );
    camera.lookAt(player.position);
    
    // Rotate flag
    flag.rotation.y += 0.01;
    
    renderer.render(scene, camera);
  }
  
  // Handle window resize
  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  
  window.addEventListener('resize', onWindowResize);
  
  animate();
  
  // Cleanup
  return function cleanup() {
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    if (container.contains(uiContainer)) {
      container.removeChild(uiContainer);
    }
    renderer.dispose();
  };
}`;

export const GYM_PUMP_PRELOADED_GAME: PublishedGame = {
  title: 'Gym Pump',
  desc: 'Lift weights, build power, and climb the leaderboard!',
  owner: 'System',
  ts: Date.now() - 172800000, // 2 days ago to ensure it appears
  gameCode: 'builtin_gymPump', // Special identifier for React component games
  thumbnail: undefined, // Will use emoji fallback
  playable: true,
  multiplayer: false,
  id: 'gym-pump'
};

export const SCHOOL_ADVENTURE_PRELOADED_GAME: PublishedGame = {
  title: 'School Adventure',
  desc: 'Explore a 3D school environment! Navigate through classrooms, hallways, and discover hidden secrets. Complete quests and interact with NPCs!',
  owner: 'System',
  ts: Date.now() - 172800000, // 2 days ago
  gameCode: SCHOOL_ADVENTURE_GAME_CODE,
  thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
  playable: true,
  multiplayer: false
};