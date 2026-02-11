'use client';

import { useEffect, useRef, useState } from 'react';
import { Skin } from '@/types';

interface Avatar3DViewerProps {
  skin: Skin;
  width?: number;
  height?: number;
  interactive?: boolean; // Enable mouse interaction
  animation?: string; // Animation to play
  equippedFace?: Skin; // Optional equipped face to apply to head
  onReady?: () => void;
  onError?: (error?: Error) => void;
}

export default function Avatar3DViewer({
  skin,
  width = 200,
  height = 200,
  interactive = true,
  animation = 'idle',
  equippedFace,
  onReady,
  onError
}: Avatar3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const characterGroupRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const readySignalRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

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
    let characterGroup: any;
    let animationTime = 0;
    let isMounted = true;
<<<<<<< HEAD
    readySignalRef.current = false;
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

    // Dynamic import for Three.js with error handling
    import('three').then((module) => {
      if (!isMounted || !canvasRef.current) return;

      try {
        THREE = module;
        
<<<<<<< HEAD
        // Validate skin again inside useEffect - ensure colors exist with defaults
        if (!skin) {
          const error = new Error('Invalid skin data');
          console.warn('Invalid skin data:', skin);
          onErrorRef.current?.(error);
          return;
        }
        
        // Ensure all color properties exist with defaults
        const defaultColors = {
          head: '#f4c2a1',
          torso: '#4d536f',
          arm: '#3a3f56',
          legs: '#3a3f56'
        };

        const resolvedColors = {
          head: skin.colors?.head || defaultColors.head,
          torso: skin.colors?.torso || defaultColors.torso,
          arm: skin.colors?.arm || defaultColors.arm,
          legs: skin.colors?.legs || defaultColors.legs
        };

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

        // Camera setup - adjusted to see top of hat and bottom of legs
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
        camera.position.set(0, 3.2, 7);
        camera.lookAt(0, 1.5, 0);
        cameraRef.current = camera;

        // Lighting - soft ambient + directional
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);

        // Create character group
        characterGroup = new THREE.Group();
        scene.add(characterGroup);
        characterGroupRef.current = characterGroup;

        // Texture creation functions - Realistic textures like Roblox
        const createSkinTexture = (color: { r: number, g: number, b: number }) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const size = 512;
          canvas.width = size;
          canvas.height = size;

          // Base skin color
          ctx.fillStyle = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
          ctx.fillRect(0, 0, size, size);

          // Add subtle skin texture with pores and variations
          const imageData = ctx.getImageData(0, 0, size, size);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
            imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
            imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
          }
          ctx.putImageData(imageData, 0, 0);

          // Add pore-like texture
          for (let i = 0; i < 200; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 2 + 0.5;
            ctx.fillStyle = `rgba(${Math.floor(color.r * 200)}, ${Math.floor(color.g * 200)}, ${Math.floor(color.b * 200)}, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          const texture = new THREE.CanvasTexture(canvas);
          if ('colorSpace' in texture && THREE.SRGBColorSpace) {
            (texture as any).colorSpace = THREE.SRGBColorSpace;
          } else if ('encoding' in texture && THREE.sRGBEncoding) {
            (texture as any).encoding = THREE.sRGBEncoding;
          }
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          return texture;
        };

        // Create pixelated texture - generates a pixelated pattern
        const createPixelatedTexture = (color: { r: number, g: number, b: number }, pixelSize: number = 8) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const size = 512;
          canvas.width = size;
          canvas.height = size;

          const pixelsPerRow = Math.floor(size / pixelSize);

          for (let y = 0; y < pixelsPerRow; y++) {
            for (let x = 0; x < pixelsPerRow; x++) {
              // Add slight color variation per pixel
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

        // Colors - apply equipped face to head if available
        const headColor = hexToColor(equippedFace?.colors?.head || resolvedColors.head);
        const torsoColor = hexToColor(resolvedColors.torso);
        const armColor = hexToColor(resolvedColors.arm);
        const legColor = hexToColor(resolvedColors.legs);
        
        // Use face materials if equipped face has glow
        const faceHasGlow = equippedFace?.isSpecial || equippedFace?.materials?.head?.emissive !== undefined;
        const faceGlowColor = equippedFace?.materials?.head?.emissive || equippedFace?.materials?.torso?.emissive;
        const faceGlowIntensity = equippedFace?.materials?.head?.emissiveIntensity || equippedFace?.materials?.torso?.emissiveIntensity || 0.6;

        // Check for glow properties (skin or equipped face)
        const hasGlow = skin.isSpecial || (skin.materials?.torso?.emissive !== undefined) || faceHasGlow;
        const glowColor = faceGlowColor || skin.materials?.torso?.emissive || skin.materials?.head?.emissive || '#4a90e2';
        const glowIntensity = faceGlowIntensity || skin.materials?.torso?.emissiveIntensity || skin.materials?.head?.emissiveIntensity || 0.6;

        // Create materials with pixelated textures (or glow for special skins/faces)
        const headMaterial = (hasGlow && (faceHasGlow || skin.isSpecial))
          ? createGlowMaterial(headColor, true, glowColor, glowIntensity)
          : new THREE.MeshStandardMaterial({
              map: createPixelatedTexture(headColor, 8),
              color: new THREE.Color(headColor.r, headColor.g, headColor.b),
              roughness: 0.8,
              metalness: 0.0
            });
        const torsoMaterial = hasGlow
          ? createGlowMaterial(torsoColor, true, glowColor, glowIntensity)
          : new THREE.MeshStandardMaterial({
              map: createPixelatedTexture(torsoColor, 8),
              color: new THREE.Color(torsoColor.r, torsoColor.g, torsoColor.b),
              roughness: 0.7,
              metalness: 0.1
            });
        const armMaterial = hasGlow
          ? createGlowMaterial(armColor, true, glowColor, glowIntensity)
          : new THREE.MeshStandardMaterial({
              map: createPixelatedTexture(armColor, 8),
              color: new THREE.Color(armColor.r, armColor.g, armColor.b),
              roughness: 0.7,
              metalness: 0.1
            });
        const legMaterial = hasGlow
          ? createGlowMaterial(legColor, true, glowColor, glowIntensity)
          : new THREE.MeshStandardMaterial({
              map: createPixelatedTexture(legColor, 8),
              color: new THREE.Color(legColor.r, legColor.g, legColor.b),
              roughness: 0.7,
              metalness: 0.1
            });

        // Helper function to create Roblox-style rounded boxes
        const createRoundedBox = (width: number, height: number, depth: number, radius: number = 0.1) => {
          const geometry = new THREE.BoxGeometry(width, height, depth);
          geometry.computeVertexNormals();
          return geometry;
        };

        // Helper function to create pixelated shape - splits into smaller cubes
        const createPixelatedShape = (
          width: number,
          height: number,
          depth: number,
          pixelSize: number = 0.1,
          baseColor: { r: number, g: number, b: number },
          variation: number = 0.1
        ) => {
          const pixelGroup = new THREE.Group();
          const pixelsX = Math.max(1, Math.floor(width / pixelSize));
          const pixelsY = Math.max(1, Math.floor(height / pixelSize));
          const pixelsZ = Math.max(1, Math.floor(depth / pixelSize));

          const actualPixelSize = Math.min(width / pixelsX, height / pixelsY, depth / pixelsZ);
          const startX = -width / 2 + actualPixelSize / 2;
          const startY = -height / 2 + actualPixelSize / 2;
          const startZ = -depth / 2 + actualPixelSize / 2;

          for (let x = 0; x < pixelsX; x++) {
            for (let y = 0; y < pixelsY; y++) {
              for (let z = 0; z < pixelsZ; z++) {
                // Calculate if this pixel should be visible (inside the shape)
                const px = startX + x * actualPixelSize;
                const py = startY + y * actualPixelSize;
                const pz = startZ + z * actualPixelSize;

                // Simple box check - can be extended for other shapes
                const inBounds = Math.abs(px) <= width / 2 && Math.abs(py) <= height / 2 && Math.abs(pz) <= depth / 2;

                if (inBounds) {
                  // Add color variation for pixelated look
                  const colorVariation = (Math.random() - 0.5) * variation;
                  const pixelColor = {
                    r: Math.max(0, Math.min(1, baseColor.r + colorVariation)),
                    g: Math.max(0, Math.min(1, baseColor.g + colorVariation)),
                    b: Math.max(0, Math.min(1, baseColor.b + colorVariation))
                  };

                  const pixelMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(pixelColor.r, pixelColor.g, pixelColor.b),
                    roughness: 0.7,
                    metalness: 0.1
                  });

                  const pixelGeometry = new THREE.BoxGeometry(
                    actualPixelSize * 0.95,
                    actualPixelSize * 0.95,
                    actualPixelSize * 0.95
                  );
                  const pixel = new THREE.Mesh(pixelGeometry, pixelMat);
                  pixel.position.set(px, py, pz);
                  pixelGroup.add(pixel);
                }
              }
            }
          }

          return pixelGroup;
        };

        // Check for special themed skin scaling (like tiny scarecrow body with big head)
        const bodyScale = (skin as any).bodyScale || { x: 1, y: 1, z: 1 };
        const headScale = (skin as any).headScale || { x: 1, y: 1, z: 1 };
        const isSpecial = (skin as any).special || false;
        const isHighPoly = true; // All skins render 500+ polygons

        // Helper to create high-poly geometry (500+ polygons MINIMUM)
        const createHighPolyGeometry = (type: 'head' | 'torso' | 'arm' | 'leg', width: number, height: number, depth: number) => {
          if (!isHighPoly) {
            return createRoundedBox(width, height, depth, 0.1);
          }
          
          // Use IcosahedronGeometry for head (high poly sphere) - 4 subdivisions = ~5120 faces
          if (type === 'head') {
            const radius = Math.max(width, height, depth) / 2;
            const geometry = new THREE.IcosahedronGeometry(radius, 4); // 4 subdivisions = ~5120 faces (WAY over 500!)
            return geometry;
          }
          
          // For body parts, use highly subdivided box geometry - 20x20x20 = 2400 faces per box (WAY over 500!)
          const segments = 20; // 20x20x20 = 2400 faces per box (ensures 500+ polygons)
          const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
          geometry.computeVertexNormals();
          return geometry;
        };

        // Helper to create glowing material with emissive properties
        const createGlowMaterial = (baseColor: { r: number, g: number, b: number }, hasGlow: boolean, glowColor?: string, glowIntensity: number = 0.5) => {
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(baseColor.r, baseColor.g, baseColor.b),
            roughness: hasGlow ? 0.3 : 0.7,
            metalness: hasGlow ? 0.5 : 0.1,
            emissive: hasGlow && glowColor ? new THREE.Color(glowColor) : new THREE.Color(0, 0, 0),
            emissiveIntensity: hasGlow ? glowIntensity : 0
          });
          return material;
        };

        // Add accessories if available
        // Head - high-poly sphere for special skins, box for regular
        const headSize = isSpecial ? 1.2 : 1.2;
        const headGeometry = createHighPolyGeometry('head', headSize * headScale.x, headSize * headScale.y, headSize * headScale.z);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 2.1, 0);
        characterGroup.add(head);

        // Torso - high-poly for special skins
        const torsoSize = { w: 1.6, h: 1.8, d: 0.8 };
        const torsoGeometry = createHighPolyGeometry(
          'torso',
          torsoSize.w * bodyScale.x, 
          torsoSize.h * bodyScale.y, 
          torsoSize.d * bodyScale.z
=======
        // Validate skin again inside useEffect
        if (!skin || !skin.colors || !skin.colors.head || !skin.colors.torso || !skin.colors.arm || !skin.colors.legs) {
          console.warn('Invalid skin data:', skin);
          return;
        }

        const canvas = canvasRef.current!;
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();

        // Camera setup - adjusted to see top of hat and bottom of legs
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
        camera.position.set(0, 3.2, 7);
        camera.lookAt(0, 1.5, 0);

        // Lighting - soft ambient + directional
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);

        // Create character group
        characterGroup = new THREE.Group();
        scene.add(characterGroup);

        // Texture creation functions - Realistic textures like Roblox
        const createSkinTexture = (color: { r: number, g: number, b: number }) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const size = 512;
          canvas.width = size;
          canvas.height = size;

          // Base skin color
          ctx.fillStyle = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
          ctx.fillRect(0, 0, size, size);

          // Add subtle skin texture with pores and variations
          const imageData = ctx.getImageData(0, 0, size, size);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
            imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
            imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
          }
          ctx.putImageData(imageData, 0, 0);

          // Add pore-like texture
          for (let i = 0; i < 200; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 2 + 0.5;
            ctx.fillStyle = `rgba(${Math.floor(color.r * 200)}, ${Math.floor(color.g * 200)}, ${Math.floor(color.b * 200)}, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          const texture = new THREE.CanvasTexture(canvas);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          return texture;
        };

        // Create pixelated texture - generates a pixelated pattern
        const createPixelatedTexture = (color: { r: number, g: number, b: number }, pixelSize: number = 8) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const size = 512;
          canvas.width = size;
          canvas.height = size;

          const pixelsPerRow = Math.floor(size / pixelSize);

          for (let y = 0; y < pixelsPerRow; y++) {
            for (let x = 0; x < pixelsPerRow; x++) {
              // Add slight color variation per pixel
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
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          return texture;
        };

        // Colors
        const headColor = hexToColor(skin.colors?.head || '#f4c2a1');
        const torsoColor = hexToColor(skin.colors?.torso || '#4d536f');
        const armColor = hexToColor(skin.colors?.arm || '#3a3f56');
        const legColor = hexToColor(skin.colors?.legs || '#3a3f56');

        // Create materials with pixelated textures
        const headMaterial = new THREE.MeshStandardMaterial({
          map: createPixelatedTexture(headColor, 8),
          color: new THREE.Color(headColor.r, headColor.g, headColor.b),
          roughness: 0.8,
          metalness: 0.0
        });
        const torsoMaterial = new THREE.MeshStandardMaterial({
          map: createPixelatedTexture(torsoColor, 8),
          color: new THREE.Color(torsoColor.r, torsoColor.g, torsoColor.b),
          roughness: 0.7,
          metalness: 0.1
        });
        const armMaterial = new THREE.MeshStandardMaterial({
          map: createPixelatedTexture(armColor, 8),
          color: new THREE.Color(armColor.r, armColor.g, armColor.b),
          roughness: 0.7,
          metalness: 0.1
        });
        const legMaterial = new THREE.MeshStandardMaterial({
          map: createPixelatedTexture(legColor, 8),
          color: new THREE.Color(legColor.r, legColor.g, legColor.b),
          roughness: 0.7,
          metalness: 0.1
        });

        // Helper function to create Roblox-style rounded boxes
        const createRoundedBox = (width: number, height: number, depth: number, radius: number = 0.1) => {
          const geometry = new THREE.BoxGeometry(width, height, depth);
          geometry.computeVertexNormals();
          return geometry;
        };

        // Helper function to create pixelated shape - splits into smaller cubes
        const createPixelatedShape = (
          width: number,
          height: number,
          depth: number,
          pixelSize: number = 0.1,
          baseColor: { r: number, g: number, b: number },
          variation: number = 0.1
        ) => {
          const pixelGroup = new THREE.Group();
          const pixelsX = Math.max(1, Math.floor(width / pixelSize));
          const pixelsY = Math.max(1, Math.floor(height / pixelSize));
          const pixelsZ = Math.max(1, Math.floor(depth / pixelSize));

          const actualPixelSize = Math.min(width / pixelsX, height / pixelsY, depth / pixelsZ);
          const startX = -width / 2 + actualPixelSize / 2;
          const startY = -height / 2 + actualPixelSize / 2;
          const startZ = -depth / 2 + actualPixelSize / 2;

          for (let x = 0; x < pixelsX; x++) {
            for (let y = 0; y < pixelsY; y++) {
              for (let z = 0; z < pixelsZ; z++) {
                // Calculate if this pixel should be visible (inside the shape)
                const px = startX + x * actualPixelSize;
                const py = startY + y * actualPixelSize;
                const pz = startZ + z * actualPixelSize;

                // Simple box check - can be extended for other shapes
                const inBounds = Math.abs(px) <= width / 2 && Math.abs(py) <= height / 2 && Math.abs(pz) <= depth / 2;

                if (inBounds) {
                  // Add color variation for pixelated look
                  const colorVariation = (Math.random() - 0.5) * variation;
                  const pixelColor = {
                    r: Math.max(0, Math.min(1, baseColor.r + colorVariation)),
                    g: Math.max(0, Math.min(1, baseColor.g + colorVariation)),
                    b: Math.max(0, Math.min(1, baseColor.b + colorVariation))
                  };

                  const pixelMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(pixelColor.r, pixelColor.g, pixelColor.b),
                    roughness: 0.7,
                    metalness: 0.1
                  });

                  const pixelGeometry = new THREE.BoxGeometry(
                    actualPixelSize * 0.95,
                    actualPixelSize * 0.95,
                    actualPixelSize * 0.95
                  );
                  const pixel = new THREE.Mesh(pixelGeometry, pixelMat);
                  pixel.position.set(px, py, pz);
                  pixelGroup.add(pixel);
                }
              }
            }
          }

          return pixelGroup;
        };

        // Check for special themed skin scaling (like tiny scarecrow body with big head)
        const bodyScale = (skin as any).bodyScale || { x: 1, y: 1, z: 1 };
        const headScale = (skin as any).headScale || { x: 1, y: 1, z: 1 };
        const isSpecial = (skin as any).special || false;

        // Add accessories if available
        // Head - square block like Roblox (with special scaling for themed skins)
        const headSize = isSpecial ? 1.2 : 1.2;
        const headGeometry = createRoundedBox(headSize * headScale.x, headSize * headScale.y, headSize * headScale.z, 0.08);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 2.1, 0);
        characterGroup.add(head);

        // Torso - wider and taller like Roblox (with special scaling)
        const torsoSize = { w: 1.6, h: 1.8, d: 0.8 };
        const torsoGeometry = createRoundedBox(
          torsoSize.w * bodyScale.x, 
          torsoSize.h * bodyScale.y, 
          torsoSize.d * bodyScale.z, 
          0.1
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        );
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.set(0, 0.9, 0);
        characterGroup.add(torso);

<<<<<<< HEAD
        // Left Arm - high-poly for special skins
        const armSize = { w: 0.5, h: 1.8, d: 0.5 };
        const leftArmGeometry = createHighPolyGeometry(
          'arm',
          armSize.w * bodyScale.x, 
          armSize.h * bodyScale.y, 
          armSize.d * bodyScale.z
=======
        // Left Arm (with scaling)
        const armSize = { w: 0.5, h: 1.8, d: 0.5 };
        const leftArmGeometry = createRoundedBox(
          armSize.w * bodyScale.x, 
          armSize.h * bodyScale.y, 
          armSize.d * bodyScale.z, 
          0.06
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        );
        const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        leftArm.position.set(-1.15 * bodyScale.x, 0.9, 0);
        characterGroup.add(leftArm);

<<<<<<< HEAD
        // Right Arm - high-poly for special skins
        const rightArmGeometry = createHighPolyGeometry(
          'arm',
          armSize.w * bodyScale.x, 
          armSize.h * bodyScale.y, 
          armSize.d * bodyScale.z
=======
        // Right Arm (with scaling)
        const rightArmGeometry = createRoundedBox(
          armSize.w * bodyScale.x, 
          armSize.h * bodyScale.y, 
          armSize.d * bodyScale.z, 
          0.06
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        );
        const rightArm = new THREE.Mesh(rightArmGeometry, armMaterial);
        rightArm.position.set(1.15 * bodyScale.x, 0.9, 0);
        characterGroup.add(rightArm);

<<<<<<< HEAD
        // Left Leg - high-poly for special skins
        const legSize = { w: 0.6, h: 1.6, d: 0.6 };
        const leftLegGeometry = createHighPolyGeometry(
          'leg',
          legSize.w * bodyScale.x, 
          legSize.h * bodyScale.y, 
          legSize.d * bodyScale.z
=======
        // Left Leg (with scaling)
        const legSize = { w: 0.6, h: 1.6, d: 0.6 };
        const leftLegGeometry = createRoundedBox(
          legSize.w * bodyScale.x, 
          legSize.h * bodyScale.y, 
          legSize.d * bodyScale.z, 
          0.06
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        );
        const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
        leftLeg.position.set(-0.4 * bodyScale.x, -1.0, 0);
        characterGroup.add(leftLeg);

<<<<<<< HEAD
        // Right Leg - high-poly for special skins
        const rightLegGeometry = createHighPolyGeometry(
          'leg',
          legSize.w * bodyScale.x, 
          legSize.h * bodyScale.y, 
          legSize.d * bodyScale.z
=======
        // Right Leg (with scaling)
        const rightLegGeometry = createRoundedBox(
          legSize.w * bodyScale.x, 
          legSize.h * bodyScale.y, 
          legSize.d * bodyScale.z, 
          0.06
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        );
        const rightLeg = new THREE.Mesh(rightLegGeometry, legMaterial);
        rightLeg.position.set(0.4 * bodyScale.x, -1.0, 0);
        characterGroup.add(rightLeg);

        // Store references for animation
        const bodyParts = {
          head,
          torso,
          leftArm,
          rightArm,
          leftLeg,
          rightLeg
        };

        // Note: We don't rotate the character for accessories - they should be visible from the front

        // Add accessories if available
        if (skin.accessories && skin.accessories.length > 0) {
          skin.accessories.forEach((accessory) => {
            const accessoryColor = accessory.color
              ? hexToColor(accessory.color)
              : { r: 0.5, g: 0.5, b: 0.5 };

            // Determine material type based on accessory type - all use pixelated textures
            let accessoryMaterial: any;
            if (accessory.type === 'glasses') {
              // Metal accessories with pixelated texture
              accessoryMaterial = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(accessoryColor, 8),
                color: new THREE.Color(accessoryColor.r, accessoryColor.g, accessoryColor.b),
                roughness: 0.2,
                metalness: 0.9
              });
            } else if (accessory.type === 'hat' || accessory.type === 'shirt' || accessory.type === 'pants' || accessory.type === 'shoes') {
              // Fabric accessories with pixelated texture
              accessoryMaterial = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(accessoryColor, 8),
                color: new THREE.Color(accessoryColor.r, accessoryColor.g, accessoryColor.b),
                roughness: 0.6,
                metalness: 0.1
              });
            } else {
              // Default material with pixelated texture
              accessoryMaterial = new THREE.MeshStandardMaterial({
                map: createPixelatedTexture(accessoryColor, 8),
                color: new THREE.Color(accessoryColor.r, accessoryColor.g, accessoryColor.b),
                roughness: 0.5,
                metalness: 0.3
              });
            }

            let accessoryMesh: any;

            switch (accessory.type) {
              case 'chain':
                // Create necklace chain around neck - better design
                const chainGroup = new THREE.Group();
                const chainColor = hexToColor(accessory.color || '#FFD700');
                const chainMat = new THREE.MeshStandardMaterial({
                  map: createPixelatedTexture(chainColor, 8),
                  color: new THREE.Color(chainColor.r, chainColor.g, chainColor.b),
                  roughness: 0.2,
                  metalness: 0.9
                });

                // Create necklace chain - positioned around the neck area (Roblox style)
                const numLinks = 16;
                for (let i = 0; i < numLinks; i++) {
                  const angle = (i / numLinks) * Math.PI * 2;
                  const linkGeometry = new THREE.TorusGeometry(0.06, 0.025, 8, 16);
                  const link = new THREE.Mesh(linkGeometry, chainMat);
                  // Position in circular shape around neck (at y position 1.8, which is neck level)
                  const radius = 0.45;
                  link.position.set(
                    Math.cos(angle) * radius,
                    1.8, // Neck level - matches the head position (2.1) minus head radius
                    Math.sin(angle) * radius * 0.6 // Slightly oval to fit neck shape
                  );
                  link.rotation.x = Math.PI / 2;
                  link.rotation.z = angle;
                  chainGroup.add(link);
                }
                // Add pendant in front (hanging down from chain)
                const pendantGeometry = createRoundedBox(0.12, 0.18, 0.04, 0.02);
                const pendant = new THREE.Mesh(pendantGeometry, chainMat);
                pendant.position.set(0, 1.5, 0.4); // In front of chest, hanging down
                chainGroup.add(pendant);
                characterGroup.add(chainGroup);
                accessoryMesh = chainGroup as any;
                break;
              case 'hat':
                // Check if it's a wizard hat
                const isWizardHat = accessory.name?.toLowerCase().includes('wizard') || accessory.id?.includes('wizard');

                if (isWizardHat) {
                  // WIZARD HAT - Triangular with bending point at top
                  const hatGroup = new THREE.Group();
                  const hatColor = hexToColor(accessory.color || '#4B0082');
                  const hatMainMat = new THREE.MeshStandardMaterial({
                    map: createPixelatedTexture(hatColor),
                    color: new THREE.Color(hatColor.r, hatColor.g, hatColor.b),
                    roughness: 0.6,
                    metalness: 0.1
                  });

                  // Base brim (wide circular base)
                  const hatBrim = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 16);
                  const hatBrimMesh = new THREE.Mesh(hatBrim, hatMainMat);
                  hatBrimMesh.position.set(0, 2.75, 0);
                  hatGroup.add(hatBrimMesh);

                  // Main triangular cone body - tall and pointy
                  const hatCone = new THREE.ConeGeometry(0.5, 1.2, 8);
                  const hatConeMesh = new THREE.Mesh(hatCone, hatMainMat);
                  hatConeMesh.position.set(0, 3.35, 0);
                  hatGroup.add(hatConeMesh);

                  // Bending point at the top - create a bent section
                  // Use a smaller cone rotated to create the bend
                  const bentTip = new THREE.ConeGeometry(0.15, 0.3, 8);
                  const bentTipMesh = new THREE.Mesh(bentTip, hatMainMat);
                  bentTipMesh.rotation.z = -0.4; // Bend to the side
                  bentTipMesh.position.set(0.1, 4.0, 0); // Position at the very top, slightly offset
                  hatGroup.add(bentTipMesh);

                  // Star or decoration at the tip (optional)
                  const starMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(1, 1, 0), // Yellow
                    emissive: new THREE.Color(0.5, 0.5, 0),
                    roughness: 0.3,
                    metalness: 0.5
                  });
                  const star = new THREE.OctahedronGeometry(0.08, 0);
                  const starMesh = new THREE.Mesh(star, starMat);
                  starMesh.position.set(0.15, 4.15, 0);
                  starMesh.rotation.x = Math.PI / 4;
                  hatGroup.add(starMesh);

                  characterGroup.add(hatGroup);
                  accessoryMesh = hatGroup as any;
                } else {
                  // Regular Roblox-style cap
                  const hatGroup = new THREE.Group();
                  const hatColor = hexToColor(accessory.color || '#FF0000');
                  const hatMainMat = new THREE.MeshStandardMaterial({
                    map: createPixelatedTexture(hatColor, 8),
                    color: new THREE.Color(hatColor.r, hatColor.g, hatColor.b),
                    roughness: 0.6,
                    metalness: 0.1
                  });

                  // Brim (bottom part)
                  const hatBrim = new THREE.CylinderGeometry(0.75, 0.75, 0.12, 16);
                  const hatBrimMesh = new THREE.Mesh(hatBrim, hatMainMat);
                  hatBrimMesh.position.set(0, 2.75, 0);
                  hatGroup.add(hatBrimMesh);

                  // Top part (crown)
                  const hatTop = new THREE.CylinderGeometry(0.5, 0.65, 0.35, 16);
                  const hatTopMesh = new THREE.Mesh(hatTop, hatMainMat);
                  hatTopMesh.position.set(0, 2.95, 0);
                  hatGroup.add(hatTopMesh);

                  // Visor (front part)
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
                  visor.position.set(0, 2.7, 0.25);
                  hatGroup.add(visor);

                  characterGroup.add(hatGroup);
                  accessoryMesh = hatGroup as any;
                }
                break;
              case 'glasses':
                // Better sunglasses design with frame and lenses
                const glassesGroup = new THREE.Group();
                const frameColor = hexToColor(accessory.color || '#000000');
                const frameMaterial = new THREE.MeshStandardMaterial({
                  map: createPixelatedTexture(frameColor, 8),
                  color: new THREE.Color(frameColor.r, frameColor.g, frameColor.b),
                  roughness: 0.3,
                  metalness: 0.7
                });

                // Frame bridge (rounded)
                const bridgeGeometry = createRoundedBox(0.15, 0.08, 0.06, 0.01);
                const bridge = new THREE.Mesh(bridgeGeometry, frameMaterial);
                bridge.position.set(0, 2.15, 0.62);
                glassesGroup.add(bridge);

                // Left frame (rounded)
                const leftFrameGeometry = createRoundedBox(0.5, 0.35, 0.06, 0.02);
                const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
                leftFrame.position.set(-0.35, 2.15, 0.62);
                glassesGroup.add(leftFrame);

                // Right frame (rounded)
                const rightFrameGeometry = createRoundedBox(0.5, 0.35, 0.06, 0.02);
                const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
                rightFrame.position.set(0.35, 2.15, 0.62);
                glassesGroup.add(rightFrame);

                // Temples (arms) (rounded)
                const leftTemple = createRoundedBox(0.4, 0.06, 0.06, 0.01);
                const leftTempleMesh = new THREE.Mesh(leftTemple, frameMaterial);
                leftTempleMesh.rotation.y = -0.3;
                leftTempleMesh.position.set(-0.65, 2.15, 0.5);
                glassesGroup.add(leftTempleMesh);

                const rightTemple = createRoundedBox(0.4, 0.06, 0.06, 0.01);
                const rightTempleMesh = new THREE.Mesh(rightTemple, frameMaterial);
                rightTempleMesh.rotation.y = 0.3;
                rightTempleMesh.position.set(0.65, 2.15, 0.5);
                glassesGroup.add(rightTempleMesh);

                // Lenses with tint
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
                leftLensMesh.position.set(-0.35, 2.15, 0.64);
                glassesGroup.add(leftLensMesh);

                const rightLens = createRoundedBox(0.45, 0.32, 0.04, 0.02);
                const rightLensMesh = new THREE.Mesh(rightLens, lensMaterial);
                rightLensMesh.position.set(0.35, 2.15, 0.64);
                glassesGroup.add(rightLensMesh);

                characterGroup.add(glassesGroup);
                accessoryMesh = glassesGroup as any;
                break;
              case 'shirt':
                // Better shirt design with sleeves and collar
                const shirtGroup = new THREE.Group();
                const shirtColor = hexToColor(accessory.color || '#FF0000');
                const shirtMat = new THREE.MeshStandardMaterial({
                  map: createPixelatedTexture(shirtColor),
                  color: new THREE.Color(shirtColor.r, shirtColor.g, shirtColor.b),
                  roughness: 0.7,
                  metalness: 0.1
                });

                // Main shirt body (rounded)
                const shirtBody = createRoundedBox(1.7, 1.9, 0.9, 0.08);
                const shirtBodyMesh = new THREE.Mesh(shirtBody, shirtMat);
                shirtBodyMesh.position.set(0, 0.9, 0.06);
                shirtGroup.add(shirtBodyMesh);

                // Collar (rounded)
                const collarColor = hexToColor(accessory.color || '#FFFFFF');
                const collarMat = new THREE.MeshStandardMaterial({
                  color: new THREE.Color(collarColor.r * 1.2, collarColor.g * 1.2, collarColor.b * 1.2),
                  roughness: 0.6
                });
                const collarGeometry = createRoundedBox(0.4, 0.2, 0.1, 0.02);
                const collar = new THREE.Mesh(collarGeometry, collarMat);
                collar.position.set(0, 1.7, 0.5);
                shirtGroup.add(collar);

                // Sleeves (rounded)
                const leftSleeve = createRoundedBox(0.6, 1.8, 0.6, 0.06);
                const leftSleeveMesh = new THREE.Mesh(leftSleeve, shirtMat);
                leftSleeveMesh.position.set(-1.2, 0.9, 0);
                shirtGroup.add(leftSleeveMesh);

                const rightSleeve = createRoundedBox(0.6, 1.8, 0.6, 0.06);
                const rightSleeveMesh = new THREE.Mesh(rightSleeve, shirtMat);
                rightSleeveMesh.position.set(1.2, 0.9, 0);
                shirtGroup.add(rightSleeveMesh);

                characterGroup.add(shirtGroup);
                accessoryMesh = shirtGroup as any;
                break;
              case 'pants':
                // Better pants design with belt and pockets
                const pantsGroup = new THREE.Group();
                const pantsColor = hexToColor(accessory.color || '#0000FF');
                const pantsMat = new THREE.MeshStandardMaterial({
                  map: createPixelatedTexture(pantsColor),
                  color: new THREE.Color(pantsColor.r, pantsColor.g, pantsColor.b),
                  roughness: 0.7,
                  metalness: 0.1
                });

                // Belt
                const beltColor = hexToColor('#8B4513'); // Brown belt
                const beltMat = new THREE.MeshStandardMaterial({
                  color: new THREE.Color(beltColor.r, beltColor.g, beltColor.b),
                  roughness: 0.5,
                  metalness: 0.3
                });
                const belt = createRoundedBox(1.8, 0.15, 0.1, 0.02);
                const beltMesh = new THREE.Mesh(belt, beltMat);
                beltMesh.position.set(0, -0.2, 0.1);
                pantsGroup.add(beltMesh);

                // Left pant leg (rounded)
                const leftPant = createRoundedBox(0.7, 1.7, 0.7, 0.06);
                const leftPantMesh = new THREE.Mesh(leftPant, pantsMat);
                leftPantMesh.position.set(-0.4, -1.0, 0.06);
                pantsGroup.add(leftPantMesh);

                // Right pant leg (rounded)
                const rightPant = createRoundedBox(0.7, 1.7, 0.7, 0.06);
                const rightPantMesh = new THREE.Mesh(rightPant, pantsMat);
                rightPantMesh.position.set(0.4, -1.0, 0.06);
                pantsGroup.add(rightPantMesh);

                characterGroup.add(pantsGroup);
                accessoryMesh = pantsGroup as any;
                break;
              case 'shoes':
                // Better shoe design with laces and sole - more visible
                const shoesGroup = new THREE.Group();
                const shoeColor = hexToColor(accessory.color || '#FFFFFF');
                const shoeMat = new THREE.MeshStandardMaterial({
                  map: createPixelatedTexture(shoeColor),
                  color: new THREE.Color(shoeColor.r, shoeColor.g, shoeColor.b),
                  roughness: 0.5,
                  metalness: 0.2
                });

                // Sole color (darker)
                const soleColor = hexToColor('#333333');
                const soleMat = new THREE.MeshStandardMaterial({
                  color: new THREE.Color(soleColor.r, soleColor.g, soleColor.b),
                  roughness: 0.8,
                  metalness: 0.1
                });

                // Left shoe (rounded) - positioned more forward and visible
                const leftShoeBody = createRoundedBox(0.75, 0.4, 0.8, 0.05);
                const leftShoeBodyMesh = new THREE.Mesh(leftShoeBody, shoeMat);
                leftShoeBodyMesh.position.set(-0.4, -1.85, 0.25); // More forward (z increased)
                shoesGroup.add(leftShoeBodyMesh);

                const leftSole = createRoundedBox(0.8, 0.12, 0.85, 0.03);
                const leftSoleMesh = new THREE.Mesh(leftSole, soleMat);
                leftSoleMesh.position.set(-0.4, -2.0, 0.25);
                shoesGroup.add(leftSoleMesh);

                // Right shoe (rounded) - positioned more forward and visible
                const rightShoeBody = createRoundedBox(0.75, 0.4, 0.8, 0.05);
                const rightShoeBodyMesh = new THREE.Mesh(rightShoeBody, shoeMat);
                rightShoeBodyMesh.position.set(0.4, -1.85, 0.25); // More forward (z increased)
                shoesGroup.add(rightShoeBodyMesh);

                const rightSole = createRoundedBox(0.8, 0.12, 0.85, 0.03);
                const rightSoleMesh = new THREE.Mesh(rightSole, soleMat);
                rightSoleMesh.position.set(0.4, -2.0, 0.25);
                shoesGroup.add(rightSoleMesh);

                characterGroup.add(shoesGroup);
                accessoryMesh = shoesGroup as any;
                break;
              case 'backpack':
                // Better backpack design with multiple colors
                const backpackGroup = new THREE.Group();
                const backpackColor = hexToColor(accessory.color || '#8B4513');
                const backpackMat = new THREE.MeshStandardMaterial({
                  map: createPixelatedTexture(backpackColor),
                  color: new THREE.Color(backpackColor.r, backpackColor.g, backpackColor.b),
                  roughness: 0.6,
                  metalness: 0.2
                });

                // Main backpack body (rounded) - positioned on back but visible from side
                const backpackBody = createRoundedBox(0.85, 1.3, 0.45, 0.06);
                const backpackBodyMesh = new THREE.Mesh(backpackBody, backpackMat);
                backpackBodyMesh.position.set(0, 0.9, -0.4); // Slightly forward so it's visible
                backpackGroup.add(backpackBodyMesh);

                // Front pocket (different color, rounded)
                const pocketColor = hexToColor(accessory.color || '#654321');
                const pocketMat = new THREE.MeshStandardMaterial({
                  map: createPixelatedTexture({ r: pocketColor.r * 0.7, g: pocketColor.g * 0.7, b: pocketColor.b * 0.7 }),
                  color: new THREE.Color(pocketColor.r * 0.7, pocketColor.g * 0.7, pocketColor.b * 0.7),
                  roughness: 0.5
                });
                const pocket = createRoundedBox(0.7, 0.5, 0.05, 0.03);
                const pocketMesh = new THREE.Mesh(pocket, pocketMat);
                pocketMesh.position.set(0, 1.1, -0.25);
                backpackGroup.add(pocketMesh);

                // Straps (black, rounded)
                const strapMat = new THREE.MeshStandardMaterial({
                  map: createPixelatedTexture({ r: 0.1, g: 0.1, b: 0.1 }),
                  color: new THREE.Color(0.1, 0.1, 0.1),
                  roughness: 0.8
                });
                const leftStrap = createRoundedBox(0.18, 1.1, 0.12, 0.02);
                const leftStrapMesh = new THREE.Mesh(leftStrap, strapMat);
                leftStrapMesh.position.set(-0.35, 0.9, -0.2);
                backpackGroup.add(leftStrapMesh);

                const rightStrap = createRoundedBox(0.18, 1.1, 0.12, 0.02);
                const rightStrapMesh = new THREE.Mesh(rightStrap, strapMat);
                rightStrapMesh.position.set(0.35, 0.9, -0.2);
                backpackGroup.add(rightStrapMesh);

                characterGroup.add(backpackGroup);
                accessoryMesh = backpackGroup as any;
                break;
              case 'wings':
                // Galaxy wings - exact match to image: broad rounded top, pointed feathers at bottom
                const wingsGroup = new THREE.Group();
                const wingColor = hexToColor(accessory.color || '#4B0082');
                
                // Create galaxy texture with stars and sparkles
                const createGalaxyTexture = (baseColor: {r: number, g: number, b: number}) => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d')!;
                  const size = 512;
                  canvas.width = size;
                  canvas.height = size;
                  
                  // Base gradient - dark purple to blue
                  const gradient = ctx.createLinearGradient(0, 0, 0, size);
                  gradient.addColorStop(0, `rgba(${Math.floor(baseColor.r * 180)}, ${Math.floor(baseColor.g * 100)}, ${Math.floor(baseColor.b * 255)}, 1)`);
                  gradient.addColorStop(0.5, `rgba(${Math.floor(baseColor.r * 100)}, ${Math.floor(baseColor.g * 50)}, ${Math.floor(baseColor.b * 200)}, 1)`);
                  gradient.addColorStop(1, `rgba(${Math.floor(baseColor.r * 50)}, ${Math.floor(baseColor.g * 20)}, ${Math.floor(baseColor.b * 100)}, 1)`);
                  ctx.fillStyle = gradient;
                  ctx.fillRect(0, 0, size, size);
                  
                  // Add starry pattern - small white dots
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                  for (let i = 0; i < 200; i++) {
                    const x = Math.random() * size;
                    const y = Math.random() * size;
                    const starSize = Math.random() * 2 + 0.5;
                    ctx.beginPath();
                    ctx.arc(x, y, starSize, 0, Math.PI * 2);
                    ctx.fill();
                  }
                  
                  // Add sparkles - larger four-pointed stars
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

                // Left wing - broad rounded top section
                const leftWingTop = new THREE.Mesh(
                  new THREE.PlaneGeometry(0.9, 0.6, 8, 4),
                  wingMat
                );
                // Shape the top to be rounded
                const leftTopPos = leftWingTop.geometry.attributes.position;
                for (let i = 0; i < leftTopPos.count; i++) {
                  const y = leftTopPos.getY(i);
                  const x = leftTopPos.getX(i);
                  // Create rounded top edge
                  if (y > 0.2) {
                    const curve = Math.sin((y - 0.2) / 0.4 * Math.PI / 2) * 0.1;
                    leftTopPos.setZ(i, curve);
                  }
                }
                leftWingTop.geometry.computeVertexNormals();
                leftWingTop.rotation.y = Math.PI / 2;
                leftWingTop.rotation.z = -0.25;
                leftWingTop.position.set(-0.5, 1.6, -0.2);
                wingsGroup.add(leftWingTop);

                // Left wing - pointed lower feathers (3-4 individual feathers)
                for (let i = 0; i < 4; i++) {
                  const featherLength = 0.4 + i * 0.1;
                  const featherWidth = 0.15 - i * 0.02;
                  const featherGeometry = new THREE.PlaneGeometry(featherWidth, featherLength, 2, 4);
                  // Make it pointed at the bottom
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
                  feather.position.set(-0.4 - i * 0.1, 1.0 - i * 0.2, -0.15 - i * 0.05);
                  wingsGroup.add(feather);
                }

                // Right wing - broad rounded top section
                const rightWingTop = new THREE.Mesh(
                  new THREE.PlaneGeometry(0.9, 0.6, 8, 4),
                  wingMat
                );
                // Shape the top to be rounded
                const rightTopPos = rightWingTop.geometry.attributes.position;
                for (let i = 0; i < rightTopPos.count; i++) {
                  const y = rightTopPos.getY(i);
                  const x = rightTopPos.getX(i);
                  // Create rounded top edge
                  if (y > 0.2) {
                    const curve = Math.sin((y - 0.2) / 0.4 * Math.PI / 2) * 0.1;
                    rightTopPos.setZ(i, curve);
                  }
                }
                rightWingTop.geometry.computeVertexNormals();
                rightWingTop.rotation.y = -Math.PI / 2;
                rightWingTop.rotation.z = 0.25;
                rightWingTop.position.set(0.5, 1.6, -0.2);
                wingsGroup.add(rightWingTop);

                // Right wing - pointed lower feathers (3-4 individual feathers)
                for (let i = 0; i < 4; i++) {
                  const featherLength = 0.4 + i * 0.1;
                  const featherWidth = 0.15 - i * 0.02;
                  const featherGeometry = new THREE.PlaneGeometry(featherWidth, featherLength, 2, 4);
                  // Make it pointed at the bottom
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
                  feather.position.set(0.4 + i * 0.1, 1.0 - i * 0.2, -0.15 - i * 0.05);
                  wingsGroup.add(feather);
                }

                characterGroup.add(wingsGroup);
                accessoryMesh = wingsGroup as any;
                break;
              case 'pet':
                // Roblox-style blocky pet on the ground - Slime, Dog, Cat, or Robot design
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

                  // Main slime body - square block
                  const slimeBody = createRoundedBox(0.5, 0.5, 0.5, 0.05);
                  const slimeBodyMesh = new THREE.Mesh(slimeBody, slimeMat);
                  slimeBodyMesh.position.set(0, 0.25, 0);
                  petGroup.add(slimeBodyMesh);

                  // Slime eyes - simple square dots
                  const eyeMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0, 0, 0), // Black
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

                  // Slime mouth - square
                  const mouthMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0, 0, 0), // Black
                    roughness: 0.5
                  });
                  const mouth = createRoundedBox(0.12, 0.06, 0.06, 0.01);
                  const mouthMesh = new THREE.Mesh(mouth, mouthMat);
                  mouthMesh.position.set(0, 0.15, 0.26);
                  petGroup.add(mouthMesh);

                  // Position slime pet on ground behind character - make it more visible
                  petGroup.position.set(0, -1.3, -1.2);
                  petGroup.userData.isPet = true;
                  characterGroup.add(petGroup);
                  accessoryMesh = petGroup as any;
                } else if (isDog) {
                  // DOG PET - Friendly dog design with pixelated texture
                  const dogMat = new THREE.MeshStandardMaterial({
                    map: createPixelatedTexture(petColor, 8),
                    color: new THREE.Color(petColor.r, petColor.g, petColor.b),
                    roughness: 0.6,
                    metalness: 0.1
                  });

                  // Dog body
                  const dogBody = createRoundedBox(0.5, 0.4, 0.7, 0.08);
                  const dogBodyMesh = new THREE.Mesh(dogBody, dogMat);
                  dogBodyMesh.position.set(0, 0.3, 0);
                  petGroup.add(dogBodyMesh);

                  // Dog head - rounder
                  const dogHead = createRoundedBox(0.4, 0.4, 0.4, 0.06);
                  const dogHeadMesh = new THREE.Mesh(dogHead, dogMat);
                  dogHeadMesh.position.set(0, 0.6, 0.3);
                  petGroup.add(dogHeadMesh);

                  // Dog ears - floppy
                  const earGeometry = createRoundedBox(0.15, 0.2, 0.05, 0.02);
                  const leftEar = new THREE.Mesh(earGeometry, dogMat);
                  leftEar.rotation.z = 0.3;
                  leftEar.position.set(-0.2, 0.65, 0.2);
                  petGroup.add(leftEar);

                  const rightEar = new THREE.Mesh(earGeometry, dogMat);
                  rightEar.rotation.z = -0.3;
                  rightEar.position.set(0.2, 0.65, 0.2);
                  petGroup.add(rightEar);

                  // Dog eyes
                  const eyeMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0.2, 0.2, 0.8), // Blue
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

                  // Dog nose
                  const noseMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0, 0, 0), // Black
                    roughness: 0.5
                  });
                  const nose = createRoundedBox(0.08, 0.06, 0.06, 0.01);
                  const noseMesh = new THREE.Mesh(nose, noseMat);
                  noseMesh.position.set(0, 0.55, 0.42);
                  petGroup.add(noseMesh);

                  // Dog legs - 4 legs
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

                  // Dog tail - wagging tail
                  const tailGeometry = createRoundedBox(0.08, 0.3, 0.08, 0.03);
                  const tail = new THREE.Mesh(tailGeometry, dogMat);
                  tail.rotation.x = Math.PI / 4;
                  tail.position.set(0, 0.3, -0.4);
                  petGroup.add(tail);

                  // Position dog pet on ground behind character
                  petGroup.position.set(0, -1.6, -1.5);
                  petGroup.userData.isPet = true;
                  characterGroup.add(petGroup);
                  accessoryMesh = petGroup as any;
                } else if (isRobot) {
                  // ROBOT PET - More robotic with pixelated texture, joints, and details
                  const robotMat = new THREE.MeshStandardMaterial({
                    map: createPixelatedTexture(petColor, 8),
                    color: new THREE.Color(petColor.r, petColor.g, petColor.b),
                    roughness: 0.3,
                    metalness: 0.8
                  });

                  // Robot body - larger block with panel details
                  const robotBody = createRoundedBox(0.6, 0.5, 0.5, 0.08);
                  const robotBodyMesh = new THREE.Mesh(robotBody, robotMat);
                  robotBodyMesh.position.set(0, 0.3, 0);
                  petGroup.add(robotBodyMesh);

                  // Robot chest panel
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

                  // Robot head - square block
                  const robotHead = createRoundedBox(0.4, 0.4, 0.4, 0.06);
                  const robotHeadMesh = new THREE.Mesh(robotHead, robotMat);
                  robotHeadMesh.position.set(0, 0.65, 0.1);
                  petGroup.add(robotHeadMesh);

                  // Robot eyes - glowing with pixelated texture
                  const eyeMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0, 1, 1), // Cyan
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

                  // Robot antenna with ball on top
                  const antenna = createRoundedBox(0.05, 0.15, 0.05, 0.02);
                  const antennaMesh = new THREE.Mesh(antenna, robotMat);
                  antennaMesh.position.set(0, 0.9, 0);
                  petGroup.add(antennaMesh);
