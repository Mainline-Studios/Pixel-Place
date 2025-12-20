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
  const keys = {};
  
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
  }
  setupGame();
}
`;

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

// Tic Tac Toe Game - Realistic 3D with proper textures
export const TIC_TAC_TOE_GAME_CODE = `// Realistic 3D Tic Tac Toe Game
// THREE is provided by the game engine

function createGame(container) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8e8e8); // Light gray background
  
  // Camera setup - zoomed in on table, showing left side board and right side hands
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(-1.5, 2.2, 4.5);
  camera.lookAt(-1.5, 0, 0);
  
  // Renderer with better quality
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  
  // Enhanced Lighting for realistic look
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Main directional light - warm sunlight
  const mainLight = new THREE.DirectionalLight(0xfff8e1, 1.2);
  mainLight.position.set(3, 8, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 4096;
  mainLight.shadow.mapSize.height = 4096;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 20;
  mainLight.shadow.camera.left = -5;
  mainLight.shadow.camera.right = 5;
  mainLight.shadow.camera.top = 5;
  mainLight.shadow.camera.bottom = -5;
  mainLight.shadow.bias = -0.0001;
  mainLight.shadow.normalBias = 0.02;
  scene.add(mainLight);
  
  // Fill light from opposite side - cool blue
  const fillLight = new THREE.DirectionalLight(0xe3f2fd, 0.5);
  fillLight.position.set(-3, 4, -4);
  scene.add(fillLight);
  
  // Rim light for depth
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(-2, 2, 6);
  scene.add(rimLight);
  
  // Subtle point light for warmth
  const pointLight = new THREE.PointLight(0xfff8e1, 0.4, 10);
  pointLight.position.set(0, 3, 2);
  scene.add(pointLight);
  
  // Grey walls - complete room
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080, // Grey
    roughness: 0.9,
    metalness: 0.0
  });
  
  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 8),
    wallMaterial
  );
  backWall.position.set(0, 2, -8);
  backWall.receiveShadow = true;
  scene.add(backWall);
  
  // Left wall
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 8),
    wallMaterial
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-10, 2, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);
  
  // Right wall
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 8),
    wallMaterial
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(10, 2, 0);
  rightWall.receiveShadow = true;
  scene.add(rightWall);
  
  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    wallMaterial
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 6, 0);
  ceiling.receiveShadow = true;
  scene.add(ceiling);
  
  // Checkered floor - black and white tiles
  const floorSize = 12;
  const tileSize = 1;
  const floor = new THREE.Group();
  
  for (let x = -floorSize/2; x < floorSize/2; x += tileSize) {
    for (let z = -floorSize/2; z < floorSize/2; z += tileSize) {
      const isWhite = (Math.floor((x + floorSize/2) / tileSize) + Math.floor((z + floorSize/2) / tileSize)) % 2 === 0;
      const tile = new THREE.Mesh(
        new THREE.PlaneGeometry(tileSize, tileSize),
        new THREE.MeshStandardMaterial({
          color: isWhite ? 0xffffff : 0x000000,
          roughness: 0.7,
          metalness: 0.0
        })
      );
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(x + tileSize/2, -1.5, z + tileSize/2);
      tile.receiveShadow = true;
      floor.add(tile);
    }
  }
  scene.add(floor);
  
  // Enhanced wood texture with grain simulation
  function createWoodMaterial(color, roughness = 0.7, metalness = 0.1) {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness,
      metalness: metalness,
      bumpScale: 2.0
    });
    
    // Create a simple wood grain pattern using a canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 512, 512);
    
    // Add wood grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, 0);
      ctx.lineTo(Math.random() * 512, 512);
      ctx.stroke();
    }
    
    // Add darker grain variations
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, 0);
      ctx.lineTo(Math.random() * 512, 512);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    material.map = texture;
    
    return material;
  }
  
  // Enhanced skin material with subtle variation
  function createSkinMaterial(color) {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.85,
      metalness: 0.0,
      emissive: 0x000000,
      emissiveIntensity: 0.0
    });
  }
  
  // Table - realistic wooden table, smaller and zoomed in
  const tableWidth = 6;
  const tableDepth = 4;
  const tableHeight = 0.25;
  
  // Enhanced table top with better wood texture
  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth),
    createWoodMaterial(0x8B4513, 0.5, 0.05) // Rich brown wood, smoother
  );
  tableTop.position.set(0, 0, 0);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  
  // Add table edge detail
  const tableEdge = new THREE.Mesh(
    new THREE.BoxGeometry(tableWidth + 0.05, 0.05, tableDepth + 0.05),
    createWoodMaterial(0x654321, 0.6, 0.1)
  );
  tableEdge.position.set(0, tableHeight/2 + 0.025, 0);
  scene.add(tableEdge);
  
  scene.add(tableTop);
  
  // Table legs - darker wood
  const legSize = 0.25;
  const legHeight = 1.5;
  const legPositions = [
    { x: -tableWidth/2 + 0.3, z: -tableDepth/2 + 0.3 },
    { x: tableWidth/2 - 0.3, z: -tableDepth/2 + 0.3 },
    { x: -tableWidth/2 + 0.3, z: tableDepth/2 - 0.3 },
    { x: tableWidth/2 - 0.3, z: tableDepth/2 - 0.3 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(legSize, legSize * 1.1, legHeight, 16),
      createWoodMaterial(0x654321, 0.7, 0.1) // Darker wood
    );
    leg.position.set(pos.x, -legHeight/2, pos.z);
    leg.castShadow = true;
    scene.add(leg);
  });
  
  // Game Board - LEFT SIDE with detailed realistic texture
  const boardSize = 2.8;
  const boardThickness = 0.12;
  const boardX = -tableWidth/2 + boardSize/2 + 0.3;
  const boardY = tableHeight/2 + boardThickness/2;
  
  // Board base - rich wood
  const boardBase = new THREE.Mesh(
    new THREE.BoxGeometry(boardSize, boardThickness, boardSize),
    createWoodMaterial(0xD2691E, 0.5, 0.05) // Lighter wood, smoother
  );
  boardBase.position.set(boardX, boardY, 0);
  boardBase.castShadow = true;
  boardBase.receiveShadow = true;
  scene.add(boardBase);
  
  // Enhanced board surface with better texture
  const boardSurfaceCanvas = document.createElement('canvas');
  boardSurfaceCanvas.width = 512;
  boardSurfaceCanvas.height = 512;
  const boardCtx = boardSurfaceCanvas.getContext('2d');
  
  // Cream base
  boardCtx.fillStyle = '#F5DEB3';
  boardCtx.fillRect(0, 0, 512, 512);
  
  // Add subtle wood grain
  boardCtx.strokeStyle = 'rgba(139, 69, 19, 0.1)';
  boardCtx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    boardCtx.beginPath();
    boardCtx.moveTo(Math.random() * 512, 0);
    boardCtx.lineTo(Math.random() * 512, 512);
    boardCtx.stroke();
  }
  
  const boardSurfaceTexture = new THREE.CanvasTexture(boardSurfaceCanvas);
  boardSurfaceTexture.wrapS = THREE.RepeatWrapping;
  boardSurfaceTexture.wrapT = THREE.RepeatWrapping;
  
  const boardSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(boardSize, boardSize),
    new THREE.MeshStandardMaterial({
      map: boardSurfaceTexture,
      roughness: 0.3,
      metalness: 0.0
    })
  );
  boardSurface.rotation.x = -Math.PI / 2;
  boardSurface.position.set(boardX, boardY + boardThickness/2 + 0.01, 0);
  boardSurface.receiveShadow = true;
  scene.add(boardSurface);
  
  // Enhanced grid lines - carved into board with depth
  const lineY = boardY + boardThickness/2 + 0.015;
  const gridLines = new THREE.Group();
  
  // Create thicker, more visible lines with depth effect
  const lineGeometry = new THREE.BoxGeometry(0.02, 0.01, boardSize);
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3728,
    roughness: 0.8,
    metalness: 0.0
  });
  
  // Vertical lines
  for (let i = 1; i < 3; i++) {
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.position.set(boardX - boardSize/2 + (boardSize/3) * i, lineY, 0);
    line.receiveShadow = true;
    gridLines.add(line);
  }
  
  // Horizontal lines
  const horizontalLineGeometry = new THREE.BoxGeometry(boardSize, 0.01, 0.02);
  for (let i = 1; i < 3; i++) {
    const line = new THREE.Mesh(horizontalLineGeometry, lineMaterial);
    line.position.set(boardX, lineY, -boardSize/2 + (boardSize/3) * i);
    line.receiveShadow = true;
    gridLines.add(line);
  }
  scene.add(gridLines);
  
  // Game state
  const board = Array(9).fill(null);
  let currentPlayer = 'X'; // X is NPC, O is player
  let gameOver = false;
  let winner = null;
  let isNPCTurn = false;
  
  // Cell positions for placing pieces
  const cellPositions = [];
  const cellSize = boardSize / 3;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      cellPositions.push({
        x: boardX - boardSize/2 + cellSize/2 + col * cellSize,
        y: boardY + boardThickness/2 + 0.08,
        z: -boardSize/2 + cellSize/2 + row * cellSize,
        index: row * 3 + col
      });
    }
  }
  
  // Pieces on board
  const placedPieces = [];
  
  // RIGHT SIDE - Two sets of arms and piles of Xs and Os
  const rightSideX = tableWidth/2 - 1.2;
  
  // Function to create a realistic 3D hand
  function createHand() {
    const handGroup = new THREE.Group();
    const skinMat = createSkinMaterial(0xFFDBB3);
    
    // Palm - rounded, more realistic shape
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.18, 4, 4, 4),
      skinMat
    );
    palm.position.set(0, 0, 0);
    palm.castShadow = true;
    handGroup.add(palm);
    
    // Hand base (wrist connection)
    const handBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.08, 12),
      skinMat
    );
    handBase.rotation.z = Math.PI / 2;
    handBase.position.set(0, 0, -0.09);
    handBase.castShadow = true;
    handGroup.add(handBase);
    
    // Fingers - each with 3 segments (proximal, middle, distal)
    const fingerData = [
      { name: 'pinky', x: -0.05, length: 0.12, segments: [0.04, 0.03, 0.025] },
      { name: 'ring', x: -0.025, length: 0.14, segments: [0.045, 0.035, 0.03] },
      { name: 'middle', x: 0, length: 0.16, segments: [0.05, 0.04, 0.035] },
      { name: 'index', x: 0.025, length: 0.14, segments: [0.045, 0.035, 0.03] }
    ];
    
    fingerData.forEach((finger, i) => {
      const fingerGroup = new THREE.Group();
      let currentZ = 0.09; // Start from palm edge
      
      // Proximal phalanx (base)
      const proximal = new THREE.Mesh(
        new THREE.CylinderGeometry(finger.segments[0] * 0.5, finger.segments[0] * 0.6, finger.segments[0], 12),
        skinMat
      );
      proximal.rotation.z = Math.PI / 2;
      proximal.position.set(finger.x, 0, currentZ);
      proximal.castShadow = true;
      fingerGroup.add(proximal);
      currentZ += finger.segments[0] / 2;
      
      // Middle phalanx
      const middle = new THREE.Mesh(
        new THREE.CylinderGeometry(finger.segments[1] * 0.5, finger.segments[1] * 0.55, finger.segments[1], 12),
        skinMat
      );
      middle.rotation.z = Math.PI / 2;
      middle.position.set(finger.x, 0, currentZ + finger.segments[1] / 2);
      middle.castShadow = true;
      fingerGroup.add(middle);
      currentZ += finger.segments[1];
      
      // Distal phalanx (tip) - slightly rounded
      const distal = new THREE.Mesh(
        new THREE.CylinderGeometry(finger.segments[2] * 0.5, finger.segments[2] * 0.4, finger.segments[2], 12),
        skinMat
      );
      distal.rotation.z = Math.PI / 2;
      distal.position.set(finger.x, 0, currentZ + finger.segments[2] / 2);
      distal.castShadow = true;
      fingerGroup.add(distal);
      
      // Finger tip - rounded nail area
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(finger.segments[2] * 0.4, 12, 12),
        skinMat
      );
      tip.position.set(finger.x, 0, currentZ + finger.segments[2]);
      tip.castShadow = true;
      fingerGroup.add(tip);
      
      fingerGroup.position.set(0, 0, 0);
      handGroup.add(fingerGroup);
    });
    
    // Thumb - positioned at an angle
    const thumbGroup = new THREE.Group();
    thumbGroup.rotation.y = -Math.PI / 3;
    thumbGroup.position.set(-0.04, 0.02, 0.06);
    
    // Thumb base (metacarpal)
    const thumbBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.045, 0.06, 12),
      skinMat
    );
    thumbBase.rotation.z = Math.PI / 2;
    thumbBase.rotation.x = Math.PI / 6;
    thumbBase.position.set(0, 0, 0);
    thumbBase.castShadow = true;
    thumbGroup.add(thumbBase);
    
    // Thumb proximal
    const thumbProximal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.04, 0.05, 12),
      skinMat
    );
    thumbProximal.rotation.z = Math.PI / 2;
    thumbProximal.position.set(0, 0, 0.05);
    thumbProximal.castShadow = true;
    thumbGroup.add(thumbProximal);
    
    // Thumb distal
    const thumbDistal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.03, 0.04, 12),
      skinMat
    );
    thumbDistal.rotation.z = Math.PI / 2;
    thumbDistal.position.set(0, 0, 0.09);
    thumbDistal.castShadow = true;
    thumbGroup.add(thumbDistal);
    
    // Thumb tip
    const thumbTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 12),
      skinMat
    );
    thumbTip.position.set(0, 0, 0.11);
    thumbTip.castShadow = true;
    thumbGroup.add(thumbTip);
    
    handGroup.add(thumbGroup);
    
    return handGroup;
  }
  
  // Player 1 arms (BOTTOM right) - realistic arms with proper joints
  const arm1Group = new THREE.Group();
  const skinMat = createSkinMaterial(0xFFDBB3);
  
  // Shoulder joint
  const shoulder1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 16),
    skinMat
  );
  shoulder1.position.set(-0.25, 0, 0);
  shoulder1.castShadow = true;
  arm1Group.add(shoulder1);
  
  // Upper arm - tapered
  const upperArm1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.13, 0.55, 16),
    skinMat
  );
  upperArm1.rotation.z = Math.PI / 2;
  upperArm1.position.set(-0.25, 0, 0.275);
  upperArm1.castShadow = true;
  arm1Group.add(upperArm1);
  
  // Elbow joint
  const elbow1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    skinMat
  );
  elbow1.position.set(-0.25, 0, 0.55);
  elbow1.castShadow = true;
  arm1Group.add(elbow1);
  
  // Forearm - tapered
  const forearm1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.11, 0.5, 16),
    skinMat
  );
  forearm1.rotation.z = Math.PI / 2;
  forearm1.position.set(-0.25, 0, 0.8);
  forearm1.castShadow = true;
  arm1Group.add(forearm1);
  
  // Wrist joint
  const wrist1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 12),
    skinMat
  );
  wrist1.position.set(-0.25, 0, 1.05);
  wrist1.castShadow = true;
  arm1Group.add(wrist1);
  
  // Realistic hand
  const hand1 = createHand();
  hand1.position.set(-0.25, 0, 1.12);
  hand1.rotation.y = -0.2;
  arm1Group.add(hand1);
  
  arm1Group.position.set(rightSideX, tableHeight/2 + 0.4, -tableDepth/2 + 0.8);
  arm1Group.rotation.y = -0.3;
  scene.add(arm1Group);
  
  // Player 2 arms (TOP right) - realistic arms with proper joints
  const arm2Group = new THREE.Group();
  
  // Shoulder joint
  const shoulder2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 16, 16),
    skinMat
  );
  shoulder2.position.set(-0.25, 0, 0);
  shoulder2.castShadow = true;
  arm2Group.add(shoulder2);
  
  // Upper arm - tapered
  const upperArm2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.13, 0.55, 16),
    skinMat
  );
  upperArm2.rotation.z = Math.PI / 2;
  upperArm2.position.set(-0.25, 0, 0.275);
  upperArm2.castShadow = true;
  arm2Group.add(upperArm2);
  
  // Elbow joint
  const elbow2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    skinMat
  );
  elbow2.position.set(-0.25, 0, 0.55);
  elbow2.castShadow = true;
  arm2Group.add(elbow2);
  
  // Forearm - tapered
  const forearm2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.11, 0.5, 16),
    skinMat
  );
  forearm2.rotation.z = Math.PI / 2;
  forearm2.position.set(-0.25, 0, 0.8);
  forearm2.castShadow = true;
  arm2Group.add(forearm2);
  
  // Wrist joint
  const wrist2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 12),
    skinMat
  );
  wrist2.position.set(-0.25, 0, 1.05);
  wrist2.castShadow = true;
  arm2Group.add(wrist2);
  
  // Realistic hand
  const hand2 = createHand();
  hand2.position.set(-0.25, 0, 1.12);
  hand2.rotation.y = -0.2;
  arm2Group.add(hand2);
  
  arm2Group.position.set(rightSideX, tableHeight/2 + 0.4, tableDepth/2 - 0.8);
  arm2Group.rotation.y = -0.3;
  scene.add(arm2Group);
  
  // Pile of X pieces (TOP right)
  const xPile = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const xPiece = createXPiece();
    xPiece.position.set(
      rightSideX + 0.3 + (Math.random() - 0.5) * 0.4,
      tableHeight/2 + 0.15 + i * 0.1,
      tableDepth/2 - 0.6 + (Math.random() - 0.5) * 0.2
    );
    xPiece.rotation.y = Math.random() * Math.PI;
    xPiece.rotation.x = (Math.random() - 0.5) * 0.3;
    xPile.add(xPiece);
  }
  scene.add(xPile);
  
  // Pile of O pieces (BOTTOM right)
  const oPile = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const oPiece = createOPiece();
    oPiece.position.set(
      rightSideX + 0.3 + (Math.random() - 0.5) * 0.4,
      tableHeight/2 + 0.15 + i * 0.1,
      -tableDepth/2 + 0.6 + (Math.random() - 0.5) * 0.2
    );
    oPiece.rotation.y = Math.random() * Math.PI;
    oPiece.rotation.x = (Math.random() - 0.5) * 0.3;
    oPile.add(oPiece);
  }
  scene.add(oPile);
  
  // Enhanced X piece - VERY bright, visible red
  function createXPiece() {
    const group = new THREE.Group();
    const size = 0.45;
    const thickness = 0.15;
    
    // Super bright red material - highly visible
    const redMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF0000, // Pure red
      roughness: 0.0,
      metalness: 0.0,
      emissive: 0xFF0000,
      emissiveIntensity: 0.8, // Strong glow
      envMapIntensity: 2.0
    });
    
    const bar1 = new THREE.Mesh(
      new THREE.BoxGeometry(size, thickness, thickness, 1, 1, 1),
      redMaterial
    );
    bar1.rotation.z = Math.PI / 4;
    bar1.castShadow = true;
    bar1.receiveShadow = true;
    group.add(bar1);
    
    const bar2 = new THREE.Mesh(
      new THREE.BoxGeometry(size, thickness, thickness, 1, 1, 1),
      redMaterial
    );
    bar2.rotation.z = -Math.PI / 4;
    bar2.castShadow = true;
    bar2.receiveShadow = true;
    group.add(bar2);
    
    return group;
  }
  
  // Enhanced O piece - VERY bright, visible blue
  function createOPiece() {
    const group = new THREE.Group();
    const radius = 0.25;
    const thickness = 0.15;
    
    // Super bright blue material - highly visible
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, thickness/2, 32, 64),
      new THREE.MeshStandardMaterial({
        color: 0x0000FF, // Pure blue
        roughness: 0.0,
        metalness: 0.0,
        emissive: 0x0000FF,
        emissiveIntensity: 0.8, // Strong glow
        envMapIntensity: 2.0
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = true;
    ring.receiveShadow = true;
    group.add(ring);
    
    return group;
  }
  
  // Function to check for winner
  function checkWinner() {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }
  
  // Function to check for draw
  function checkDraw() {
    return board.every(cell => cell !== null);
  }
  
  // AI function for NPC (X player)
  function getBestMove() {
    // Try to win
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        if (checkWinner() === 'X') {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }
    
    // Block player from winning
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        if (checkWinner() === 'O') {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }
    
    // Take center if available
    if (board[4] === null) return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available spot
    const available = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) available.push(i);
    }
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
    
    return -1;
  }
  
  // NPC makes a move
  function makeNPCMove() {
    if (gameOver || currentPlayer !== 'X' || isNPCTurn === false) return;
    
    const move = getBestMove();
    if (move >= 0) {
      setTimeout(() => {
        placePiece(move, 'X');
        isNPCTurn = false;
      }, 500); // Small delay to make it feel natural
    }
  }
  
  // Place piece on board
  function placePiece(index, player) {
    if (board[index] !== null || gameOver) return false;
    
    board[index] = player;
    const cellPos = cellPositions[index];
    
    let piece;
    if (player === 'X') {
      piece = createXPiece();
    } else {
      piece = createOPiece();
    }
    
    piece.position.set(cellPos.x, cellPos.y, cellPos.z);
    piece.scale.set(1.3, 1.3, 1.3);
    scene.add(piece);
    placedPieces.push(piece);
    
    // Check for winner
    winner = checkWinner();
    if (winner) {
      gameOver = true;
      if (winner === 'X') {
        updateUI('NPC (Red) wins!');
      } else {
        updateUI('You (Blue) win!');
      }
    } else if (checkDraw()) {
      gameOver = true;
      updateUI('Draw!');
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      if (currentPlayer === 'X') {
        updateUI('NPC (Red) thinking...');
        isNPCTurn = true;
        makeNPCMove();
      } else {
        updateUI('Your turn (Blue) - Click on board to place piece');
      }
    }
    
    return true;
  }
  
  // Enhanced UI with better styling
  const uiContainer = document.createElement('div');
  uiContainer.style.cssText = \`
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: #2c3e50;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 20px;
    font-weight: 600;
    z-index: 100;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,249,250,0.98) 100%);
    padding: 16px 30px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid rgba(255,255,255,0.8);
    backdrop-filter: blur(10px);
  \`;
  container.appendChild(uiContainer);
  
  const statusText = document.createElement('div');
  statusText.textContent = 'NPC (Red) goes first - Click on board when it is your turn';
  statusText.style.cssText = 'text-align: center; margin-bottom: 8px;';
  uiContainer.appendChild(statusText);
  
  function updateUI(message) {
    statusText.textContent = message;
  }
  
  // Reset button - always visible
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset Game';
  resetButton.style.cssText = \`
    width: 100%;
    margin-top: 8px;
    padding: 10px 20px;
    font-size: 15px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    display: block;
  \`;
  resetButton.onmouseenter = () => {
    resetButton.style.transform = 'translateY(-2px)';
    resetButton.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
  };
  resetButton.onmouseleave = () => {
    resetButton.style.transform = 'translateY(0)';
    resetButton.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
  };
  resetButton.onclick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Clear board state completely
    for (let i = 0; i < 9; i++) {
      board[i] = null;
    }
    currentPlayer = 'X';
    gameOver = false;
    winner = null;
    isNPCTurn = false;
    
    // Remove ALL placed pieces from scene - simple and direct
    const piecesToRemove = [...placedPieces]; // Copy array
    placedPieces.length = 0; // Clear array immediately
    
    piecesToRemove.forEach(piece => {
      if (piece) {
        // Remove from scene
        try {
          if (piece.parent) {
            piece.parent.remove(piece);
          }
          if (scene.children.includes(piece)) {
            scene.remove(piece);
          }
        } catch (err) {
          // Ignore errors, just continue
        }
        
        // Dispose resources
        try {
          if (piece.traverse) {
            piece.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      if (mat && mat.dispose) mat.dispose();
                    });
                  } else if (child.material.dispose) {
                    child.material.dispose();
                  }
                }
              }
            });
          }
        } catch (err) {
          // Ignore disposal errors
        }
      }
    });
    
    // Also remove any pieces on the board by checking scene
    const allChildren = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Group && obj !== playerGroup && obj !== arm1Group && obj !== arm2Group) {
        // Check if it's a game piece (X or O) by checking if it has red or blue materials
        let isGamePiece = false;
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const color = child.material?.color;
            if (color) {
              const hex = color.getHex();
              // Bright red or bright blue pieces
              if (hex === 0xFF0000 || hex === 0x0000FF || hex === 0xFF3333) {
                // Check if it's positioned on the board
                if (obj.position.y > 0.1 && obj.position.y < 0.5) {
                  isGamePiece = true;
                }
              }
            }
          }
        });
        if (isGamePiece) {
          allChildren.push(obj);
        }
      }
    });
    
    allChildren.forEach(piece => {
      try {
        if (piece.parent) piece.parent.remove(piece);
        if (scene.children.includes(piece)) scene.remove(piece);
      } catch (err) {
        // Ignore
      }
    });
    
    // Reset UI
    updateUI('NPC (Red) goes first - Click on board when it is your turn');
    
    // NPC goes first after a short delay
    setTimeout(() => {
      if (!gameOver) {
        isNPCTurn = true;
        makeNPCMove();
      }
    }, 500);
  };
  uiContainer.appendChild(resetButton);
  
  // Raycaster for mouse clicks
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  function onMouseClick(event) {
    if (gameOver || currentPlayer !== 'O' || isNPCTurn) return; // Only allow clicks on player's turn
    
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Check intersection with board surface
    const intersects = raycaster.intersectObject(boardSurface);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      
      // Find which cell was clicked
      let closestCell = null;
      let minDistance = Infinity;
      
      cellPositions.forEach(cellPos => {
        const distance = Math.sqrt(
          Math.pow(point.x - cellPos.x, 2) + Math.pow(point.z - cellPos.z, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCell = cellPos;
        }
      });
      
      if (closestCell && minDistance < cellSize / 2) {
        placePiece(closestCell.index, currentPlayer);
      }
    }
  }
  
  container.addEventListener('click', onMouseClick);
  
  // Start game - NPC goes first
  setTimeout(() => {
    isNPCTurn = true;
    makeNPCMove();
  }, 1000);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Subtle hand movement
    const time = Date.now() * 0.001;
    arm1Group.rotation.y = -0.3 + Math.sin(time) * 0.05;
    arm2Group.rotation.y = -0.3 + Math.cos(time) * 0.05;
    
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
    container.removeEventListener('click', onMouseClick);
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    if (container.contains(uiContainer)) {
      container.removeChild(uiContainer);
    }
    renderer.dispose();
  };
  }
  setupGame();
}
`;

