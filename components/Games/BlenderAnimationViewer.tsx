'use client';

import { useEffect, useRef } from 'react';

interface BlenderAnimationViewerProps {
  modelUrl: string;
  width?: number;
  height?: number;
  enableControls?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
}

export default function BlenderAnimationViewer({
  modelUrl,
  width = 320,
  height = 320,
  enableControls = false,
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
    let avatarRoot: any = null;
    let baseY = 0;
    let cleanupKeys = () => {};
    const pressed = new Set<string>();
    let jumpVelocity = 0;
    let yOffset = 0;

    Promise.all([import('three'), import('three/examples/jsm/loaders/GLTFLoader.js')])
      .then(([THREE, { GLTFLoader }]) => {
        if (!isMounted || !canvasRef.current) return;
        const scene = new THREE.Scene();
        scene.background = null;
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        camera.position.set(0, 1.7, 5.2);
        camera.lookAt(0, 1.25, 0);

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
            avatarRoot = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(avatarRoot);
            const size = bbox.getSize(new THREE.Vector3());
            const center = bbox.getCenter(new THREE.Vector3());
            const targetHeight = 3.2;
            const scale = size.y > 0 ? targetHeight / size.y : 1;
            avatarRoot.scale.setScalar(scale);
            avatarRoot.position.set(-center.x * scale, -bbox.min.y * scale - 0.05, -center.z * scale);
            baseY = avatarRoot.position.y;
            scene.add(avatarRoot);

            if (Array.isArray(gltf.animations) && gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(avatarRoot);
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
          if (enableControls && avatarRoot) {
            const walkSpeed = 2.2;
            const turnSpeed = 2.8;
            if (pressed.has('a')) avatarRoot.rotation.y += turnSpeed * dt;
            if (pressed.has('d')) avatarRoot.rotation.y -= turnSpeed * dt;

            const forward = Number(pressed.has('w')) - Number(pressed.has('s'));
            if (forward !== 0) {
              avatarRoot.position.x += Math.sin(avatarRoot.rotation.y) * walkSpeed * forward * dt;
              avatarRoot.position.z += Math.cos(avatarRoot.rotation.y) * walkSpeed * forward * dt;
            }

            jumpVelocity -= 9.8 * dt;
            yOffset = Math.max(0, yOffset + jumpVelocity * dt);
            if (yOffset === 0 && jumpVelocity < 0) jumpVelocity = 0;
            avatarRoot.position.y = baseY + yOffset;
          }
          renderer.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };
        animate();

        const onKeyDown = (event: KeyboardEvent) => {
          if (!enableControls) return;
          const key = event.key.toLowerCase();
          if (!['w', 'a', 's', 'd', ' '].includes(key)) return;
          event.preventDefault();
          if (key === ' ' && enableControls && yOffset === 0) {
            jumpVelocity = 4.1;
          } else {
            pressed.add(key);
          }
        };
        const onKeyUp = (event: KeyboardEvent) => {
          if (!enableControls) return;
          pressed.delete(event.key.toLowerCase());
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        cleanupKeys = () => {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
        };
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
      cleanupKeys();
    };
  }, [modelUrl, width, height, enableControls, onReady, onError]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