<<<<<<< HEAD
                  const antennaBall = new THREE.SphereGeometry(0.06, isHighPoly ? 16 : 8, isHighPoly ? 16 : 8);
=======
                  const antennaBall = new THREE.SphereGeometry(0.06, 8, 8);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
                  const antennaBallMesh = new THREE.Mesh(antennaBall, eyeMat);
                  antennaBallMesh.position.set(0, 0.98, 0);
                  petGroup.add(antennaBallMesh);

                  // Robot shoulders (joints)
                  const jointMat = new THREE.MeshStandardMaterial({
                    map: createPixelatedTexture({ r: petColor.r * 0.5, g: petColor.g * 0.5, b: petColor.b * 0.5 }, 8),
                    color: new THREE.Color(petColor.r * 0.5, petColor.g * 0.5, petColor.b * 0.5),
                    roughness: 0.1,
                    metalness: 0.9
                  });
<<<<<<< HEAD
                  const leftShoulder = new THREE.SphereGeometry(0.12, isHighPoly ? 16 : 8, isHighPoly ? 16 : 8);
=======
                  const leftShoulder = new THREE.SphereGeometry(0.12, 8, 8);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
                  const leftShoulderMesh = new THREE.Mesh(leftShoulder, jointMat);
                  leftShoulderMesh.position.set(-0.35, 0.5, 0);
                  petGroup.add(leftShoulderMesh);