export const TIC_TAC_TOE_PRELOADED_GAME: PublishedGame = {
  title: 'Tic Tac Toe',
  desc: 'Enhanced 3D Tic Tac Toe! Play against an AI opponent on a beautifully textured wooden board. You play as Blue (O), NPC plays as Red (X).',
  owner: 'System',
  ts: Date.now() + 1000, // Ensure it's always the latest
  gameCode: TIC_TAC_TOE_GAME_CODE,
  thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48YW5pbWF0ZSBpZD0iZmxhc2giIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswLjU7MSIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiM4QjQ1MTMiLz48bGluZSB4MT0iMTMzIiB5MT0iNTAiIHgyPSIxMzMiIHkyPSIzNTAiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGxpbmUgeDE9IjI2NyIgeTE9IjUwIiB4Mj0iMjY3IiB5Mj0iMzUwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNCIvPjxsaW5lIHgxPSI1MCIgeTE9IjEzMyIgeDI9IjM1MCIgeTI9IjEzMyIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjQiLz48bGluZSB4MT0iNTAiIHkxPSIyNjciIHgyPSIzNTAiIHkyPSIyNjciIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHRleHQgeD0iOTEiIHk9IjIxMCIgZm9udC1zaXplPSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmaWxsPSIjRkYwMDAwIiBmb250LXdlaWdodD0iYm9sZCIgb3BhY2l0eT0iZmxhc2giPlg8L3RleHQ+PHRleHQgeD0iMjE1IiB5PSIyMTAiIGZvbnQtc2l6ZT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZmlsbD0iIzAwMDBGRiIgZm9udC13ZWlnaHQ9ImJvbGQiPk88L3RleHQ+PHRleHQgeD0iMzA5IiB5PSIyMTAiIGZvbnQtc2l6ZT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZmlsbD0iI0ZGMDAwMCIgZm9udC13ZWlnaHQ9ImJvbGQiPlg8L3RleHQ+PHRleHQgeD0iMTU1IiB5PSIzNDAiIGZvbnQtc2l6ZT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZmlsbD0iIzAwMDBGRiIgZm9udC13ZWlnaHQ9ImJvbGQiPk88L3RleHQ+PHRleHQgeD0iMjc1IiB5PSIzNDAiIGZvbnQtc2l6ZT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZmlsbD0iI0ZGMDAwMCIgZm9udC13ZWlnaHQ9ImJvbGQiPlg8L3RleHQ+PC9zdmc+',
  playable: true,
  multiplayer: false
};

