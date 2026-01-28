'use client';

import { useEffect, useRef, useState } from 'react';
import { Accessory } from '@/types';

interface Accessory3DViewerProps {
  accessory: Accessory;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export default function Accessory3DViewer({
  accessory,
  width = 80,
  height = 80,
  interactive = true
}: Accessory3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const accessoryGroupRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  // Convert hex color to Three.js color
  const hexToColor = (hex: string) => {
    if (!hex || typeof hex !== 'string') {
      return { r: 0.5, g: 0.5, b: 0.5 };
    }
    try {
      const num = parseInt(hex.replace('#', ''), 16);
      if (isNaN(num)) {
        return { r: 0.5, g: 0.5, b: 0.5 };
      }
      return {
        r: ((num >> 16) & 255) / 255,
        g: ((num >> 8) & 255) / 255,
        b: (num & 255) / 255
      };
    } catch (e) {
      return { r: 0.5, g: 0.5, b: 0.5 };
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    let THREE: any;
    let accessoryGroup: any;
    let isMounted = true;

    // Dynamic import for Three.js and GLTFLoader
    Promise.all([
      import('three'),
      accessory.modelUrl ? import('three/examples/jsm/loaders/GLTFLoader.js') : Promise.resolve(null)
    ]).then(([threeModule, gltfLoaderModule]) => {
      if (!isMounted || !canvasRef.current) return;

      try {
        THREE = threeModule;
        const GLTFLoader = gltfLoaderModule?.GLTFLoader;

        const canvas = canvasRef.current!;
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true
        });
        rendererRef.current = renderer;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
          renderer.outputEncoding = THREE.sRGBEncoding;
        }

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera setup - centered on accessory
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 0, 3);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);

        // Create accessory group
        accessoryGroup = new THREE.Group();
        scene.add(accessoryGroup);
        accessoryGroupRef.current = accessoryGroup;

        // Load GLTF model if modelUrl is provided
        if (accessory.modelUrl && GLTFLoader) {
          const loader = new GLTFLoader();
          loader.load(
            accessory.modelUrl,
            (gltf) => {
              if (!isMounted || !accessoryGroup) return;
              
              const model = gltf.scene;
              
              // Scale model appropriately
              const scale = accessory.scale || 1.0;
              model.scale.set(scale, scale, scale);
              
              // Center the model
              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              model.position.sub(center);
              
              accessoryGroup.add(model);
            },
            (progress) => {
              // Loading progress (optional)
            },
            (error) => {
              console.error('Error loading GLTF model:', error);
              // Fallback to default rendering
              createDefaultAccessory();
            }
          );
          return; // Exit early, model will be added when loaded
        }

        // Create pixelated texture
        const createPixelatedTexture = (color: {r: number, g: number, b: number}, pixelSize: number = 8) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const size = 512;
          canvas.width = size;
          canvas.height = size;
          
          const pixelsPerRow = Math.floor(size / pixelSize);
          
          for (let y = 0; y < pixelsPerRow; y++) {
            for (let x = 0; x < pixelsPerRow; x++) {
              const variation = (Math.random() - 0.5) * 0.15;
              const pixelColor = {
                r: Math.max(0, Math.min(255, Math.floor((color.r + variation) * 255))),
                g: Math.max(0, Math.min(255, Math.floor((color.g + variation) * 255))),
                b: Math.max(0, Math.min(255, Math.floor((color.b + variation) * 255)))
              };
              
              ctx.fillStyle = `rgb(${pixelColor.r}, ${pixelColor.g}, ${pixelColor.b})`;
              ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
          }
          
          const texture = new THREE.CanvasTexture(canvas);
          if ('colorSpace' in texture && THREE.SRGBColorSpace) {
            (texture as any).colorSpace = THREE.SRGBColorSpace;
          } else if ('encoding' in texture && THREE.sRGBEncoding) {
            (texture as any).encoding = THREE.sRGBEncoding;
          }
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          return texture;
        };

        // Helper function to create rounded boxes
        const createRoundedBox = (width: number, height: number, depth: number, radius: number = 0.1) => {
          const geometry = new THREE.BoxGeometry(width, height, depth);
          geometry.computeVertexNormals();
          return geometry;
        };

        const accessoryColor = hexToColor(accessory.color || '#FFFFFF');
        const accessoryMat = new THREE.MeshStandardMaterial({
          map: createPixelatedTexture(accessoryColor, 8),
          color: new THREE.Color(accessoryColor.r, accessoryColor.g, accessoryColor.b),
          roughness: 0.5,
          metalness: 0.1
        });

        // Render accessory based on type - match Avatar3DViewer exactly
        switch (accessory.type) {
          case 'chain':
            // Necklace chain
            const chainGroup = new THREE.Group();
            const chainColor = hexToColor(accessory.color || '#FFD700');
            const chainMat = new THREE.MeshStandardMaterial({
              map: createPixelatedTexture(chainColor, 8),
              color: new THREE.Color(chainColor.r, chainColor.g, chainColor.b),
              roughness: 0.2,
              metalness: 0.9
            });

            const numLinks = 16;
            for (let i = 0; i < numLinks; i++) {
              const angle = (i / numLinks) * Math.PI * 2;
              const linkGeometry = new THREE.TorusGeometry(0.06, 0.025, 8, 16);
              const link = new THREE.Mesh(linkGeometry, chainMat);
              const radius = 0.45;
              link.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius * 0.6
              );
              link.rotation.x = Math.PI / 2;
              link.rotation.z = angle;
              chainGroup.add(link);
            }
            const pendantGeometry = createRoundedBox(0.12, 0.18, 0.04, 0.02);
            const pendant = new THREE.Mesh(pendantGeometry, chainMat);
            pendant.position.set(0, -0.3, 0.4);
            chainGroup.add(pendant);
            accessoryGroup.add(chainGroup);
            break;

          case 'hat':
            const isWizardHat = accessory.name?.toLowerCase().includes('wizard') || accessory.id?.includes('wizard');
            if (isWizardHat) {
              // Wizard Hat - exact match to Avatar3DViewer
              const hatGroup = new THREE.Group();
              const hatColor = hexToColor(accessory.color || '#4B0082');
              const hatMainMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(hatColor),
                color: new THREE.Color(hatColor.r, hatColor.g, hatColor.b),
                roughness: 0.6,
                metalness: 0.1
              });