<<<<<<< HEAD
                  const rightShoulder = new THREE.SphereGeometry(0.12, isHighPoly ? 16 : 8, isHighPoly ? 16 : 8);
=======
                  const rightShoulder = new THREE.SphereGeometry(0.12, 8, 8);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
                  const rightShoulderMesh = new THREE.Mesh(rightShoulder, jointMat);
                  rightShoulderMesh.position.set(0.35, 0.5, 0);
                  petGroup.add(rightShoulderMesh);

                  // Robot arms
                  const armGeometry = createRoundedBox(0.15, 0.4, 0.15, 0.04);
                  const leftArm = new THREE.Mesh(armGeometry, robotMat);
                  leftArm.position.set(-0.35, 0.2, 0);
                  petGroup.add(leftArm);

                  const rightArm = new THREE.Mesh(armGeometry, robotMat);
                  rightArm.position.set(0.35, 0.2, 0);
                  petGroup.add(rightArm);

                  // Robot elbows (joints)
<<<<<<< HEAD
                  const leftElbow = new THREE.SphereGeometry(0.1, isHighPoly ? 16 : 8, isHighPoly ? 16 : 8);
=======
                  const leftElbow = new THREE.SphereGeometry(0.1, 8, 8);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
                  const leftElbowMesh = new THREE.Mesh(leftElbow, jointMat);
                  leftElbowMesh.position.set(-0.35, 0, 0);
                  petGroup.add(leftElbowMesh);