// Capture the Flag Game - 4 Team Layout
export const CAPTURE_THE_FLAG_GAME_CODE = `// 4 Team Capture the Flag - Enhanced Fullscreen Version
// THREE is provided by the game engine

function createGame(container) {
  // Check if online mode
  // Check for socket - also check __gameSocket which is set before gameSocket wrapper
  const isOnline = typeof window !== 'undefined' && (
    (window.gameSocket !== undefined && window.gameSocket !== null) ||
    (window.__gameSocket !== undefined && window.__gameSocket !== null)
  );
  const onlinePlayers = window.gamePlayers || [];
  let useNPCs = !isOnline; // No NPCs in online mode by default
  let waitingForPlayers = isOnline && onlinePlayers.length < 4;
  let gameStarted = !waitingForPlayers;
  
  // Scene setup - Enhanced graphics
  const scene = new THREE.Scene();
  const skyColor = new THREE.Color(0x87CEEB);
  scene.background = skyColor;
  scene.fog = new THREE.Fog(skyColor, 50, 400);
  
  // Enhanced camera with zoom support
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 0);
  
  // Enhanced renderer settings for better graphics
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  
  // Enhanced lighting for better graphics
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
  sunLight.position.set(30, 120, 30);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.left = -200;
  sunLight.shadow.camera.right = 200;
  sunLight.shadow.camera.top = 200;
  sunLight.shadow.camera.bottom = -200;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 600;
  sunLight.shadow.bias = -0.0001;
  sunLight.shadow.normalBias = 0.02;
  scene.add(sunLight);
  
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-30, 60, -30);
  scene.add(fillLight);
  
  const rimLight = new THREE.DirectionalLight(0x88ccff, 0.3);
  rimLight.position.set(0, 50, -50);
  scene.add(rimLight);
  
  // Field setup with better geometry
  const fieldSize = 200;
  const quadrantSize = fieldSize / 2;
  const quadrantMaterial = window.createRealisticMaterial('grass', { 
    color: 0xD2B48C,
    roughness: 0.9,
    metalness: 0.0
  });
  
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const quadrant = new THREE.Mesh(
        new THREE.PlaneGeometry(quadrantSize, quadrantSize, 32, 32),
        quadrantMaterial
      );
      quadrant.rotation.x = -Math.PI / 2;
      quadrant.position.set(
        -fieldSize/4 + i * quadrantSize,
        0.01,
        -fieldSize/4 + j * quadrantSize
      );
      quadrant.receiveShadow = true;
      scene.add(quadrant);
    }
  }
  
  // Enhanced division lines
  const lineBox1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.25, fieldSize),
    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 })
  );
  lineBox1.position.set(0, 0.125, 0);
  scene.add(lineBox1);
  
  const lineBox2 = new THREE.Mesh(
    new THREE.BoxGeometry(fieldSize, 0.25, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 })
  );
  lineBox2.position.set(0, 0.125, 0);
  scene.add(lineBox2);
  
  // Function to create avatar from user skin
  function createPlayerAvatar(THREE, skinData) {
    const avatarGroup = new THREE.Group();
    const hexToColor = (hex) => new THREE.Color(hex);
    
    const colors = skinData?.colors || {
      head: '#FFDBB3',
      torso: '#2196F3',
      arm: '#2196F3',
      legs: '#2196F3'
    };
    
    // Head
    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ 
      color: hexToColor(colors.head),
      roughness: 0.5,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.5, 0);
    head.castShadow = true;
    avatarGroup.add(head);
    
    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.9, 0.9, 0.5, 8, 8);
    const torsoMat = new THREE.MeshStandardMaterial({ 
      color: hexToColor(colors.torso),
      roughness: 0.4,
      metalness: 0.1
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.5, 0);
    torso.castShadow = true;
    avatarGroup.add(torso);
    
    // Arms
    const armGeo = new THREE.BoxGeometry(0.28, 0.7, 0.28, 4, 8);
    const armMat = new THREE.MeshStandardMaterial({ 
      color: hexToColor(colors.arm),
      roughness: 0.4,
      metalness: 0.1
    });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.59, 0.5, 0);
    leftArm.castShadow = true;
    avatarGroup.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.59, 0.5, 0);
    rightArm.castShadow = true;
    avatarGroup.add(rightArm);
    
    // Legs
    const legGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4, 4, 8);
    const legMat = new THREE.MeshStandardMaterial({ 
      color: hexToColor(colors.legs),
      roughness: 0.4,
      metalness: 0.1
    });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25, -0.3, 0);
    leftLeg.castShadow = true;
    avatarGroup.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.25, -0.3, 0);
    rightLeg.castShadow = true;
    avatarGroup.add(rightLeg);
    
    return avatarGroup;
  }
  
  // Get user skin data from window (passed from GamePlayer)
  const userSkinData = window.__userSkinData || null;
  
  // Player - create with user avatar if available
  const playerGroup = new THREE.Group();
  if (userSkinData) {
    const playerAvatar = createPlayerAvatar(THREE, userSkinData);
    playerGroup.add(playerAvatar);
  } else {
    // Default blue player
    const playerBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.5, 1.5, 16, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x2196F3,
        roughness: 0.4,
        metalness: 0.1
      })
    );
    playerBody.position.y = 1;
    playerBody.castShadow = true;
    playerGroup.add(playerBody);
    
    const playerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xFFDBB3,
        roughness: 0.5,
        metalness: 0.0
      })
    );
    playerHead.position.y = 2.2;
    playerHead.castShadow = true;
    playerGroup.add(playerHead);
  }
  
  playerGroup.position.set(-40, 0, 40);
  scene.add(playerGroup);
  
  // Function to create team base
  function createTeamBase(color, position, flagCorner) {
    const baseGroup = new THREE.Group();
    
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1, 12, 4, 1, 4),
      window.createRealisticMaterial('concrete', { 
        color: color,
        roughness: 0.7,
        metalness: 0.0
      })
    );
    base.position.y = 0.5;
    base.castShadow = true;
    base.receiveShadow = true;
    baseGroup.add(base);
    
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 6, 32),
      window.createRealisticMaterial('wood', { 
        color: 0x654321,
        roughness: 0.8,
        metalness: 0.0
      })
    );
    flagPole.position.set(flagCorner.x, 3, flagCorner.z);
    flagPole.castShadow = true;
    baseGroup.add(flagPole);
    
    const flagGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 0.5, 4, 1),
        new THREE.MeshStandardMaterial({ 
          color: i % 2 === 0 ? color : 0xFFFFFF,
          emissive: i % 2 === 0 ? color : 0x000000,
          emissiveIntensity: 0.3
        })
      );
      stripe.position.set(0, -0.75 + i * 0.5, 1.5);
      flagGroup.add(stripe);
    }
    flagGroup.position.set(flagCorner.x, 5.5, flagCorner.z);
    baseGroup.add(flagGroup);
    
    baseGroup.position.copy(position);
    scene.add(baseGroup);
    
    return { baseGroup, flagGroup, flagPole, flagPosition: new THREE.Vector3(position.x + flagCorner.x, 5.5, position.z + flagCorner.z) };
  }
  
  const blueTeam = createTeamBase(0x2196F3, new THREE.Vector3(-80, 0, 80), new THREE.Vector3(-5, 0, 5));
  const redTeam = createTeamBase(0xFF0000, new THREE.Vector3(80, 0, 80), new THREE.Vector3(5, 0, 5));
  const greenTeam = createTeamBase(0x4CAF50, new THREE.Vector3(80, 0, -80), new THREE.Vector3(5, 0, -5));
  const yellowTeam = createTeamBase(0xFFEB3B, new THREE.Vector3(-80, 0, -80), new THREE.Vector3(-5, 0, -5));
  
  // NPCs (only if not online or useNPCs is true)
  const allNPCs = [];
  const teamColors = [0x2196F3, 0xFF0000, 0x4CAF50, 0xFFEB3B];
  const teamPositions = [
    new THREE.Vector3(-80, 0, 80),
    new THREE.Vector3(80, 0, 80),
    new THREE.Vector3(80, 0, -80),
    new THREE.Vector3(-80, 0, -80)
  ];
  
  function createNPCs() {
    allNPCs.length = 0;
    for (let team = 0; team < 4; team++) {
      for (let i = 0; i < 5; i++) {
        const npcGroup = new THREE.Group();
        const npcBody = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.5, 1.5, 16, 32),
          new THREE.MeshStandardMaterial({ 
            color: teamColors[team],
            roughness: 0.4,
            metalness: 0.1
          })
        );
        npcBody.position.y = 1;
        npcBody.castShadow = true;
        npcGroup.add(npcBody);
        
        const npcHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 32, 32),
          new THREE.MeshStandardMaterial({ 
            color: 0xFFDBB3,
            roughness: 0.5,
            metalness: 0.0
          })
        );
        npcHead.position.y = 2.2;
        npcHead.castShadow = true;
        npcGroup.add(npcHead);
        
        const angle = (i / 5) * Math.PI * 2;
        const radius = 8 + Math.random() * 5;
        npcGroup.position.set(
          teamPositions[team].x + Math.cos(angle) * radius,
          0,
          teamPositions[team].z + Math.sin(angle) * radius
        );
        
        scene.add(npcGroup);
        allNPCs.push({
          group: npcGroup,
          team: team,
          basePos: teamPositions[team],
          angle: angle,
          radius: radius,
          speed: 0.01 + Math.random() * 0.01,
          velocity: new THREE.Vector3(0, 0, 0),
          chaseMode: false
        });
      }
    }
  }
  
  if (useNPCs) {
    createNPCs();
  }
  
  // Game state
  const flags = {
    red: { team: redTeam, carried: false, atBase: true },
    green: { team: greenTeam, carried: false, atBase: true },
    yellow: { team: yellowTeam, carried: false, atBase: true }
  };
  let score = 0;
  let health = 100;
  
  // Player physics
  let playerYVelocity = 0;
  let isGrounded = true;
  let jumpCooldown = 0;
  
  // Camera zoom state
  let cameraZoom = 1.0; // 1.0 = first person, higher = zoomed out
  let cameraMode = 'firstPerson';
  
  // Mouse look
  let isPointerLocked = false;
  let pitch = 0;
  let yaw = 0;
  
  const onMouseMove = (e) => {
    if (isPointerLocked && e.movementX !== undefined && e.movementY !== undefined) {
      const sensitivity = 0.005;
      yaw -= e.movementX * sensitivity;
      pitch -= e.movementY * sensitivity;
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    }
  };
  
  const onPointerLockChange = () => {
    isPointerLocked = document.pointerLockElement === container;
  };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  
  container.addEventListener('click', () => {
    if (!isPointerLocked) {
      container.requestPointerLock().catch(() => {});
    }
  });
  
  setTimeout(() => {
    container.requestPointerLock().catch(() => {});
  }, 1000);
  
  // Keyboard controls
  const keys = {};
  const handleKeyDown = (e) => {
    keys[e.code] = true;
    // Jump (Space)
    if (e.code === 'Space' && isGrounded && jumpCooldown <= 0) {
      playerYVelocity = 12;
      isGrounded = false;
      jumpCooldown = 0.3;
      e.preventDefault();
    }
    // Zoom in (I) - closer view, first person
    if (e.code === 'KeyI') {
      cameraZoom = Math.max(1.0, cameraZoom - 0.2);
      if (cameraZoom > 1.0) cameraMode = 'thirdPerson';
      else cameraMode = 'firstPerson';
      e.preventDefault();
    }
    // Zoom out (O) - farther view, third person to see avatar
    if (e.code === 'KeyO') {
      cameraZoom = Math.min(5.0, cameraZoom + 0.2);
      if (cameraZoom > 1.0) cameraMode = 'thirdPerson';
      else cameraMode = 'firstPerson';
      e.preventDefault();
    }
  };
  const handleKeyUp = (e) => {
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
    font-size: 16px;
    z-index: 100;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
    background: rgba(0,0,0,0.8);
    padding: 15px;
    border-radius: 10px;
    border: 2px solid rgba(255,255,255,0.3);
  \`;
  container.appendChild(uiContainer);
  
  const scoreText = document.createElement('div');
  scoreText.textContent = 'Score: 0';
  scoreText.style.fontSize = '18px';
  scoreText.style.fontWeight = 'bold';
  scoreText.style.color = '#4CAF50';
  uiContainer.appendChild(scoreText);
  
  const healthText = document.createElement('div');
  healthText.textContent = 'Health: 100';
  healthText.style.marginTop = '8px';
  healthText.style.color = '#FF5252';
  uiContainer.appendChild(healthText);
  
  const flagStatus = document.createElement('div');
  flagStatus.textContent = waitingForPlayers ? 'Waiting for players... (4 needed)' : 'Capture flags from Red, Green, and Yellow teams!';
  flagStatus.style.marginTop = '8px';
  flagStatus.style.color = '#FFD700';
  uiContainer.appendChild(flagStatus);
  
  const waitingText = document.createElement('div');
  if (waitingForPlayers) {
    waitingText.textContent = 'Players: ' + (onlinePlayers.length + 1) + '/4';
    waitingText.style.marginTop = '8px';
    waitingText.style.color = '#00A2FF';
    uiContainer.appendChild(waitingText);
    
    const switchButton = document.createElement('button');
    switchButton.textContent = 'Switch to NPC Game';
    switchButton.style.cssText = 'margin-top: 12px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;';
    switchButton.onclick = () => {
      useNPCs = true;
      waitingForPlayers = false;
      gameStarted = true;
      waitingText.remove();
      switchButton.remove();
      flagStatus.textContent = 'Capture flags from Red, Green, and Yellow teams!';
      createNPCs();
    };
    uiContainer.appendChild(switchButton);
  }
  
  const instructions = document.createElement('div');
  instructions.innerHTML = 'WASD: Move | Shift: Sprint | Space: Jump | I/O: Zoom | Click to lock mouse';
  instructions.style.marginTop = '12px';
  instructions.style.fontSize = '12px';
  instructions.style.color = '#aaa';
  uiContainer.appendChild(instructions);
  
  // Chat UI
  const chatContainer = document.createElement('div');
  chatContainer.style.cssText = \`
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 300px;
    max-height: 200px;
    background: rgba(0,0,0,0.7);
    border-radius: 10px;
    padding: 10px;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 100;
    overflow-y: auto;
    display: none;
  \`;
  container.appendChild(chatContainer);
  
  const chatMessages = [];
  const presetMessages = ['Hi!', 'Thanks!', 'I have the flag!'];
  let chatVisible = false;
  
  // Chat button
  const chatButton = document.createElement('button');
  chatButton.textContent = 'Chat (C)';
  chatButton.style.cssText = 'margin-top: 8px; padding: 6px 12px; background: #00A2FF; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;';
  chatButton.onclick = () => {
    chatVisible = !chatVisible;
    chatContainer.style.display = chatVisible ? 'block' : 'none';
    chatButtonsContainer.style.display = chatVisible ? 'flex' : 'none';
  };
  uiContainer.appendChild(chatButton);
  
  // Chat message buttons
  const chatButtonsContainer = document.createElement('div');
  chatButtonsContainer.style.cssText = 'margin-top: 8px; display: none; gap: 4px; flex-wrap: wrap;';
  presetMessages.forEach((msg) => {
    const btn = document.createElement('button');
    btn.textContent = msg;
    btn.style.cssText = 'padding: 4px 8px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; cursor: pointer; font-size: 11px;';
    btn.onclick = () => {
      const chatMsg = document.createElement('div');
      chatMsg.textContent = 'You: ' + msg;
      chatMsg.style.marginBottom = '4px';
      chatMessages.push(chatMsg);
      chatContainer.appendChild(chatMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      if (typeof window !== 'undefined' && window.gameSocket && typeof window.gameSocket.emit === 'function') {
        window.gameSocket.emit('chat-message', { message: msg });
      }
    };
    chatButtonsContainer.appendChild(btn);
  });
  uiContainer.appendChild(chatButtonsContainer);
  
  // Handle chat key (C)
  const handleChatKey = (e) => {
    if (e.code === 'KeyC' && !e.repeat) {
      chatVisible = !chatVisible;
      chatContainer.style.display = chatVisible ? 'block' : 'none';
      chatButtonsContainer.style.display = chatVisible ? 'flex' : 'none';
    }
  };
  document.addEventListener('keydown', handleChatKey);
  
  // Handle chat messages from other players
  if (typeof window !== 'undefined' && window.gameSocket && typeof window.gameSocket.on === 'function') {
    window.gameSocket.on('chat-message', (data) => {
      const chatMsg = document.createElement('div');
      chatMsg.textContent = (data.username || 'Player') + ': ' + data.message;
      chatMsg.style.marginBottom = '4px';
      chatMessages.push(chatMsg);
      chatContainer.appendChild(chatMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
    
    window.gameSocket.on('players-updated', (data) => {
      if (data.players && data.players.length >= 4 && waitingForPlayers) {
        waitingForPlayers = false;
        gameStarted = true;
        if (waitingText.parentNode) waitingText.remove();
        flagStatus.textContent = 'Capture flags from Red, Green, and Yellow teams!';
      }
    });
  }
  
  // Movement
  const baseMoveSpeed = 8.0;
  const sprintMultiplier = 1.8;
  const velocity = new THREE.Vector3();
  let lastTime = performance.now();
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    
    // Camera rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    
    // Movement
    velocity.set(0, 0, 0);
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    
    const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const currentMoveSpeed = baseMoveSpeed * (isSprinting ? sprintMultiplier : 1.0);
    
    if (keys['KeyW']) velocity.add(forward);
    if (keys['KeyS']) velocity.sub(forward);
    if (keys['KeyA']) velocity.sub(right);
    if (keys['KeyD']) velocity.add(right);
    
    if (velocity.length() > 0) {
      velocity.normalize();
      velocity.multiplyScalar(currentMoveSpeed * deltaTime);
      playerGroup.position.add(velocity);
    }
    
    // Jump physics
    playerYVelocity -= 30 * deltaTime; // Gravity
    playerGroup.position.y += playerYVelocity * deltaTime;
    
    if (playerGroup.position.y <= 0) {
      playerGroup.position.y = 0;
      playerYVelocity = 0;
      isGrounded = true;
    }
    
    if (jumpCooldown > 0) jumpCooldown -= deltaTime;
    
    // Keep player in bounds
    playerGroup.position.x = Math.max(-95, Math.min(95, playerGroup.position.x));
    playerGroup.position.z = Math.max(-95, Math.min(95, playerGroup.position.z));
    
    // Camera positioning with zoom
    if (cameraMode === 'firstPerson' || cameraZoom <= 1.0) {
      camera.position.copy(playerGroup.position);
      camera.position.y = 1.6;
    } else {
      // Third person view when zoomed out - see avatar
      const zoomDistance = 3 + (cameraZoom - 1) * 2;
      const cameraOffset = new THREE.Vector3(0, 1 + (cameraZoom - 1) * 0.5, zoomDistance);
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      camera.position.copy(playerGroup.position).add(cameraOffset);
      camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1, 0)));
    }
    
    // Update NPCs with improved AI - chase when player near their base
    if (useNPCs && gameStarted) {
      allNPCs.forEach((npc) => {
        const distToPlayer = playerGroup.position.distanceTo(npc.group.position);
        const distToBase = npc.group.position.distanceTo(npc.basePos);
        const playerNearBase = distToBase < 25; // Player within 25 units of NPC base
        
        // Enhanced AI: Chase if player near their base
        if (playerNearBase && npc.team !== 0 && distToPlayer < 30) {
          npc.chaseMode = true;
          const direction = new THREE.Vector3().subVectors(playerGroup.position, npc.group.position).normalize();
          npc.velocity.copy(direction.multiplyScalar(0.15));
          npc.group.position.add(npc.velocity);
          npc.group.lookAt(playerGroup.position);
        } else {
          npc.chaseMode = false;
          // Patrol mode
          npc.angle += npc.speed;
          npc.group.position.x = npc.basePos.x + Math.cos(npc.angle) * npc.radius;
          npc.group.position.z = npc.basePos.z + Math.sin(npc.angle) * npc.radius;
        }
        
        // Keep NPCs on ground
        npc.group.position.y = 0;
        
        // NPCs look at player if close
        if (distToPlayer < 15) {
          npc.group.lookAt(playerGroup.position);
        }
        
        // Damage from enemy NPCs
        if (npc.team !== 0 && distToPlayer < 4 && health > 0) {
          health = Math.max(0, health - 0.3);
          healthText.textContent = 'Health: ' + Math.floor(health);
          healthText.style.color = health < 30 ? '#FF0000' : '#FF5252';
        }
      });
    }
    
    // Flag collisions
    if (gameStarted) {
      Object.keys(flags).forEach(flagKey => {
        const flag = flags[flagKey];
        if (!flag.carried && flag.atBase) {
          const flagBasePos = flag.team.baseGroup.position;
          const distance = playerGroup.position.distanceTo(new THREE.Vector3(flagBasePos.x, 1, flagBasePos.z));
          if (distance < 6) {
            flag.carried = true;
            flag.atBase = false;
            flag.team.flagGroup.position.copy(playerGroup.position);
            flag.team.flagGroup.position.y = 2.5;
            flagStatus.textContent = flagKey.toUpperCase() + ' Flag: CARRIED! Return to blue base!';
            flagStatus.style.color = '#FF6B00';
          }
        }
      });
      
      // Return flag to blue base
      const blueBasePos = blueTeam.baseGroup.position;
      const distanceToBlueBase = playerGroup.position.distanceTo(new THREE.Vector3(blueBasePos.x, 1, blueBasePos.z));
      if (distanceToBlueBase < 6) {
        Object.keys(flags).forEach(flagKey => {
          const flag = flags[flagKey];
          if (flag.carried) {
            flag.carried = false;
            flag.atBase = true;
            score++;
            scoreText.textContent = 'Score: ' + score;
            const flagBasePos = flag.team.baseGroup.position;
            flag.team.flagGroup.position.set(flagBasePos.x + (flagKey === 'red' ? 5 : flagKey === 'green' ? 5 : -5), 5.5, flagBasePos.z + (flagKey === 'red' ? 5 : flagKey === 'green' ? -5 : -5));
            flag.team.flagGroup.rotation.y = 0;
            flagStatus.textContent = flagKey.toUpperCase() + ' FLAG CAPTURED! +1 Point';
            flagStatus.style.color = '#00FF00';
            setTimeout(() => {
              const allCaptured = Object.values(flags).every(f => !f.carried);
              flagStatus.textContent = allCaptured ? 'Capture flags from Red, Green, and Yellow teams!' : 'Capture more flags!';
              flagStatus.style.color = '#FFD700';
            }, 2000);
          }
        });
      }
    }
    
    // Update flag positions
    Object.keys(flags).forEach(flagKey => {
      const flag = flags[flagKey];
      if (flag.carried) {
        flag.team.flagGroup.position.x = playerGroup.position.x;
        flag.team.flagGroup.position.z = playerGroup.position.z;
        flag.team.flagGroup.rotation.y += 0.1;
      } else if (flag.atBase) {
        flag.team.flagGroup.rotation.y += 0.02;
      }
    });
    
    blueTeam.flagGroup.rotation.y += 0.02;
    
    // Game over
    if (health <= 0) {
      flagStatus.textContent = 'GAME OVER! Press R to restart';
      flagStatus.style.color = '#FF0000';
      if (keys['KeyR']) {
        health = 100;
        score = 0;
        Object.keys(flags).forEach(flagKey => {
          flags[flagKey].carried = false;
          flags[flagKey].atBase = true;
          const flagBasePos = flags[flagKey].team.baseGroup.position;
          flags[flagKey].team.flagGroup.position.set(flagBasePos.x + (flagKey === 'red' ? 5 : flagKey === 'green' ? 5 : -5), 5.5, flagBasePos.z + (flagKey === 'red' ? 5 : flagKey === 'green' ? -5 : -5));
        });
        playerGroup.position.set(-40, 0, 40);
        playerYVelocity = 0;
        isGrounded = true;
        healthText.textContent = 'Health: 100';
        healthText.style.color = '#FF5252';
        scoreText.textContent = 'Score: 0';
        flagStatus.textContent = 'Capture flags from Red, Green, and Yellow teams!';
        flagStatus.style.color = '#FFD700';
      }
    }
    
    renderer.render(scene, camera);
  }
  
  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  
  window.addEventListener('resize', onWindowResize);
  animate();
  }
  
  return function cleanup() {
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('keydown', handleChatKey);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('pointerlockchange', onPointerLockChange);
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    if (container.contains(uiContainer)) {
      container.removeChild(uiContainer);
    }
    if (container.contains(chatContainer)) {
      container.removeChild(chatContainer);
    }
    renderer.dispose();
  };
`;

