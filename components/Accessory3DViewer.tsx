'use client';

import { useEffect, useRef, useState } from 'react';
import { Accessory } from '@/types';
import { createTextureByStyle } from '@/lib/threeTextures';

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
          alpha: true,
          powerPreference: 'high-performance'
        });
        rendererRef.current = renderer;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        if (THREE.ACESFilmicToneMapping !== undefined) {
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1;
        }
        if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
          renderer.outputEncoding = THREE.sRGBEncoding;
        }

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 0, 3);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(3, 5, 4);
        scene.add(directionalLight);
        const fillLight = new THREE.DirectionalLight(0xe8f4ff, 0.35);
        fillLight.position.set(-2, 2, -2);
        scene.add(fillLight);

        const type = (accessory.type || 'default').toLowerCase();
        const accTextureStyle = (accessory as any).textureStyle || (type === 'glasses' || type === 'chain' ? 'metal' : type === 'shoes' ? 'leather' : ['shirt', 'pants', 'hat', 'backpack'].includes(type) ? 'fabric' : 'pixelated');
        const canvasToTex = (canvas: HTMLCanvasElement) => {
          const tex = new THREE.CanvasTexture(canvas);
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestFilter;
          if ('colorSpace' in tex && THREE.SRGBColorSpace) (tex as any).colorSpace = THREE.SRGBColorSpace;
          else if ('encoding' in tex && THREE.sRGBEncoding) (tex as any).encoding = THREE.sRGBEncoding;
          return tex;
        };

        const accColor = hexToColor(accessory.color || '#ffffff');
        const accMat = new THREE.MeshStandardMaterial({
          map: canvasToTex(createTextureByStyle(accTextureStyle, accColor, 512, 8)),
          color: new THREE.Color(accColor.r, accColor.g, accColor.b),
          roughness: 0.6,
          metalness: 0.2
        });

        accessoryGroup = new THREE.Group();
        if (accessory.modelUrl && GLTFLoader) {
          const loader = new GLTFLoader();
          loader.load(
            accessory.modelUrl,
            (gltf: any) => {
              if (!isMounted || !accessoryGroup) return;
              const model = gltf.scene;
              const scale = (accessory as any).scale ?? 1;
              model.scale.set(scale, scale, scale);
              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              model.position.sub(center);
              accessoryGroup.add(model);
            },
            undefined,
            () => { createFallbackMesh(); }
          );
        } else {
          createFallbackMesh();
        }

        function createFallbackMesh() {
          if (!accessoryGroup || !THREE) return;
          let mesh: any;
          switch (type) {
            case 'hat':
              mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16), accMat);
              mesh.position.y = 0.4;
              break;
            case 'glasses':
              mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.1), accMat);
              mesh.position.z = 0.35;
              break;
            case 'chain':
              mesh = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 8, 16), accMat);
              mesh.rotation.x = Math.PI / 2;
              break;
            case 'shirt':
              mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 0.5), accMat);
              break;
            case 'pants':
              mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.5), accMat);
              mesh.position.y = -0.4;
              break;
            case 'shoes':
              mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.4), accMat);
              mesh.position.y = -0.55;
              break;
            case 'backpack':
              mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), accMat);
              mesh.position.z = -0.35;
              break;
            default:
              mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), accMat);
          }
          if (mesh) {
            mesh.castShadow = true;
            accessoryGroup.add(mesh);
          }
        }

        scene.add(accessoryGroup);
        accessoryGroupRef.current = accessoryGroup;

        const animate = () => {
          if (!isMounted || !accessoryGroup) return;
          if (interactive && isHovered) {
            accessoryGroup.rotation.y = rotationRef.current.y;
            accessoryGroup.rotation.x = rotationRef.current.x;
          } else {
            accessoryGroup.rotation.y += 0.01;
          }
          renderer.render(scene, camera);
        };

        renderer.setAnimationLoop(animate);

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
      if (rendererRef.current) {
        try {
          rendererRef.current.setAnimationLoop(null);
          rendererRef.current.dispose();
        } catch (e) { /* ignore */ }
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
            else obj.material.dispose();
          }
        });
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