<<<<<<< HEAD
                  const rightElbow = new THREE.SphereGeometry(0.1, isHighPoly ? 16 : 8, isHighPoly ? 16 : 8);
=======
                  const rightElbow = new THREE.SphereGeometry(0.1, 8, 8);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
                  const rightElbowMesh = new THREE.Mesh(rightElbow, jointMat);
                  rightElbowMesh.position.set(0.35, 0, 0);
                  petGroup.add(rightElbowMesh);

                  // Robot legs
                  const legGeometry = createRoundedBox(0.15, 0.35, 0.15, 0.04);
                  const leftLeg = new THREE.Mesh(legGeometry, robotMat);
                  leftLeg.position.set(-0.2, -0.1, 0);
                  petGroup.add(leftLeg);

                  const rightLeg = new THREE.Mesh(legGeometry, robotMat);
                  rightLeg.position.set(0.2, -0.1, 0);
                  petGroup.add(rightLeg);

                  // Robot hips (joints)
<<<<<<< HEAD
                  const leftHip = new THREE.SphereGeometry(0.1, isHighPoly ? 16 : 8, isHighPoly ? 16 : 8);
=======
                  const leftHip = new THREE.SphereGeometry(0.1, 8, 8);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
                  const leftHipMesh = new THREE.Mesh(leftHip, jointMat);
                  leftHipMesh.position.set(-0.2, 0.15, 0);
                  petGroup.add(leftHipMesh);

