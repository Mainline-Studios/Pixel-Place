'use client';

import { useEffect, useRef } from 'react';

interface BlenderAnimationViewerProps {
  modelUrl: string;
  width?: number;
  height?: number;
  onReady?: () => void;
  onError?: (message: string) => void;
}

export default function BlenderAnimationViewer({
  modelUrl,
  width = 320,
  height = 320,
  onReady,
  onError,
}: BlenderAnimationViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let isMounted = true;
    let frameId: number | null = null;
    let renderer: any = null;
    let mixer: any = null;

    Promise.all([import('three'), import('three/examples/jsm/loaders/GLTFLoader.js')])
      .then(([THREE, { GLTFLoader }]) => {
        if (!isMounted || !canvasRef.current) return;
        const scene = new THREE.Scene();
        scene.background = null;
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
        camera.position.set(0, 1.5, 4.2);
        camera.lookAt(0, 1.2, 0);

        renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.15));
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(2.5, 5, 3);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x9ed0ff, 0.45);
        rim.position.set(-3, 2, -4);
        scene.add(rim);

        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            if (!isMounted) return;
            const root = gltf.scene;
            root.position.set(0, -1.2, 0);
            scene.add(root);

            if (Array.isArray(gltf.animations) && gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(root);
              gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.enabled = true;
                action.play();
              });
            }

            onReady?.();
          },
          undefined,
          (err) => {
            if (!isMounted) return;
            onError?.(`Could not load ${modelUrl}.`);
            console.error('BlenderAnimationViewer load error:', err);
          },
        );

        const clock = new THREE.Clock();
        const animate = () => {
          if (!isMounted) return;
          const dt = clock.getDelta();
          if (mixer) mixer.update(dt);
          renderer.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };
        animate();
      })
      .catch((err) => {
        if (!isMounted) return;
        onError?.('Failed to initialize 3D animation viewer.');
        console.error('BlenderAnimationViewer init error:', err);
      });

    return () => {
      isMounted = false;
      if (frameId) cancelAnimationFrame(frameId);
      if (renderer) renderer.dispose();
    };
  }, [modelUrl, width, height, onReady, onError]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

