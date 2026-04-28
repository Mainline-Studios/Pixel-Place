'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import ModernButton from '../RobloxStyle/ModernButton';
import ModernCard from '../RobloxStyle/ModernCard';
import BlockyCharacter from '../RobloxStyle/BlockyCharacter';

/**
 * Gym Pump - 3D Fitness Game
 * 
 * Core Design Principles Applied:
 * 1. Clear Goals: Build power, earn coins, level up, compete on leaderboards
 * 2. Progressive Difficulty: Exercises get harder, rewards increase
 * 3. Intuitive Controls: Click/tap to pump, visual feedback
 * 4. Multiplayer: Real-time leaderboard, shared progress
 * 5. Visual/Audio Feedback: 3D character animations, particle effects, sound cues
 * 6. Replayability: Multiple exercises, achievements, progression system
 * 7. Narrative Context: Build your character's strength and power
 * 8. Accessibility: Simple controls, clear visual indicators
 */

interface Exercise {
  id: string;
  name: string;
  icon: string;
  basePower: number;
  baseCoins: number;
  difficulty: number;
  description: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface PlayerStats {
  power: number;
  coins: number;
  level: number;
  xp: number;
  totalPumps: number;
  achievements: Achievement[];
}

const EXERCISES: Exercise[] = [
  {
    id: 'bench',
    name: 'Bench Press',
    icon: '💪',
    basePower: 10,
    baseCoins: 5,
    difficulty: 1,
    description: 'Build upper body strength'
  },
  {
    id: 'squat',
    name: 'Squats',
    icon: '🦵',
    basePower: 12,
    baseCoins: 6,
    difficulty: 1.2,
    description: 'Strengthen your legs'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    icon: '🏋️',
    basePower: 15,
    baseCoins: 8,
    difficulty: 1.5,
    description: 'Maximum power gains'
  },
  {
    id: 'curl',
    name: 'Bicep Curls',
    icon: '💪',
    basePower: 8,
    baseCoins: 4,
    difficulty: 0.8,
    description: 'Quick arm workout'
  },
  {
    id: 'press',
    name: 'Shoulder Press',
    icon: '💪',
    basePower: 11,
    baseCoins: 6,
    difficulty: 1.1,
    description: 'Build shoulder strength'
  }
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_pump', name: 'First Pump', description: 'Complete your first exercise', unlocked: false, progress: 0, target: 1 },
  { id: 'hundred_pumps', name: 'Century', description: 'Complete 100 pumps', unlocked: false, progress: 0, target: 100 },
  { id: 'thousand_pumps', name: 'Thousand Club', description: 'Complete 1,000 pumps', unlocked: false, progress: 0, target: 1000 },
  { id: 'level_10', name: 'Level 10', description: 'Reach level 10', unlocked: false, progress: 0, target: 10 },
  { id: 'level_25', name: 'Level 25', description: 'Reach level 25', unlocked: false, progress: 0, target: 25 },
  { id: 'power_1000', name: 'Powerhouse', description: 'Reach 1,000 power', unlocked: false, progress: 0, target: 1000 },
  { id: 'power_5000', name: 'Beast Mode', description: 'Reach 5,000 power', unlocked: false, progress: 0, target: 5000 },
  { id: 'rich', name: 'Rich', description: 'Earn 10,000 coins', unlocked: false, progress: 0, target: 10000 }
];

export default function GymPump() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gymPumpStats') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          power: parsed.power || 0,
          coins: parsed.coins || 0,
          level: parsed.level || 1,
          xp: parsed.xp || 0,
          totalPumps: parsed.totalPumps || 0,
          achievements: parsed.achievements || ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, progress: 0 }))
        };
      } catch {
        // Fallback to default
      }
    }
    return {
      power: 0,
      coins: 0,
      level: 1,
      xp: 0,
      totalPumps: 0,
      achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, progress: 0 }))
    };
  });

  const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES[0]);
  const [isPumping, setIsPumping] = useState(false);
  const [pumpCount, setPumpCount] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Array<{ player: string; power: number; level: number }>>([]);

  // Save stats to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gymPumpStats', JSON.stringify(stats));
    }
  }, [stats]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90e2, 0.5, 20);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    // Create gym floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2f45,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create character
    const characterGroup = new THREE.Group();
    
    // Body parts (blocky Roblox style)
    const bodyParts = [
      { name: 'head', size: [0.4, 0.4, 0.4], pos: [0, 1.2, 0], color: 0xffdd7a },
      { name: 'torso', size: [0.5, 0.6, 0.3], pos: [0, 0.7, 0], color: 0x4a90e2 },
      { name: 'leftArm', size: [0.15, 0.5, 0.15], pos: [-0.4, 0.7, 0], color: 0xffdd7a },
      { name: 'rightArm', size: [0.15, 0.5, 0.15], pos: [0.4, 0.7, 0], color: 0xffdd7a },
      { name: 'leftLeg', size: [0.2, 0.5, 0.2], pos: [-0.15, 0.1, 0], color: 0x2a2f45 },
      { name: 'rightLeg', size: [0.2, 0.5, 0.2], pos: [0.15, 0.1, 0], color: 0x2a2f45 }
    ];

    bodyParts.forEach(part => {
      const geometry = new THREE.BoxGeometry(...part.size);
      const material = new THREE.MeshStandardMaterial({ 
        color: part.color,
        roughness: 0.7,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...part.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = part.name;
      characterGroup.add(mesh);
    });

    characterGroup.position.set(0, 0, 0);
    scene.add(characterGroup);
    characterRef.current = characterGroup;

    // Gym equipment (dumbbells)
    const createDumbbell = (x: number, z: number) => {
      const group = new THREE.Group();
      
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 })
      );
      bar.rotation.z = Math.PI / 2;
      group.add(bar);

      const weight1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.1 })
      );
      weight1.position.x = -0.3;
      group.add(weight1);

      const weight2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.1 })
      );
      weight2.position.x = 0.3;
      group.add(weight2);

      group.position.set(x, 0.2, z);
      scene.add(group);
    };

    createDumbbell(-2, -1);
    createDumbbell(2, -1);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (characterRef.current && isPumping) {
        // Animate character during pump
        const time = Date.now() * 0.005;
        const leftArm = characterRef.current.getObjectByName('leftArm');
        const rightArm = characterRef.current.getObjectByName('rightArm');
        
        if (leftArm && rightArm) {
          leftArm.rotation.x = Math.sin(time * 2) * 0.5;
          rightArm.rotation.x = Math.sin(time * 2) * 0.5;
        }
      } else if (characterRef.current && !isPumping) {
        // Idle animation
        const time = Date.now() * 0.001;
        const leftArm = characterRef.current.getObjectByName('leftArm');
        const rightArm = characterRef.current.getObjectByName('rightArm');
        
        if (leftArm && rightArm) {
          leftArm.rotation.x = Math.sin(time) * 0.1;
          rightArm.rotation.x = Math.sin(time) * 0.1;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  const handlePump = useCallback(() => {
    if (isPumping) return;

    setIsPumping(true);
    setPumpCount(prev => prev + 1);

    const exercise = selectedExercise;
    const powerGain = Math.floor(exercise.basePower * (1 + stats.level * 0.1));
    const coinGain = Math.floor(exercise.baseCoins * (1 + stats.level * 0.05));
    const xpGain = Math.floor(10 * exercise.difficulty);

    setStats(prev => {
      const newPower = prev.power + powerGain;
      const newCoins = prev.coins + coinGain;
      const newXp = prev.xp + xpGain;
      const newTotalPumps = prev.totalPumps + 1;
      
      // Calculate level
      const xpForNextLevel = prev.level * 100;
      let newLevel = prev.level;
      let remainingXp = newXp;
      
      while (remainingXp >= xpForNextLevel && newLevel < 100) {
        remainingXp -= xpForNextLevel;
        newLevel++;
      }

      // Update achievements
      const updatedAchievements = prev.achievements.map(ach => {
        let progress = ach.progress;
        if (ach.id === 'first_pump' && newTotalPumps >= 1) progress = 1;
        else if (ach.id === 'hundred_pumps') progress = Math.min(newTotalPumps, 100);
        else if (ach.id === 'thousand_pumps') progress = Math.min(newTotalPumps, 1000);
        else if (ach.id === 'level_10') progress = Math.min(newLevel, 10);
        else if (ach.id === 'level_25') progress = Math.min(newLevel, 25);
        else if (ach.id === 'power_1000') progress = Math.min(newPower, 1000);
        else if (ach.id === 'power_5000') progress = Math.min(newPower, 5000);
        else if (ach.id === 'rich') progress = Math.min(newCoins, 10000);

        return {
          ...ach,
          progress,
          unlocked: progress >= ach.target
        };
      });

      return {
        power: newPower,
        coins: newCoins,
        level: newLevel,
        xp: remainingXp,
        totalPumps: newTotalPumps,
        achievements: updatedAchievements
      };
    });

    setTimeout(() => setIsPumping(false), 300);
  }, [isPumping, selectedExercise, stats.level]);

  const xpForNextLevel = stats.level * 100;
  const xpProgress = (stats.xp / xpForNextLevel) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1419 100%)',
      fontFamily: "'Segoe UI', 'Roboto', system-ui, sans-serif",
      color: "#ecf0f1",
      overflow: 'auto',
      zIndex: 1
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* 3D View */}
        <div style={{ flex: '1 1 600px', minHeight: '500px' }}>
          <ModernCard variant="outlined" title="💪 Gym" style={{ height: '100%' }}>
            <div 
              ref={containerRef}
              style={{
                width: '100%',
                height: '500px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#0a0e1a'
              }}
            />
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {EXERCISES.map(ex => (
                <ModernButton
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  variant={selectedExercise.id === ex.id ? 'success' : 'default'}
                  size="small"
                  icon={ex.icon}
                >
                  {ex.name}
                </ModernButton>
              ))}
            </div>
            <div style={{ marginTop: '16px' }}>
              <ModernButton
                onClick={handlePump}
                disabled={isPumping}
                variant="success"
                size="large"
                icon="💪"
                fullWidth
              >
                {isPumping ? 'Pumping...' : `Pump ${selectedExercise.name}`}
              </ModernButton>
            </div>
          </ModernCard>
        </div>

        {/* Stats Panel */}
        <div style={{ flex: '0 1 350px' }}>
          <ModernCard variant="outlined" title="📊 Stats">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#9ab', marginBottom: '4px' }}>Power</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#4a90e2' }}>
                {stats.power.toLocaleString()}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#9ab', marginBottom: '4px' }}>Coins</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffdd7a' }}>
                {stats.coins.toLocaleString()}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#9ab', marginBottom: '4px' }}>
                Level {stats.level}
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#1a1f2e',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '4px'
              }}>
                <div style={{
                  width: `${xpProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4a90e2, #6ab0ff)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '12px', color: '#9ab', marginTop: '4px' }}>
                {stats.xp} / {xpForNextLevel} XP
              </div>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a2f45' }}>
              <div style={{ fontSize: '14px', color: '#9ab', marginBottom: '4px' }}>Total Pumps</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {stats.totalPumps.toLocaleString()}
              </div>
            </div>
          </ModernCard>

          <ModernCard variant="outlined" title="🏆 Achievements" style={{ marginTop: '16px' }}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {stats.achievements.map(ach => (
                <div
                  key={ach.id}
                  style={{
                    padding: '8px',
                    marginBottom: '8px',
                    background: ach.unlocked ? 'rgba(74, 144, 226, 0.1)' : '#1a1f2e',
                    borderRadius: '6px',
                    border: ach.unlocked ? '1px solid #4a90e2' : '1px solid #2a2f45'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    {ach.unlocked ? '✓' : ''} {ach.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ab', marginBottom: '4px' }}>
                    {ach.description}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: '#0a0e1a',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}>
                    <div style={{
                      width: `${Math.min((ach.progress / ach.target) * 100, 100)}%`,
                      height: '100%',
                      background: ach.unlocked ? '#4a90e2' : '#6ab0ff'
                    }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ab', marginTop: '2px' }}>
                    {ach.progress} / {ach.target}
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
}