<<<<<<< HEAD
                  const rightHip = new THREE.SphereGeometry(0.1, isHighPoly ? 16 : 8, isHighPoly ? 16 : 8);
=======
                  const rightHip = new THREE.SphereGeometry(0.1, 8, 8);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
                  const rightHipMesh = new THREE.Mesh(rightHip, jointMat);
                  rightHipMesh.position.set(0.2, 0.15, 0);
                  petGroup.add(rightHipMesh);

                  // Position robot pet on ground behind character - make it more visible
                  petGroup.position.set(0, -1.3, -1.2);
                  petGroup.userData.isPet = true;
                  characterGroup.add(petGroup);
                  accessoryMesh = petGroup as any;
                } else {
                  // CAT PET - Bigger, cat-like design
                  const catMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(petColor.r, petColor.g, petColor.b),
                    roughness: 0.6,
                    metalness: 0.1
                  });

                  // Cat body - larger, more cat-like proportions
                  const catBody = createRoundedBox(0.5, 0.35, 0.6, 0.08);
                  const catBodyMesh = new THREE.Mesh(catBody, catMat);
                  catBodyMesh.position.set(0, 0.25, 0);
                  petGroup.add(catBodyMesh);

                  // Cat head - rounder, bigger
                  const catHead = createRoundedBox(0.35, 0.35, 0.35, 0.06);
                  const catHeadMesh = new THREE.Mesh(catHead, catMat);
                  catHeadMesh.position.set(0, 0.55, 0.25);
                  petGroup.add(catHeadMesh);

                  // Cat ears - pointed triangles (made with boxes)
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

                  // Cat eyes
                  const eyeMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0.2, 0.8, 0.2), // Green
                    emissive: new THREE.Color(0, 0.2, 0),
                    roughness: 0.3
                  });
                  const leftEye = createRoundedBox(0.1, 0.08, 0.05, 0.02);
                  const leftEyeMesh = new THREE.Mesh(leftEye, eyeMat);
                  leftEyeMesh.position.set(-0.1, 0.55, 0.4);
                  petGroup.add(leftEyeMesh);

                  const rightEye = createRoundedBox(0.1, 0.08, 0.05, 0.02);
                  const rightEyeMesh = new THREE.Mesh(rightEye, eyeMat);
                  rightEyeMesh.position.set(0.1, 0.55, 0.4);
                  petGroup.add(rightEyeMesh);

                  // Cat nose
                  const noseMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(1, 0.5, 0.8), // Pink
                    roughness: 0.5
                  });
                  const nose = createRoundedBox(0.06, 0.04, 0.04, 0.01);
                  const noseMesh = new THREE.Mesh(nose, noseMat);
                  noseMesh.position.set(0, 0.5, 0.42);
                  petGroup.add(noseMesh);

                  // Cat legs - 4 legs
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

                  // Cat tail - longer, curved
                  const tailGeometry = createRoundedBox(0.08, 0.25, 0.08, 0.03);
                  const tail = new THREE.Mesh(tailGeometry, catMat);
                  tail.rotation.x = Math.PI / 3;
                  tail.rotation.z = 0.3;
                  tail.position.set(0, 0.3, -0.35);
                  tail.userData.isTail = true;
                  petGroup.add(tail);

                  // Position cat pet on ground behind character - make it more visible
                  petGroup.position.set(0, -1.3, -1.2);
                  petGroup.userData.isPet = true;
                  characterGroup.add(petGroup);
                  accessoryMesh = petGroup as any;
                }
                break;