export const CAPTURE_THE_FLAG_PRELOADED_GAME: PublishedGame = {
  title: 'Capture the Flag',
  desc: '4 Team Capture the Flag! You are Blue team (top-left). Capture flags from Red, Green, and Yellow teams and bring them to your base. Mouse look + WASD movement!',
  owner: 'System',
  ts: Date.now() + 2000,
  gameCode: CAPTURE_THE_FLAG_GAME_CODE,
  thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzJkNTAxNiIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNEMkI0OEMiLz48bGluZSB4MT0iMjAwIiB5MT0iNTAiIHgyPSIyMDAiIHkyPSIzNTAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+PGxpbmUgeDE9IjUwIiB5MT0iMjAwIiB4Mj0iMzUwIiB5Mj0iMjAwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOCIgZmlsbD0iIzIxOTZGMiIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjEwMCIgcj0iOCIgZmlsbD0iI0ZGMDAwMCIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjMwMCIgcj0iOCIgZmlsbD0iIzRDQUY1MCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjMwMCIgcj0iOCIgZmlsbD0iI0ZGRUIzQiIvPjwvc3ZnPg==',
  playable: true,
  multiplayer: false
};

// Hide and Seek Game - Online Multiplayer Only
export const HIDE_AND_SEEK_GAME_CODE = `// Hide and Seek - Online Multiplayer
// THREE is provided by the game engine

function createGame(container) {
  
  // Check if socket is already available - if not, show Play Online button
  const initialSocketCheck = typeof window !== 'undefined' && (
    (window.gameSocket !== undefined && window.gameSocket !== null) ||
    (window.__gameSocket !== undefined && window.__gameSocket !== null) ||
    (window.__gameSocket && window.__gameSocket.connected === true)
  );
  
  if (!initialSocketCheck) {
    container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>This game requires online multiplayer. Click "Play Online" to start.</p><button id="hide-seek-play-online-initial" style="margin-top: 15px; padding: 10px 20px; background: #4A9EFF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">Play Online</button></div>';
    
    const playBtnInitial = container.querySelector('#hide-seek-play-online-initial');
    if (playBtnInitial) {
      playBtnInitial.addEventListener('click', () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('hide-seek-request-online'));
        }
        container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>Connecting to server...</p></div>';
      });
    }
  }
  

  function attachTimeoutButtons(container, checkSocket, checkCount, maxChecks) {
    const playBtnTimeout = container.querySelector('#hide-seek-play-online-timeout, #hide-seek-play-online-timeout-retry');
    if (playBtnTimeout) {
      playBtnTimeout.replaceWith(playBtnTimeout.cloneNode(true));
      const newPlayBtn = container.querySelector('#hide-seek-play-online-timeout, #hide-seek-play-online-timeout-retry');
      newPlayBtn.addEventListener('click', () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('hide-seek-request-online'));
        }
        checkCount = 0;
        container.innerHTML = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><div style="margin-bottom: 30px;"><div style="width: 80px; height: 80px; margin: 0 auto; position: relative;"><div style="width: 80px; height: 80px; border: 8px solid #f0f0f0; border-top: 8px solid #4A9EFF; border-radius: 50%; animation: spin 1s linear infinite;"></div></div><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style></div><h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Connecting to Server</h2><p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.5;">Establishing connection and entering game...</p></div></div>';
      });
    }
    
    const startServerBtn = container.querySelector('#hide-seek-start-server, #hide-seek-start-server-retry');
    if (startServerBtn) {
      startServerBtn.replaceWith(startServerBtn.cloneNode(true));
      const newStartBtn = container.querySelector('#hide-seek-start-server, #hide-seek-start-server-retry');
      newStartBtn.addEventListener('click', async () => {
        // Show loading screen immediately
        container.innerHTML = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><div style="margin-bottom: 30px;"><div style="width: 80px; height: 80px; margin: 0 auto; position: relative;"><div style="width: 80px; height: 80px; border: 8px solid #f0f0f0; border-top: 8px solid #10B981; border-radius: 50%; animation: spin 1s linear infinite;"></div></div><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style></div><h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Starting Socket Server</h2><p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.5;">Initializing server and establishing connection...</p></div></div>';
        try {
          const response = await fetch('/api/socket-server/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          if (data.success) {
            newStartBtn.textContent = 'Server Started!';
            newStartBtn.style.background = '#10B981';
            checkCount = 0;
            container.innerHTML = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><div style="margin-bottom: 30px;"><div style="width: 80px; height: 80px; margin: 0 auto; position: relative;"><div style="width: 80px; height: 80px; border: 8px solid #f0f0f0; border-top: 8px solid #10B981; border-radius: 50%; animation: spin 1s linear infinite;"></div></div><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style></div><h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Server Started</h2><p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.5;">Socket server is running. Connecting to game...</p></div></div>';
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
                const timeoutHtml = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Hide and Seek</h2><p style="color: #4a5568; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">This game requires an online multiplayer connection. Please ensure the socket server is running.</p><div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;"><button id="hide-seek-play-online-timeout-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #4A9EFF 0%, #357ABD 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);" ">🎮 Play Online</button><button id="hide-seek-start-server-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" ">🚀 Start Socket Server</button><button id="hide-seek-keep-trying-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);" ">🔄 Keep Trying</button></div><p style="font-size: 14px; color: #e53e3e; margin: 0; padding: 12px; background: #fed7d7; border-radius: 8px;">⚠️ Connection timeout. Please ensure the socket server is running.</p></div></div>';
                container.innerHTML = timeoutHtml;
                attachTimeoutButtons(container, newInterval, checkCount, maxChecks);
              }
            }, 100);
          } else {
            // Show error screen
            const errorHtml = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Hide and Seek</h2><p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">Failed to start socket server.</p><p style="font-size: 14px; color: #e53e3e; margin: 0 0 30px 0; padding: 12px; background: #fed7d7; border-radius: 8px;">' + (data.error || 'Unknown error') + '</p><div style="display: flex; flex-direction: column; gap: 12px;"><button id="hide-seek-start-server-retry-error" style="padding: 14px 24px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" ">🔄 Try Again</button><button id="hide-seek-back-to-error" style="padding: 14px 24px; background: linear-gradient(135deg, #718096 0%, #4a5568 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(113, 128, 150, 0.3);" ">← Back</button></div></div></div>';
            container.innerHTML = errorHtml;
            // Re-attach button handlers
            const retryBtn = container.querySelector('#hide-seek-start-server-retry-error');
            if (retryBtn) {
              retryBtn.addEventListener('click', () => {
                attachTimeoutButtons(container, checkSocket, checkCount, maxChecks);
                const startBtn = container.querySelector('#hide-seek-start-server, #hide-seek-start-server-retry');
                if (startBtn) startBtn.click();
              });
            }
            const backBtn = container.querySelector('#hide-seek-back-to-error');
            if (backBtn) {
              backBtn.addEventListener('click', () => {
                const timeoutHtml = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Hide and Seek</h2><p style="color: #4a5568; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">This game requires an online multiplayer connection. Please ensure the socket server is running.</p><div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;"><button id="hide-seek-play-online-timeout-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #4A9EFF 0%, #357ABD 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);" ">🎮 Play Online</button><button id="hide-seek-start-server-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" ">🚀 Start Socket Server</button><button id="hide-seek-keep-trying-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);" ">🔄 Keep Trying</button></div><p style="font-size: 14px; color: #e53e3e; margin: 0; padding: 12px; background: #fed7d7; border-radius: 8px;">⚠️ Connection timeout. Please ensure the socket server is running.</p></div></div>';
                container.innerHTML = timeoutHtml;
                attachTimeoutButtons(container, checkSocket, checkCount, maxChecks);
              });
            }
          }
        } catch (error) {
          // Show error screen
          const errorHtml = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Hide and Seek</h2><p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">Failed to start socket server.</p><p style="font-size: 14px; color: #e53e3e; margin: 0 0 30px 0; padding: 12px; background: #fed7d7; border-radius: 8px;">' + error.message + '</p><div style="display: flex; flex-direction: column; gap: 12px;"><button id="hide-seek-start-server-retry-error-catch" style="padding: 14px 24px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" ">🔄 Try Again</button><button id="hide-seek-back-to-error-catch" style="padding: 14px 24px; background: linear-gradient(135deg, #718096 0%, #4a5568 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(113, 128, 150, 0.3);" ">← Back</button></div></div></div>';
          container.innerHTML = errorHtml;
          // Re-attach button handlers
          const retryBtn = container.querySelector('#hide-seek-start-server-retry-error-catch');
          if (retryBtn) {
            retryBtn.addEventListener('click', () => {
              attachTimeoutButtons(container, checkSocket, checkCount, maxChecks);
              const startBtn = container.querySelector('#hide-seek-start-server, #hide-seek-start-server-retry');
              if (startBtn) startBtn.click();
            });
          }
          const backBtn = container.querySelector('#hide-seek-back-to-error-catch');
          if (backBtn) {
            backBtn.addEventListener('click', () => {
              const timeoutHtml = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Hide and Seek</h2><p style="color: #4a5568; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">This game requires an online multiplayer connection. Please ensure the socket server is running.</p><div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;"><button id="hide-seek-play-online-timeout-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #4A9EFF 0%, #357ABD 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);" ">🎮 Play Online</button><button id="hide-seek-start-server-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" ">🚀 Start Socket Server</button><button id="hide-seek-keep-trying-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);" ">🔄 Keep Trying</button></div><p style="font-size: 14px; color: #e53e3e; margin: 0; padding: 12px; background: #fed7d7; border-radius: 8px;">⚠️ Connection timeout. Please ensure the socket server is running.</p></div></div>';
              container.innerHTML = timeoutHtml;
              attachTimeoutButtons(container, checkSocket, checkCount, maxChecks);
            });
          }
        }
      });
    }
    
    const keepTryingBtn = container.querySelector('#hide-seek-keep-trying, #hide-seek-keep-trying-retry');
    if (keepTryingBtn) {
      keepTryingBtn.replaceWith(keepTryingBtn.cloneNode(true));
      const newKeepBtn = container.querySelector('#hide-seek-keep-trying, #hide-seek-keep-trying-retry');
      newKeepBtn.addEventListener('click', () => {
        checkCount = 0;
        if (checkSocket) clearInterval(checkSocket);
        container.innerHTML = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><div style="margin-bottom: 30px;"><div style="width: 80px; height: 80px; margin: 0 auto; position: relative;"><div style="width: 80px; height: 80px; border: 8px solid #f0f0f0; border-top: 8px solid #4A9EFF; border-radius: 50%; animation: spin 1s linear infinite;"></div></div><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style></div><h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Connecting to Server</h2><p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.5;">Retrying connection and initializing socket server...</p></div></div>';
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
            container.innerHTML = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Hide and Seek</h2><p style="color: #4a5568; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">This game requires an online multiplayer connection. Please ensure the socket server is running.</p><div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;"><button id="hide-seek-play-online-timeout-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #4A9EFF 0%, #357ABD 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);" ">🎮 Play Online</button><button id="hide-seek-start-server-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" ">🚀 Start Socket Server</button><button id="hide-seek-keep-trying-retry" style="padding: 14px 24px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);" ">🔄 Keep Trying</button></div><p style="font-size: 14px; color: #e53e3e; margin: 0; padding: 12px; background: #fed7d7; border-radius: 8px;">⚠️ Connection timeout. Please ensure the socket server is running.</p></div></div>';
            attachTimeoutButtons(container, newInterval, checkCount, maxChecks);
          }
        }, 100);
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
      container.innerHTML = '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;"><div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center;"><h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Hide and Seek</h2><p style="color: #4a5568; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">This game requires an online multiplayer connection. Please ensure the socket server is running.</p><div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;"><button id="hide-seek-play-online-timeout" style="padding: 14px 24px; background: linear-gradient(135deg, #4A9EFF 0%, #357ABD 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);" ">🎮 Play Online</button><button id="hide-seek-start-server" style="padding: 14px 24px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" ">🚀 Start Socket Server</button><button id="hide-seek-keep-trying" style="padding: 14px 24px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);" ">🔄 Keep Trying</button></div><p style="font-size: 14px; color: #e53e3e; margin: 0; padding: 12px; background: #fed7d7; border-radius: 8px;">⚠️ Connection timeout. Please ensure the socket server is running.</p></div></div>';
      attachTimeoutButtons(container, checkSocket, checkCount, maxChecks);
    } else if (checkCount % 10 === 0) {
      // Show progress every second
      container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>Waiting for connection... (' + Math.ceil((maxChecks - checkCount) / 10) + 's)</p></div>';
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

