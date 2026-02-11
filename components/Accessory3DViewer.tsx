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
          }          default:
            // Default accessory display
            const defaultAccessory = new THREE.Mesh(
              createRoundedBox(0.6, 0.6, 0.6, 0.05),
              accessoryMat
            );
            accessoryGroup.add(defaultAccessory);
        }

<<<<<<< HEAD
        // Helper function for default accessory creation (used in error fallback)
        const createDefaultAccessory = () => {
          if (!accessoryGroup) return;
          const defaultAccessory = new THREE.Mesh(
            createRoundedBox(0.6, 0.6, 0.6, 0.05),
            accessoryMat
          );
          accessoryGroup.add(defaultAccessory);
        };

=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
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

