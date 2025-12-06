'use client';

import { useEffect, useRef } from 'react';
import { Skin } from '@/types';

interface Avatar3DProps {
  skin: Skin;
  size?: number;
  autoRotate?: boolean;
  showControls?: boolean;
}

export default function Avatar3D({ skin, size = 1, autoRotate = false, showControls = false }: Avatar3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const avatarRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let THREE: any;
    let OrbitControls: any;

    // Dynamic import for Three.js
    Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js')
    ]).then(([THREEModule, OrbitControlsModule]) => {
      THREE = THREEModule;
      OrbitControls = OrbitControlsModule.OrbitControls;

      const container = containerRef.current!;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      // Camera
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 2, 5);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      container.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.5);
      pointLight.position.set(-5, 5, -5);
      scene.add(pointLight);

      // Create avatar
      const avatarGroup = new THREE.Group();

      // Helper to convert hex to Three.js color
      const hexToColor = (hex: string) => {
        return new THREE.Color(hex);
      };

      const colors = skin.colors || {
        head: '#4a4f66',
        torso: '#4d536f',
        arm: '#3a3f56',
        legs: '#3a3f56'
      };

      // Head
      const headGeometry = new THREE.BoxGeometry(0.6 * size, 0.6 * size, 0.6 * size);
      const headMaterial = new THREE.MeshStandardMaterial({
        color: hexToColor(colors.head),
        metalness: 0.3,
        roughness: 0.7
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.set(0, 1.5 * size, 0);
      avatarGroup.add(head);

      // Face - Eyes
      const eyeGeometry = new THREE.BoxGeometry(0.08 * size, 0.08 * size, 0.02 * size);
      const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      
      // Left Eye
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.15 * size, 1.55 * size, 0.31 * size);
      avatarGroup.add(leftEye);
      
      // Right Eye
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.15 * size, 1.55 * size, 0.31 * size);
      avatarGroup.add(rightEye);

      // Eye pupils
      const pupilGeometry = new THREE.BoxGeometry(0.05 * size, 0.05 * size, 0.02 * size);
      const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      
      const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      leftPupil.position.set(-0.15 * size, 1.55 * size, 0.32 * size);
      avatarGroup.add(leftPupil);
      
      const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      rightPupil.position.set(0.15 * size, 1.55 * size, 0.32 * size);
      avatarGroup.add(rightPupil);

      // Mouth
      const mouthGeometry = new THREE.BoxGeometry(0.2 * size, 0.05 * size, 0.02 * size);
      const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, 1.4 * size, 0.31 * size);
      avatarGroup.add(mouth);

      // Torso
      const torsoGeometry = new THREE.BoxGeometry(0.9 * size, 0.9 * size, 0.5 * size);
      const torsoMaterial = new THREE.MeshStandardMaterial({
        color: hexToColor(colors.torso),
        metalness: 0.3,
        roughness: 0.7
      });
      const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
      torso.position.set(0, 0.5 * size, 0);
      avatarGroup.add(torso);

      // Left Arm
      const armGeometry = new THREE.BoxGeometry(0.28 * size, 0.7 * size, 0.28 * size);
      const armMaterial = new THREE.MeshStandardMaterial({
        color: hexToColor(colors.arm),
        metalness: 0.3,
        roughness: 0.7
      });
      const leftArm = new THREE.Mesh(armGeometry, armMaterial);
      leftArm.position.set(-0.59 * size, 0.5 * size, 0);
      avatarGroup.add(leftArm);

      // Right Arm
      const rightArm = new THREE.Mesh(armGeometry, armMaterial);
      rightArm.position.set(0.59 * size, 0.5 * size, 0);
      avatarGroup.add(rightArm);

      // Legs
      const legGeometry = new THREE.BoxGeometry(0.4 * size, 0.6 * size, 0.4 * size);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: hexToColor(colors.legs),
        metalness: 0.3,
        roughness: 0.7
      });
      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-0.25 * size, -0.3 * size, 0);
      avatarGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(0.25 * size, -0.3 * size, 0);
      avatarGroup.add(rightLeg);

      // Add glow effect based on rarity
      if (skin.rarity === 'legendary') {
        const glowGeometry = new THREE.BoxGeometry(1.2 * size, 2.5 * size, 1.2 * size);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xffd76a,
          transparent: true,
          opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(avatarGroup.position);
        scene.add(glow);
      } else if (skin.rarity === 'rare') {
        const glowGeometry = new THREE.BoxGeometry(1.1 * size, 2.3 * size, 1.1 * size);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xb7b7ff,
          transparent: true,
          opacity: 0.15
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(avatarGroup.position);
        scene.add(glow);
      }

      scene.add(avatarGroup);
      avatarRef.current = avatarGroup;

      // Controls (optional)
      if (showControls) {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minDistance = 3;
        controls.maxDistance = 10;
        controls.target.set(0, 0.5, 0);
        controlsRef.current = controls;
      }

      // Store refs
      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;

      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);

        if (autoRotate && avatarRef.current) {
          avatarRef.current.rotation.y += 0.01;
        }

        if (controlsRef.current) {
          controlsRef.current.update();
        }

        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [skin, size, autoRotate, showControls]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 60%)'
      }}
    />
  );
}