<<<<<<< HEAD
              case 'drone':
                // Floating drone accessory above player - supports GLTF models
                const droneGroup = new THREE.Group();
                const floatHeight = accessory.floatHeight || 3.0; // Default 3 units above player
                const rotationSpeed = accessory.rotationSpeed || 0.5;
                
                // Helper function for fallback drone (defined first)
                const createDroneFallback = (group: any, acc: any) => {
                  const droneColor = hexToColor(acc.color || '#1a1a2e');
                  const droneMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(droneColor.r, droneColor.g, droneColor.b),
                    metalness: 0.9,
                    roughness: 0.2,
                    emissive: new THREE.Color(0, 0.3, 0.6),
                    emissiveIntensity: 0.5
                  });
                  
                  // Main body
                  const body = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.3, 0.8),
                    droneMat
                  );
                  group.add(body);
                  
                  // 4 rotors
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
                    group.add(rotor);
                  }
                };
                
                // Load GLTF model if modelUrl is provided
                if (accessory.modelUrl) {
                  import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
                    const loader = new GLTFLoader();
                    loader.load(
                      accessory.modelUrl!,
                      (gltf) => {
                        if (!isMounted || !droneGroup) return;
                        
                        const model = gltf.scene;
                        
                        // Scale model appropriately
                        const scale = accessory.scale || 1.0;
                        model.scale.set(scale, scale, scale);
                        
                        // Center the model
                        const box = new THREE.Box3().setFromObject(model);
                        const center = box.getCenter(new THREE.Vector3());
                        model.position.sub(center);
                        
                        droneGroup.add(model);
                      },
                      undefined,
                      (error) => {
                        console.error('Error loading drone GLTF:', error);
                        // Fallback to simple representation
                        createDroneFallback(droneGroup, accessory);
                      }
                    );
                  }).catch(() => {
                    // Fallback if GLTFLoader fails to import
                    createDroneFallback(droneGroup, accessory);
                  });
                } else {
                  // Create simple drone representation
                  createDroneFallback(droneGroup, accessory);
                }
                
                // Position drone floating above player
                droneGroup.position.set(0, floatHeight, 0);
                droneGroup.userData.isDrone = true;
                droneGroup.userData.rotationSpeed = rotationSpeed;
                droneGroup.userData.floatHeight = floatHeight;
                
                // Add floating animation
                const floatTime = { value: 0 };
                const animateFloat = () => {
                  if (!isMounted || !droneGroup) return;
                  floatTime.value += 0.02;
                  // Gentle floating motion
                  droneGroup.position.y = floatHeight + Math.sin(floatTime.value) * 0.2;
                  // Slow rotation
                  droneGroup.rotation.y += rotationSpeed * 0.01;
                };
                
                // Store animation function
                droneGroup.userData.animateFloat = animateFloat;
                
                characterGroup.add(droneGroup);
                accessoryMesh = droneGroup as any;
                break;
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
              default:
                const defaultGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                accessoryMesh = new THREE.Mesh(defaultGeometry, accessoryMaterial);
                if (accessory.position) {
                  accessoryMesh.position.set(
                    accessory.position.x,
                    accessory.position.y,
                    accessory.position.z
                  );
                }
                characterGroup.add(accessoryMesh);
            }
          });
        }

        rendererRef.current = renderer;
        sceneRef.current = scene;
        cameraRef.current = camera;
        characterGroupRef.current = characterGroup;

        // Animation function