              const hatBrim = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 16);
              const hatBrimMesh = new THREE.Mesh(hatBrim, hatMainMat);
              hatBrimMesh.position.set(0, 0, 0);
              hatGroup.add(hatBrimMesh);

              const hatCone = new THREE.ConeGeometry(0.5, 1.2, 8);
              const hatConeMesh = new THREE.Mesh(hatCone, hatMainMat);
              hatConeMesh.position.set(0, 0.6, 0);
              hatGroup.add(hatConeMesh);

              const bentTip = new THREE.ConeGeometry(0.15, 0.3, 8);
              const bentTipMesh = new THREE.Mesh(bentTip, hatMainMat);
              bentTipMesh.rotation.z = -0.4;
              bentTipMesh.position.set(0.1, 1.3, 0);
              hatGroup.add(bentTipMesh);

              const starMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(1, 1, 0),
                emissive: new THREE.Color(0.5, 0.5, 0),
                roughness: 0.3,
                metalness: 0.5
              });
              const star = new THREE.OctahedronGeometry(0.08, 0);
              const starMesh = new THREE.Mesh(star, starMat);
              starMesh.position.set(0.15, 1.45, 0);
              starMesh.rotation.x = Math.PI / 4;
              hatGroup.add(starMesh);
              accessoryGroup.add(hatGroup);
            } else {
              // Regular Roblox-style cap - exact match
              const hatGroup = new THREE.Group();
              const hatColor = hexToColor(accessory.color || '#FF0000');
              const hatMainMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(hatColor, 8),
                color: new THREE.Color(hatColor.r, hatColor.g, hatColor.b),
                roughness: 0.6,
                metalness: 0.1
              });

              const hatBrim = new THREE.CylinderGeometry(0.75, 0.75, 0.12, 16);
              const hatBrimMesh = new THREE.Mesh(hatBrim, hatMainMat);
              hatBrimMesh.position.set(0, 0, 0);
              hatGroup.add(hatBrimMesh);

              const hatTop = new THREE.CylinderGeometry(0.5, 0.65, 0.35, 16);
              const hatTopMesh = new THREE.Mesh(hatTop, hatMainMat);
              hatTopMesh.position.set(0, 0.2, 0);
              hatGroup.add(hatTopMesh);

              const visorColor = hexToColor(accessory.color || '#000000');
              const visorMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture({ r: visorColor.r * 0.5, g: visorColor.g * 0.5, b: visorColor.b * 0.5 }, 8),
                color: new THREE.Color(visorColor.r * 0.5, visorColor.g * 0.5, visorColor.b * 0.5),
                roughness: 0.4,
                metalness: 0.2
              });
              const visorGeometry = createRoundedBox(0.8, 0.1, 0.3, 0.03);
              const visor = new THREE.Mesh(visorGeometry, visorMat);
              visor.rotation.x = -0.2;
              visor.position.set(0, -0.05, 0.25);
              hatGroup.add(visor);
              accessoryGroup.add(hatGroup);
            }
            break;

          case 'glasses':
            // Better sunglasses design - exact match to Avatar3DViewer
            const glassesGroup = new THREE.Group();
            const frameColor = hexToColor(accessory.color || '#000000');
            const frameMaterial = new THREE.MeshStandardMaterial({
              map: createPixelatedTexture(frameColor, 8),
              color: new THREE.Color(frameColor.r, frameColor.g, frameColor.b),
              roughness: 0.3,
              metalness: 0.7
            });

            const bridgeGeometry = createRoundedBox(0.15, 0.08, 0.06, 0.01);
            const bridge = new THREE.Mesh(bridgeGeometry, frameMaterial);
            bridge.position.set(0, 0, 0.62);
            glassesGroup.add(bridge);

            const leftFrameGeometry = createRoundedBox(0.5, 0.35, 0.06, 0.02);
            const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
            leftFrame.position.set(-0.35, 0, 0.62);
            glassesGroup.add(leftFrame);

            const rightFrameGeometry = createRoundedBox(0.5, 0.35, 0.06, 0.02);
            const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
            rightFrame.position.set(0.35, 0, 0.62);
            glassesGroup.add(rightFrame);

            const leftTemple = createRoundedBox(0.4, 0.06, 0.06, 0.01);
            const leftTempleMesh = new THREE.Mesh(leftTemple, frameMaterial);
            leftTempleMesh.rotation.y = -0.3;
            leftTempleMesh.position.set(-0.65, 0, 0.5);
            glassesGroup.add(leftTempleMesh);

            const rightTemple = createRoundedBox(0.4, 0.06, 0.06, 0.01);
            const rightTempleMesh = new THREE.Mesh(rightTemple, frameMaterial);
            rightTempleMesh.rotation.y = 0.3;
            rightTempleMesh.position.set(0.65, 0, 0.5);
            glassesGroup.add(rightTempleMesh);

            const lensColor = hexToColor(accessory.color || '#1a1a2e');
            const lensMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color(lensColor.r * 0.3, lensColor.g * 0.3, lensColor.b * 0.5),
              transparent: true,
              opacity: 0.4,
              roughness: 0.1,
              metalness: 0.9
            });

            const leftLens = createRoundedBox(0.45, 0.32, 0.04, 0.02);
            const leftLensMesh = new THREE.Mesh(leftLens, lensMaterial);
            leftLensMesh.position.set(-0.35, 0, 0.64);
            glassesGroup.add(leftLensMesh);

            const rightLens = createRoundedBox(0.45, 0.32, 0.04, 0.02);
            const rightLensMesh = new THREE.Mesh(rightLens, lensMaterial);
            rightLensMesh.position.set(0.35, 0, 0.64);
            glassesGroup.add(rightLensMesh);
            accessoryGroup.add(glassesGroup);
            break;

          case 'wings':
            // Galaxy wings - use the same code from Avatar3DViewer
            const wingsGroup = new THREE.Group();
            const wingColor = hexToColor(accessory.color || '#4B0082');
            
            const createGalaxyTexture = (baseColor: {r: number, g: number, b: number}) => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;
              const size = 512;
              canvas.width = size;
              canvas.height = size;
              
              const gradient = ctx.createLinearGradient(0, 0, 0, size);
              gradient.addColorStop(0, `rgba(${Math.floor(baseColor.r * 180)}, ${Math.floor(baseColor.g * 100)}, ${Math.floor(baseColor.b * 255)}, 1)`);
              gradient.addColorStop(0.5, `rgba(${Math.floor(baseColor.r * 100)}, ${Math.floor(baseColor.g * 50)}, ${Math.floor(baseColor.b * 200)}, 1)`);
              gradient.addColorStop(1, `rgba(${Math.floor(baseColor.r * 50)}, ${Math.floor(baseColor.g * 20)}, ${Math.floor(baseColor.b * 100)}, 1)`);
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, size, size);
              
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              for (let i = 0; i < 200; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const starSize = Math.random() * 2 + 0.5;
                ctx.beginPath();
                ctx.arc(x, y, starSize, 0, Math.PI * 2);
                ctx.fill();
              }
              
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.lineWidth = 2;
              for (let i = 0; i < 30; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const sparkleSize = Math.random() * 4 + 3;
                ctx.beginPath();
                ctx.moveTo(x, y - sparkleSize);
                ctx.lineTo(x, y + sparkleSize);
                ctx.moveTo(x - sparkleSize, y);
                ctx.lineTo(x + sparkleSize, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y, sparkleSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
              }
              
              const texture = new THREE.CanvasTexture(canvas);
              texture.magFilter = THREE.NearestFilter;
              texture.minFilter = THREE.NearestFilter;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              return texture;
            };
            
            const wingMat = new THREE.MeshStandardMaterial({
              map: createGalaxyTexture(wingColor),
              color: new THREE.Color(wingColor.r, wingColor.g, wingColor.b),
              roughness: 0.4,
              metalness: 0.2,
              emissive: new THREE.Color(wingColor.r * 0.3, wingColor.g * 0.2, wingColor.b * 0.4),
              emissiveIntensity: 0.3
            });

            // Left wing top
            const leftWingTop = new THREE.Mesh(
              new THREE.PlaneGeometry(0.9, 0.6, 8, 4),
              wingMat
            );
            const leftTopPos = leftWingTop.geometry.attributes.position;
            for (let i = 0; i < leftTopPos.count; i++) {
              const y = leftTopPos.getY(i);
              if (y > 0.2) {
                const curve = Math.sin((y - 0.2) / 0.4 * Math.PI / 2) * 0.1;
                leftTopPos.setZ(i, curve);
              }
            }
            leftWingTop.geometry.computeVertexNormals();
            leftWingTop.rotation.y = Math.PI / 2;
            leftWingTop.rotation.z = -0.25;
            leftWingTop.position.set(-0.5, 0.3, 0);
            wingsGroup.add(leftWingTop);

            // Left wing feathers
            for (let i = 0; i < 4; i++) {
              const featherLength = 0.4 + i * 0.1;
              const featherWidth = 0.15 - i * 0.02;
              const featherGeometry = new THREE.PlaneGeometry(featherWidth, featherLength, 2, 4);
              const featherPos = featherGeometry.attributes.position;
              for (let j = 0; j < featherPos.count; j++) {
                const y = featherPos.getY(j);
                if (y < -0.15) {
                  const point = Math.abs(y + 0.15) / 0.15;
                  const x = featherPos.getX(j);
                  featherPos.setX(j, x * (1 - point * 0.5));
                }
              }
              featherGeometry.computeVertexNormals();
              const feather = new THREE.Mesh(featherGeometry, wingMat);
              feather.rotation.y = Math.PI / 2;
              feather.rotation.z = -0.2 - i * 0.05;
              feather.position.set(-0.4 - i * 0.1, -0.3 - i * 0.2, 0);
              wingsGroup.add(feather);
            }

            // Right wing top
            const rightWingTop = new THREE.Mesh(
              new THREE.PlaneGeometry(0.9, 0.6, 8, 4),
              wingMat
            );
            const rightTopPos = rightWingTop.geometry.attributes.position;
            for (let i = 0; i < rightTopPos.count; i++) {
              const y = rightTopPos.getY(i);
              if (y > 0.2) {
                const curve = Math.sin((y - 0.2) / 0.4 * Math.PI / 2) * 0.1;
                rightTopPos.setZ(i, curve);
              }
            }
            rightWingTop.geometry.computeVertexNormals();
            rightWingTop.rotation.y = -Math.PI / 2;
            rightWingTop.rotation.z = 0.25;
            rightWingTop.position.set(0.5, 0.3, 0);
            wingsGroup.add(rightWingTop);

            // Right wing feathers
            for (let i = 0; i < 4; i++) {
              const featherLength = 0.4 + i * 0.1;
              const featherWidth = 0.15 - i * 0.02;
              const featherGeometry = new THREE.PlaneGeometry(featherWidth, featherLength, 2, 4);
              const featherPos = featherGeometry.attributes.position;
              for (let j = 0; j < featherPos.count; j++) {
                const y = featherPos.getY(j);
                if (y < -0.15) {
                  const point = Math.abs(y + 0.15) / 0.15;
                  const x = featherPos.getX(j);
                  featherPos.setX(j, x * (1 - point * 0.5));
                }
              }
              featherGeometry.computeVertexNormals();
              const feather = new THREE.Mesh(featherGeometry, wingMat);
              feather.rotation.y = -Math.PI / 2;
              feather.rotation.z = 0.2 + i * 0.05;
              feather.position.set(0.4 + i * 0.1, -0.3 - i * 0.2, 0);
              wingsGroup.add(feather);
            }

            accessoryGroup.add(wingsGroup);
            break;

          case 'pet':
            // Pet accessories - exact match to Avatar3DViewer
            const petGroup = new THREE.Group();
            const petColor = hexToColor(accessory.color || '#8B4513');
            const isRobot = accessory.name?.toLowerCase().includes('robot') || accessory.id?.includes('robot');
            const isCat = accessory.name?.toLowerCase().includes('cat') || accessory.id?.includes('cat');
            const isDog = accessory.name?.toLowerCase().includes('dog') || accessory.id?.includes('dog');
            const isSlime = accessory.name?.toLowerCase().includes('slime') || accessory.id?.includes('slime');

            if (isSlime) {
              // SLIME PET - Square block with pixelated texture
              const slimeMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(petColor, 8),
                color: new THREE.Color(petColor.r, petColor.g, petColor.b),
                roughness: 0.2,
                metalness: 0.0,
                transparent: true,
                opacity: 0.9
              });

              const slimeBody = createRoundedBox(0.5, 0.5, 0.5, 0.05);
              const slimeBodyMesh = new THREE.Mesh(slimeBody, slimeMat);
              slimeBodyMesh.position.set(0, 0.25, 0);
              petGroup.add(slimeBodyMesh);

              const eyeMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0, 0, 0),
                roughness: 0.5
              });
              const leftEye = createRoundedBox(0.08, 0.08, 0.08, 0.01);
              const leftEyeMesh = new THREE.Mesh(leftEye, eyeMat);
              leftEyeMesh.position.set(-0.12, 0.3, 0.26);
              petGroup.add(leftEyeMesh);

              const rightEye = createRoundedBox(0.08, 0.08, 0.08, 0.01);
              const rightEyeMesh = new THREE.Mesh(rightEye, eyeMat);
              rightEyeMesh.position.set(0.12, 0.3, 0.26);
              petGroup.add(rightEyeMesh);

              const mouthMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0, 0, 0),
                roughness: 0.5
              });
              const mouth = createRoundedBox(0.12, 0.06, 0.06, 0.01);
              const mouthMesh = new THREE.Mesh(mouth, mouthMat);
              mouthMesh.position.set(0, 0.15, 0.26);
              petGroup.add(mouthMesh);
              accessoryGroup.add(petGroup);
            } else if (isDog) {
              // DOG PET
              const dogMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(petColor, 8),
                color: new THREE.Color(petColor.r, petColor.g, petColor.b),
                roughness: 0.6,
                metalness: 0.1
              });

              const dogBody = createRoundedBox(0.5, 0.4, 0.7, 0.08);
              const dogBodyMesh = new THREE.Mesh(dogBody, dogMat);
              dogBodyMesh.position.set(0, 0.3, 0);
              petGroup.add(dogBodyMesh);

              const dogHead = createRoundedBox(0.4, 0.4, 0.4, 0.06);
              const dogHeadMesh = new THREE.Mesh(dogHead, dogMat);
              dogHeadMesh.position.set(0, 0.6, 0.3);
              petGroup.add(dogHeadMesh);

              const earGeometry = createRoundedBox(0.15, 0.2, 0.05, 0.02);
              const leftEar = new THREE.Mesh(earGeometry, dogMat);
              leftEar.rotation.z = 0.3;
              leftEar.position.set(-0.2, 0.65, 0.2);
              petGroup.add(leftEar);

              const rightEar = new THREE.Mesh(earGeometry, dogMat);
              rightEar.rotation.z = -0.3;
              rightEar.position.set(0.2, 0.65, 0.2);
              petGroup.add(rightEar);

              const eyeMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0.2, 0.2, 0.8),
                emissive: new THREE.Color(0, 0, 0.1),
                roughness: 0.3
              });
              const leftEye = createRoundedBox(0.1, 0.08, 0.05, 0.02);
              const leftEyeMesh = new THREE.Mesh(leftEye, eyeMat);
              leftEyeMesh.position.set(-0.1, 0.6, 0.4);
              petGroup.add(leftEyeMesh);

              const rightEye = createRoundedBox(0.1, 0.08, 0.05, 0.02);
              const rightEyeMesh = new THREE.Mesh(rightEye, eyeMat);
              rightEyeMesh.position.set(0.1, 0.6, 0.4);
              petGroup.add(rightEyeMesh);

              const noseMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0, 0, 0),
                roughness: 0.5
              });
              const nose = createRoundedBox(0.08, 0.06, 0.06, 0.01);
              const noseMesh = new THREE.Mesh(nose, noseMat);
              noseMesh.position.set(0, 0.55, 0.42);
              petGroup.add(noseMesh);

              const legGeometry = createRoundedBox(0.12, 0.3, 0.12, 0.03);
              const legMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(petColor.r * 0.7, petColor.g * 0.7, petColor.b * 0.7),
                roughness: 0.6
              });

              const frontLeftLeg = new THREE.Mesh(legGeometry, legMat);
              frontLeftLeg.position.set(-0.18, 0.05, 0.2);
              petGroup.add(frontLeftLeg);

              const frontRightLeg = new THREE.Mesh(legGeometry, legMat);
              frontRightLeg.position.set(0.18, 0.05, 0.2);
              petGroup.add(frontRightLeg);

              const backLeftLeg = new THREE.Mesh(legGeometry, legMat);
              backLeftLeg.position.set(-0.18, 0.05, -0.2);
              petGroup.add(backLeftLeg);

              const backRightLeg = new THREE.Mesh(legGeometry, legMat);
              backRightLeg.position.set(0.18, 0.05, -0.2);
              petGroup.add(backRightLeg);

              const tailGeometry = createRoundedBox(0.08, 0.3, 0.08, 0.03);
              const tail = new THREE.Mesh(tailGeometry, dogMat);
              tail.rotation.x = Math.PI / 4;
              tail.position.set(0, 0.3, -0.4);
              petGroup.add(tail);
              accessoryGroup.add(petGroup);
            } else if (isRobot) {
              // ROBOT PET
              const robotMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(petColor, 8),
                color: new THREE.Color(petColor.r, petColor.g, petColor.b),
                roughness: 0.3,
                metalness: 0.8
              });

              const robotBody = createRoundedBox(0.6, 0.5, 0.5, 0.08);
              const robotBodyMesh = new THREE.Mesh(robotBody, robotMat);
              robotBodyMesh.position.set(0, 0.3, 0);
              petGroup.add(robotBodyMesh);

              const panelMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture({ r: petColor.r * 0.7, g: petColor.g * 0.7, b: petColor.b * 0.7 }, 8),
                color: new THREE.Color(petColor.r * 0.7, petColor.g * 0.7, petColor.b * 0.7),
                roughness: 0.2,
                metalness: 0.9
              });
              const chestPanel = createRoundedBox(0.3, 0.2, 0.05, 0.02);
              const chestPanelMesh = new THREE.Mesh(chestPanel, panelMat);
              chestPanelMesh.position.set(0, 0.35, 0.26);
              petGroup.add(chestPanelMesh);

              const robotHead = createRoundedBox(0.4, 0.4, 0.4, 0.06);
              const robotHeadMesh = new THREE.Mesh(robotHead, robotMat);
              robotHeadMesh.position.set(0, 0.65, 0.1);
              petGroup.add(robotHeadMesh);

              const eyeMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0, 1, 1),
                emissive: new THREE.Color(0, 0.5, 0.5),
                roughness: 0.1,
                metalness: 0.9
              });
              const leftEye = createRoundedBox(0.1, 0.1, 0.05, 0.02);
              const leftEyeMesh = new THREE.Mesh(leftEye, eyeMat);
              leftEyeMesh.position.set(-0.12, 0.65, 0.25);
              petGroup.add(leftEyeMesh);

              const rightEye = createRoundedBox(0.1, 0.1, 0.05, 0.02);
              const rightEyeMesh = new THREE.Mesh(rightEye, eyeMat);
              rightEyeMesh.position.set(0.12, 0.65, 0.25);
              petGroup.add(rightEyeMesh);

              const antenna = createRoundedBox(0.05, 0.15, 0.05, 0.02);
              const antennaMesh = new THREE.Mesh(antenna, robotMat);
              antennaMesh.position.set(0, 0.9, 0);
              petGroup.add(antennaMesh);
              const antennaBall = new THREE.SphereGeometry(0.06, 8, 8);
              const antennaBallMesh = new THREE.Mesh(antennaBall, eyeMat);
              antennaBallMesh.position.set(0, 0.98, 0);
              petGroup.add(antennaBallMesh);

              const jointMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture({ r: petColor.r * 0.5, g: petColor.g * 0.5, b: petColor.b * 0.5 }, 8),
                color: new THREE.Color(petColor.r * 0.5, petColor.g * 0.5, petColor.b * 0.5),
                roughness: 0.1,
                metalness: 0.9
              });
              const leftShoulder = new THREE.SphereGeometry(0.12, 8, 8);
              const leftShoulderMesh = new THREE.Mesh(leftShoulder, jointMat);
              leftShoulderMesh.position.set(-0.35, 0.5, 0);
              petGroup.add(leftShoulderMesh);

              const rightShoulder = new THREE.SphereGeometry(0.12, 8, 8);
              const rightShoulderMesh = new THREE.Mesh(rightShoulder, jointMat);
              rightShoulderMesh.position.set(0.35, 0.5, 0);
              petGroup.add(rightShoulderMesh);

              const armGeometry = createRoundedBox(0.15, 0.4, 0.15, 0.04);
              const leftArm = new THREE.Mesh(armGeometry, robotMat);
              leftArm.position.set(-0.35, 0.2, 0);
              petGroup.add(leftArm);

              const rightArm = new THREE.Mesh(armGeometry, robotMat);
              rightArm.position.set(0.35, 0.2, 0);
              petGroup.add(rightArm);

              const leftElbow = new THREE.SphereGeometry(0.1, 8, 8);
              const leftElbowMesh = new THREE.Mesh(leftElbow, jointMat);
              leftElbowMesh.position.set(-0.35, 0, 0);
              petGroup.add(leftElbowMesh);

              const rightElbow = new THREE.SphereGeometry(0.1, 8, 8);
              const rightElbowMesh = new THREE.Mesh(rightElbow, jointMat);
              rightElbowMesh.position.set(0.35, 0, 0);
              petGroup.add(rightElbowMesh);

              const legGeometry = createRoundedBox(0.15, 0.35, 0.15, 0.04);
              const leftLeg = new THREE.Mesh(legGeometry, robotMat);
              leftLeg.position.set(-0.2, -0.1, 0);
              petGroup.add(leftLeg);

              const rightLeg = new THREE.Mesh(legGeometry, robotMat);
              rightLeg.position.set(0.2, -0.1, 0);
              petGroup.add(rightLeg);

              const leftHip = new THREE.SphereGeometry(0.1, 8, 8);
              const leftHipMesh = new THREE.Mesh(leftHip, jointMat);
              leftHipMesh.position.set(-0.2, 0.15, 0);
              petGroup.add(leftHipMesh);

              const rightHip = new THREE.SphereGeometry(0.1, 8, 8);
              const rightHipMesh = new THREE.Mesh(rightHip, jointMat);
              rightHipMesh.position.set(0.2, 0.15, 0);
              petGroup.add(rightHipMesh);
              accessoryGroup.add(petGroup);
            } else {
              // CAT PET
              const catMat = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(petColor, 8),
                color: new THREE.Color(petColor.r, petColor.g, petColor.b),
                roughness: 0.6,
                metalness: 0.1
              });

              const catBody = createRoundedBox(0.5, 0.35, 0.6, 0.08);
              const catBodyMesh = new THREE.Mesh(catBody, catMat);
              catBodyMesh.position.set(0, 0.25, 0);
              petGroup.add(catBodyMesh);

              const catHead = createRoundedBox(0.35, 0.35, 0.35, 0.06);
              const catHeadMesh = new THREE.Mesh(catHead, catMat);
              catHeadMesh.position.set(0, 0.55, 0.25);
              petGroup.add(catHeadMesh);

              const earGeometry = createRoundedBox(0.12, 0.15, 0.05, 0.02);
              const leftEar = new THREE.Mesh(earGeometry, catMat);
              leftEar.rotation.z = -0.4;
              leftEar.rotation.x = -0.2;
              leftEar.position.set(-0.15, 0.7, 0.2);
              petGroup.add(leftEar);

              const rightEar = new THREE.Mesh(earGeometry, catMat);
              rightEar.rotation.z = 0.4;
              rightEar.rotation.x = -0.2;
              rightEar.position.set(0.15, 0.7, 0.2);
              petGroup.add(rightEar);

              const eyeMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0.2, 0.8, 0.2),
                emissive: new THREE.Color(0, 0.2, 0),
                roughness: 0.3
              });
              const leftEye = createRoundedBox(0.1, 0.08, 0.05, 0.02);
              const leftEyeMesh = new THREE.Mesh(leftEye, eyeMat);
              leftEyeMesh.position.set(-0.1, 0.6, 0.4);
              petGroup.add(leftEyeMesh);

              const rightEye = createRoundedBox(0.1, 0.08, 0.05, 0.02);
              const rightEyeMesh = new THREE.Mesh(rightEye, eyeMat);
              rightEyeMesh.position.set(0.1, 0.6, 0.4);
              petGroup.add(rightEyeMesh);

              const noseMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(1, 0.5, 0.8),
                roughness: 0.5
              });
              const nose = createRoundedBox(0.06, 0.05, 0.05, 0.01);
              const noseMesh = new THREE.Mesh(nose, noseMat);
              noseMesh.position.set(0, 0.55, 0.4);
              petGroup.add(noseMesh);

              const legGeometry = createRoundedBox(0.12, 0.3, 0.12, 0.03);
              const legMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(petColor.r * 0.7, petColor.g * 0.7, petColor.b * 0.7),
                roughness: 0.6
              });

              const frontLeftLeg = new THREE.Mesh(legGeometry, legMat);
              frontLeftLeg.position.set(-0.18, 0.05, 0.2);
              petGroup.add(frontLeftLeg);

              const frontRightLeg = new THREE.Mesh(legGeometry, legMat);
              frontRightLeg.position.set(0.18, 0.05, 0.2);
              petGroup.add(frontRightLeg);

              const backLeftLeg = new THREE.Mesh(legGeometry, legMat);
              backLeftLeg.position.set(-0.18, 0.05, -0.2);
              petGroup.add(backLeftLeg);

              const backRightLeg = new THREE.Mesh(legGeometry, legMat);
              backRightLeg.position.set(0.18, 0.05, -0.2);
              petGroup.add(backRightLeg);

              const tailGeometry = createRoundedBox(0.08, 0.25, 0.08, 0.03);
              const tail = new THREE.Mesh(tailGeometry, catMat);
              tail.rotation.x = Math.PI / 3;
              tail.rotation.z = 0.3;
              tail.position.set(0, 0.3, -0.35);
              petGroup.add(tail);
              accessoryGroup.add(petGroup);
            }
            break;

          case 'drone':
            // Drone accessory - will be loaded from GLTF if modelUrl exists
            // Fallback to simple representation if no model
            if (!accessory.modelUrl) {
              const droneGroup = new THREE.Group();
              const droneBody = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.3, 0.8),
                new THREE.MeshStandardMaterial({
                  color: new THREE.Color(0.1, 0.2, 0.4),
                  metalness: 0.9,
                  roughness: 0.2,
                  emissive: new THREE.Color(0, 0.3, 0.6),
                  emissiveIntensity: 0.5
                })
              );
              droneGroup.add(droneBody);
              
              // Simple rotor representation
              for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                const rotor = new THREE.Mesh(
                  new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8),
                  new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0.8, 0.8, 0.9),
                    metalness: 0.7,
                    roughness: 0.3
                  })
                );
                rotor.position.set(
                  Math.cos(angle) * 0.5,
                  0.2,
                  Math.sin(angle) * 0.5
                );
                droneGroup.add(rotor);
              }
              accessoryGroup.add(droneGroup);
            }
            break;

          default:
            // Default accessory display
            const defaultAccessory = new THREE.Mesh(
              createRoundedBox(0.6, 0.6, 0.6, 0.05),
              accessoryMat
            );
            accessoryGroup.add(defaultAccessory);
        }

        // Helper function for default accessory creation (used in error fallback)
        const createDefaultAccessory = () => {
          if (!accessoryGroup) return;
          const defaultAccessory = new THREE.Mesh(
            createRoundedBox(0.6, 0.6, 0.6, 0.05),
            accessoryMat
          );
          accessoryGroup.add(defaultAccessory);
        };

        // Auto-rotate for display
        const animate = () => {
          if (!isMounted || !accessoryGroup) return;
          
          if (interactive && isHovered) {
            accessoryGroup.rotation.y = rotationRef.current.y;
            accessoryGroup.rotation.x = rotationRef.current.x;
          } else {
            // Auto-rotate slowly
            accessoryGroup.rotation.y += 0.01;
          }
          
          renderer.render(scene, camera);
          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Mouse interaction
        if (interactive && mountRef.current) {
          const handleMouseMove = (e: MouseEvent) => {
            if (!mountRef.current) return;
            const rect = mountRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            rotationRef.current.y = x * 0.5;
            rotationRef.current.x = y * 0.3;
          };

          mountRef.current.addEventListener('mousemove', handleMouseMove);
          mountRef.current.addEventListener('mouseenter', () => setIsHovered(true));
          mountRef.current.addEventListener('mouseleave', () => {
            setIsHovered(false);
            rotationRef.current = { x: 0, y: 0 };
          });

          return () => {
            if (mountRef.current) {
              mountRef.current.removeEventListener('mousemove', handleMouseMove);
            }
          };
        }

        rendererRef.current = renderer;
        sceneRef.current = scene;
        cameraRef.current = camera;
        accessoryGroupRef.current = accessoryGroup;

      } catch (error) {
        console.error('Error initializing accessory 3D viewer:', error);
      }
    });

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [accessory, width, height, interactive, isHovered]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        cursor: interactive ? 'grab' : 'default'
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}