<<<<<<< HEAD
        const signalReady = () => {
          if (!readySignalRef.current) {
            readySignalRef.current = true;
            onReadyRef.current?.();
          }
        };

=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);
          animationTime += 0.016; // ~60fps

<<<<<<< HEAD
          // Animate floating drones
          characterGroup.children.forEach((child: any) => {
            if (child.userData?.isDrone && child.userData?.animateFloat) {
              child.userData.animateFloat();
            }
          });

=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
          // Apply rotation based on mouse position
          if (interactive && isHovered) {
            const targetRotationY = mousePositionRef.current.x * Math.PI;
            const targetRotationX = mousePositionRef.current.y * 0.3;

            rotationRef.current.y += (targetRotationY - rotationRef.current.y) * 0.1;
            rotationRef.current.x += (targetRotationX - rotationRef.current.x) * 0.1;

            characterGroup.rotation.y = rotationRef.current.y;
            characterGroup.rotation.x = rotationRef.current.x;
          } else {
            // Smooth return to center - no automatic rotation for accessories
            rotationRef.current.y *= 0.95;
            rotationRef.current.x *= 0.95;
            characterGroup.rotation.y = rotationRef.current.y;
            characterGroup.rotation.x = rotationRef.current.x;
          }

          // Animate pets (walking/following animation on ground)
          characterGroup.children.forEach((child: any) => {
            if (child.userData?.isPet) {
              // Slight bobbing motion as if walking on ground
              child.position.y = -1.8 + Math.sin(animationTime * 4) * 0.05;
              // Tail wagging
              child.children.forEach((petPart: any) => {
                if (petPart.userData?.isTail) {
                  petPart.rotation.x = Math.PI / 3 + Math.sin(animationTime * 6) * 0.3;
                }
              });
              // Slight head movement
              const head = child.children.find((c: any) => c.position.y > 0.3 && c.position.z > 0.2);
              if (head) {
                head.rotation.y = Math.sin(animationTime * 2) * 0.1;
              }
            }
          });

          // Apply animations
          if (animation === 'idle') {
            // Gentle idle animation
            head.position.y = 2.1 + Math.sin(animationTime * 2) * 0.02;
            leftArm.rotation.x = Math.sin(animationTime * 1.5) * 0.1;
            rightArm.rotation.x = -Math.sin(animationTime * 1.5) * 0.1;
            // Reset other parts
            leftLeg.rotation.x = 0;
            rightLeg.rotation.x = 0;
            rightArm.rotation.z = 0;
            characterGroup.position.y = 0;
          } else if (animation === 'walk') {
            // Walking animation
            leftLeg.rotation.x = Math.sin(animationTime * 4) * 0.3;
            rightLeg.rotation.x = -Math.sin(animationTime * 4) * 0.3;
            leftArm.rotation.x = -Math.sin(animationTime * 4) * 0.3;
            rightArm.rotation.x = Math.sin(animationTime * 4) * 0.3;
            characterGroup.position.y = Math.abs(Math.sin(animationTime * 4)) * 0.1;
            // Reset head
            head.position.y = 2.1;
            rightArm.rotation.z = 0;
          } else if (animation === 'wave') {
            // Waving animation
            rightArm.rotation.x = -Math.PI / 2 + Math.sin(animationTime * 3) * 0.5;
            rightArm.rotation.z = Math.sin(animationTime * 3) * 0.3;
            // Reset other parts
            head.position.y = 2.1;
            leftArm.rotation.x = 0;
            leftLeg.rotation.x = 0;
            rightLeg.rotation.x = 0;
            characterGroup.position.y = 0;
          } else {
            // Default: reset all
            head.position.y = 2.1;
            leftArm.rotation.x = 0;
            rightArm.rotation.x = 0;
            rightArm.rotation.z = 0;
            leftLeg.rotation.x = 0;
            rightLeg.rotation.x = 0;
            characterGroup.position.y = 0;
          }

          renderer.render(scene, camera);
<<<<<<< HEAD
          signalReady();
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        };

        animate();
      } catch (error) {
        console.error('Error in Avatar3DViewer:', error);
<<<<<<< HEAD
        onErrorRef.current?.(error as Error);
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        if (canvasRef.current) {
          canvasRef.current.style.display = 'none';
        }
      }
    }).catch((error) => {
      console.error('Failed to load Three.js:', error);
<<<<<<< HEAD
      onErrorRef.current?.(error as Error);
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
      if (canvasRef.current) {
        canvasRef.current.style.display = 'none';
      }
    });

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        try {
          rendererRef.current.dispose();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [skin, width, height, interactive, animation, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Map to -1 to 1 range, centered
    mousePositionRef.current = {
      x: (x - 0.5) * 2,
      y: (y - 0.5) * 2
    };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mousePositionRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={mountRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        cursor: interactive ? 'grab' : 'default',
        userSelect: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}
